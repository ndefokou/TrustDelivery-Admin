use sqlx::PgPool;
use crate::models::Rider;
use uuid::Uuid;

#[allow(dead_code)]
pub struct RiderService;

#[allow(dead_code)]
impl RiderService {
    pub async fn get_active_riders(pool: &PgPool) -> Result<Vec<Rider>, sqlx::Error> {
        let riders = sqlx::query_as::<_, Rider>(
            "SELECT id, full_name, phone_number, national_id, address, motorbike_registration, profile_photo, status, current_lat, current_lng, total_deliveries, completed_deliveries, failed_deliveries, performance_score, total_revenue, created_at, updated_at FROM riders WHERE status = 'active' ORDER BY performance_score DESC"
        )
        .fetch_all(pool)
        .await;
        
        riders
    }

    pub async fn update_performance(rider_id: Uuid, pool: &PgPool) -> Result<(), sqlx::Error> {
        sqlx::query(
            "UPDATE riders SET performance_score = (completed_deliveries::float / NULLIF(total_deliveries, 0) * 100) WHERE id = $1",
        )
        .bind(rider_id)
        .execute(pool)
        .await?;
        
        Ok(())
    }
}