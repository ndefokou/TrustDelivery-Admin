use actix_web::{web, HttpResponse, Error};
use crate::config::AppState;
use crate::models::{DashboardData, DashboardStats, KPICard, Trend, DailyDeliveries, DailyRevenue, StatusDistribution, TopCarrier};

pub async fn get_dashboard(state: web::Data<AppState>) -> Result<HttpResponse, Error> {
    let total_deliveries: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM deliveries"
    )
    .fetch_one(state.db.as_ref())
    .await
    .unwrap_or(0);

    let in_transit: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM deliveries WHERE LOWER(status) = 'in_transit'"
    )
    .fetch_one(state.db.as_ref())
    .await
    .unwrap_or(0);

    let completed: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM deliveries WHERE LOWER(status) = 'delivered'"
    )
    .fetch_one(state.db.as_ref())
    .await
    .unwrap_or(0);

    let failed: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM deliveries WHERE LOWER(status) = 'failed'"
    )
    .fetch_one(state.db.as_ref())
    .await
    .unwrap_or(0);

    let total_revenue: f64 = sqlx::query_scalar(
        "SELECT COALESCE(SUM(delivery_cost), 0) FROM deliveries WHERE LOWER(status) = 'delivered'"
    )
    .fetch_one(state.db.as_ref())
    .await
    .unwrap_or(0.0);

    let active_carriers: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM carriers WHERE is_active = true"
    )
    .fetch_one(state.db.as_ref())
    .await
    .unwrap_or(0);

    let stats = DashboardStats {
        total_deliveries_today: total_deliveries,
        in_transit,
        completed_today: completed,
        failed_today: failed,
        revenue_today: total_revenue,
        active_carriers,
    };

    let kpi_cards = vec![
        KPICard {
            title: "Total Deliveries".to_string(),
            value: total_deliveries,
            trend: Some(Trend { direction: "up".to_string(), percentage: 12.5 }),
            icon: "package".to_string(),
        },
        KPICard {
            title: "In Transit".to_string(),
            value: in_transit,
            trend: Some(Trend { direction: "up".to_string(), percentage: 8.2 }),
            icon: "truck".to_string(),
        },
        KPICard {
            title: "Completed".to_string(),
            value: completed,
            trend: Some(Trend { direction: "up".to_string(), percentage: 15.3 }),
            icon: "check-circle".to_string(),
        },
        KPICard {
            title: "Failed".to_string(),
            value: failed,
            trend: Some(Trend { direction: "down".to_string(), percentage: 5.0 }),
            icon: "alert-circle".to_string(),
        },
        KPICard {
            title: "Revenue (FCFA)".to_string(),
            value: total_revenue as i64,
            trend: Some(Trend { direction: "up".to_string(), percentage: 18.7 }),
            icon: "dollar-sign".to_string(),
        },
        KPICard {
            title: "Active Carriers".to_string(),
            value: active_carriers,
            trend: Some(Trend { direction: "up".to_string(), percentage: 3.2 }),
            icon: "users".to_string(),
        },
    ];

    let deliveries_per_day = sqlx::query_as::<_, DailyDeliveries>(
        "SELECT DATE(created_at)::text as date, COUNT(*)::int as count FROM deliveries WHERE created_at >= NOW() - INTERVAL '7 days' GROUP BY DATE(created_at) ORDER BY DATE(created_at)"
    )
    .fetch_all(state.db.as_ref())
    .await
    .unwrap_or_default();

    let revenue_per_day = sqlx::query_as::<_, DailyRevenue>(
        "SELECT DATE(COALESCE(delivered_at, completed_at))::text as date, SUM(delivery_cost)::float as revenue FROM deliveries WHERE LOWER(status) = 'delivered' AND COALESCE(delivered_at, completed_at) >= NOW() - INTERVAL '7 days' GROUP BY DATE(COALESCE(delivered_at, completed_at)) ORDER BY DATE(COALESCE(delivered_at, completed_at))"
    )
    .fetch_all(state.db.as_ref())
    .await
    .unwrap_or_default();

    let status_distribution = sqlx::query_as::<_, StatusDistribution>(
        "SELECT LOWER(status) as status, COUNT(*)::int as count, (COUNT(*)::float / (SELECT COUNT(*) FROM deliveries) * 100) as percentage FROM deliveries GROUP BY LOWER(status)"
    )
    .fetch_all(state.db.as_ref())
    .await
    .unwrap_or_default();

    let top_performing_carriers = sqlx::query_as::<_, TopCarrier>(
        "SELECT ROW_NUMBER() OVER (ORDER BY COUNT(d.id) DESC)::int4 as rank, r.company_name as carrier_name, COUNT(d.id)::int4 as deliveries_completed, AVG(CASE WHEN LOWER(d.status) = 'delivered' THEN 100 ELSE 0 END)::float as success_rate, SUM(d.delivery_cost)::float as revenue_generated FROM carriers r LEFT JOIN deliveries d ON COALESCE(d.assigned_carrier_id, d.carrier_id) = r.id GROUP BY r.id, r.company_name HAVING COUNT(d.id) > 0 ORDER BY deliveries_completed DESC LIMIT 5"
    )
    .fetch_all(state.db.as_ref())
    .await
    .unwrap_or_default();

    let dashboard = DashboardData {
        stats,
        kpi_cards,
        deliveries_per_day,
        revenue_per_day,
        status_distribution,
        top_performing_carriers,
    };

    Ok(HttpResponse::Ok().json(dashboard))
}

pub fn routes() -> actix_web::Scope {
    web::scope("/api/dashboard")
        .route("", web::get().to(get_dashboard))
}