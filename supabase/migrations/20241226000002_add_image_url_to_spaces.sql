-- Add image_url column to spaces table and migrate data from images array
-- This allows each space to have a single representative image URL

-- Add image_url column if it doesn't exist
ALTER TABLE spaces 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Migrate data from images array to image_url (take first image)
UPDATE spaces 
SET image_url = images[1] 
WHERE images IS NOT NULL 
  AND array_length(images, 1) > 0
  AND (image_url IS NULL OR image_url = '');

-- Add comment for documentation
COMMENT ON COLUMN spaces.image_url IS 'Representative image URL for the space';


