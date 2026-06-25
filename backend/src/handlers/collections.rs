use actix_web::{web, HttpResponse, Scope};
use serde::Serialize;
use uuid::Uuid;
use bigdecimal::num_traits::ToPrimitive;

use crate::config::AppState;

#[derive(Debug, Serialize)]
pub struct CollectionSummaryResponse {
    pub total_collected: f64,
    pub total_returned: f64,
    pub outstanding_balance: f64,
    pub carriers: Vec<CarrierCollectionSummary>,
}

#[derive(Debug, Serialize)]
pub struct CarrierCollectionSummary {
    pub carrier_id: Uuid,
    pub carrier_name: String,
    pub carrier_phone: String,
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
    pub carrier_id: Uuid,
    pub carrier_name: String,
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
    pub carrier_id: Uuid,
    pub amount_returned: f64,
    pub notes: Option<String>,
}

pub async fn get_collection_summary(
    state: web::Data<AppState>,
) -> HttpResponse {
    let rows = sqlx::query_as::<_, (Uuid, String, String, Option<sqlx::types::BigDecimal>, Option<sqlx::types::BigDecimal>, Option<i64>)>(
        r#"
        SELECT 
            r.id as carrier_id,
            r.company_name as carrier_name,
            r.phone as carrier_phone,
            COALESCE(SUM(d.amount_to_collect), 0) as total_to_collect,
            COALESCE(SUM(CASE WHEN d.collection_status = 'collected' THEN d.amount_to_collect ELSE 0 END), 0) as total_collected,
            COUNT(CASE WHEN d.collect_payment = true AND d.collection_status = 'collected' THEN 1 END) as collections_count
        FROM carriers r
        LEFT JOIN deliveries d ON COALESCE(d.assigned_carrier_id, d.carrier_id) = r.id 
            AND d.collect_payment = true 
            AND d.status = 'delivered'
        WHERE r.is_active = true
        GROUP BY r.id, r.company_name, r.phone
        HAVING COUNT(CASE WHEN d.collect_payment = true AND d.collection_status = 'collected' THEN 1 END) > 0
        ORDER BY total_collected DESC
        "#
    )
    .fetch_all(state.db.as_ref())
    .await;

    match rows {
        Ok(rows) => {
            let carriers: Vec<CarrierCollectionSummary> = rows.into_iter().map(|(carrier_id, carrier_name, carrier_phone, _total_to_collect, total_collected, collections_count)| {
                let collected = total_collected
                    .as_ref()
                    .and_then(|v| v.to_f64())
                    .unwrap_or(0.0);
                CarrierCollectionSummary {
                    carrier_id,
                    carrier_name,
                    carrier_phone,
                    total_collected: collected,
                    total_returned: 0.0,
                    outstanding_balance: collected,
                    collections_count: collections_count.unwrap_or(0),
                }
            }).collect();

            let total_collected: f64 = carriers.iter().map(|r| r.total_collected).sum();
            
            HttpResponse::Ok().json(CollectionSummaryResponse {
                total_collected,
                total_returned: 0.0,
                outstanding_balance: total_collected,
                carriers,
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

pub async fn get_carrier_collections(
    state: web::Data<AppState>,
    path: web::Path<Uuid>,
) -> HttpResponse {
    let carrier_id = path.into_inner();

    let carrier_name_result: Result<String, _> = sqlx::query_scalar(
        "SELECT company_name FROM carriers WHERE id = $1"
    )
    .bind(carrier_id)
    .fetch_one(state.db.as_ref())
    .await;

    let carrier_name = carrier_name_result.unwrap_or_else(|_| "Unknown Carrier".to_string());

    let records: Vec<CollectionRecord> = match sqlx::query_as::<_, (Uuid, String, Option<sqlx::types::BigDecimal>, Option<sqlx::types::BigDecimal>, Option<String>, Option<chrono::DateTime<chrono::Utc>>, Option<chrono::DateTime<chrono::Utc>>)>(
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
        WHERE COALESCE(d.assigned_carrier_id, d.carrier_id) = $1 
            AND d.collect_payment = true 
            AND d.status = 'delivered'
        ORDER BY d.delivered_at DESC
        "#
    )
    .bind(carrier_id)
    .fetch_all(state.db.as_ref())
    .await {
        Ok(rows) => rows.into_iter().map(|(delivery_id, customer_name, amount_to_collect, amount_collected, collection_status, collected_at, created_at)| {
            CollectionRecord {
                id: Uuid::new_v4(),
                carrier_id,
                carrier_name: carrier_name.clone(),
                delivery_id,
                customer_name,
                amount_to_collect: amount_to_collect.and_then(|v| v.to_f64()).unwrap_or(0.0),
                amount_collected: amount_collected.and_then(|v| v.to_f64()),
                collection_status: collection_status.unwrap_or_else(|| "pending".to_string()),
                collected_at: collected_at.map(|t| t.to_rfc3339()),
                created_at: created_at.map(|t| t.to_rfc3339()).unwrap_or_default(),
            }
        }).collect(),
        Err(e) => {
            eprintln!("Error fetching carrier collections: {}", e);
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "error": format!("Database error: {}", e)
            }));
        }
    };

    let total = records.len() as i64;

    HttpResponse::Ok().json(CollectionHistoryResponse {
        records,
        total,
    })
}

pub async fn get_collection_history(
    state: web::Data<AppState>,
) -> HttpResponse {
    let records: Vec<CollectionRecord> = match sqlx::query_as::<_, (Uuid, Option<Uuid>, String, String, Option<sqlx::types::BigDecimal>, Option<sqlx::types::BigDecimal>, Option<String>, Option<chrono::DateTime<chrono::Utc>>, Option<chrono::DateTime<chrono::Utc>>)>(
        r#"
        SELECT 
            d.id as delivery_id,
            COALESCE(d.assigned_carrier_id, d.carrier_id) as carrier_id,
            r.company_name as carrier_name,
            d.customer_name,
            d.amount_to_collect,
            d.amount_collected,
            d.collection_status,
            d.collected_at,
            d.delivered_at as created_at
        FROM deliveries d
        LEFT JOIN carriers r ON r.id = COALESCE(d.assigned_carrier_id, d.carrier_id)
        WHERE d.collect_payment = true 
            AND d.status = 'delivered'
        ORDER BY d.delivered_at DESC
        LIMIT 100
        "#
    )
    .fetch_all(state.db.as_ref())
    .await {
        Ok(rows) => rows.into_iter().map(|(delivery_id, carrier_id, carrier_name, customer_name, amount_to_collect, amount_collected, collection_status, collected_at, created_at)| {
            CollectionRecord {
                id: Uuid::new_v4(),
                carrier_id: carrier_id.unwrap_or_else(Uuid::nil),
                carrier_name,
                delivery_id,
                customer_name,
                amount_to_collect: amount_to_collect.and_then(|v| v.to_f64()).unwrap_or(0.0),
                amount_collected: amount_collected.and_then(|v| v.to_f64()),
                collection_status: collection_status.unwrap_or_else(|| "pending".to_string()),
                collected_at: collected_at.map(|t| t.to_rfc3339()),
                created_at: created_at.map(|t| t.to_rfc3339()).unwrap_or_default(),
            }
        }).collect(),
        Err(e) => {
            eprintln!("Error fetching collection history: {}", e);
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "error": format!("Database error: {}", e)
            }));
        }
    };

    let total = records.len() as i64;

    HttpResponse::Ok().json(CollectionHistoryResponse {
        records,
        total,
    })
}

pub async fn validate_return(
    state: web::Data<AppState>,
    body: web::Json<ValidateReturnRequest>,
) -> HttpResponse {
    let result = sqlx::query(
        r#"
        UPDATE deliveries 
        SET collection_status = 'returned',
            amount_collected = amount_to_collect
        WHERE COALESCE(assigned_carrier_id, carrier_id) = $1 
            AND collect_payment = true 
            AND collection_status = 'collected'
            AND status = 'delivered'
        "#
    )
    .bind(body.carrier_id)
    .execute(state.db.as_ref())
    .await;

    match result {
        Ok(_) => {
            HttpResponse::Ok().json(serde_json::json!({
                "message": "Return validated successfully",
                "carrier_id": body.carrier_id,
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
        .route("/carrier/{id}", web::get().to(get_carrier_collections))
        .route("/validate-return", web::post().to(validate_return))
}