use actix_web::{web, HttpResponse, Error};
use crate::config::AppState;

pub async fn daily_report(_state: web::Data<AppState>) -> Result<HttpResponse, Error> {
    let today = chrono::Utc::now().date_naive();

    Ok(HttpResponse::Ok().json(serde_json::json!({
        "date": today,
        "deliveries_created": 0,
        "deliveries_completed": 0,
        "deliveries_failed": 0,
        "revenue": 0.0
    })))
}

pub async fn weekly_report(state: web::Data<AppState>) -> Result<HttpResponse, Error> {
    let deliveries = sqlx::query_as::<_, crate::models::DailyDeliveries>(
        "SELECT DATE(created_at)::text as date, COUNT(*)::int as count FROM deliveries WHERE created_at >= NOW() - INTERVAL '7 days' GROUP BY DATE(created_at) ORDER BY DATE(created_at)"
    )
    .fetch_all(state.db.as_ref())
    .await
    .unwrap_or_default();

    Ok(HttpResponse::Ok().json(deliveries))
}

pub async fn monthly_report(state: web::Data<AppState>) -> Result<HttpResponse, Error> {
    let deliveries = sqlx::query_as::<_, crate::models::DailyDeliveries>(
        "SELECT DATE(created_at)::text as date, COUNT(*)::int as count FROM deliveries WHERE created_at >= NOW() - INTERVAL '30 days' GROUP BY DATE(created_at) ORDER BY DATE(created_at)"
    )
    .fetch_all(state.db.as_ref())
    .await
    .unwrap_or_default();

    Ok(HttpResponse::Ok().json(deliveries))
}

pub async fn revenue_report(state: web::Data<AppState>) -> Result<HttpResponse, Error> {
    let revenue = sqlx::query_as::<_, crate::models::DailyRevenue>(
        "SELECT DATE(created_at)::text as date, SUM(COALESCE(delivery_fee, delivery_cost, 0))::float8 as revenue FROM deliveries WHERE LOWER(status::text) = 'delivered' GROUP BY DATE(created_at) ORDER BY DATE(created_at) LIMIT 30"
    )
    .fetch_all(state.db.as_ref())
    .await
    .unwrap_or_default();

    Ok(HttpResponse::Ok().json(revenue))
}

pub async fn rider_performance(state: web::Data<AppState>) -> Result<HttpResponse, Error> {
    let riders = sqlx::query_as::<_, crate::models::TopRider>(
        "SELECT ROW_NUMBER() OVER (ORDER BY COUNT(d.id) DESC)::int4 as rank, r.full_name as rider_name, COUNT(d.id)::int4 as deliveries_completed, CASE WHEN COUNT(*) > 0 THEN (COUNT(*) FILTER (WHERE LOWER(d.status::text) = 'delivered')::float8 / COUNT(*)::float8) * 100 ELSE 0 END as success_rate, SUM(COALESCE(d.delivery_fee, d.delivery_cost, 0))::float8 as revenue_generated FROM riders r LEFT JOIN deliveries d ON COALESCE(d.assigned_rider_id, d.rider_id) = r.id GROUP BY r.id, r.full_name ORDER BY deliveries_completed DESC LIMIT 10"
    )
    .fetch_all(state.db.as_ref())
    .await
    .unwrap_or_default();

    Ok(HttpResponse::Ok().json(riders))
}

pub async fn failed_deliveries_report(state: web::Data<AppState>) -> Result<HttpResponse, Error> {
    let failures = sqlx::query_as::<_, crate::models::StatusDistribution>(
        "SELECT COALESCE(failure_reason::text, 'Unknown') as status, COUNT(*)::int as count, CASE WHEN (SELECT COUNT(*) FROM deliveries WHERE LOWER(status::text) = 'failed') = 0 THEN 0 ELSE (COUNT(*)::float8 / (SELECT COUNT(*)::float8 FROM deliveries WHERE LOWER(status::text) = 'failed') * 100) END as percentage FROM deliveries WHERE LOWER(status::text) = 'failed' AND failure_reason IS NOT NULL GROUP BY failure_reason"
    )
    .fetch_all(state.db.as_ref())
    .await
    .unwrap_or_default();

    Ok(HttpResponse::Ok().json(failures))
}

pub fn routes() -> actix_web::Scope {
    web::scope("/api/reports")
        .route("/daily", web::get().to(daily_report))
        .route("/weekly", web::get().to(weekly_report))
        .route("/monthly", web::get().to(monthly_report))
        .route("/revenue", web::get().to(revenue_report))
        .route("/rider-performance", web::get().to(rider_performance))
        .route("/failed-deliveries", web::get().to(failed_deliveries_report))
}