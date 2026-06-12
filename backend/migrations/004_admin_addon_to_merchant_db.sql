-- TrustDelivery Admin Panel — Add-on Migration for Merchant Supabase DB
-- Run this in the Merchant Supabase SQL Editor before starting the Admin backend

-- 1. Add 'refunded' to payment_status (backward compatible, no data conflicts expected)
ALTER TYPE payment_status ADD VALUE IF NOT EXISTS 'refunded';

-- 2. Add missing Admin payment_method values to Merchant DB enum
ALTER TYPE payment_method ADD VALUE IF NOT EXISTS 'bank_transfer';
ALTER TYPE payment_method ADD VALUE IF NOT EXISTS 'mtn_mobile_money';

-- 3. Create merchant_status enum (if not exists)
DO $$ BEGIN
    CREATE TYPE merchant_status AS ENUM ('active', 'suspended', 'pending');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 4. Add computed/admin columns to merchants table
ALTER TABLE merchants
ADD COLUMN IF NOT EXISTS status merchant_status NOT NULL DEFAULT 'active',
ADD COLUMN IF NOT EXISTS total_deliveries INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_revenue NUMERIC(12,2) NOT NULL DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS active_deliveries INTEGER NOT NULL DEFAULT 0;

-- 5. Add trigger to auto-update merchants.updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_merchants_updated_at ON merchants;
CREATE TRIGGER update_merchants_updated_at
    BEFORE UPDATE ON merchants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
