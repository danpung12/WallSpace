-- Add manually_closed column to spaces table
-- This allows managers to manually close/open spaces regardless of booking status

ALTER TABLE spaces ADD COLUMN IF NOT EXISTS manually_closed BOOLEAN DEFAULT false;

-- Add comment to explain the column
COMMENT ON COLUMN spaces.manually_closed IS 'Allows managers to manually mark a space as closed, independent of booking status';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_spaces_manually_closed ON spaces(manually_closed);


