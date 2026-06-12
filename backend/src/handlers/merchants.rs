use actix_web::{web, HttpResponse, Error};
use crate::config::AppState;
use crate::models::{CreateMerchantRequest, UpdateMerchantRequest, MerchantListResponse, MerchantFilter, Merchant};

pub async fn list_merchants(
    state: web::Data<AppState>,
    _query: web::Query<MerchantFilter>,
) -> Result<HttpResponse, Error> {
    let page: i64 = 1;
    let per_page: i64 = 20;
    
    let merchants = sqlx::query_as::<_, Merchant>(
        "SELECT id, business_name, owner_name, email, business_phone AS \"phone_number\", business_address AS address, status, total_deliveries, total_revenue::float8, active_deliveries, created_at, updated_at FROM merchants ORDER BY created_at DESC LIMIT $1 OFFSET $2",
    )
    .bind(per_page)
    .bind((page - 1) * per_page)
    .fetch_all(state.db.as_ref())
    .await
    .unwrap_or_default();

    let total: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM merchants")
        .fetch_one(state.db.as_ref())
        .await
        .unwrap_or(0);

    Ok(HttpResponse::Ok().json(MerchantListResponse {
        merchants,
        total,
        page: page as i32,
        per_page: per_page as i32,
    }))
}

pub async fn get_merchant(
    state: web::Data<AppState>,
    path: web::Path<uuid::Uuid>,
) -> Result<HttpResponse, Error> {
    let id = path.into_inner();
    
    let merchant = sqlx::query_as::<_, Merchant>(
        "SELECT id, business_name, owner_name, email, business_phone AS \"phone_number\", business_address AS address, status, total_deliveries, total_revenue::float8, active_deliveries, created_at, updated_at FROM merchants WHERE id = $1",
    )
    .bind(id)
    .fetch_optional(state.db.as_ref())
    .await;

    match merchant {
        Ok(Some(m)) => Ok(HttpResponse::Ok().json(m)),
        _ => Ok(HttpResponse::NotFound().json(serde_json::json!({
            "error": "Merchant not found"
        }))),
    }
}

pub async fn create_merchant(
    state: web::Data<AppState>,
    req: web::Json<CreateMerchantRequest>,
) -> Result<HttpResponse, Error> {
    let merchant = sqlx::query_as::<_, Merchant>(
        "INSERT INTO merchants (business_name, owner_name, email, business_phone, business_address, status, total_deliveries, total_revenue, active_deliveries, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, 'active'::merchant_status, 0, 0.0, 0, NOW(), NOW()) RETURNING id, business_name, owner_name, email, business_phone AS \"phone_number\", business_address AS address, status, total_deliveries, total_revenue::float8, active_deliveries, created_at, updated_at",
    )
    .bind(&req.business_name)
    .bind(&req.owner_name)
    .bind(&req.email)
    .bind(&req.phone_number)
    .bind(&req.address)
    .fetch_one(state.db.as_ref())
    .await;

    match merchant {
        Ok(m) => {
            // Create notification for new merchant registration
            let _ = sqlx::query(
                "INSERT INTO notifications (notification_type, title, message, reference_id, is_read, created_at) VALUES ($1::notification_type, $2, $3, $4, false, NOW())"
            )
            .bind("new_merchant_registration")
            .bind("New Merchant Registered")
            .bind(format!("{} has completed merchant registration.", m.business_name))
            .bind(m.id)
            .execute(state.db.as_ref())
            .await;

            Ok(HttpResponse::Created().json(m))
        },
        _ => Ok(HttpResponse::BadRequest().json(serde_json::json!({
            "error": "Failed to create merchant"
        }))),
    }
}

pub async fn update_merchant(
    state: web::Data<AppState>,
    path: web::Path<uuid::Uuid>,
    req: web::Json<UpdateMerchantRequest>,
) -> Result<HttpResponse, Error> {
    let id = path.into_inner();
    
    let merchant = sqlx::query_as::<_, Merchant>(
        "UPDATE merchants SET business_name = COALESCE($1, business_name), owner_name = COALESCE($2, owner_name), email = COALESCE($3, email), business_phone = COALESCE($4, business_phone), business_address = COALESCE($5, business_address), updated_at = NOW() WHERE id = $6 RETURNING id, business_name, owner_name, email, business_phone AS \"phone_number\", business_address AS address, status, total_deliveries, total_revenue::float8, active_deliveries, created_at, updated_at",
    )
    .bind(&req.business_name)
    .bind(&req.owner_name)
    .bind(&req.email)
    .bind(&req.phone_number)
    .bind(&req.address)
    .bind(id)
    .fetch_one(state.db.as_ref())
    .await;

    match merchant {
        Ok(m) => Ok(HttpResponse::Ok().json(m)),
        _ => Ok(HttpResponse::NotFound().json(serde_json::json!({
            "error": "Merchant not found"
        }))),
    }
}

pub async fn suspend_merchant(
    state: web::Data<AppState>,
    path: web::Path<uuid::Uuid>,
) -> Result<HttpResponse, Error> {
    let id = path.into_inner();
    
    let merchant = sqlx::query_as::<_, Merchant>(
        "UPDATE merchants SET status = 'suspended'::merchant_status, updated_at = NOW() WHERE id = $1 RETURNING id, business_name, owner_name, email, business_phone AS \"phone_number\", business_address AS address, status, total_deliveries, total_revenue::float8, active_deliveries, created_at, updated_at",
    )
    .bind(id)
    .fetch_one(state.db.as_ref())
    .await;

    match merchant {
        Ok(m) => {
            let _ = sqlx::query(
                "INSERT INTO notifications (notification_type, title, message, reference_id, is_read, created_at) VALUES ($1::notification_type, $2, $3, $4, false, NOW())"
            )
            .bind("new_merchant_registration")
            .bind("Merchant Suspended")
            .bind(format!("Merchant {} has been suspended by admin.", m.business_name))
            .bind(m.id)
            .execute(state.db.as_ref())
            .await;

            Ok(HttpResponse::Ok().json(m))
        },
        _ => Ok(HttpResponse::NotFound().json(serde_json::json!({
            "error": "Merchant not found"
        }))),
    }
}

pub async fn activate_merchant(
    state: web::Data<AppState>,
    path: web::Path<uuid::Uuid>,
) -> Result<HttpResponse, Error> {
    let id = path.into_inner();
    
    let merchant = sqlx::query_as::<_, Merchant>(
        "UPDATE merchants SET status = 'active'::merchant_status, updated_at = NOW() WHERE id = $1 RETURNING id, business_name, owner_name, email, business_phone AS \"phone_number\", business_address AS address, status, total_deliveries, total_revenue::float8, active_deliveries, created_at, updated_at",
    )
    .bind(id)
    .fetch_one(state.db.as_ref())
    .await;

    match merchant {
        Ok(m) => {
            let _ = sqlx::query(
                "INSERT INTO notifications (notification_type, title, message, reference_id, is_read, created_at) VALUES ($1::notification_type, $2, $3, $4, false, NOW())"
            )
            .bind("new_merchant_registration")
            .bind("Merchant Activated")
            .bind(format!("Merchant {} has been activated by admin.", m.business_name))
            .bind(m.id)
            .execute(state.db.as_ref())
            .await;

            Ok(HttpResponse::Ok().json(m))
        },
        _ => Ok(HttpResponse::NotFound().json(serde_json::json!({
            "error": "Merchant not found"
        }))),
    }
}

pub fn routes() -> actix_web::Scope {
    web::scope("/api/merchants")
        .route("", web::get().to(list_merchants))
        .route("", web::post().to(create_merchant))
        .route("/{id}", web::get().to(get_merchant))
        .route("/{id}", web::put().to(update_merchant))
        .route("/{id}/suspend", web::post().to(suspend_merchant))
        .route("/{id}/activate", web::post().to(activate_merchant))
}