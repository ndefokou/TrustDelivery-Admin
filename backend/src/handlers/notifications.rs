use actix_web::{web, HttpResponse, Error};
use crate::config::AppState;
use crate::models::Notification;
use uuid::Uuid;

pub async fn list_notifications(state: web::Data<AppState>) -> Result<HttpResponse, Error> {
    let notifications = sqlx::query_as::<_, Notification>(
        "SELECT id, notification_type, title, message, reference_id, is_read, created_at, read_at FROM notifications ORDER BY created_at DESC LIMIT 50"
    )
    .fetch_all(state.db.as_ref())
    .await
    .unwrap_or_default();

    let unread_count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM notifications WHERE is_read = false")
        .fetch_one(state.db.as_ref())
        .await
        .unwrap_or(0);

    Ok(HttpResponse::Ok().json(serde_json::json!({
        "notifications": notifications,
        "total": notifications.len() as i64,
        "unread_count": unread_count
    })))
}

pub async fn mark_as_read(
    state: web::Data<AppState>,
    path: web::Path<Uuid>,
) -> Result<HttpResponse, Error> {
    let id = path.into_inner();

    let notification = sqlx::query_as::<_, Notification>(
        "UPDATE notifications SET is_read = true, read_at = NOW() WHERE id = $1 RETURNING id, notification_type, title, message, reference_id, is_read, created_at, read_at",
    )
    .bind(id)
    .fetch_one(state.db.as_ref())
    .await;

    match notification {
        Ok(n) => Ok(HttpResponse::Ok().json(n)),
        _ => Ok(HttpResponse::NotFound().json(serde_json::json!({
            "error": "Notification not found"
        }))),
    }
}

pub async fn mark_all_as_read(state: web::Data<AppState>) -> Result<HttpResponse, Error> {
    let _ = sqlx::query("UPDATE notifications SET is_read = true, read_at = NOW() WHERE is_read = false")
        .execute(state.db.as_ref())
        .await;

    Ok(HttpResponse::Ok().json(serde_json::json!({
        "message": "All notifications marked as read"
    })))
}

pub fn routes() -> actix_web::Scope {
    web::scope("/api/notifications")
        .route("", web::get().to(list_notifications))
        .route("/{id}/read", web::post().to(mark_as_read))
        .route("/read-all", web::post().to(mark_all_as_read))
}