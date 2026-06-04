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
        "SELECT id, business_name, owner_name, email, phone_number, address, status, total_deliveries, total_revenue, active_deliveries, created_at, updated_at FROM merchants ORDER BY created_at DESC LIMIT $1 OFFSET $2",
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
        "SELECT id, business_name, owner_name, email, phone_number, address, status, total_deliveries, total_revenue, active_deliveries, created_at, updated_at FROM merchants WHERE id = $1",
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
        "INSERT INTO merchants (business_name, owner_name, email, phone_number, address, status, total_deliveries, total_revenue, active_deliveries, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, 'active'::merchant_status, 0, 0.0, 0, NOW(), NOW()) RETURNING id, business_name, owner_name, email, phone_number, address, status, total_deliveries, total_revenue, active_deliveries, created_at, updated_at",
    )
    .bind(&req.business_name)
    .bind(&req.owner_name)
    .bind(&req.email)
    .bind(&req.phone_number)
    .bind(&req.address)
    .fetch_one(state.db.as_ref())
    .await;

    match merchant {
        Ok(m) => Ok(HttpResponse::Created().json(m)),
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
        "UPDATE merchants SET business_name = COALESCE($1, business_name), owner_name = COALESCE($2, owner_name), email = COALESCE($3, email), phone_number = COALESCE($4, phone_number), address = COALESCE($5, address), updated_at = NOW() WHERE id = $6 RETURNING id, business_name, owner_name, email, phone_number, address, status, total_deliveries, total_revenue, active_deliveries, created_at, updated_at",
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
        "UPDATE merchants SET status = 'suspended'::merchant_status, updated_at = NOW() WHERE id = $1 RETURNING id, business_name, owner_name, email, phone_number, address, status, total_deliveries, total_revenue, active_deliveries, created_at, updated_at",
    )
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

pub fn routes() -> actix_web::Scope {
    web::scope("/api/merchants")
        .route("", web::get().to(list_merchants))
        .route("", web::post().to(create_merchant))
        .route("/{id}", web::get().to(get_merchant))
        .route("/{id}", web::put().to(update_merchant))
        .route("/{id}/suspend", web::post().to(suspend_merchant))
}