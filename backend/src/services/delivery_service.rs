use sqlx::PgPool;
use crate::models::Delivery;
use uuid::Uuid;

const DELIVERY_SELECT: &str = "id, product_description, product_value::float8 AS product_value, delivery_cost::float8 AS delivery_cost, distance_km, customer_name, customer_phone, delivery_address_text AS delivery_address, NULL::float8 AS delivery_lat, NULL::float8 AS delivery_lng, merchant_id, assigned_carrier_id, status, failure_reason::text AS failure_reason, otp_code, otp_verified, created_at, NULL::timestamptz AS paid_at, assigned_at, picked_up_at, delivered_at, NULL::timestamptz AS failed_at";

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

    pub async fn assign_carrier(delivery_id: Uuid, carrier_id: Uuid, pool: &PgPool) -> Result<Delivery, sqlx::Error> {
        let delivery = sqlx::query_as::<_, Delivery>(
            &format!("UPDATE deliveries SET assigned_carrier_id = $1, status = 'assigned', assigned_at = NOW() WHERE id = $2 RETURNING {}", DELIVERY_SELECT),
        )
        .bind(carrier_id)
        .bind(delivery_id)
        .fetch_one(pool)
        .await;
        
        delivery
    }

    pub async fn mark_in_transit(delivery_id: Uuid, pool: &PgPool) -> Result<Delivery, sqlx::Error> {
        let delivery = sqlx::query_as::<_, Delivery>(
            &format!("UPDATE deliveries SET status = 'in_transit', picked_up_at = NOW() WHERE id = $1 RETURNING {}", DELIVERY_SELECT),
        )
        .bind(delivery_id)
        .fetch_one(pool)
        .await;
        
        delivery
    }

    pub async fn mark_delivered(delivery_id: Uuid, pool: &PgPool) -> Result<Delivery, sqlx::Error> {
        let delivery = sqlx::query_as::<_, Delivery>(
            &format!("UPDATE deliveries SET status = 'delivered', delivered_at = NOW() WHERE id = $1 RETURNING {}", DELIVERY_SELECT),
        )
        .bind(delivery_id)
        .fetch_one(pool)
        .await;
        
        delivery
    }
}