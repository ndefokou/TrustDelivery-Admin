use actix_web::{web, HttpResponse, Error};
use crate::config::AppState;
use crate::models::Payment;
use uuid::Uuid;

pub async fn list_payments(
    state: web::Data<AppState>,
    _query: web::Json<crate::models::PaymentFilter>,
) -> Result<HttpResponse, Error> {
    let page: i64 = 1;
    let per_page: i64 = 20;
    
    let payments = sqlx::query_as::<_, Payment>(
        "SELECT id, transaction_id, delivery_id, merchant_id, amount, payment_method, status, payment_reference, created_at, completed_at FROM payments ORDER BY created_at DESC LIMIT $1 OFFSET $2",
    )
    .bind(per_page)
    .bind((page - 1) * per_page)
    .fetch_all(state.db.as_ref())
    .await
    .unwrap_or_default();

    let total: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM payments")
        .fetch_one(state.db.as_ref())
        .await
        .unwrap_or(0);

    Ok(HttpResponse::Ok().json(serde_json::json!({
        "payments": payments,
        "total": total,
        "page": page,
        "per_page": per_page,
    })))
}

pub async fn get_payment(
    state: web::Data<AppState>,
    path: web::Path<Uuid>,
) -> Result<HttpResponse, Error> {
    let id = path.into_inner();
    
    let payment = sqlx::query_as::<_, Payment>(
        "SELECT id, transaction_id, delivery_id, merchant_id, amount, payment_method, status, payment_reference, created_at, completed_at FROM payments WHERE id = $1",
    )
    .bind(id)
    .fetch_optional(state.db.as_ref())
    .await;

    match payment {
        Ok(Some(p)) => Ok(HttpResponse::Ok().json(p)),
        _ => Ok(HttpResponse::NotFound().json(serde_json::json!({
            "error": "Payment not found"
        }))),
    }
}

pub fn routes() -> actix_web::Scope {
    web::scope("/api/payments")
        .route("", web::get().to(list_payments))
        .route("/{id}", web::get().to(get_payment))
}