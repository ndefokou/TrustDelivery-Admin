-- Add COD (Cash-on-Delivery) fields to deliveries table

-- Add COD fields to deliveries
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS collect_payment BOOLEAN DEFAULT false;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS amount_to_collect DECIMAL(12, 2) DEFAULT 0;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS amount_collected DECIMAL(12, 2);
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS collection_status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS collected_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS rider_notes TEXT;

-- Create rider_collections table for tracking financial ledger
CREATE TABLE IF NOT EXISTS rider_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rider_id UUID REFERENCES riders(id) ON DELETE CASCADE,
    delivery_id UUID REFERENCES deliveries(id) ON DELETE CASCADE,
    amount_collected DECIMAL(12, 2) NOT NULL DEFAULT 0,
    amount_returned DECIMAL(12, 2) DEFAULT 0,
    collection_status VARCHAR(20) NOT NULL DEFAULT 'pending',
    collected_at TIMESTAMP WITH TIME ZONE,
    returned_at TIMESTAMP WITH TIME ZONE,
    validated_by UUID REFERENCES users(id),
    validated_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME TIME DEFAULT NOW()
);

-- Create index on rider_collections
CREATE INDEX IF NOT EXISTS idx_rider_collections_rider_id ON rider_collections(rider_id);
CREATE INDEX IF NOT EXISTS idx_rider_collections_delivery_id ON rider_collections(delivery_id);
CREATE INDEX IF NOT EXISTS idx_rider_collections_status ON rider_collections(collection_status);

-- Create collection_ledger for audit trail
CREATE TABLE IF NOT EXISTS collection_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rider_id UUID REFERENCES riders(id) ON DELETE SET NULL,
    delivery_id UUID REFERENCES deliveries(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    reference_id UUID,
    performed_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_collection_ledger_rider_id ON collection_ledger(rider_id);
CREATE INDEX IF NOT EXISTS idx_collection_ledger_delivery_id ON collection_ledger(delivery_id);
CREATE INDEX IF NOT EXISTS idx_collection_ledger_action ON collection_ledger(action);

-- Update trigger for rider_collections
DROP TRIGGER IF EXISTS update_rider_collections_updated_at ON rider_collections;
CREATE TRIGGER update_rider_collections_updated_at BEFORE UPDATE ON rider_collections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();