-- Create storage bucket for location images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'locations',
  'locations',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS for locations bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view location images (public bucket)
CREATE POLICY "Anyone can view location images"
ON storage.objects FOR SELECT
USING (bucket_id = 'locations');

-- Policy: Authenticated managers can upload location images
CREATE POLICY "Managers can upload location images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'locations' 
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.user_type = 'manager'
  )
);

-- Policy: Managers can update their own location images
CREATE POLICY "Managers can update their location images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'locations' 
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.user_type = 'manager'
  )
);

-- Policy: Managers can delete their own location images
CREATE POLICY "Managers can delete their location images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'locations' 
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.user_type = 'manager'
  )
);










