use actix_web::{web, HttpResponse, Error};
use crate::config::AppState;
use crate::models::{CreateDeliveryRequest, UpdateDeliveryRequest, AssignRiderRequest, DeliveryListResponse, DeliveryFilter, DeliveryDetailsResponse, MerchantBasic, RiderBasic};
use uuid::Uuid;
use chrono::Utc;

pub async fn list_deliveries(
    state: web::Data<AppState>,
    _query: web::Query<DeliveryFilter>,
) -> Result<HttpResponse, Error> {
    let page: i64 = 1;
    let per_page: i64 = 20;
    
    let deliveries = sqlx::query_as::<_, crate::models::Delivery>(
        "SELECT id, product_description, product_value, delivery_cost, distance_km, customer_name, customer_phone, delivery_address, delivery_lat, delivery_lng, merchant_id, assigned_rider_id, status, failure_reason, otp_code, otp_verified, created_at, paid_at, assigned_at, picked_up_at, delivered_at, failed_at FROM deliveries ORDER BY created_at DESC LIMIT $1 OFFSET $2",
    )
    .bind(per_page)
    .bind((page - 1) * per_page)
    .fetch_all(state.db.as_ref())
    .await
    .unwrap_or_default();

    let total: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM deliveries")
        .fetch_one(state.db.as_ref())
        .await
        .unwrap_or(0);

    Ok(HttpResponse::Ok().json(DeliveryListResponse {
        deliveries,
        total,
        page: page as i32,
        per_page: per_page as i32,
    }))
}

pub async fn get_delivery(
    state: web::Data<AppState>,
    path: web::Path<Uuid>,
) -> Result<HttpResponse, Error> {
    let id = path.into_inner();
    
    let delivery = sqlx::query_as::<_, crate::models::Delivery>(
        "SELECT id, product_description, product_value, delivery_cost, distance_km, customer_name, customer_phone, delivery_address, delivery_lat, delivery_lng, merchant_id, assigned_rider_id, status, failure_reason, otp_code, otp_verified, created_at, paid_at, assigned_at, picked_up_at, delivered_at, failed_at FROM deliveries WHERE id = $1",
    )
    .bind(id)
    .fetch_optional(state.db.as_ref())
    .await;

    match delivery {
        Ok(Some(del)) => {
            let merchant = sqlx::query_as::<_, MerchantBasic>(
                "SELECT id, business_name, contact_phone, email FROM merchants WHERE id = $1",
            )
            .bind(del.merchant_id)
            .fetch_optional(state.db.as_ref())
            .await
            .unwrap_or(None);
            
            let rider = if let Some(rider_id) = del.assigned_rider_id {
                sqlx::query_as::<_, RiderBasic>(
                    "SELECT id, full_name, phone_number FROM riders WHERE id = $1",
                )
                .bind(rider_id)
                .fetch_optional(state.db.as_ref())
                .await
                .unwrap_or(None)
            } else {
                None
            };
            
            Ok(HttpResponse::Ok().json(DeliveryDetailsResponse {
                delivery: del,
                merchant: merchant.unwrap_or(MerchantBasic { id: uuid::Uuid::nil(), business_name: String::new(), contact_phone: String::new(), email: String::new() }),
                rider,
                timeline: vec![],
            }))
        }
        _ => Ok(HttpResponse::NotFound().json(serde_json::json!({
            "error": "Delivery not found"
        }))),
    }
}

pub async fn create_delivery(
    state: web::Data<AppState>,
    req: web::Json<CreateDeliveryRequest>,
) -> Result<HttpResponse, Error> {
    let delivery = sqlx::query_as::<_, crate::models::Delivery>(
        "INSERT INTO deliveries (product_description, product_value, delivery_cost, distance_km, customer_name, customer_phone, delivery_address, delivery_lat, delivery_lng, merchant_id, status, otp_code, otp_verified, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'awaiting_assignment', $11, false, $12) RETURNING id, product_description, product_value, delivery_cost, distance_km, customer_name, customer_phone, delivery_address, delivery_lat, delivery_lng, merchant_id, assigned_rider_id, status, failure_reason, otp_code, otp_verified, created_at, paid_at, assigned_at, picked_up_at, delivered_at, failed_at",
    )
    .bind(&req.product_description)
    .bind(req.product_value)
    .bind(1000.0)
    .bind(req.distance_km)
    .bind(&req.customer_name)
    .bind(&req.customer_phone)
    .bind(&req.delivery_address)
    .bind(req.delivery_lat)
    .bind(req.delivery_lng)
    .bind(req.merchant_id)
    .bind("000000")
    .bind(Utc::now())
    .fetch_one(state.db.as_ref())
    .await;

    match delivery {
        Ok(del) => Ok(HttpResponse::Created().json(del)),
        _ => Ok(HttpResponse::BadRequest().json(serde_json::json!({
            "error": "Failed to create delivery"
        }))),
    }
}

pub async fn assign_rider(
    state: web::Data<AppState>,
    path: web::Path<Uuid>,
    req: web::Json<AssignRiderRequest>,
) -> Result<HttpResponse, Error> {
    let delivery_id = path.into_inner();
    
    let delivery = sqlx::query_as::<_, crate::models::Delivery>(
        "UPDATE deliveries SET assigned_rider_id = $1, status = 'assigned', assigned_at = $2 WHERE id = $3 RETURNING id, product_description, product_value, delivery_cost, distance_km, customer_name, customer_phone, delivery_address, delivery_lat, delivery_lng, merchant_id, assigned_rider_id, status, failure_reason, otp_code, otp_verified, created_at, paid_at, assigned_at, picked_up_at, delivered_at, failed_at",
    )
    .bind(req.rider_id)
    .bind(Utc::now())
    .bind(delivery_id)
    .fetch_one(state.db.as_ref())
    .await;

    match delivery {
        Ok(del) => Ok(HttpResponse::Ok().json(del)),
        _ => Ok(HttpResponse::BadRequest().json(serde_json::json!({
            "error": "Failed to assign rider"
        }))),
    }
}

pub async fn update_delivery(
    state: web::Data<AppState>,
    path: web::Path<Uuid>,
    req: web::Json<UpdateDeliveryRequest>,
) -> Result<HttpResponse, Error> {
    let id = path.into_inner();
    
    let delivery = sqlx::query_as::<_, crate::models::Delivery>(
        "UPDATE deliveries SET product_description = COALESCE($1, product_description), customer_name = COALESCE($2, customer_name), customer_phone = COALESCE($3, customer_phone), delivery_address = COALESCE($4, delivery_address) WHERE id = $5 RETURNING id, product_description, product_value, delivery_cost, distance_km, customer_name, customer_phone, delivery_address, delivery_lat, delivery_lng, merchant_id, assigned_rider_id, status, failure_reason, otp_code, otp_verified, created_at, paid_at, assigned_at, picked_up_at, delivered_at, failed_at",
    )
    .bind(&req.product_description)
    .bind(&req.customer_name)
    .bind(&req.customer_phone)
    .bind(&req.delivery_address)
    .bind(id)
    .fetch_one(state.db.as_ref())
    .await;

    match delivery {
        Ok(del) => Ok(HttpResponse::Ok().json(del)),
        _ => Ok(HttpResponse::NotFound().json(serde_json::json!({
            "error": "Delivery not found"
        }))),
    }
}

pub async fn cancel_delivery(
    state: web::Data<AppState>,
    path: web::Path<Uuid>,
) -> Result<HttpResponse, Error> {
    let id = path.into_inner();
    
    let result = sqlx::query("DELETE FROM deliveries WHERE id = $1")
        .bind(id)
        .execute(state.db.as_ref())
        .await;

    match result {
        Ok(_) => Ok(HttpResponse::Ok().json(serde_json::json!({
            "message": "Delivery cancelled"
        }))),
        _ => Ok(HttpResponse::NotFound().json(serde_json::json!({
            "error": "Delivery not found"
        }))),
    }
}

pub async fn get_awaiting_assignments(
    state: web::Data<AppState>,
) -> Result<HttpResponse, Error> {
    let deliveries = sqlx::query_as::<_, crate::models::Delivery>(
        "SELECT id, product_description, product_value, delivery_cost, distance_km, customer_name, customer_phone, delivery_address, delivery_lat, delivery_lng, merchant_id, assigned_rider_id, status, failure_reason, otp_code, otp_verified, created_at, paid_at, assigned_at, picked_up_at, delivered_at, failed_at FROM deliveries WHERE status = 'awaiting_assignment' ORDER BY created_at DESC"
    )
    .fetch_all(state.db.as_ref())
    .await
    .unwrap_or_default();

    Ok(HttpResponse::Ok().json(deliveries))
}

pub fn routes() -> actix_web::Scope {
    web::scope("/api/deliveries")
        .route("", web::get().to(list_deliveries))
        .route("", web::post().to(create_delivery))
        .route("/awaiting", web::get().to(get_awaiting_assignments))
        .route("/{id}", web::get().to(get_delivery))
        .route("/{id}", web::put().to(update_delivery))
        .route("/{id}", web::delete().to(cancel_delivery))
        .route("/{id}/assign", web::post().to(assign_rider))
}