-- Fix RLS policies for location creation
-- This migration fixes RLS issues preventing managers from creating locations

-- ============================================
-- 1. Fix locations table RLS policies
-- ============================================

-- Drop existing policy
DROP POLICY IF EXISTS "Managers can manage their own locations" ON locations;
DROP POLICY IF EXISTS "Managers can manage locations" ON locations;

-- Create separate policies for different operations

-- SELECT: Anyone can view active locations
CREATE POLICY "Anyone can view locations" ON locations 
FOR SELECT 
USING (is_active = true OR manager_id = auth.uid());

-- INSERT: Authenticated managers can create locations
CREATE POLICY "Managers can create locations" ON locations 
FOR INSERT 
WITH CHECK (
  auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.user_type = 'manager'
  )
  AND manager_id = auth.uid()
);

-- UPDATE: Managers can update their own locations
CREATE POLICY "Managers can update own locations" ON locations 
FOR UPDATE 
USING (manager_id = auth.uid())
WITH CHECK (manager_id = auth.uid());

-- DELETE: Managers can delete their own locations
CREATE POLICY "Managers can delete own locations" ON locations 
FOR DELETE 
USING (manager_id = auth.uid());

-- ============================================
-- 2. Fix location-related tables RLS policies
-- ============================================

-- location_options
DROP POLICY IF EXISTS "Anyone can view location options" ON location_options;
DROP POLICY IF EXISTS "Managers can manage location options" ON location_options;

CREATE POLICY "Anyone can view location options" ON location_options FOR SELECT USING (true);
CREATE POLICY "Managers can manage location options" ON location_options FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM locations 
    WHERE locations.id = location_options.location_id 
    AND locations.manager_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM locations 
    WHERE locations.id = location_options.location_id 
    AND locations.manager_id = auth.uid()
  )
);

-- location_images
DROP POLICY IF EXISTS "Anyone can view location images" ON location_images;
DROP POLICY IF EXISTS "Managers can manage location images" ON location_images;

CREATE POLICY "Anyone can view location images" ON location_images FOR SELECT USING (true);
CREATE POLICY "Managers can manage location images" ON location_images FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM locations 
    WHERE locations.id = location_images.location_id 
    AND locations.manager_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM locations 
    WHERE locations.id = location_images.location_id 
    AND locations.manager_id = auth.uid()
  )
);

-- location_tags
DROP POLICY IF EXISTS "Anyone can view location tags" ON location_tags;
DROP POLICY IF EXISTS "Managers can manage location tags" ON location_tags;

CREATE POLICY "Anyone can view location tags" ON location_tags FOR SELECT USING (true);
CREATE POLICY "Managers can manage location tags" ON location_tags FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM locations 
    WHERE locations.id = location_tags.location_id 
    AND locations.manager_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM locations 
    WHERE locations.id = location_tags.location_id 
    AND locations.manager_id = auth.uid()
  )
);

-- location_sns
DROP POLICY IF EXISTS "Anyone can view location sns" ON location_sns;
DROP POLICY IF EXISTS "Managers can manage location sns" ON location_sns;

CREATE POLICY "Anyone can view location sns" ON location_sns FOR SELECT USING (true);
CREATE POLICY "Managers can manage location sns" ON location_sns FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM locations 
    WHERE locations.id = location_sns.location_id 
    AND locations.manager_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM locations 
    WHERE locations.id = location_sns.location_id 
    AND locations.manager_id = auth.uid()
  )
);

-- spaces
DROP POLICY IF EXISTS "Anyone can view spaces" ON spaces;
DROP POLICY IF EXISTS "Managers can manage spaces" ON spaces;

CREATE POLICY "Anyone can view spaces" ON spaces FOR SELECT USING (true);
CREATE POLICY "Managers can manage spaces" ON spaces FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM locations 
    WHERE locations.id = spaces.location_id 
    AND locations.manager_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM locations 
    WHERE locations.id = spaces.location_id 
    AND locations.manager_id = auth.uid()
  )
);

-- tags (allow anyone to read, only insert if not exists)
DROP POLICY IF EXISTS "Anyone can view tags" ON tags;
DROP POLICY IF EXISTS "Anyone can insert tags" ON tags;

CREATE POLICY "Anyone can view tags" ON tags FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert tags" ON tags FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- 3. Fix storage.objects RLS policies
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view location images" ON storage.objects;
DROP POLICY IF EXISTS "Managers can upload location images" ON storage.objects;
DROP POLICY IF EXISTS "Managers can update their location images" ON storage.objects;
DROP POLICY IF EXISTS "Managers can delete their location images" ON storage.objects;

-- Create new policies with better logic

-- SELECT: Anyone can view location images (public bucket)
CREATE POLICY "Public can view location images" ON storage.objects 
FOR SELECT 
USING (bucket_id = 'locations');

-- INSERT: Authenticated managers can upload to their own folder
CREATE POLICY "Managers can upload location images" ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'locations' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- UPDATE: Managers can update their own images
CREATE POLICY "Managers can update their location images" ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'locations' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'locations' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- DELETE: Managers can delete their own images
CREATE POLICY "Managers can delete their location images" ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'locations' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- 4. Add helpful comments
-- ============================================

COMMENT ON POLICY "Managers can create locations" ON locations IS 
'Allows authenticated managers to create new locations. The manager_id must match their user ID.';

COMMENT ON POLICY "Public can view location images" ON storage.objects IS 
'Allows anyone to view location images since the bucket is public.';

COMMENT ON POLICY "Managers can upload location images" ON storage.objects IS 
'Allows managers to upload images to their own folder (userid/filename.jpg). The folder name must match their user ID.';




