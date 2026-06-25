use sqlx::PgPool;
use crate::models::Carrier;
use uuid::Uuid;

#[allow(dead_code)]
pub struct CarrierService;

#[allow(dead_code)]
impl CarrierService {
    pub async fn get_active_carriers(pool: &PgPool) -> Result<Vec<Carrier>, sqlx::Error> {
        let carriers = sqlx::query_as::<_, Carrier>(
            "SELECT id, company_name, phone, email, address, coverage_zones, max_capacity, base_fee, price_per_km, is_active, is_verified, total_deliveries, completed_deliveries, failed_deliveries, performance_score, total_revenue, created_at, updated_at FROM carriers WHERE is_active = true ORDER BY performance_score DESC NULLS LAST"
        )
        .fetch_all(pool)
        .await;
        
        carriers
    }

    pub async fn update_performance(carrier_id: Uuid, pool: &PgPool) -> Result<(), sqlx::Error> {
        sqlx::query(
            "UPDATE carriers SET performance_score = (completed_deliveries::float / NULLIF(total_deliveries, 0) * 100) WHERE id = $1",
        )
        .bind(carrier_id)
        .execute(pool)
        .await?;
        
        Ok(())
    }
}