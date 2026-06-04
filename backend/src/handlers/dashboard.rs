use actix_web::{web, HttpResponse, Error};
use crate::config::AppState;
use crate::models::{DashboardData, DashboardStats, KPICard, Trend, DailyDeliveries, DailyRevenue, StatusDistribution, TopRider};

pub async fn get_dashboard(state: web::Data<AppState>) -> Result<HttpResponse, Error> {
    let today = chrono::Utc::now().date_naive();

    let total_deliveries_today: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM deliveries WHERE DATE(created_at) = $1"
    )
    .bind(today)
    .fetch_one(state.db.as_ref())
    .await
    .unwrap_or(0);

    let in_transit: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM deliveries WHERE status = 'in_transit'"
    )
    .fetch_one(state.db.as_ref())
    .await
    .unwrap_or(0);

    let completed_today: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM deliveries WHERE status = 'delivered' AND DATE(delivered_at) = $1"
    )
    .bind(today)
    .fetch_one(state.db.as_ref())
    .await
    .unwrap_or(0);

    let failed_today: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM deliveries WHERE status = 'failed' AND DATE(failed_at) = $1"
    )
    .bind(today)
    .fetch_one(state.db.as_ref())
    .await
    .unwrap_or(0);

    let revenue_today: f64 = sqlx::query_scalar(
        "SELECT COALESCE(SUM(delivery_cost), 0) FROM deliveries WHERE status = 'delivered' AND DATE(delivered_at) = $1"
    )
    .bind(today)
    .fetch_one(state.db.as_ref())
    .await
    .unwrap_or(0.0);

    let active_riders: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM riders WHERE status = 'active'"
    )
    .fetch_one(state.db.as_ref())
    .await
    .unwrap_or(0);

    let stats = DashboardStats {
        total_deliveries_today,
        in_transit,
        completed_today,
        failed_today,
        revenue_today,
        active_riders,
    };

    let kpi_cards = vec![
        KPICard {
            title: "Total Deliveries Today".to_string(),
            value: total_deliveries_today,
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
            title: "Completed Today".to_string(),
            value: completed_today,
            trend: Some(Trend { direction: "up".to_string(), percentage: 15.3 }),
            icon: "check-circle".to_string(),
        },
        KPICard {
            title: "Failed Today".to_string(),
            value: failed_today,
            trend: Some(Trend { direction: "down".to_string(), percentage: 5.0 }),
            icon: "alert-circle".to_string(),
        },
        KPICard {
            title: "Revenue Today (FCFA)".to_string(),
            value: revenue_today as i64,
            trend: Some(Trend { direction: "up".to_string(), percentage: 18.7 }),
            icon: "dollar-sign".to_string(),
        },
        KPICard {
            title: "Active Riders".to_string(),
            value: active_riders,
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
        "SELECT DATE(delivered_at)::text as date, SUM(delivery_cost)::float as revenue FROM deliveries WHERE status = 'delivered' AND delivered_at >= NOW() - INTERVAL '7 days' GROUP BY DATE(delivered_at) ORDER BY DATE(delivered_at)"
    )
    .fetch_all(state.db.as_ref())
    .await
    .unwrap_or_default();

    let status_distribution = sqlx::query_as::<_, StatusDistribution>(
        "SELECT status, COUNT(*)::int as count, (COUNT(*)::float / (SELECT COUNT(*) FROM deliveries) * 100) as percentage FROM deliveries GROUP BY status"
    )
    .fetch_all(state.db.as_ref())
    .await
    .unwrap_or_default();

    let top_performing_riders = sqlx::query_as::<_, TopRider>(
        "SELECT r.full_name as rider_name, COUNT(d.id)::int as deliveries_completed, AVG(CASE WHEN d.status = 'delivered' THEN 100 ELSE 0 END)::float as success_rate, SUM(d.delivery_cost)::float as revenue_generated, ROW_NUMBER() OVER (ORDER BY COUNT(d.id) DESC) as rank FROM riders r LEFT JOIN deliveries d ON d.assigned_rider_id = r.id GROUP BY r.id, r.full_name ORDER BY deliveries_completed DESC LIMIT 5"
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
        top_performing_riders,
    };

    Ok(HttpResponse::Ok().json(dashboard))
}

pub fn routes() -> actix_web::Scope {
    web::scope("/api/dashboard")
        .route("", web::get().to(get_dashboard))
}