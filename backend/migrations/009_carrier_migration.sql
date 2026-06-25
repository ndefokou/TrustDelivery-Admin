-- Migration: Rename riders table and related columns to carriers/carrier
-- This migrates the existing rider terminology to carrier terminology

-- Rename the riders table to carriers
ALTER TABLE riders RENAME TO carriers;

-- Rename assigned_rider_id column in deliveries table
ALTER TABLE deliveries RENAME COLUMN assigned_rider_id TO assigned_carrier_id;

-- Rename rider_id column in deliveries table
ALTER TABLE deliveries RENAME COLUMN rider_id TO carrier_id;

-- Rename rider_id column in expenses table
ALTER TABLE expenses RENAME COLUMN rider_id TO carrier_id;

-- Rename rider_id column in notifications table
ALTER TABLE notifications RENAME COLUMN rider_id TO carrier_id;

-- Rename the rider_status enum type to carrier_status
ALTER TYPE rider_status RENAME TO carrier_status;

-- Rename foreign key constraints on deliveries
ALTER TABLE deliveries RENAME CONSTRAINT deliveries_assigned_rider_id_fkey TO deliveries_assigned_carrier_id_fkey;
ALTER TABLE deliveries RENAME CONSTRAINT deliveries_rider_id_fkey TO deliveries_carrier_id_fkey;

-- Rename foreign key constraint on expenses
ALTER TABLE expenses RENAME CONSTRAINT expenses_rider_id_fkey TO expenses_carrier_id_fkey;

-- Rename foreign key constraint on notifications
ALTER TABLE notifications RENAME CONSTRAINT notifications_rider_id_fkey TO notifications_carrier_id_fkey;

-- Rename indexes (use IF EXISTS for indexes that may not exist)
ALTER INDEX IF EXISTS idx_deliveries_assigned_rider_id RENAME TO idx_deliveries_assigned_carrier_id;
ALTER INDEX IF EXISTS idx_deliveries_rider_id RENAME TO idx_deliveries_carrier_id;
ALTER INDEX IF EXISTS idx_expenses_rider_id RENAME TO idx_expenses_carrier_id;
ALTER INDEX IF EXISTS idx_notifications_rider_id RENAME TO idx_notifications_carrier_id;
ALTER INDEX IF EXISTS idx_riders_status RENAME TO idx_carriers_status;
ALTER INDEX IF EXISTS idx_riders_phone RENAME TO idx_carriers_phone;

-- Rename unique constraint indexes if they exist
ALTER INDEX IF EXISTS riders_phone_key RENAME TO carriers_phone_key;

-- Rename trigger on carriers table
DROP TRIGGER IF EXISTS update_riders_updated_at ON carriers;
CREATE TRIGGER update_carriers_updated_at BEFORE UPDATE ON carriers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create notification_type enum type (needed by Admin code)
-- Include all values: both existing uppercase data and new lowercase values from Admin code
CREATE TYPE notification_type AS ENUM (
    'new_paid_delivery',
    'failed_delivery',
    'expense_submission',
    'new_merchant_registration',
    'new_carrier_registration',
    'delivery_assigned',
    'DELIVERY_ASSIGNED',
    'SYSTEM',
    'EXPENSE_APPROVED',
    'NEW_DELIVERY',
    'EXPENSE_REJECTED',
    'DELIVERY_UPDATE',
    'SYSTEM_ANNOUNCEMENT'
);

-- Alter notifications.notification_type column from VARCHAR to enum
ALTER TABLE notifications ALTER COLUMN notification_type TYPE notification_type
    USING notification_type::notification_type;

-- Update notification type from new_rider_registration to new_carrier_registration
UPDATE notifications SET notification_type = 'new_carrier_registration' WHERE notification_type::text = 'new_rider_registration';

-- Add rider_notes column to deliveries if it doesn't exist (referenced in migration 006)
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS rider_notes TEXT;