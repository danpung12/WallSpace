-- Create storage bucket for artwork images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('artworks', 'artworks', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view artwork images
CREATE POLICY "Anyone can view artwork images"
ON storage.objects FOR SELECT
USING (bucket_id = 'artworks');

-- Policy: Authenticated artists can upload their own artwork images
CREATE POLICY "Artists can upload artwork images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'artworks' 
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.user_type = 'artist'
  )
);

-- Policy: Artists can update their own artwork images
CREATE POLICY "Artists can update own artwork images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'artworks'
  AND auth.uid() IN (
    SELECT artist_id FROM public.artworks 
    WHERE image_url LIKE '%' || storage.objects.name || '%'
  )
);

-- Policy: Artists can delete their own artwork images
CREATE POLICY "Artists can delete own artwork images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'artworks'
  AND auth.uid() IN (
    SELECT artist_id FROM public.artworks 
    WHERE image_url LIKE '%' || storage.objects.name || '%'
  )
);










