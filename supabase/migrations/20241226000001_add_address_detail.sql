-- Add address_detail column to locations table
ALTER TABLE locations ADD COLUMN IF NOT EXISTS address_detail TEXT;

-- Add comment
COMMENT ON COLUMN locations.address_detail IS 'Detailed address information (e.g., floor, room number)';






