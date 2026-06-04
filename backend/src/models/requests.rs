use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateDeliveryRequest {
    pub product_description: String,
    pub product_value: f64,
    pub distance_km: f64,
    pub customer_name: String,
    pub customer_phone: String,
    pub delivery_address: String,
    pub delivery_lat: Option<f64>,
    pub delivery_lng: Option<f64>,
    pub merchant_id: Uuid,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateDeliveryRequest {
    pub product_description: Option<String>,
    pub customer_name: Option<String>,
    pub customer_phone: Option<String>,
    pub delivery_address: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AssignRiderRequest {
    pub rider_id: Uuid,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeliveryFilter {
    pub status: Option<String>,
    pub merchant_id: Option<Uuid>,
    pub rider_id: Option<Uuid>,
    pub date_from: Option<DateTime<Utc>>,
    pub date_to: Option<DateTime<Utc>>,
    pub search: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeliveryListResponse {
    pub deliveries: Vec<crate::models::Delivery>,
    pub total: i64,
    pub page: i32,
    pub per_page: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeliveryTimelineEvent {
    pub status: String,
    pub timestamp: DateTime<Utc>,
    pub description: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeliveryDetailsResponse {
    pub delivery: crate::models::Delivery,
    pub merchant: MerchantBasic,
    pub rider: Option<RiderBasic>,
    pub timeline: Vec<DeliveryTimelineEvent>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct MerchantBasic {
    pub id: Uuid,
    pub business_name: String,
    pub contact_phone: String,
    pub email: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct RiderBasic {
    pub id: Uuid,
    pub full_name: String,
    pub phone_number: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateRiderRequest {
    pub full_name: String,
    pub phone_number: String,
    pub national_id: String,
    pub address: String,
    pub motorbike_registration: String,
    pub profile_photo: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateRiderRequest {
    pub full_name: Option<String>,
    pub phone_number: Option<String>,
    pub address: Option<String>,
    pub profile_photo: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RiderFilter {
    pub status: Option<String>,
    pub search: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RiderListResponse {
    pub riders: Vec<crate::models::Rider>,
    pub total: i64,
    pub page: i32,
    pub per_page: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateMerchantRequest {
    pub business_name: String,
    pub owner_name: String,
    pub email: String,
    pub phone_number: String,
    pub address: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateMerchantRequest {
    pub business_name: Option<String>,
    pub owner_name: Option<String>,
    pub email: Option<String>,
    pub phone_number: Option<String>,
    pub address: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MerchantFilter {
    pub status: Option<String>,
    pub search: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MerchantListResponse {
    pub merchants: Vec<crate::models::Merchant>,
    pub total: i64,
    pub page: i32,
    pub per_page: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LoginResponse {
    pub token: String,
    pub user: UserInfo,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserInfo {
    pub id: Uuid,
    pub email: String,
    pub full_name: String,
    pub role: crate::models::UserRole,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateUserRequest {
    pub email: String,
    pub password: String,
    pub full_name: String,
    pub role: crate::models::UserRole,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PaymentFilter {
    pub merchant_id: Option<Uuid>,
    pub status: Option<String>,
    pub date_from: Option<DateTime<Utc>>,
    pub date_to: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateExpenseRequest {
    pub rider_id: Uuid,
    pub category: crate::models::ExpenseCategory,
    pub amount: f64,
    pub description: String,
    pub receipt_image: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReviewExpenseRequest {
    pub status: crate::models::ExpenseStatus,
    pub admin_notes: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateSettingsRequest {
    pub company: Option<crate::models::CompanySettings>,
    pub pricing_rules: Option<Vec<crate::models::PricingRule>>,
}