use sqlx::PgPool;
use crate::models::Delivery;
use uuid::Uuid;

#[allow(dead_code)]
pub struct DeliveryService;

#[allow(dead_code)]
impl DeliveryService {
    pub fn calculate_delivery_price(distance_km: f64) -> f64 {
        if distance_km <= 3.0 {
            1000.0
        } else if distance_km <= 5.0 {
            1500.0
        } else if distance_km <= 10.0 {
            2500.0
        } else {
            3000.0 + (distance_km - 10.0) * 200.0
        }
    }

    pub async fn assign_rider(delivery_id: Uuid, rider_id: Uuid, pool: &PgPool) -> Result<Delivery, sqlx::Error> {
        let delivery = sqlx::query_as::<_, Delivery>(
            "UPDATE deliveries SET assigned_rider_id = $1, status = 'assigned', assigned_at = NOW() WHERE id = $2 RETURNING id, product_description, product_value, delivery_cost, distance_km, customer_name, customer_phone, delivery_address, delivery_lat, delivery_lng, merchant_id, assigned_rider_id, status, failure_reason, otp_code, otp_verified, created_at, paid_at, assigned_at, picked_up_at, delivered_at, failed_at",
        )
        .bind(rider_id)
        .bind(delivery_id)
        .fetch_one(pool)
        .await;
        
        delivery
    }

    pub async fn mark_in_transit(delivery_id: Uuid, pool: &PgPool) -> Result<Delivery, sqlx::Error> {
        let delivery = sqlx::query_as::<_, Delivery>(
            "UPDATE deliveries SET status = 'in_transit', picked_up_at = NOW() WHERE id = $1 RETURNING id, product_description, product_value, delivery_cost, distance_km, customer_name, customer_phone, delivery_address, delivery_lat, delivery_lng, merchant_id, assigned_rider_id, status, failure_reason, otp_code, otp_verified, created_at, paid_at, assigned_at, picked_up_at, delivered_at, failed_at",
        )
        .bind(delivery_id)
        .fetch_one(pool)
        .await;
        
        delivery
    }

    pub async fn mark_delivered(delivery_id: Uuid, pool: &PgPool) -> Result<Delivery, sqlx::Error> {
        let delivery = sqlx::query_as::<_, Delivery>(
            "UPDATE deliveries SET status = 'delivered', delivered_at = NOW() WHERE id = $1 RETURNING id, product_description, product_value, delivery_cost, distance_km, customer_name, customer_phone, delivery_address, delivery_lat, delivery_lng, merchant_id, assigned_rider_id, status, failure_reason, otp_code, otp_verified, created_at, paid_at, assigned_at, picked_up_at, delivered_at, failed_at",
        )
        .bind(delivery_id)
        .fetch_one(pool)
        .await;
        
        delivery
    }
}