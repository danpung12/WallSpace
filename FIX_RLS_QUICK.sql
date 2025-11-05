-- QUICK FIX for RLS policies
-- Run this in Supabase Dashboard > SQL Editor
-- This will fix the location creation and image upload issues

-- ============================================
-- 1. Fix Storage Policies (Simplify)
-- ============================================

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Managers can upload location images" ON storage.objects;
DROP POLICY IF EXISTS "Managers can update their location images" ON storage.objects;
DROP POLICY IF EXISTS "Managers can delete their location images" ON storage.objects;

-- Create simpler policies: Any authenticated user can upload to their own folder
CREATE POLICY "Authenticated users can upload location images" ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'locations' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Authenticated users can update their location images" ON storage.objects 
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

CREATE POLICY "Authenticated users can delete their location images" ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'locations' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- 2. Fix Locations Table Policies
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Managers can manage their own locations" ON locations;
DROP POLICY IF EXISTS "Managers can manage locations" ON locations;

-- Create new policies
-- SELECT: Anyone can view locations
CREATE POLICY "Public can view locations" ON locations 
FOR SELECT 
USING (true);

-- INSERT: Any authenticated user can create a location (simplified for testing)
CREATE POLICY "Authenticated users can create locations" ON locations 
FOR INSERT 
WITH CHECK (
  auth.role() = 'authenticated'
  AND manager_id = auth.uid()
);

-- UPDATE: Users can update their own locations
CREATE POLICY "Users can update own locations" ON locations 
FOR UPDATE 
USING (manager_id = auth.uid())
WITH CHECK (manager_id = auth.uid());

-- DELETE: Users can delete their own locations
CREATE POLICY "Users can delete own locations" ON locations 
FOR DELETE 
USING (manager_id = auth.uid());

-- ============================================
-- 3. Fix Related Tables (Simplified)
-- ============================================

-- location_options
DROP POLICY IF EXISTS "Managers can manage location options" ON location_options;
CREATE POLICY "Authenticated users can manage location options" ON location_options 
FOR ALL 
WITH CHECK (auth.role() = 'authenticated');

-- location_images
DROP POLICY IF EXISTS "Managers can manage location images" ON location_images;
CREATE POLICY "Authenticated users can manage location images" ON location_images 
FOR ALL 
WITH CHECK (auth.role() = 'authenticated');

-- location_tags
DROP POLICY IF EXISTS "Managers can manage location tags" ON location_tags;
CREATE POLICY "Authenticated users can manage location tags" ON location_tags 
FOR ALL 
WITH CHECK (auth.role() = 'authenticated');

-- location_sns
DROP POLICY IF EXISTS "Managers can manage location sns" ON location_sns;
CREATE POLICY "Authenticated users can manage location sns" ON location_sns 
FOR ALL 
WITH CHECK (auth.role() = 'authenticated');

-- spaces
DROP POLICY IF EXISTS "Managers can manage spaces" ON spaces;
CREATE POLICY "Authenticated users can manage spaces" ON spaces 
FOR ALL 
WITH CHECK (auth.role() = 'authenticated');

-- tags
DROP POLICY IF EXISTS "Authenticated users can insert tags" ON tags;
CREATE POLICY "Authenticated users can insert tags" ON tags 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- DONE! Now try creating a location again.
-- ============================================

















