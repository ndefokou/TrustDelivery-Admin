use actix_web::{web, HttpResponse, Error};
use crate::config::AppState;
use crate::models::{CreateCarrierRequest, UpdateCarrierRequest, UpdateCarrierPasswordRequest, CarrierListResponse, CarrierFilter, Carrier, Expense, CreateExpenseRequest, ReviewExpenseRequest};
use uuid::Uuid;

const CARRIER_SELECT: &str = "id, company_name, phone, email, address, coverage_zones, max_capacity, base_fee, price_per_km, is_active, is_verified, total_deliveries, completed_deliveries, failed_deliveries, performance_score, total_revenue, created_at, updated_at";

pub async fn list_carriers(
    state: web::Data<AppState>,
    _query: web::Query<CarrierFilter>,
) -> Result<HttpResponse, Error> {
    let page: i64 = 1;
    let per_page: i64 = 20;
    
    let carriers = sqlx::query_as::<_, Carrier>(
        &format!("SELECT {} FROM carriers ORDER BY created_at DESC LIMIT $1 OFFSET $2", CARRIER_SELECT),
    )
    .bind(per_page)
    .bind((page - 1) * per_page)
    .fetch_all(state.db.as_ref())
    .await
    .unwrap_or_default();

    let total: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM carriers")
        .fetch_one(state.db.as_ref())
        .await
        .unwrap_or(0);

    Ok(HttpResponse::Ok().json(CarrierListResponse {
        carriers,
        total,
        page: page as i32,
        per_page: per_page as i32,
    }))
}

pub async fn get_carrier(
    state: web::Data<AppState>,
    path: web::Path<Uuid>,
) -> Result<HttpResponse, Error> {
    let id = path.into_inner();
    
    let carrier = sqlx::query_as::<_, Carrier>(
        &format!("SELECT {} FROM carriers WHERE id = $1", CARRIER_SELECT),
    )
    .bind(id)
    .fetch_optional(state.db.as_ref())
    .await;

    match carrier {
        Ok(Some(c)) => Ok(HttpResponse::Ok().json(c)),
        _ => Ok(HttpResponse::NotFound().json(serde_json::json!({
            "error": "Carrier not found"
        }))),
    }
}

pub async fn create_carrier(
    state: web::Data<AppState>,
    req: web::Json<CreateCarrierRequest>,
) -> Result<HttpResponse, Error> {
    let password_hash = bcrypt::hash(&req.password, bcrypt::DEFAULT_COST)
        .map_err(|e| {
            log::error!("Failed to hash password: {}", e);
            actix_web::error::ErrorInternalServerError("Failed to hash password")
        })?;
    
    let carrier = sqlx::query_as::<_, Carrier>(
        &format!("INSERT INTO carriers (company_name, phone, email, password_hash, address, is_active, is_verified, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, true, true, NOW(), NOW()) RETURNING {}", CARRIER_SELECT),
    )
    .bind(&req.company_name)
    .bind(&req.phone)
    .bind(&req.email)
    .bind(&password_hash)
    .bind(&req.address)
    .fetch_one(state.db.as_ref())
    .await;

    match carrier {
        Ok(c) => {
            let _ = sqlx::query(
                "INSERT INTO notifications (notification_type, title, message, reference_id, is_read, created_at) VALUES ($1::notification_type, $2, $3, $4, false, NOW())"
            )
            .bind("new_carrier_registration")
            .bind("New Carrier Created")
            .bind(format!("Carrier {} has been created with email {}.", c.company_name, c.email.as_ref().unwrap_or(&String::new())))
            .bind(c.id)
            .execute(state.db.as_ref())
            .await;

            Ok(HttpResponse::Created().json(c))
        },
        Err(e) => {
            log::error!("Failed to create carrier: {}", e);
            let error_msg = e.to_string();
            let user_message = if error_msg.contains("carriers_phone_key") || error_msg.contains("carriers_phone_number_key") {
                "A carrier with this phone number already exists"
            } else if error_msg.contains("carriers_email_key") {
                "A carrier with this email already exists"
            } else {
                "Failed to create carrier"
            };
            Ok(HttpResponse::BadRequest().json(serde_json::json!({
                "error": user_message
            })))
        }
    }
}

pub async fn update_carrier(
    state: web::Data<AppState>,
    path: web::Path<Uuid>,
    req: web::Json<UpdateCarrierRequest>,
) -> Result<HttpResponse, Error> {
    let id = path.into_inner();
    
    let carrier = sqlx::query_as::<_, Carrier>(
        &format!("UPDATE carriers SET company_name = COALESCE($1, company_name), phone = COALESCE($2, phone), email = COALESCE($3, email), address = COALESCE($4, address), updated_at = NOW() WHERE id = $5 RETURNING {}", CARRIER_SELECT),
    )
    .bind(&req.company_name)
    .bind(&req.phone)
    .bind(&req.email)
    .bind(&req.address)
    .bind(id)
    .fetch_one(state.db.as_ref())
    .await;

    match carrier {
        Ok(c) => Ok(HttpResponse::Ok().json(c)),
        _ => Ok(HttpResponse::NotFound().json(serde_json::json!({
            "error": "Carrier not found"
        }))),
    }
}

pub async fn update_carrier_password(
    state: web::Data<AppState>,
    path: web::Path<Uuid>,
    req: web::Json<UpdateCarrierPasswordRequest>,
) -> Result<HttpResponse, Error> {
    let id = path.into_inner();
    
    let password_hash = bcrypt::hash(&req.password, bcrypt::DEFAULT_COST)
        .map_err(|e| {
            log::error!("Failed to hash password: {}", e);
            actix_web::error::ErrorInternalServerError("Failed to hash password")
        })?;
    
    let result = sqlx::query(
        "UPDATE carriers SET password_hash = $1, updated_at = NOW() WHERE id = $2"
    )
    .bind(&password_hash)
    .bind(id)
    .execute(state.db.as_ref())
    .await;

    match result {
        Ok(_) => Ok(HttpResponse::Ok().json(serde_json::json!({
            "message": "Password updated successfully",
            "plain_password": req.password
        }))),
        Err(e) => {
            log::error!("Failed to update carrier password: {}", e);
            Ok(HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to update password"
            })))
        }
    }
}

pub async fn suspend_carrier(
    state: web::Data<AppState>,
    path: web::Path<Uuid>,
) -> Result<HttpResponse, Error> {
    let id = path.into_inner();
    
    let carrier = sqlx::query_as::<_, Carrier>(
        &format!("UPDATE carriers SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING {}", CARRIER_SELECT),
    )
    .bind(id)
    .fetch_one(state.db.as_ref())
    .await;

    match carrier {
        Ok(c) => {
            let _ = sqlx::query(
                "INSERT INTO notifications (notification_type, title, message, reference_id, is_read, created_at) VALUES ($1::notification_type, $2, $3, $4, false, NOW())"
            )
            .bind("new_carrier_registration")
            .bind("Carrier Suspended")
            .bind(format!("Carrier {} has been suspended by admin.", c.company_name))
            .bind(c.id)
            .execute(state.db.as_ref())
            .await;

            Ok(HttpResponse::Ok().json(c))
        },
        _ => Ok(HttpResponse::NotFound().json(serde_json::json!({
            "error": "Carrier not found"
        }))),
    }
}

pub async fn activate_carrier(
    state: web::Data<AppState>,
    path: web::Path<Uuid>,
) -> Result<HttpResponse, Error> {
    let id = path.into_inner();
    
    let carrier = sqlx::query_as::<_, Carrier>(
        &format!("UPDATE carriers SET is_active = true, updated_at = NOW() WHERE id = $1 RETURNING {}", CARRIER_SELECT),
    )
    .bind(id)
    .fetch_one(state.db.as_ref())
    .await;

    match carrier {
        Ok(c) => {
            let _ = sqlx::query(
                "INSERT INTO notifications (notification_type, title, message, reference_id, is_read, created_at) VALUES ($1::notification_type, $2, $3, $4, false, NOW())"
            )
            .bind("new_carrier_registration")
            .bind("Carrier Activated")
            .bind(format!("Carrier {} has been activated by admin.", c.company_name))
            .bind(c.id)
            .execute(state.db.as_ref())
            .await;

            Ok(HttpResponse::Ok().json(c))
        },
        _ => Ok(HttpResponse::NotFound().json(serde_json::json!({
            "error": "Carrier not found"
        }))),
    }
}

pub async fn list_expenses(
    state: web::Data<AppState>,
    path: web::Path<Uuid>,
) -> Result<HttpResponse, Error> {
    let carrier_id = path.into_inner();
    let expenses = sqlx::query_as::<_, Expense>(
        "SELECT id, carrier_id, category, amount::float8, description, receipt_url AS receipt_image, status, rejection_reason AS admin_notes, created_at, reviewed_at, reviewed_by FROM expenses WHERE carrier_id = $1 ORDER BY created_at DESC LIMIT 50",
    )
    .bind(carrier_id)
    .fetch_all(state.db.as_ref())
    .await
    .unwrap_or_default();

    Ok(HttpResponse::Ok().json(expenses))
}

pub async fn list_all_expenses(
    state: web::Data<AppState>,
) -> Result<HttpResponse, Error> {
    let expenses = sqlx::query_as::<_, crate::models::ExpenseWithCarrier>(
        "SELECT e.id, e.carrier_id, r.company_name as carrier_name, e.category, e.amount::float8, e.description, e.receipt_url AS receipt_image, e.status, e.rejection_reason AS admin_notes, e.created_at, e.reviewed_at, e.reviewed_by FROM expenses e JOIN carriers r ON e.carrier_id = r.id ORDER BY e.created_at DESC LIMIT 50",
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
        "INSERT INTO expenses (carrier_id, category, amount, description, receipt_url, status, created_at) VALUES ($1, $2::expense_category, $3, $4, $5, 'pending'::expense_status, NOW()) RETURNING id, carrier_id, category, amount::float8, description, receipt_url AS receipt_image, status, rejection_reason AS admin_notes, created_at, reviewed_at, reviewed_by",
    )
    .bind(req.carrier_id)
    .bind(&req.category)
    .bind(req.amount)
    .bind(&req.description)
    .bind(&req.receipt_image)
    .fetch_one(state.db.as_ref())
    .await;

    match expense {
        Ok(e) => {
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
        "UPDATE expenses SET status = $1::expense_status, rejection_reason = $2, reviewed_at = NOW() WHERE id = $3 RETURNING id, carrier_id, category, amount::float8, description, receipt_url AS receipt_image, status, rejection_reason AS admin_notes, created_at, reviewed_at, reviewed_by",
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

pub async fn carrier_performance(
    state: web::Data<AppState>,
) -> Result<HttpResponse, Error> {
    let carriers = sqlx::query_as::<_, crate::models::TopCarrier>(
        "SELECT ROW_NUMBER() OVER (ORDER BY COUNT(*) FILTER (WHERE LOWER(d.status::text) = 'delivered') DESC)::int4 as rank, r.company_name as carrier_name, COUNT(*) FILTER (WHERE LOWER(d.status::text) = 'delivered')::int4 as deliveries_completed, CASE WHEN COUNT(*) > 0 THEN (COUNT(*) FILTER (WHERE LOWER(d.status::text) = 'delivered')::float8 / COUNT(*)::float8) * 100 ELSE 0 END as success_rate, COALESCE(SUM(COALESCE(d.delivery_fee, 0)), 0)::float8 as revenue_generated FROM carriers r LEFT JOIN deliveries d ON COALESCE(d.assigned_carrier_id, d.carrier_id) = r.id GROUP BY r.id, r.company_name HAVING COUNT(*) > 0 ORDER BY deliveries_completed DESC LIMIT 8"
    )
    .fetch_all(state.db.as_ref())
    .await
    .unwrap_or_default();

    Ok(HttpResponse::Ok().json(carriers))
}

pub fn routes() -> actix_web::Scope {
    web::scope("/api/carriers")
        .route("", web::get().to(list_carriers))
        .route("", web::post().to(create_carrier))
        .service(
            web::resource("/performance")
                .route(web::get().to(carrier_performance))
        )
        .service(
            web::resource("/expenses")
                .route(web::get().to(list_all_expenses))
                .route(web::post().to(create_expense))
        )
        .service(
            web::resource("/expenses/{id}/review")
                .route(web::post().to(review_expense))
        )
        .service(
            web::resource("/{id}")
                .route(web::get().to(get_carrier))
                .route(web::put().to(update_carrier))
        )
        .service(
            web::resource("/{id}/password")
                .route(web::put().to(update_carrier_password))
        )
        .service(
            web::resource("/{id}/suspend")
                .route(web::post().to(suspend_carrier))
        )
        .service(
            web::resource("/{id}/activate")
                .route(web::post().to(activate_carrier))
        )
        .service(
            web::resource("/{id}/expenses")
                .route(web::get().to(list_expenses))
        )
}