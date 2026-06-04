-- TrustDelivery Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Custom Types
CREATE TYPE delivery_status AS ENUM ('awaiting_assignment', 'assigned', 'in_transit', 'delivered', 'failed');
CREATE TYPE rider_status AS ENUM ('active', 'offline', 'busy', 'suspended');
CREATE TYPE merchant_status AS ENUM ('active', 'suspended', 'pending');
CREATE TYPE payment_method AS ENUM ('orange_money', 'mtn_mobile_money', 'bank_transfer');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE user_role AS ENUM ('admin', 'super_admin');
CREATE TYPE expense_category AS ENUM ('fuel', 'maintenance', 'parking', 'other');
CREATE TYPE expense_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE notification_type AS ENUM ('new_paid_delivery', 'failed_delivery', 'expense_submission', 'new_merchant_registration', 'new_rider_registration', 'delivery_assigned');

-- Users Table (Administrators)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Merchants Table
CREATE TABLE merchants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_name VARCHAR(255) NOT NULL,
    owner_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    status merchant_status NOT NULL DEFAULT 'active',
    total_deliveries INTEGER DEFAULT 0,
    total_revenue DECIMAL(12, 2) DEFAULT 0.0,
    active_deliveries INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Riders Table
CREATE TABLE riders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    national_id VARCHAR(50) UNIQUE NOT NULL,
    address TEXT NOT NULL,
    motorbike_registration VARCHAR(50) NOT NULL,
    profile_photo VARCHAR(500),
    status rider_status NOT NULL DEFAULT 'active',
    current_lat DECIMAL(10, 8),
    current_lng DECIMAL(11, 8),
    total_deliveries INTEGER DEFAULT 0,
    completed_deliveries INTEGER DEFAULT 0,
    failed_deliveries INTEGER DEFAULT 0,
    performance_score DECIMAL(5, 2) DEFAULT 0.0,
    total_revenue DECIMAL(12, 2) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deliveries Table
CREATE TABLE deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_description TEXT NOT NULL,
    product_value DECIMAL(12, 2) NOT NULL,
    delivery_cost DECIMAL(12, 2) NOT NULL,
    distance_km DECIMAL(8, 2) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    delivery_address TEXT NOT NULL,
    delivery_lat DECIMAL(10, 8),
    delivery_lng DECIMAL(11, 8),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    assigned_rider_id UUID REFERENCES riders(id) ON DELETE SET NULL,
    status delivery_status NOT NULL DEFAULT 'awaiting_assignment',
    failure_reason TEXT,
    otp_code VARCHAR(6),
    otp_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    paid_at TIMESTAMP WITH TIME ZONE,
    assigned_at TIMESTAMP WITH TIME ZONE,
    picked_up_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE
);

-- Payments Table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id VARCHAR(100) UNIQUE NOT NULL,
    delivery_id UUID NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    payment_method payment_method NOT NULL,
    status payment_status NOT NULL DEFAULT 'pending',
    payment_reference VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Rider Expenses Table
CREATE TABLE rider_expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rider_id UUID NOT NULL REFERENCES riders(id) ON DELETE CASCADE,
    category expense_category NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    description TEXT NOT NULL,
    receipt_image VARCHAR(500),
    status expense_status NOT NULL DEFAULT 'pending',
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Notifications Table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notification_type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    reference_id UUID,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- Pricing Rules Table
CREATE TABLE pricing_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    min_distance_km DECIMAL(8, 2) NOT NULL,
    max_distance_km DECIMAL(8, 2) NOT NULL,
    base_price DECIMAL(12, 2) NOT NULL,
    price_per_km DECIMAL(12, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Company Settings Table
CREATE TABLE company_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    logo_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Indexes for Performance
CREATE INDEX idx_deliveries_status ON deliveries(status);
CREATE INDEX idx_deliveries_merchant ON deliveries(merchant_id);
CREATE INDEX idx_deliveries_rider ON deliveries(assigned_rider_id);
CREATE INDEX idx_deliveries_created ON deliveries(created_at);
CREATE INDEX idx_riders_status ON riders(status);
CREATE INDEX idx_merchants_status ON merchants(status);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created ON payments(created_at);

-- Insert Default Pricing Rules
INSERT INTO pricing_rules (min_distance_km, max_distance_km, base_price, price_per_km) VALUES
(0, 3, 1000, NULL),
(3, 5, 1500, NULL),
(5, 10, 2500, NULL),
(10, 999999, 3000, 200);

-- Insert Default Company Settings
INSERT INTO company_settings (company_name, address, phone, email) VALUES
('TrustDelivery', 'Yaoundé, Cameroon', '+237 XXX XXX XXX', 'info@trustdelivery.cm');

-- Insert Sample Admin User (password: admin123)
INSERT INTO users (email, password_hash, full_name, role) VALUES
('admin@trustdelivery.cm', '$2b$12$LQv3c1yqBWVHxkd0LHA4COYz6TtxMQJqhN8/X4.Dz4vVkZrPW8.d0', 'Admin User', 'super_admin');

-- Create Function to Update Timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create Triggers for Updated At
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_merchants_updated_at BEFORE UPDATE ON merchants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_riders_updated_at BEFORE UPDATE ON riders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pricing_rules_updated_at BEFORE UPDATE ON pricing_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_company_settings_updated_at BEFORE UPDATE ON company_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();