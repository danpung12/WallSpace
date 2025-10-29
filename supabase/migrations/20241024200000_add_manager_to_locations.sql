-- Add manager_id to locations table
ALTER TABLE locations
ADD COLUMN IF NOT EXISTS manager_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_locations_manager ON locations(manager_id);

-- Update RLS policy for managers to only see their own locations
DROP POLICY IF EXISTS "Managers can manage locations" ON locations;

CREATE POLICY "Managers can manage their own locations" ON locations 
FOR ALL 
USING (
  manager_id = auth.uid() 
  OR 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.user_type = 'manager'
    AND manager_id IS NULL  -- Allow access to unassigned locations for claiming
  )
);

-- Update existing locations (optional - for testing, assign to current user)
-- You can run this manually if needed:
-- UPDATE locations SET manager_id = (SELECT id FROM profiles WHERE user_type = 'manager' LIMIT 1) WHERE manager_id IS NULL;

COMMENT ON COLUMN locations.manager_id IS 'The manager/owner of this location';










