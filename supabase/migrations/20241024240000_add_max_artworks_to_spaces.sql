-- Add max_artworks column to spaces table
-- This allows each space to have a maximum number of artworks that can be reserved

ALTER TABLE spaces 
ADD COLUMN IF NOT EXISTS max_artworks INTEGER DEFAULT 1 NOT NULL,
ADD COLUMN IF NOT EXISTS current_reservations INTEGER DEFAULT 0 NOT NULL;

-- Add check constraint to ensure current_reservations doesn't exceed max_artworks
ALTER TABLE spaces 
ADD CONSTRAINT check_reservations_not_exceed_max 
CHECK (current_reservations <= max_artworks);

-- Add comments for documentation
COMMENT ON COLUMN spaces.max_artworks IS 'Maximum number of artworks that can be reserved in this space simultaneously';
COMMENT ON COLUMN spaces.current_reservations IS 'Current number of active reservations in this space';

-- Update existing spaces with default value
UPDATE spaces SET max_artworks = 1 WHERE max_artworks IS NULL;
UPDATE spaces SET current_reservations = 0 WHERE current_reservations IS NULL;








