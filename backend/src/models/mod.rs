use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "delivery_status", rename_all = "lowercase")]
pub enum DeliveryStatus {
    #[serde(rename = "awaiting_assignment")]
    AwaitingAssignment,
    #[serde(rename = "assigned")]
    Assigned,
    #[serde(rename = "in_transit")]
    InTransit,
    #[serde(rename = "delivered")]
    Delivered,
    #[serde(rename = "failed")]
    Failed,
}

impl Default for DeliveryStatus {
    fn default() -> Self {
        DeliveryStatus::AwaitingAssignment
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Delivery {
    pub id: Uuid,
    pub product_description: String,
    pub product_value: f64,
    pub delivery_cost: f64,
    pub distance_km: f64,
    pub customer_name: String,
    pub customer_phone: String,
    pub delivery_address: String,
    pub delivery_lat: Option<f64>,
    pub delivery_lng: Option<f64>,
    pub merchant_id: Uuid,
    pub assigned_rider_id: Option<Uuid>,
    pub status: DeliveryStatus,
    pub failure_reason: Option<String>,
    pub otp_code: Option<String>,
    pub otp_verified: bool,
    pub created_at: DateTime<Utc>,
    pub paid_at: Option<DateTime<Utc>>,
    pub assigned_at: Option<DateTime<Utc>>,
    pub picked_up_at: Option<DateTime<Utc>>,
    pub delivered_at: Option<DateTime<Utc>>,
    pub failed_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "rider_status", rename_all = "lowercase")]
pub enum RiderStatus {
    #[serde(rename = "active")]
    Active,
    #[serde(rename = "offline")]
    Offline,
    #[serde(rename = "busy")]
    Busy,
    #[serde(rename = "suspended")]
    Suspended,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Rider {
    pub id: Uuid,
    pub full_name: String,
    pub phone_number: String,
    pub national_id: String,
    pub address: String,
    pub motorbike_registration: String,
    pub profile_photo: Option<String>,
    pub status: RiderStatus,
    pub current_lat: Option<f64>,
    pub current_lng: Option<f64>,
    pub total_deliveries: i32,
    pub completed_deliveries: i32,
    pub failed_deliveries: i32,
    pub performance_score: f64,
    pub total_revenue: f64,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "merchant_status", rename_all = "lowercase")]
pub enum MerchantStatus {
    #[serde(rename = "active")]
    Active,
    #[serde(rename = "suspended")]
    Suspended,
    #[serde(rename = "pending")]
    Pending,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Merchant {
    pub id: Uuid,
    pub business_name: String,
    pub owner_name: String,
    pub email: String,
    pub phone_number: String,
    pub address: String,
    pub status: MerchantStatus,
    pub total_deliveries: i32,
    pub total_revenue: f64,
    pub active_deliveries: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "text")]
pub enum UserRole {
    #[serde(rename = "admin")]
    Admin,
    #[serde(rename = "super_admin")]
    SuperAdmin,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct User {
    pub id: Uuid,
    pub email: String,
    pub password_hash: String,
    pub full_name: String,
    pub role: UserRole,
    pub is_active: bool,
    pub last_login: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "text")]
pub enum PaymentMethod {
    #[serde(rename = "orange_money")]
    OrangeMoney,
    #[serde(rename = "mtn_mobile_money")]
    MtnMobileMoney,
    #[serde(rename = "bank_transfer")]
    BankTransfer,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "text")]
pub enum PaymentStatus {
    #[serde(rename = "pending")]
    Pending,
    #[serde(rename = "completed")]
    Completed,
    #[serde(rename = "failed")]
    Failed,
    #[serde(rename = "refunded")]
    Refunded,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Payment {
    pub id: Uuid,
    pub transaction_id: String,
    pub delivery_id: Uuid,
    pub merchant_id: Uuid,
    pub amount: f64,
    pub payment_method: PaymentMethod,
    pub status: PaymentStatus,
    pub payment_reference: Option<String>,
    pub created_at: DateTime<Utc>,
    pub completed_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "expense_category", rename_all = "lowercase")]
pub enum ExpenseCategory {
    #[serde(rename = "fuel")]
    Fuel,
    #[serde(rename = "maintenance")]
    Maintenance,
    #[serde(rename = "parking")]
    Parking,
    #[serde(rename = "other")]
    Other,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "expense_status", rename_all = "lowercase")]
pub enum ExpenseStatus {
    #[serde(rename = "pending")]
    Pending,
    #[serde(rename = "approved")]
    Approved,
    #[serde(rename = "rejected")]
    Rejected,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Expense {
    pub id: Uuid,
    pub rider_id: Uuid,
    pub category: ExpenseCategory,
    pub amount: f64,
    pub description: String,
    pub receipt_image: Option<String>,
    pub status: ExpenseStatus,
    pub admin_notes: Option<String>,
    pub created_at: DateTime<Utc>,
    pub reviewed_at: Option<DateTime<Utc>>,
    pub reviewed_by: Option<Uuid>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct ExpenseWithRider {
    pub id: Uuid,
    pub rider_id: Uuid,
    pub rider_name: String,
    pub category: ExpenseCategory,
    pub amount: f64,
    pub description: String,
    pub receipt_image: Option<String>,
    pub status: ExpenseStatus,
    pub admin_notes: Option<String>,
    pub created_at: DateTime<Utc>,
    pub reviewed_at: Option<DateTime<Utc>>,
    pub reviewed_by: Option<Uuid>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "notification_type", rename_all = "snake_case")]
pub enum NotificationType {
    #[serde(rename = "new_paid_delivery")]
    NewPaidDelivery,
    #[serde(rename = "failed_delivery")]
    FailedDelivery,
    #[serde(rename = "expense_submission")]
    ExpenseSubmission,
    #[serde(rename = "new_merchant_registration")]
    NewMerchantRegistration,
    #[serde(rename = "new_rider_registration")]
    NewRiderRegistration,
    #[serde(rename = "delivery_assigned")]
    DeliveryAssigned,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Notification {
    pub id: Uuid,
    pub notification_type: NotificationType,
    pub title: String,
    pub message: String,
    pub reference_id: Option<Uuid>,
    pub is_read: bool,
    pub created_at: DateTime<Utc>,
    pub read_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PricingRule {
    pub min_distance_km: f64,
    pub max_distance_km: f64,
    pub base_price: f64,
    pub price_per_km: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CompanySettings {
    pub company_name: String,
    pub address: String,
    pub phone: String,
    pub email: String,
    pub logo_url: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Settings {
    pub company: CompanySettings,
    pub pricing_rules: Vec<PricingRule>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KPICard {
    pub title: String,
    pub value: i64,
    pub trend: Option<Trend>,
    pub icon: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Trend {
    pub direction: String,
    pub percentage: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DashboardStats {
    pub total_deliveries_today: i64,
    pub in_transit: i64,
    pub completed_today: i64,
    pub failed_today: i64,
    pub revenue_today: f64,
    pub active_riders: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct DailyDeliveries {
    pub date: String,
    pub count: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct DailyRevenue {
    pub date: String,
    pub revenue: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct StatusDistribution {
    pub status: String,
    pub count: i32,
    pub percentage: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct TopRider {
    pub rank: i32,
    pub rider_name: String,
    pub deliveries_completed: i32,
    pub success_rate: f64,
    pub revenue_generated: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DashboardData {
    pub stats: DashboardStats,
    pub kpi_cards: Vec<KPICard>,
    pub deliveries_per_day: Vec<DailyDeliveries>,
    pub revenue_per_day: Vec<DailyRevenue>,
    pub status_distribution: Vec<StatusDistribution>,
    pub top_performing_riders: Vec<TopRider>,
}

pub mod requests;

pub use requests::*;