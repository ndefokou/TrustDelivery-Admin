use actix_web::{web, HttpResponse, Error};
use crate::config::AppState;
use crate::models::{CreateRiderRequest, UpdateRiderRequest, RiderListResponse, RiderFilter, Rider, Expense, CreateExpenseRequest, ReviewExpenseRequest};
use uuid::Uuid;

pub async fn list_riders(
    state: web::Data<AppState>,
    _query: web::Query<RiderFilter>,
) -> Result<HttpResponse, Error> {
    let page: i64 = 1;
    let per_page: i64 = 20;
    
    let riders = sqlx::query_as::<_, Rider>(
        "SELECT id, full_name, phone_number, national_id, address, motorbike_registration, profile_photo, status, current_lat, current_lng, total_deliveries, completed_deliveries, failed_deliveries, performance_score, total_revenue, created_at, updated_at FROM riders ORDER BY created_at DESC LIMIT $1 OFFSET $2",
    )
    .bind(per_page)
    .bind((page - 1) * per_page)
    .fetch_all(state.db.as_ref())
    .await
    .unwrap_or_default();

    let total: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM riders")
        .fetch_one(state.db.as_ref())
        .await
        .unwrap_or(0);

    Ok(HttpResponse::Ok().json(RiderListResponse {
        riders,
        total,
        page: page as i32,
        per_page: per_page as i32,
    }))
}

pub async fn get_rider(
    state: web::Data<AppState>,
    path: web::Path<Uuid>,
) -> Result<HttpResponse, Error> {
    let id = path.into_inner();
    
    let rider = sqlx::query_as::<_, Rider>(
        "SELECT id, full_name, phone_number, national_id, address, motorbike_registration, profile_photo, status, current_lat, current_lng, total_deliveries, completed_deliveries, failed_deliveries, performance_score, total_revenue, created_at, updated_at FROM riders WHERE id = $1",
    )
    .bind(id)
    .fetch_optional(state.db.as_ref())
    .await;

    match rider {
        Ok(Some(r)) => Ok(HttpResponse::Ok().json(r)),
        _ => Ok(HttpResponse::NotFound().json(serde_json::json!({
            "error": "Rider not found"
        }))),
    }
}

pub async fn create_rider(
    state: web::Data<AppState>,
    req: web::Json<CreateRiderRequest>,
) -> Result<HttpResponse, Error> {
    let rider = sqlx::query_as::<_, Rider>(
        "INSERT INTO riders (full_name, phone_number, national_id, address, motorbike_registration, profile_photo, status, total_deliveries, completed_deliveries, failed_deliveries, performance_score, total_revenue, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, 'active'::rider_status, 0, 0, 0, 0.0, 0.0, NOW(), NOW()) RETURNING id, full_name, phone_number, national_id, address, motorbike_registration, profile_photo, status, current_lat, current_lng, total_deliveries, completed_deliveries, failed_deliveries, performance_score, total_revenue, created_at, updated_at",
    )
    .bind(&req.full_name)
    .bind(&req.phone_number)
    .bind(&req.national_id)
    .bind(&req.address)
    .bind(&req.motorbike_registration)
    .bind(&req.profile_photo)
    .fetch_one(state.db.as_ref())
    .await;

    match rider {
        Ok(r) => Ok(HttpResponse::Created().json(r)),
        _ => Ok(HttpResponse::BadRequest().json(serde_json::json!({
            "error": "Failed to create rider"
        }))),
    }
}

pub async fn update_rider(
    state: web::Data<AppState>,
    path: web::Path<Uuid>,
    req: web::Json<UpdateRiderRequest>,
) -> Result<HttpResponse, Error> {
    let id = path.into_inner();
    
    let rider = sqlx::query_as::<_, Rider>(
        "UPDATE riders SET full_name = COALESCE($1, full_name), phone_number = COALESCE($2, phone_number), address = COALESCE($3, address), profile_photo = COALESCE($4, profile_photo), updated_at = NOW() WHERE id = $5 RETURNING id, full_name, phone_number, national_id, address, motorbike_registration, profile_photo, status, current_lat, current_lng, total_deliveries, completed_deliveries, failed_deliveries, performance_score, total_revenue, created_at, updated_at",
    )
    .bind(&req.full_name)
    .bind(&req.phone_number)
    .bind(&req.address)
    .bind(&req.profile_photo)
    .bind(id)
    .fetch_one(state.db.as_ref())
    .await;

    match rider {
        Ok(r) => Ok(HttpResponse::Ok().json(r)),
        _ => Ok(HttpResponse::NotFound().json(serde_json::json!({
            "error": "Rider not found"
        }))),
    }
}

pub async fn suspend_rider(
    state: web::Data<AppState>,
    path: web::Path<Uuid>,
) -> Result<HttpResponse, Error> {
    let id = path.into_inner();
    
    let rider = sqlx::query_as::<_, Rider>(
        "UPDATE riders SET status = 'suspended'::rider_status, updated_at = NOW() WHERE id = $1 RETURNING id, full_name, phone_number, national_id, address, motorbike_registration, profile_photo, status, current_lat, current_lng, total_deliveries, completed_deliveries, failed_deliveries, performance_score, total_revenue, created_at, updated_at",
    )
    .bind(id)
    .fetch_one(state.db.as_ref())
    .await;

    match rider {
        Ok(r) => Ok(HttpResponse::Ok().json(r)),
        _ => Ok(HttpResponse::NotFound().json(serde_json::json!({
            "error": "Rider not found"
        }))),
    }
}

pub async fn activate_rider(
    state: web::Data<AppState>,
    path: web::Path<Uuid>,
) -> Result<HttpResponse, Error> {
    let id = path.into_inner();
    
    let rider = sqlx::query_as::<_, Rider>(
        "UPDATE riders SET status = 'active'::rider_status, updated_at = NOW() WHERE id = $1 RETURNING id, full_name, phone_number, national_id, address, motorbike_registration, profile_photo, status, current_lat, current_lng, total_deliveries, completed_deliveries, failed_deliveries, performance_score, total_revenue, created_at, updated_at",
    )
    .bind(id)
    .fetch_one(state.db.as_ref())
    .await;

    match rider {
        Ok(r) => Ok(HttpResponse::Ok().json(r)),
        _ => Ok(HttpResponse::NotFound().json(serde_json::json!({
            "error": "Rider not found"
        }))),
    }
}

pub async fn list_expenses(
    state: web::Data<AppState>,
    _path: web::Path<Uuid>,
) -> Result<HttpResponse, Error> {
    let expenses = sqlx::query_as::<_, Expense>(
        "SELECT id, rider_id, category, amount, description, receipt_image, status, admin_notes, created_at, reviewed_at, reviewed_by FROM rider_expenses ORDER BY created_at DESC LIMIT 50",
    )
    .fetch_all(state.db.as_ref())
    .await
    .unwrap_or_default();

    Ok(HttpResponse::Ok().json(expenses))
}

pub async fn create_expense(
    state: web::Data<AppState>,
    req: web::Json<CreateExpenseRequest>,
) -> Result<HttpResponse, Error> {
    let expense = sqlx::query_as::<_, Expense>(
        "INSERT INTO rider_expenses (rider_id, category, amount, description, receipt_image, status, created_at) VALUES ($1, $2::expense_category, $3, $4, $5, 'pending'::expense_status, NOW()) RETURNING id, rider_id, category, amount, description, receipt_image, status, admin_notes, created_at, reviewed_at, reviewed_by",
    )
    .bind(req.rider_id)
    .bind(&req.category)
    .bind(req.amount)
    .bind(&req.description)
    .bind(&req.receipt_image)
    .fetch_one(state.db.as_ref())
    .await;

    match expense {
        Ok(e) => Ok(HttpResponse::Created().json(e)),
        _ => Ok(HttpResponse::BadRequest().json(serde_json::json!({
            "error": "Failed to create expense"
        }))),
    }
}

pub async fn review_expense(
    state: web::Data<AppState>,
    path: web::Path<Uuid>,
    req: web::Json<ReviewExpenseRequest>,
) -> Result<HttpResponse, Error> {
    let expense_id = path.into_inner();
    
    let expense = sqlx::query_as::<_, Expense>(
        "UPDATE rider_expenses SET status = $1::expense_status, admin_notes = $2, reviewed_at = NOW() WHERE id = $3 RETURNING id, rider_id, category, amount, description, receipt_image, status, admin_notes, created_at, reviewed_at, reviewed_by",
    )
    .bind(&req.status)
    .bind(&req.admin_notes)
    .bind(expense_id)
    .fetch_one(state.db.as_ref())
    .await;

    match expense {
        Ok(e) => Ok(HttpResponse::Ok().json(e)),
        _ => Ok(HttpResponse::NotFound().json(serde_json::json!({
            "error": "Expense not found"
        }))),
    }
}

pub fn routes() -> actix_web::Scope {
    web::scope("/api/riders")
        .route("", web::get().to(list_riders))
        .route("", web::post().to(create_rider))
        .route("/{id}", web::get().to(get_rider))
        .route("/{id}", web::put().to(update_rider))
        .route("/{id}/suspend", web::post().to(suspend_rider))
        .route("/{id}/activate", web::post().to(activate_rider))
        .route("/{id}/expenses", web::get().to(list_expenses))
        .route("/expenses", web::post().to(create_expense))
        .route("/expenses/{id}/review", web::post().to(review_expense))
}