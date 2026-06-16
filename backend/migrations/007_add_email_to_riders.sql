-- Add email and password_hash columns to riders table if they don't exist

-- Add email column
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'riders' AND column_name = 'email') THEN
        ALTER TABLE riders ADD COLUMN email VARCHAR(255);
    END IF;
END $$;

-- Add password_hash column
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'riders' AND column_name = 'password_hash') THEN
        ALTER TABLE riders ADD COLUMN password_hash VARCHAR(255) NOT NULL DEFAULT '';
    END IF;
END $$;

-- Add is_verified column
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'riders' AND column_name = 'is_verified') THEN
        ALTER TABLE riders ADD COLUMN is_verified BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Create unique index on email
CREATE UNIQUE INDEX IF NOT EXISTS idx_riders_email ON riders(email) WHERE email IS NOT NULL;

-- Update existing riders to have is_verified = true
UPDATE riders SET is_verified = true WHERE is_verified IS NULL;