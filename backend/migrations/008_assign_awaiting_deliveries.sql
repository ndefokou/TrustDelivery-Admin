-- Migration: Assign all awaiting deliveries to available riders using round-robin
-- Run this to assign deliveries that are stuck in awaiting_assignment status

-- First, update any uppercase status values to lowercase for consistency
UPDATE deliveries SET status = 'awaiting_assignment' WHERE LOWER(status) = 'awaiting_assignment' AND status != 'awaiting_assignment';
UPDATE deliveries SET status = 'assigned' WHERE LOWER(status) = 'assigned' AND status != 'assigned';
UPDATE deliveries SET status = 'in_transit' WHERE LOWER(status) = 'in_transit' AND status != 'in_transit';
UPDATE deliveries SET status = 'delivered' WHERE LOWER(status) = 'delivered' AND status != 'delivered';
UPDATE deliveries SET status = 'failed' WHERE LOWER(status) = 'failed' AND status != 'failed';

-- Ensure riders are marked as verified and active
UPDATE riders SET is_verified = true WHERE is_verified IS NULL;
UPDATE riders SET is_active = true WHERE is_active IS NULL;

-- Assign all awaiting deliveries to riders with lowest workload (round-robin)
DO $$
DECLARE
    delivery_record RECORD;
    v_rider_id UUID;
    v_rider_name TEXT;
    v_count INTEGER := 0;
BEGIN
    -- Loop through all awaiting deliveries
    FOR delivery_record IN 
        SELECT id, product_description 
        FROM deliveries 
        WHERE LOWER(status) = 'awaiting_assignment'
        ORDER BY created_at ASC
    LOOP
        -- Find rider with fewest active deliveries (round-robin assignment)
        -- This allows riders to have multiple deliveries at once
        SELECT r.id, r.full_name INTO v_rider_id, v_rider_name
        FROM riders r
        LEFT JOIN deliveries d ON COALESCE(d.assigned_rider_id, d.rider_id) = r.id 
            AND LOWER(d.status) IN ('assigned', 'in_transit')
        WHERE COALESCE(r.is_active, true) = true
            AND COALESCE(r.is_verified, true) = true
        GROUP BY r.id, r.full_name
        ORDER BY COUNT(d.id) ASC, r.created_at ASC
        LIMIT 1;
        
        -- If a rider is found, assign the delivery
        IF v_rider_id IS NOT NULL THEN
            UPDATE deliveries 
            SET 
                assigned_rider_id = v_rider_id,
                status = 'assigned',
                assigned_at = NOW(),
                updated_at = NOW()
            WHERE id = delivery_record.id;
            
            -- Create notification if table exists
            BEGIN
                INSERT INTO notifications (rider_id, title, message, notification_type, related_id, is_read, created_at)
                VALUES (
                    v_rider_id,
                    'New Delivery Assigned',
                    'A delivery for ' || COALESCE(delivery_record.product_description, 'Unknown') || ' has been assigned to you.',
                    'DELIVERY_ASSIGNED',
                    delivery_record.id,
                    false,
                    NOW()
                );
            EXCEPTION WHEN OTHERS THEN
                NULL;
            END;
            
            v_count := v_count + 1;
            RAISE NOTICE 'Assigned delivery % to rider %', delivery_record.id, v_rider_name;
        ELSE
            RAISE NOTICE 'No available rider found for delivery %', delivery_record.id;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Total deliveries assigned: %', v_count;
END $$;