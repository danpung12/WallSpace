-- Add missing columns to spaces table to match schema
-- This ensures all required columns exist before inserting mock data

-- Add columns if they don't exist
ALTER TABLE spaces 
ADD COLUMN IF NOT EXISTS width INTEGER,
ADD COLUMN IF NOT EXISTS height INTEGER,
ADD COLUMN IF NOT EXISTS price INTEGER,
ADD COLUMN IF NOT EXISTS is_reserved BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS description TEXT;

-- Update existing records with default values if needed
UPDATE spaces SET width = 500 WHERE width IS NULL;
UPDATE spaces SET height = 300 WHERE height IS NULL;
UPDATE spaces SET price = 100000 WHERE price IS NULL;
UPDATE spaces SET is_reserved = false WHERE is_reserved IS NULL;

-- Make required columns NOT NULL after setting default values
ALTER TABLE spaces 
ALTER COLUMN width SET NOT NULL,
ALTER COLUMN height SET NOT NULL,
ALTER COLUMN price SET NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN spaces.width IS 'Width in cm';
COMMENT ON COLUMN spaces.height IS 'Height in cm';
COMMENT ON COLUMN spaces.price IS 'Daily rental price in KRW';
COMMENT ON COLUMN spaces.is_reserved IS 'Whether the space is currently reserved';
COMMENT ON COLUMN spaces.image_url IS 'URL of space image';
COMMENT ON COLUMN spaces.description IS 'Space description';

