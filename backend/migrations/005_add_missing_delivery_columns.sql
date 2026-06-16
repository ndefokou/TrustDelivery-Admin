-- Migration: Add missing columns to deliveries table (for existing Supabase databases)
-- Run this if you have an existing deliveries table from the merchant app

-- Add missing columns to deliveries table (if they don't exist)
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS delivery_cost DECIMAL(12, 2) NOT NULL DEFAULT 0;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS distance_km DECIMAL(8, 2) NOT NULL DEFAULT 0;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS delivery_address_text TEXT;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS failure_reason TEXT;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS otp_code VARCHAR(6);
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS otp_verified BOOLEAN DEFAULT false;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS picked_up_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS failed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'FCFA';
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'merchant_wallet';
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending';
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS delivery_id VARCHAR(100);
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS assigned_rider_id UUID;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS product_description TEXT;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS product_value DECIMAL(12, 2) NOT NULL DEFAULT 0;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255);
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(20);

-- Update delivery_address_text from delivery_address if it exists and delivery_address_text is null
UPDATE deliveries SET delivery_address_text = delivery_address WHERE delivery_address_text IS NULL AND delivery_address IS NOT NULL;

-- Ensure delivery_cost has a value (update from existing data if needed)
UPDATE deliveries SET delivery_cost = COALESCE(delivery_cost, 0) WHERE delivery_cost IS NULL;

-- Add foreign key constraint for assigned_rider_id (if riders table exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'riders') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'deliveries_assigned_rider_id_fkey' 
            AND table_name = 'deliveries'
        ) THEN
            ALTER TABLE deliveries ADD CONSTRAINT deliveries_assigned_rider_id_fkey 
            FOREIGN KEY (assigned_rider_id) REFERENCES riders(id) ON DELETE SET NULL;
        END IF;
    END IF;
END $$;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_deliveries_merchant_id ON deliveries(merchant_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_assigned_rider_id ON deliveries(assigned_rider_id);