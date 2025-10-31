-- Create storage bucket for artwork images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'artworks',
  'artworks',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS for artworks bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view artwork images (public bucket)
CREATE POLICY "Anyone can view artwork images"
ON storage.objects FOR SELECT
USING (bucket_id = 'artworks');

-- Policy: Authenticated users can upload their own artwork images
CREATE POLICY "Users can upload their own artwork images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'artworks' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can update their own artwork images
CREATE POLICY "Users can update their own artwork images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'artworks' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own artwork images
CREATE POLICY "Users can delete their own artwork images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'artworks' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);













