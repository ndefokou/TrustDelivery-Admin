use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "delivery_status", rename_all = "snake_case")]
pub enum DeliveryStatus {
    #[serde(rename = "awaiting_assignment")]
    AwaitingAssignment,
    #[serde(rename = "awaiting_carrier_acceptance")]
    AwaitingCarrierAcceptance,
    #[serde(rename = "assigned")]
    Assigned,
    #[serde(rename = "accepted")]
    Accepted,
    #[serde(rename = "picked_up")]
    PickedUp,
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

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "varchar", rename_all = "snake_case")]
pub enum CollectionStatus {
    #[serde(rename = "pending")]
    Pending,
    #[serde(rename = "collected")]
    Collected,
    #[serde(rename = "not_collected")]
    NotCollected,
}

impl Default for CollectionStatus {
    fn default() -> Self {
        CollectionStatus::Pending
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
    pub assigned_carrier_id: Option<Uuid>,
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
    #[sqlx(default)]
    pub collect_payment: bool,
    #[sqlx(default)]
    pub amount_to_collect: Option<f64>,
    #[sqlx(default)]
    pub amount_collected: Option<f64>,
    #[sqlx(default)]
    pub collection_status: Option<String>,
    #[sqlx(default)]
    pub collected_at: Option<DateTime<Utc>>,
    #[sqlx(default)]
    pub carrier_notes: Option<String>,
}



#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Carrier {
    pub id: Uuid,
    pub company_name: String,
    pub phone: String,
    pub email: Option<String>,
    pub address: Option<String>,
    pub coverage_zones: Option<serde_json::Value>,
    pub max_capacity: Option<i32>,
    pub base_fee: Option<f64>,
    pub price_per_km: Option<f64>,
    pub is_active: bool,
    pub is_verified: bool,
    pub total_deliveries: Option<i32>,
    pub completed_deliveries: Option<i32>,
    pub failed_deliveries: Option<i32>,
    pub performance_score: Option<f64>,
    pub total_revenue: Option<f64>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "merchant_status", rename_all = "snake_case")]
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
#[sqlx(type_name = "user_role", rename_all = "snake_case")]
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
#[sqlx(type_name = "payment_method", rename_all = "snake_case")]
pub enum PaymentMethod {
    #[serde(rename = "orange_money")]
    OrangeMoney,
    #[serde(rename = "mtn_momo")]
    MtnMomo,
    #[serde(rename = "merchant_wallet")]
    MerchantWallet,
    #[serde(rename = "mtn_mobile_money")]
    MtnMobileMoney,
    #[serde(rename = "bank_transfer")]
    BankTransfer,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "payment_status", rename_all = "snake_case")]
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
#[sqlx(type_name = "expense_category", rename_all = "snake_case")]
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
#[sqlx(type_name = "expense_status", rename_all = "snake_case")]
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
    pub carrier_id: Uuid,
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
pub struct ExpenseWithCarrier {
    pub id: Uuid,
    pub carrier_id: Uuid,
    pub carrier_name: String,
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
    #[serde(rename = "new_carrier_registration")]
    NewCarrierRegistration,
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
    pub active_carriers: i64,
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
pub struct TopCarrier {
    pub rank: i32,
    pub carrier_name: String,
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
    pub top_performing_carriers: Vec<TopCarrier>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct CarrierCollection {
    pub id: Uuid,
    pub carrier_id: Uuid,
    pub delivery_id: Uuid,
    pub amount_collected: f64,
    pub amount_returned: f64,
    pub collection_status: String,
    pub collected_at: Option<DateTime<Utc>>,
    pub returned_at: Option<DateTime<Utc>>,
    pub validated_by: Option<Uuid>,
    pub validated_at: Option<DateTime<Utc>>,
    pub notes: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct CarrierCollectionWithDetails {
    pub id: Uuid,
    pub carrier_id: Uuid,
    pub carrier_name: String,
    pub delivery_id: Uuid,
    pub customer_name: String,
    pub amount_collected: f64,
    pub amount_returned: f64,
    pub collection_status: String,
    pub collected_at: Option<DateTime<Utc>>,
    pub returned_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct CarrierCollectionSummary {
    pub carrier_id: Uuid,
    pub carrier_name: String,
    pub total_collected: f64,
    pub total_returned: f64,
    pub outstanding_balance: f64,
    pub collections_count: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct CollectionLedger {
    pub id: Uuid,
    pub carrier_id: Option<Uuid>,
    pub delivery_id: Option<Uuid>,
    pub action: String,
    pub amount: f64,
    pub reference_id: Option<Uuid>,
    pub performed_by: Option<Uuid>,
    pub notes: Option<String>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidateReturnRequest {
    pub carrier_id: Uuid,
    pub amount: f64,
    pub notes: Option<String>,
}

pub mod requests;

pub use requests::*;