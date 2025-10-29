-- Add description column to artworks table if it doesn't exist
ALTER TABLE artworks 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Update RLS policies for artworks to allow insert
DROP POLICY IF EXISTS "Artists can manage own artworks" ON artworks;

-- Allow artists to insert their own artworks
CREATE POLICY "Artists can insert own artworks"
ON artworks FOR INSERT
WITH CHECK (
  auth.uid() = artist_id
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.user_type = 'artist'
  )
);

-- Allow artists to update their own artworks
CREATE POLICY "Artists can update own artworks"
ON artworks FOR UPDATE
USING (auth.uid() = artist_id);

-- Allow artists to delete their own artworks
CREATE POLICY "Artists can delete own artworks"
ON artworks FOR DELETE
USING (auth.uid() = artist_id);











