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
        "SELECT id, full_name, phone_number, national_id, address, motorbike_registration, profile_photo, status, current_lat::float8, current_lng::float8, total_deliveries, completed_deliveries, failed_deliveries, performance_score::float8, total_revenue::float8, created_at, updated_at FROM riders ORDER BY created_at DESC LIMIT $1 OFFSET $2",
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
        "SELECT id, full_name, phone_number, national_id, address, motorbike_registration, profile_photo, status, current_lat::float8, current_lng::float8, total_deliveries, completed_deliveries, failed_deliveries, performance_score::float8, total_revenue::float8, created_at, updated_at FROM riders WHERE id = $1",
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
        "INSERT INTO riders (full_name, phone_number, national_id, address, motorbike_registration, profile_photo, status, total_deliveries, completed_deliveries, failed_deliveries, performance_score, total_revenue, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, 'active'::rider_status, 0, 0, 0, 0.0, 0.0, NOW(), NOW()) RETURNING id, full_name, phone_number, national_id, address, motorbike_registration, profile_photo, status, current_lat::float8, current_lng::float8, total_deliveries, completed_deliveries, failed_deliveries, performance_score::float8, total_revenue::float8, created_at, updated_at",
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
        Ok(r) => {
            // Create notification for new rider registration
            let _ = sqlx::query(
                "INSERT INTO notifications (notification_type, title, message, reference_id, is_read, created_at) VALUES ($1::notification_type, $2, $3, $4, false, NOW())"
            )
            .bind("new_rider_registration")
            .bind("New Rider Registration")
            .bind(format!("{} has completed rider registration and is awaiting approval.", r.full_name))
            .bind(r.id)
            .execute(state.db.as_ref())
            .await;

            Ok(HttpResponse::Created().json(r))
        },
        Err(e) => {
            log::error!("Failed to create rider: {}", e);
            let error_msg = e.to_string();
            let user_message = if error_msg.contains("riders_phone_number_key") {
                "A rider with this phone number already exists"
            } else if error_msg.contains("riders_national_id_key") {
                "A rider with this national ID already exists"
            } else {
                "Failed to create rider"
            };
            Ok(HttpResponse::BadRequest().json(serde_json::json!({
                "error": user_message
            })))
        }
    }
}

pub async fn update_rider(
    state: web::Data<AppState>,
    path: web::Path<Uuid>,
    req: web::Json<UpdateRiderRequest>,
) -> Result<HttpResponse, Error> {
    let id = path.into_inner();
    
    let rider = sqlx::query_as::<_, Rider>(
        "UPDATE riders SET full_name = COALESCE($1, full_name), phone_number = COALESCE($2, phone_number), address = COALESCE($3, address), profile_photo = COALESCE($4, profile_photo), updated_at = NOW() WHERE id = $5 RETURNING id, full_name, phone_number, national_id, address, motorbike_registration, profile_photo, status, current_lat::float8, current_lng::float8, total_deliveries, completed_deliveries, failed_deliveries, performance_score::float8, total_revenue::float8, created_at, updated_at",
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
        "UPDATE riders SET status = 'suspended'::rider_status, updated_at = NOW() WHERE id = $1 RETURNING id, full_name, phone_number, national_id, address, motorbike_registration, profile_photo, status, current_lat::float8, current_lng::float8, total_deliveries, completed_deliveries, failed_deliveries, performance_score::float8, total_revenue::float8, created_at, updated_at",
    )
    .bind(id)
    .fetch_one(state.db.as_ref())
    .await;

    match rider {
        Ok(r) => {
            let _ = sqlx::query(
                "INSERT INTO notifications (notification_type, title, message, reference_id, is_read, created_at) VALUES ($1::notification_type, $2, $3, $4, false, NOW())"
            )
            .bind("new_rider_registration")
            .bind("Rider Suspended")
            .bind(format!("Rider {} has been suspended by admin.", r.full_name))
            .bind(r.id)
            .execute(state.db.as_ref())
            .await;

            Ok(HttpResponse::Ok().json(r))
        },
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
        "UPDATE riders SET status = 'active'::rider_status, updated_at = NOW() WHERE id = $1 RETURNING id, full_name, phone_number, national_id, address, motorbike_registration, profile_photo, status, current_lat::float8, current_lng::float8, total_deliveries, completed_deliveries, failed_deliveries, performance_score::float8, total_revenue::float8, created_at, updated_at",
    )
    .bind(id)
    .fetch_one(state.db.as_ref())
    .await;

    match rider {
        Ok(r) => {
            let _ = sqlx::query(
                "INSERT INTO notifications (notification_type, title, message, reference_id, is_read, created_at) VALUES ($1::notification_type, $2, $3, $4, false, NOW())"
            )
            .bind("new_rider_registration")
            .bind("Rider Activated")
            .bind(format!("Rider {} has been activated by admin.", r.full_name))
            .bind(r.id)
            .execute(state.db.as_ref())
            .await;

            Ok(HttpResponse::Ok().json(r))
        },
        _ => Ok(HttpResponse::NotFound().json(serde_json::json!({
            "error": "Rider not found"
        }))),
    }
}

pub async fn list_expenses(
    state: web::Data<AppState>,
    path: web::Path<Uuid>,
) -> Result<HttpResponse, Error> {
    let rider_id = path.into_inner();
    let expenses = sqlx::query_as::<_, Expense>(
        "SELECT id, rider_id, category, amount, description, receipt_image, status, admin_notes, created_at, reviewed_at, reviewed_by FROM rider_expenses WHERE rider_id = $1 ORDER BY created_at DESC LIMIT 50",
    )
    .bind(rider_id)
    .fetch_all(state.db.as_ref())
    .await
    .unwrap_or_default();

    Ok(HttpResponse::Ok().json(expenses))
}

pub async fn list_all_expenses(
    state: web::Data<AppState>,
) -> Result<HttpResponse, Error> {
    let expenses = sqlx::query_as::<_, crate::models::ExpenseWithRider>(
        "SELECT e.id, e.rider_id, r.full_name as rider_name, e.category, e.amount::float8, e.description, e.receipt_image, e.status, e.admin_notes, e.created_at, e.reviewed_at, e.reviewed_by FROM rider_expenses e JOIN riders r ON e.rider_id = r.id ORDER BY e.created_at DESC LIMIT 50",
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
        Ok(e) => {
            // Create notification for expense submission
            let _ = sqlx::query(
                "INSERT INTO notifications (notification_type, title, message, reference_id, is_read, created_at) VALUES ($1::notification_type, $2, $3, $4, false, NOW())"
            )
            .bind("expense_submission")
            .bind("New Expense Submitted")
            .bind(format!("An expense of {} FCFA for {} has been submitted for review.", e.amount, e.description))
            .bind(e.id)
            .execute(state.db.as_ref())
            .await;

            Ok(HttpResponse::Created().json(e))
        },
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
        Ok(e) => {
            let _ = sqlx::query(
                "INSERT INTO notifications (notification_type, title, message, reference_id, is_read, created_at) VALUES ($1::notification_type, $2, $3, $4, false, NOW())"
            )
            .bind("expense_submission")
            .bind("Expense Reviewed")
            .bind(format!("An expense has been reviewed and marked as {}.", serde_json::to_string(&e.status).unwrap_or_default().trim_matches('"')))
            .bind(e.id)
            .execute(state.db.as_ref())
            .await;

            Ok(HttpResponse::Ok().json(e))
        },
        _ => Ok(HttpResponse::NotFound().json(serde_json::json!({
            "error": "Expense not found"
        }))),
    }
}

pub async fn rider_performance(
    state: web::Data<AppState>,
) -> Result<HttpResponse, Error> {
    let riders = sqlx::query_as::<_, crate::models::TopRider>(
        "SELECT ROW_NUMBER() OVER (ORDER BY completed_deliveries DESC) as rank, full_name as rider_name, completed_deliveries as deliveries_completed, CASE WHEN total_deliveries > 0 THEN (completed_deliveries::float8 / total_deliveries::float8) * 100 ELSE 0 END as success_rate, total_revenue::float8 as revenue_generated FROM riders WHERE total_deliveries > 0 ORDER BY completed_deliveries DESC LIMIT 8"
    )
    .fetch_all(state.db.as_ref())
    .await
    .unwrap_or_default();

    Ok(HttpResponse::Ok().json(riders))
}

pub fn routes() -> actix_web::Scope {
    web::scope("/api/riders")
        .route("", web::get().to(list_riders))
        .route("", web::post().to(create_rider))
        .route("/{id}", web::get().to(get_rider))
        .route("/{id}", web::put().to(update_rider))
        .route("/{id}/suspend", web::post().to(suspend_rider))
        .route("/{id}/activate", web::post().to(activate_rider))
        .route("/performance", web::get().to(rider_performance))
        .route("/expenses", web::get().to(list_all_expenses))
        .route("/{id}/expenses", web::get().to(list_expenses))
        .route("/expenses", web::post().to(create_expense))
        .route("/expenses/{id}/review", web::post().to(review_expense))
}