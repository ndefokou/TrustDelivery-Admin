use actix_web::{web, HttpResponse, Scope};
use serde::Serialize;
use uuid::Uuid;
use chrono::Utc;

use crate::config::AppState;

#[derive(Debug, Serialize)]
pub struct CollectionSummaryResponse {
    pub total_collected: f64,
    pub total_returned: f64,
    pub outstanding_balance: f64,
    pub riders: Vec<RiderCollectionSummary>,
}

#[derive(Debug, Serialize)]
pub struct RiderCollectionSummary {
    pub rider_id: Uuid,
    pub rider_name: String,
    pub rider_phone: String,
    pub total_collected: f64,
    pub total_returned: f64,
    pub outstanding_balance: f64,
    pub collections_count: i64,
}

#[derive(Debug, Serialize)]
pub struct CollectionHistoryResponse {
    pub records: Vec<CollectionRecord>,
    pub total: i64,
}

#[derive(Debug, Serialize)]
pub struct CollectionRecord {
    pub id: Uuid,
    pub rider_id: Uuid,
    pub rider_name: String,
    pub delivery_id: Uuid,
    pub customer_name: String,
    pub amount_to_collect: f64,
    pub amount_collected: Option<f64>,
    pub collection_status: String,
    pub collected_at: Option<String>,
    pub created_at: String,
}

#[derive(Debug, serde::Deserialize)]
pub struct ValidateReturnRequest {
    pub rider_id: Uuid,
    pub amount_returned: f64,
    pub notes: Option<String>,
}

pub async fn get_collection_summary(
    state: web::Data<AppState>,
) -> HttpResponse {
    let result = sqlx::query!(
        r#"
        SELECT 
            r.id as rider_id,
            r.full_name as rider_name,
            r.phone_number as rider_phone,
            COALESCE(SUM(d.amount_to_collect), 0)::float8 as total_to_collect,
            COALESCE(SUM(CASE WHEN d.collection_status = 'collected' THEN d.amount_to_collect ELSE 0 END), 0)::float8 as total_collected,
            COUNT(CASE WHEN d.collect_payment = true AND d.collection_status = 'collected' THEN 1 END) as collections_count
        FROM riders r
        LEFT JOIN deliveries d ON COALESCE(d.assigned_rider_id, d.rider_id) = r.id 
            AND d.collect_payment = true 
            AND d.status = 'delivered'
        WHERE r.is_active = true
        GROUP BY r.id, r.full_name, r.phone_number
        HAVING COUNT(CASE WHEN d.collect_payment = true AND d.collection_status = 'collected' THEN 1 END) > 0
        ORDER BY total_collected DESC
        "#
    )
    .fetch_all(state.db.as_ref())
    .await;

    match result {
        Ok(rows) => {
            let riders: Vec<RiderCollectionSummary> = rows.into_iter().map(|row| {
                RiderCollectionSummary {
                    rider_id: row.rider_id,
                    rider_name: row.rider_name.unwrap_or_default(),
                    rider_phone: row.rider_phone.unwrap_or_default(),
                    total_collected: row.total_collected.unwrap_or(0.0),
                    total_returned: 0.0,
                    outstanding_balance: row.total_collected.unwrap_or(0.0),
                    collections_count: row.collections_count.unwrap_or(0) as i64,
                }
            }).collect();

            let total_collected: f64 = riders.iter().map(|r| r.total_collected).sum();
            
            HttpResponse::Ok().json(CollectionSummaryResponse {
                total_collected,
                total_returned: 0.0,
                outstanding_balance: total_collected,
                riders,
            })
        },
        Err(e) => {
            eprintln!("Error fetching collection summary: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": format!("Database error: {}", e)
            }))
        }
    }
}

pub async fn get_rider_collections(
    state: web::Data<AppState>,
    path: web::Path<Uuid>,
) -> HttpResponse {
    let rider_id = path.into_inner();

    let result = sqlx::query!(
        r#"
        SELECT 
            d.id as delivery_id,
            d.customer_name,
            d.amount_to_collect,
            d.amount_collected,
            d.collection_status,
            d.collected_at,
            d.delivered_at as created_at
        FROM deliveries d
        WHERE COALESCE(d.assigned_rider_id, d.rider_id) = $1 
            AND d.collect_payment = true 
            AND d.status = 'delivered'
        ORDER BY d.delivered_at DESC
        "#,
        rider_id
    )
    .fetch_all(state.db.as_ref())
    .await;

    match result {
        Ok(rows) => {
            let rider_name_result = sqlx::query_scalar!(
                "SELECT full_name FROM riders WHERE id = $1",
                rider_id
            )
            .fetch_one(state.db.as_ref())
            .await;

            let rider_name = rider_name_result.unwrap_or_else(|_| "Unknown Rider".to_string());

            let records: Vec<CollectionRecord> = rows.into_iter().map(|row| {
                CollectionRecord {
                    id: Uuid::new_v4(),
                    rider_id,
                    rider_name: rider_name.clone(),
                    delivery_id: row.delivery_id,
                    customer_name: row.customer_name.unwrap_or_default(),
                    amount_to_collect: row.amount_to_collect.unwrap_or(0.0) as f64,
                    amount_collected: row.amount_collected.map(|v| v as f64),
                    collection_status: row.collection_status.unwrap_or_else(|| "pending".to_string()),
                    collected_at: row.collected_at.map(|t| t.to_rfc3339()),
                    created_at: row.created_at.map(|t| t.to_rfc3339()).unwrap_or_default(),
                }
            }).collect();

            let total = records.len() as i64;

            HttpResponse::Ok().json(CollectionHistoryResponse {
                records,
                total,
            })
        },
        Err(e) => {
            eprintln!("Error fetching rider collections: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": format!("Database error: {}", e)
            }))
        }
    }
}

pub async fn get_collection_history(
    state: web::Data<AppState>,
) -> HttpResponse {
    let result = sqlx::query!(
        r#"
        SELECT 
            d.id as delivery_id,
            COALESCE(d.assigned_rider_id, d.rider_id) as rider_id,
            r.full_name as rider_name,
            d.customer_name,
            d.amount_to_collect,
            d.amount_collected,
            d.collection_status,
            d.collected_at,
            d.delivered_at as created_at
        FROM deliveries d
        LEFT JOIN riders r ON r.id = COALESCE(d.assigned_rider_id, d.rider_id)
        WHERE d.collect_payment = true 
            AND d.status = 'delivered'
        ORDER BY d.delivered_at DESC
        LIMIT 100
        "#
    )
    .fetch_all(state.db.as_ref())
    .await;

    match result {
        Ok(rows) => {
            let records: Vec<CollectionRecord> = rows.into_iter().map(|row| {
                CollectionRecord {
                    id: Uuid::new_v4(),
                    rider_id: row.rider_id.unwrap_or_else(Uuid::nil),
                    rider_name: row.rider_name.unwrap_or_else(|| "Unknown".to_string()),
                    delivery_id: row.delivery_id,
                    customer_name: row.customer_name.unwrap_or_default(),
                    amount_to_collect: row.amount_to_collect.unwrap_or(0.0) as f64,
                    amount_collected: row.amount_collected.map(|v| v as f64),
                    collection_status: row.collection_status.unwrap_or_else(|| "pending".to_string()),
                    collected_at: row.collected_at.map(|t| t.to_rfc3339()),
                    created_at: row.created_at.map(|t| t.to_rfc3339()).unwrap_or_default(),
                }
            }).collect();

            let total = records.len() as i64;

            HttpResponse::Ok().json(CollectionHistoryResponse {
                records,
                total,
            })
        },
        Err(e) => {
            eprintln!("Error fetching collection history: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": format!("Database error: {}", e)
            }))
        }
    }
}

pub async fn validate_return(
    state: web::Data<AppState>,
    body: web::Json<ValidateReturnRequest>,
) -> HttpResponse {
    let result = sqlx::query!(
        r#"
        UPDATE deliveries 
        SET collection_status = 'returned',
            amount_collected = amount_to_collect
        WHERE COALESCE(assigned_rider_id, rider_id) = $1 
            AND collect_payment = true 
            AND collection_status = 'collected'
            AND status = 'delivered'
        "#,
        body.rider_id
    )
    .execute(state.db.as_ref())
    .await;

    match result {
        Ok(_) => {
            HttpResponse::Ok().json(serde_json::json!({
                "message": "Return validated successfully",
                "rider_id": body.rider_id,
                "amount_returned": body.amount_returned
            }))
        },
        Err(e) => {
            eprintln!("Error validating return: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": format!("Database error: {}", e)
            }))
        }
    }
}

pub fn routes() -> Scope {
    web::scope("/api/collections")
        .route("/summary", web::get().to(get_collection_summary))
        .route("/history", web::get().to(get_collection_history))
        .route("/rider/{id}", web::get().to(get_rider_collections))
        .route("/validate-return", web::post().to(validate_return))
}