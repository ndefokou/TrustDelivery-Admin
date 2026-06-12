use sqlx::PgPool;
use crate::models::Merchant;
use uuid::Uuid;

#[allow(dead_code)]
pub struct MerchantService;

#[allow(dead_code)]
impl MerchantService {
    pub async fn get_active_merchants(pool: &PgPool) -> Result<Vec<Merchant>, sqlx::Error> {
        let merchants = sqlx::query_as::<_, Merchant>(
            "SELECT id, business_name, owner_name, email, business_phone AS \"phone_number\", business_address AS address, status, total_deliveries, total_revenue::float8, active_deliveries, created_at, updated_at FROM merchants WHERE status = 'active' ORDER BY created_at DESC"
        )
        .fetch_all(pool)
        .await;

        merchants
    }

    pub async fn update_statistics(merchant_id: Uuid, pool: &PgPool) -> Result<(), sqlx::Error> {
        sqlx::query(
            "UPDATE merchants SET total_deliveries = (SELECT COUNT(*) FROM deliveries WHERE merchant_id = $1), total_revenue = (SELECT COALESCE(SUM(delivery_cost), 0) FROM deliveries WHERE merchant_id = $1 AND status = 'delivered'), active_deliveries = (SELECT COUNT(*) FROM deliveries WHERE merchant_id = $1 AND status IN ('awaiting_assignment', 'assigned', 'in_transit')) WHERE id = $1",
        )
        .bind(merchant_id)
        .execute(pool)
        .await?;
        
        Ok(())
    }
}