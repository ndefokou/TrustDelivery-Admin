use actix_web::{web, HttpResponse, Error};
use crate::config::AppState;
use crate::models::{CreateDeliveryRequest, UpdateDeliveryRequest, AssignCarrierRequest, DeliveryListResponse, DeliveryFilter, DeliveryDetailsResponse, CarrierBasic, MerchantWithLocation};
use crate::services::pricing_service::PricingService;
use uuid::Uuid;
use chrono::Utc;
use rand::Rng;

fn generate_otp() -> String {
    format!("{:04}", rand::thread_rng().gen_range(1000..9999))
}

const DELIVERY_SELECT: &str = "d.id, d.product_description, d.product_value::float8, d.delivery_cost::float8, d.distance_km::float8, d.customer_name, d.customer_phone, COALESCE(d.delivery_address_text, d.delivery_address) AS delivery_address, d.delivery_latitude::float8 AS delivery_lat, d.delivery_longitude::float8 AS delivery_lng, d.merchant_id, COALESCE(d.assigned_carrier_id, d.carrier_id) AS assigned_carrier_id, LOWER(d.status::text)::delivery_status AS status, d.failure_reason, d.otp_code, d.otp_verified, d.created_at, d.paid_at, d.assigned_at, d.picked_up_at, d.delivered_at, d.failed_at";

const DELIVERY_RETURNING: &str = "id, product_description, product_value::float8, delivery_cost::float8, distance_km::float8, customer_name, customer_phone, COALESCE(delivery_address_text, delivery_address) AS delivery_address, delivery_latitude::float8 AS delivery_lat, delivery_longitude::float8 AS delivery_lng, merchant_id, COALESCE(assigned_carrier_id, carrier_id) AS assigned_carrier_id, LOWER(status::text)::delivery_status AS status, failure_reason, otp_code, otp_verified, created_at, paid_at, assigned_at, picked_up_at, delivered_at, failed_at";

pub async fn list_deliveries(
    state: web::Data<AppState>,
    query: web::Query<DeliveryFilter>,
) -> Result<HttpResponse, Error> {
    let page = query.page.unwrap_or(1).max(1) as i64;
    let per_page = query.per_page.unwrap_or(20).max(1).min(100) as i64;

    let mut from_clause = String::from("FROM deliveries d");
    if query.merchant.as_ref().map(|s| !s.is_empty()).unwrap_or(false) {
        from_clause.push_str(" JOIN merchants m ON m.id = d.merchant_id");
    }

    let mut sql = format!("SELECT {} {}", DELIVERY_SELECT, from_clause);
    let mut count_sql = format!("SELECT COUNT(*) {}", from_clause);

    let mut conditions: Vec<String> = Vec::new();
    let mut idx: usize = 1;

    if query.status.as_ref().map(|s| !s.is_empty()).unwrap_or(false) {
        conditions.push(format!("LOWER(d.status::text) = ${}", idx));
        idx += 1;
    }
    if query.merchant_id.is_some() {
        conditions.push(format!("d.merchant_id = ${}", idx));
        idx += 1;
    }
    if query.carrier_id.is_some() {
        conditions.push(format!("d.assigned_carrier_id = ${}", idx));
        idx += 1;
    }
    if query.date_from.as_ref().map(|s| !s.is_empty()).unwrap_or(false) {
        conditions.push(format!("d.created_at >= ${}", idx));
        idx += 1;
    }
    if query.date_to.as_ref().map(|s| !s.is_empty()).unwrap_or(false) {
        conditions.push(format!("d.created_at <= ${}", idx));
        idx += 1;
    }
    if query.search.as_ref().map(|s| !s.is_empty()).unwrap_or(false) {
        conditions.push(format!("(d.customer_name ILIKE ${} OR d.customer_phone ILIKE ${} OR d.product_description ILIKE ${} OR CAST(d.id AS TEXT) ILIKE ${})", idx, idx, idx, idx));
        idx += 1;
    }
    if query.merchant.as_ref().map(|s| !s.is_empty()).unwrap_or(false) {
        conditions.push(format!("m.business_name ILIKE ${}", idx));
        idx += 1;
    }

    if !conditions.is_empty() {
        let where_clause = format!(" WHERE {}", conditions.join(" AND "));
        sql.push_str(&where_clause);
        count_sql.push_str(&where_clause);
    }

    sql.push_str(&format!(" ORDER BY d.created_at DESC LIMIT ${} OFFSET ${}", idx, idx + 1));

    let mut q = sqlx::query_as::<_, crate::models::Delivery>(&sql);

    if let Some(status) = &query.status {
        if !status.is_empty() {
            q = q.bind(status);
        }
    }
    if let Some(merchant_id) = query.merchant_id {
        q = q.bind(merchant_id);
    }
    if let Some(carrier_id) = query.carrier_id {
        q = q.bind(carrier_id);
    }
    if let Some(date_from) = &query.date_from {
        if !date_from.is_empty() {
            q = q.bind(date_from);
        }
    }
    if let Some(date_to) = &query.date_to {
        if !date_to.is_empty() {
            q = q.bind(date_to);
        }
    }
    if let Some(search) = &query.search {
        if !search.is_empty() {
            q = q.bind(format!("%{}%", search));
        }
    }
    if let Some(merchant) = &query.merchant {
        if !merchant.is_empty() {
            q = q.bind(format!("%{}%", merchant));
        }
    }

    let deliveries = match q
        .bind(per_page)
        .bind((page - 1) * per_page)
        .fetch_all(state.db.as_ref())
        .await
    {
        Ok(d) => d,
        Err(e) => {
            eprintln!("SQL ERROR (list_deliveries): {}", e);
            eprintln!("SQL was: {}", sql);
            return Ok(HttpResponse::InternalServerError().json(serde_json::json!({
                "error": format!("Database query failed: {}", e),
                "sql": sql
            })));
        }
    };

    let mut count_q = sqlx::query_scalar::<_, i64>(&count_sql);

    if let Some(status) = &query.status {
        if !status.is_empty() {
            count_q = count_q.bind(status);
        }
    }
    if let Some(merchant_id) = query.merchant_id {
        count_q = count_q.bind(merchant_id);
    }
    if let Some(carrier_id) = query.carrier_id {
        count_q = count_q.bind(carrier_id);
    }
    if let Some(date_from) = &query.date_from {
        if !date_from.is_empty() {
            count_q = count_q.bind(date_from);
        }
    }
    if let Some(date_to) = &query.date_to {
        if !date_to.is_empty() {
            count_q = count_q.bind(date_to);
        }
    }
    if let Some(search) = &query.search {
        if !search.is_empty() {
            count_q = count_q.bind(format!("%{}%", search));
        }
    }
    if let Some(merchant) = &query.merchant {
        if !merchant.is_empty() {
            count_q = count_q.bind(format!("%{}%", merchant));
        }
    }

    let total = match count_q.fetch_one(state.db.as_ref()).await {
        Ok(t) => t,
        Err(e) => {
            eprintln!("SQL ERROR (count deliveries): {}", e);
            eprintln!("Count SQL was: {}", count_sql);
            return Ok(HttpResponse::InternalServerError().json(serde_json::json!({
                "error": format!("Database count query failed: {}", e),
                "sql": count_sql
            })));
        }
    };

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
        &format!("SELECT {} FROM deliveries d WHERE id = $1", DELIVERY_SELECT),
    )
    .bind(id)
    .fetch_optional(state.db.as_ref())
    .await;

    match delivery {
        Ok(Some(del)) => {
            let merchant = sqlx::query_as::<_, MerchantWithLocation>(
                "SELECT id, business_name, phone AS contact_phone, email, dispatch_latitude, dispatch_longitude, address FROM merchants WHERE id = $1",
            )
            .bind(del.merchant_id)
            .fetch_optional(state.db.as_ref())
            .await
            .unwrap_or(None);
            
            let carrier = if let Some(carrier_id) = del.assigned_carrier_id {
                sqlx::query_as::<_, CarrierBasic>(
                    "SELECT id, company_name, phone, email FROM carriers WHERE id = $1",
                )
                .bind(carrier_id)
                .fetch_optional(state.db.as_ref())
                .await
                .unwrap_or(None)
            } else {
                None
            };
            
            Ok(HttpResponse::Ok().json(DeliveryDetailsResponse {
                delivery: del,
                merchant: merchant.unwrap_or(MerchantWithLocation { 
                    id: uuid::Uuid::nil(), 
                    business_name: String::new(), 
                    contact_phone: String::new(), 
                    email: String::new(),
                    dispatch_latitude: None,
                    dispatch_longitude: None,
                    address: String::new(),
                }),
                carrier,
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
    let delivery_cost = PricingService::calculate_base_cost(req.distance_km);
    let otp_code = generate_otp();
    
    let delivery = sqlx::query_as::<_, crate::models::Delivery>(
        &format!(
            "INSERT INTO deliveries (product_description, product_value, delivery_cost, distance_km, customer_name, customer_phone, delivery_address_text, merchant_id, status, otp_code, otp_verified, created_at, updated_at, delivery_id, currency, payment_method, payment_status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'awaiting_assignment', $9, false, $10, NOW(), gen_random_uuid()::text, 'FCFA', 'merchant_wallet', 'pending') RETURNING {}",
            DELIVERY_RETURNING
        ),
    )
    .bind(&req.product_description)
    .bind(req.product_value as i64)
    .bind(delivery_cost)
    .bind(req.distance_km)
    .bind(&req.customer_name)
    .bind(&req.customer_phone)
    .bind(&req.delivery_address)
    .bind(req.merchant_id)
    .bind(&otp_code)
    .bind(Utc::now())
    .fetch_one(state.db.as_ref())
    .await;

    match delivery {
        Ok(del) => {
            // Create notification for new paid delivery
            let _ = sqlx::query(
                "INSERT INTO notifications (notification_type, title, message, reference_id, is_read, created_at) VALUES ($1::notification_type, $2, $3, $4, false, NOW())"
            )
            .bind("new_paid_delivery")
            .bind("New Paid Delivery")
            .bind(format!("A new delivery for {} has been paid and is awaiting assignment.", del.product_description))
            .bind(del.id)
            .execute(state.db.as_ref())
            .await;

            Ok(HttpResponse::Created().json(del))
        },
        Err(e) => {
            eprintln!("SQL ERROR (create_delivery): {}", e);
            Ok(HttpResponse::BadRequest().json(serde_json::json!({
                "error": format!("Failed to create delivery: {}", e)
            })))
        }
    }
}

pub async fn assign_carrier(
    state: web::Data<AppState>,
    path: web::Path<Uuid>,
    req: web::Json<AssignCarrierRequest>,
) -> Result<HttpResponse, Error> {
    let delivery_id = path.into_inner();

    let delivery = sqlx::query_as::<_, crate::models::Delivery>(
        &format!(
            "UPDATE deliveries SET assigned_carrier_id = $1, status = 'assigned', assigned_at = $2 WHERE id = $3 RETURNING {}",
            DELIVERY_RETURNING
        ),
    )
    .bind(req.carrier_id)
    .bind(Utc::now())
    .bind(delivery_id)
    .fetch_one(state.db.as_ref())
    .await;

    match delivery {
        Ok(del) => {
            // Create notification for delivery assigned
            let _ = sqlx::query(
                "INSERT INTO notifications (notification_type, title, message, reference_id, is_read, created_at) VALUES ($1::notification_type, $2, $3, $4, false, NOW())"
            )
            .bind("delivery_assigned")
            .bind("Delivery Assigned")
            .bind(format!("A delivery for {} has been assigned to a carrier.", del.product_description))
            .bind(del.id)
            .execute(state.db.as_ref())
            .await;

            Ok(HttpResponse::Ok().json(del))
        },
        Err(e) => {
            eprintln!("SQL ERROR (assign_carrier): {}", e);
            Ok(HttpResponse::BadRequest().json(serde_json::json!({
                "error": format!("Failed to assign carrier: {}", e)
            })))
        }
    }
}

pub async fn update_delivery(
    state: web::Data<AppState>,
    path: web::Path<Uuid>,
    req: web::Json<UpdateDeliveryRequest>,
) -> Result<HttpResponse, Error> {
    let id = path.into_inner();
    
    let delivery = sqlx::query_as::<_, crate::models::Delivery>(
        &format!(
            "UPDATE deliveries SET product_description = COALESCE($1, product_description), customer_name = COALESCE($2, customer_name), customer_phone = COALESCE($3, customer_phone), delivery_address_text = COALESCE($4, delivery_address_text) WHERE id = $5 RETURNING {}",
            DELIVERY_RETURNING
        ),
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
        Err(e) => {
            eprintln!("SQL ERROR (update_delivery): {}", e);
            Ok(HttpResponse::NotFound().json(serde_json::json!({
                "error": format!("Delivery not found or update failed: {}", e)
            })))
        }
    }
}

pub async fn cancel_delivery(
    state: web::Data<AppState>,
    path: web::Path<Uuid>,
) -> Result<HttpResponse, Error> {
    let id = path.into_inner();

    let delivery = sqlx::query_as::<_, crate::models::Delivery>(
        &format!(
            "UPDATE deliveries SET status = 'failed'::delivery_status WHERE id = $1 RETURNING {}",
            DELIVERY_RETURNING
        ),
    )
    .bind(id)
    .fetch_one(state.db.as_ref())
    .await;

    match delivery {
        Ok(del) => {
            // Create notification for failed delivery
            let _ = sqlx::query(
                "INSERT INTO notifications (notification_type, title, message, reference_id, is_read, created_at) VALUES ($1::notification_type, $2, $3, $4, false, NOW())"
            )
            .bind("failed_delivery")
            .bind("Delivery Failed")
            .bind(format!("Delivery for {} failed: Cancelled by admin.", del.product_description))
            .bind(del.id)
            .execute(state.db.as_ref())
            .await;

            Ok(HttpResponse::Ok().json(del))
        }
        Err(e) => {
            eprintln!("SQL ERROR (cancel_delivery): {}", e);
            Ok(HttpResponse::NotFound().json(serde_json::json!({
                "error": format!("Delivery not found or cancel failed: {}", e)
            })))
        }
    }
}

pub async fn get_awaiting_assignments(
    state: web::Data<AppState>,
) -> Result<HttpResponse, Error> {
    match sqlx::query_as::<_, crate::models::Delivery>(
        &format!("SELECT {} FROM deliveries d WHERE LOWER(status::text) = 'awaiting_assignment' ORDER BY created_at DESC", DELIVERY_SELECT),
    )
    .fetch_all(state.db.as_ref())
    .await {
        Ok(deliveries) => Ok(HttpResponse::Ok().json(deliveries)),
        Err(e) => {
            eprintln!("SQL ERROR (get_awaiting_assignments): {}", e);
            Ok(HttpResponse::InternalServerError().json(serde_json::json!({
                "error": format!("Database query failed: {}", e)
            })))
        }
    }
}

/// Auto-assign a delivery to the best available carrier based on:
/// 1. Carrier status (must be 'active')
/// 2. Performance score (higher is better)
/// 3. Current workload (fewer active deliveries is better)
pub async fn auto_assign_delivery(
    state: web::Data<AppState>,
    path: web::Path<Uuid>,
) -> Result<HttpResponse, Error> {
    let delivery_id = path.into_inner();

    // Find the best available carrier
    let best_carrier = sqlx::query_as::<_, (uuid::Uuid, String, i64, i64, f64)>(
        r#"
        SELECT r.id, r.company_name, r.completed_deliveries, r.failed_deliveries, r.performance_score
        FROM carriers r
        WHERE 
            r.is_active = true
            AND COALESCE(r.is_verified, true) = true
            AND r.id NOT IN (
                SELECT COALESCE(assigned_carrier_id, carrier_id) FROM deliveries 
                WHERE COALESCE(assigned_carrier_id, carrier_id) IS NOT NULL 
                AND LOWER(status::text) IN ('assigned', 'in_transit')
            )
        ORDER BY 
            r.performance_score DESC NULLS LAST,
            r.completed_deliveries DESC,
            r.failed_deliveries ASC
        LIMIT 1
        "#
    )
    .fetch_optional(state.db.as_ref())
    .await;

    match best_carrier {
        Ok(Some((carrier_id, carrier_name, _completed, _failed, score))) => {
            // Assign the delivery to this carrier
            let delivery = sqlx::query_as::<_, crate::models::Delivery>(
                &format!(
                    "UPDATE deliveries SET assigned_carrier_id = $1, status = 'assigned', assigned_at = $2 WHERE id = $3 RETURNING {}",
                    DELIVERY_RETURNING
                ),
            )
            .bind(carrier_id)
            .bind(Utc::now())
            .bind(delivery_id)
            .fetch_one(state.db.as_ref())
            .await;

            match delivery {
                Ok(del) => {
                    // Create notification
                    let _ = sqlx::query(
                        "INSERT INTO notifications (notification_type, title, message, reference_id, is_read, created_at) VALUES ($1::notification_type, $2, $3, $4, false, NOW())"
                    )
                    .bind("delivery_assigned")
                    .bind("Delivery Auto-Assigned")
                    .bind(format!("Delivery assigned to {} automatically.", carrier_name))
                    .bind(del.id)
                    .execute(state.db.as_ref())
                    .await;

                    Ok(HttpResponse::Ok().json(serde_json::json!({
                        "delivery": del,
                        "assigned_carrier": {
                            "id": carrier_id,
                            "name": carrier_name,
                            "performance_score": score
                        }
                    })))
                },
                Err(e) => {
                    eprintln!("SQL ERROR (auto_assign_delivery): {}", e);
                    Ok(HttpResponse::BadRequest().json(serde_json::json!({
                        "error": format!("Failed to auto-assign: {}", e)
                    })))
                }
            }
        },
        Ok(None) => {
            Ok(HttpResponse::NotFound().json(serde_json::json!({
                "error": "No available carriers found for auto-assignment"
            })))
        },
        Err(e) => {
            eprintln!("SQL ERROR (find_best_carrier): {}", e);
            Ok(HttpResponse::InternalServerError().json(serde_json::json!({
                "error": format!("Failed to find available carriers: {}", e)
            })))
        }
    }
}

/// Get available carriers sorted by suitability for auto-assignment
pub async fn get_available_carriers(
    state: web::Data<AppState>,
) -> Result<HttpResponse, Error> {
    let carriers = sqlx::query_as::<_, (uuid::Uuid, String, String, i64, i64, f64)>(
        r#"
        SELECT r.id, r.company_name, 
            CASE WHEN r.is_active THEN 'active' ELSE 'suspended' END as status,
            r.completed_deliveries, r.failed_deliveries, r.performance_score
        FROM carriers r
        WHERE r.is_active = true
        ORDER BY 
            r.performance_score DESC NULLS LAST,
            r.completed_deliveries DESC,
            r.failed_deliveries ASC
        "#
    )
    .fetch_all(state.db.as_ref())
    .await;

    match carriers {
        Ok(rows) => {
            let carriers: Vec<serde_json::Value> = rows.iter().map(|(id, name, status, completed, failed, score)| {
                serde_json::json!({
                    "id": id,
                    "company_name": name,
                    "status": status,
                    "completed_deliveries": completed,
                    "failed_deliveries": failed,
                    "performance_score": score,
                    "active_deliveries": 0
                })
            }).collect();
            Ok(HttpResponse::Ok().json(carriers))
        },
        Err(e) => {
            eprintln!("SQL ERROR (get_available_carriers): {}", e);
            Ok(HttpResponse::InternalServerError().json(serde_json::json!({
                "error": format!("Database query failed: {}", e)
            })))
        }
    }
}

pub fn routes() -> actix_web::Scope {
    web::scope("/api/deliveries")
        .route("", web::get().to(list_deliveries))
        .route("", web::post().to(create_delivery))
        .route("/awaiting", web::get().to(get_awaiting_assignments))
        .route("/available-carriers", web::get().to(get_available_carriers))
        .route("/{id}", web::get().to(get_delivery))
        .route("/{id}", web::put().to(update_delivery))
        .route("/{id}", web::delete().to(cancel_delivery))
        .route("/{id}/assign", web::post().to(assign_carrier))
        .route("/{id}/auto-assign", web::post().to(auto_assign_delivery))
}
