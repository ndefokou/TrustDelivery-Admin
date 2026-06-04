-- TrustDelivery Admin Panel — Add-on Migration
-- Run this in your EXISTING Supabase SQL Editor
-- This migration ONLY creates admin tables, skipping any that already exist

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────
-- CUSTOM TYPES (safe creation)
-- ─────────────────────────────────────────

DO $$ BEGIN
    CREATE TYPE delivery_status AS ENUM ('awaiting_assignment', 'assigned', 'in_transit', 'delivered', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE rider_status AS ENUM ('active', 'offline', 'busy', 'suspended');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM ('orange_money', 'mtn_mobile_money', 'bank_transfer');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'super_admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE expense_category AS ENUM ('fuel', 'maintenance', 'parking', 'other');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE expense_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM ('new_paid_delivery', 'failed_delivery', 'expense_submission', 'new_merchant_registration', 'new_rider_registration', 'delivery_assigned');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─────────────────────────────────────────
-- ADMIN TABLES
-- ─────────────────────────────────────────

-- 1. Admin Users
CREATE TABLE IF NOT EXISTS users (
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

-- 2. Riders
CREATE TABLE IF NOT EXISTS riders (
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

-- 3. Deliveries (references existing merchants table)
CREATE TABLE IF NOT EXISTS deliveries (
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
    merchant_id UUID NOT NULL,
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

-- Add foreign key constraint for merchants (if merchants table exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'merchants') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'deliveries_merchant_id_fkey' 
            AND table_name = 'deliveries'
        ) THEN
            ALTER TABLE deliveries ADD CONSTRAINT deliveries_merchant_id_fkey 
            FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE;
        END IF;
    END IF;
END $$;

-- 4. Payments
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id VARCHAR(100) UNIQUE NOT NULL,
    delivery_id UUID NOT NULL,
    merchant_id UUID NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    payment_method payment_method NOT NULL,
    status payment_status NOT NULL DEFAULT 'pending',
    payment_reference VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Add foreign key for payments
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'payments_delivery_id_fkey' 
        AND table_name = 'payments'
    ) THEN
        ALTER TABLE payments ADD CONSTRAINT payments_delivery_id_fkey 
        FOREIGN KEY (delivery_id) REFERENCES deliveries(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'payments_merchant_id_fkey' 
        AND table_name = 'payments'
    ) THEN
        ALTER TABLE payments ADD CONSTRAINT payments_merchant_id_fkey 
        FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 5. Rider Expenses
CREATE TABLE IF NOT EXISTS rider_expenses (
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

-- 6. Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notification_type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    reference_id UUID,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- 7. Pricing Rules
CREATE TABLE IF NOT EXISTS pricing_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    min_distance_km DECIMAL(8, 2) NOT NULL,
    max_distance_km DECIMAL(8, 2) NOT NULL,
    base_price DECIMAL(12, 2) NOT NULL,
    price_per_km DECIMAL(12, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Company Settings
CREATE TABLE IF NOT EXISTS company_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    logo_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_deliveries_status ON deliveries(status);
CREATE INDEX IF NOT EXISTS idx_deliveries_created ON deliveries(created_at);
CREATE INDEX IF NOT EXISTS idx_riders_status ON riders(status);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(is_read);

-- ─────────────────────────────────────────
-- DEFAULT DATA
-- ─────────────────────────────────────────

-- Default Pricing Rules
INSERT INTO pricing_rules (min_distance_km, max_distance_km, base_price, price_per_km)
SELECT * FROM (VALUES
    (0, 3, 1000, NULL),
    (3, 5, 1500, NULL),
    (5, 10, 2500, NULL),
    (10, 999999, 3000, 200)
) AS v (min_distance_km, max_distance_km, base_price, price_per_km)
WHERE NOT EXISTS (SELECT 1 FROM pricing_rules LIMIT 1);

-- Default Company Settings
INSERT INTO company_settings (company_name, address, phone, email)
SELECT 'TrustDelivery', 'Yaoundé, Cameroon', '+237 XXX XXX XXX', 'info@trustdelivery.cm'
WHERE NOT EXISTS (SELECT 1 FROM company_settings LIMIT 1);

-- Default Admin User (password: admin123)
INSERT INTO users (email, password_hash, full_name, role)
SELECT 'admin@trustdelivery.cm', '$2b$12$LQv3c1yqBWVHxkd0LHA4COYz6TtxMQJqhN8/X4.Dz4vVkZrPW8.d0', 'Admin User', 'super_admin'
WHERE NOT EXISTS (SELECT 1 FROM users LIMIT 1);

-- ─────────────────────────────────────────
-- AUTO-UPDATE TIMESTAMP TRIGGERS
-- ─────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_riders_updated_at ON riders;
CREATE TRIGGER update_riders_updated_at BEFORE UPDATE ON riders 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pricing_rules_updated_at ON pricing_rules;
CREATE TRIGGER update_pricing_rules_updated_at BEFORE UPDATE ON pricing_rules 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_company_settings_updated_at ON company_settings;
CREATE TRIGGER update_company_settings_updated_at BEFORE UPDATE ON company_settings 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
