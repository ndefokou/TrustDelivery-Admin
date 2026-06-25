-- Migration: Align carriers table schema for carrier-specific columns
-- This renames rider-specific columns and adds carrier-specific ones

-- Rename full_name to company_name
ALTER TABLE carriers RENAME COLUMN full_name TO company_name;

-- Drop rider-specific columns that are no longer needed
ALTER TABLE carriers DROP COLUMN IF EXISTS national_id;
ALTER TABLE carriers DROP COLUMN IF EXISTS motorbike_brand;
ALTER TABLE carriers DROP COLUMN IF EXISTS motorbike_model;
ALTER TABLE carriers DROP COLUMN IF EXISTS motorbike_plate;
ALTER TABLE carriers DROP COLUMN IF EXISTS emergency_contact_name;
ALTER TABLE carriers DROP COLUMN IF EXISTS emergency_contact_phone;
ALTER TABLE carriers DROP COLUMN IF EXISTS profile_photo_url;

-- Add carrier-specific columns if they don't exist
ALTER TABLE carriers ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE carriers ADD COLUMN IF NOT EXISTS coverage_zones JSONB DEFAULT '[]'::jsonb;
ALTER TABLE carriers ADD COLUMN IF NOT EXISTS max_capacity INTEGER DEFAULT 200;
ALTER TABLE carriers ADD COLUMN IF NOT EXISTS base_fee DOUBLE PRECISION DEFAULT 1500;
ALTER TABLE carriers ADD COLUMN IF NOT EXISTS price_per_km DOUBLE PRECISION DEFAULT 200;
ALTER TABLE carriers ADD COLUMN IF NOT EXISTS performance_score DOUBLE PRECISION DEFAULT 0;
ALTER TABLE carriers ADD COLUMN IF NOT EXISTS total_deliveries INTEGER DEFAULT 0;
ALTER TABLE carriers ADD COLUMN IF NOT EXISTS completed_deliveries INTEGER DEFAULT 0;
ALTER TABLE carriers ADD COLUMN IF NOT EXISTS failed_deliveries INTEGER DEFAULT 0;
ALTER TABLE carriers ADD COLUMN IF NOT EXISTS total_revenue DOUBLE PRECISION DEFAULT 0;

-- Drop carrier_status enum type if it exists (we now use is_active boolean)
DROP TYPE IF EXISTS carrier_status;