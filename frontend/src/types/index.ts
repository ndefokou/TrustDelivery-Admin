export type DeliveryStatus = 'awaiting_assignment' | 'assigned' | 'in_transit' | 'delivered' | 'failed'

export type RiderStatus = 'active' | 'offline' | 'busy' | 'suspended'

export type MerchantStatus = 'active' | 'suspended' | 'pending'

export type PaymentMethod = 'orange_money' | 'mtn_mobile_money' | 'bank_transfer'

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded'

export type UserRole = 'admin' | 'super_admin'

export type ExpenseCategory = 'fuel' | 'maintenance' | 'parking' | 'other'

export type ExpenseStatus = 'pending' | 'approved' | 'rejected'

export type NotificationType = 
  | 'new_paid_delivery' 
  | 'failed_delivery' 
  | 'expense_submission' 
  | 'new_merchant_registration' 
  | 'new_rider_registration'
  | 'delivery_assigned'

export interface Delivery {
  id: string
  product_description: string
  product_value: number
  delivery_cost: number
  distance_km: number
  customer_name: string
  customer_phone: string
  delivery_address: string
  delivery_lat?: number
  delivery_lng?: number
  merchant_id: string
  assigned_rider_id?: string
  status: DeliveryStatus
  failure_reason?: string
  otp_code?: string
  otp_verified: boolean
  created_at: string
  paid_at?: string
  assigned_at?: string
  picked_up_at?: string
  delivered_at?: string
  failed_at?: string
}

export interface Rider {
  id: string
  full_name: string
  phone_number: string
  national_id: string
  address: string
  motorbike_registration: string
  profile_photo?: string
  status: RiderStatus
  current_lat?: number
  current_lng?: number
  total_deliveries: number
  completed_deliveries: number
  failed_deliveries: number
  performance_score: number
  total_revenue: number
  created_at: string
  updated_at: string
}

export interface Merchant {
  id: string
  business_name: string
  owner_name: string
  email: string
  phone_number: string
  address: string
  status: MerchantStatus
  total_deliveries: number
  total_revenue: number
  active_deliveries: number
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  full_name: string
  role: UserRole
}

export interface Payment {
  id: string
  transaction_id: string
  delivery_id: string
  merchant_id: string
  amount: number
  payment_method: PaymentMethod
  status: PaymentStatus
  payment_reference?: string
  created_at: string
  completed_at?: string
}

export interface Expense {
  id: string
  rider_id: string
  rider_name?: string
  category: ExpenseCategory
  amount: number
  description: string
  receipt_image?: string
  status: ExpenseStatus
  admin_notes?: string
  created_at: string
  reviewed_at?: string
  reviewed_by?: string
}

export interface Notification {
  id: string
  notification_type: NotificationType
  title: string
  message: string
  reference_id?: string
  is_read: boolean
  created_at: string
  read_at?: string
}

export interface KPICard {
  title: string
  value: number
  trend?: {
    direction: 'up' | 'down'
    percentage: number
  }
  icon: string
}

export interface DashboardStats {
  total_deliveries_today: number
  in_transit: number
  completed_today: number
  failed_today: number
  revenue_today: number
  active_riders: number
}

export interface DailyDeliveries {
  date: string
  count: number
}

export interface DailyRevenue {
  date: string
  revenue: number
}

export interface StatusDistribution {
  status: string
  count: number
  percentage: number
}

export interface TopRider {
  rank: number
  rider_name: string
  deliveries_completed: number
  success_rate: number
  revenue_generated: number
}

export interface DashboardData {
  stats: DashboardStats
  kpi_cards: KPICard[]
  deliveries_per_day: DailyDeliveries[]
  revenue_per_day: DailyRevenue[]
  status_distribution: StatusDistribution[]
  top_performing_riders: TopRider[]
}

export interface PaginationParams {
  page: number
  per_page: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  per_page: number
}

export interface PricingRule {
  min_distance_km: number
  max_distance_km: number
  base_price: number
  price_per_km?: number
}

export interface CompanySettings {
  company_name: string
  address: string
  phone: string
  email: string
  logo_url?: string
}

export interface Settings {
  company: CompanySettings
  pricing_rules: PricingRule[]
}