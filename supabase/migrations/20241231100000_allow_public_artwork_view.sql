-- Allow anyone (including unauthenticated users) to view artworks
-- This enables sharing artwork links publicly

-- Drop existing view policy if exists
DROP POLICY IF EXISTS "Anyone can view artworks" ON artworks;

-- Create new policy that allows public viewing
CREATE POLICY "Anyone can view artworks"
ON artworks FOR SELECT
USING (true);

-- Ensure profiles can be viewed publicly (for artist information)
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;

CREATE POLICY "Users can view all profiles"
ON profiles FOR SELECT
USING (true);


