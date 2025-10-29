-- locations Storage Bucket 생성 및 정책 설정
-- Supabase Dashboard > SQL Editor에서 실행

-- ============================================
-- 1. Storage Bucket 생성
-- ============================================

-- 기존 bucket이 있으면 삭제하고 재생성 (선택사항, 주의!)
-- DELETE FROM storage.buckets WHERE id = 'locations';

-- locations bucket 생성
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'locations',
  'locations',
  true,  -- public bucket (누구나 읽기 가능)
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

-- 확인
SELECT id, name, public, file_size_limit, allowed_mime_types, created_at
FROM storage.buckets
WHERE id = 'locations';

-- ============================================
-- 2. Storage RLS 정책 생성
-- ============================================

-- 기존 정책 모두 삭제
DROP POLICY IF EXISTS "Anyone can view location images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view location images" ON storage.objects;
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Managers can upload location images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload location images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Managers can update their location images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update their location images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
DROP POLICY IF EXISTS "Managers can delete their location images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete their location images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;

-- 새로운 정책 생성

-- SELECT: 누구나 읽기 가능 (public bucket)
CREATE POLICY "Public can view location images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'locations');

-- INSERT: 인증된 사용자만 업로드 가능
CREATE POLICY "Authenticated users can upload location images" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'locations' 
  AND auth.role() = 'authenticated'
);

-- UPDATE: 인증된 사용자만 수정 가능
CREATE POLICY "Authenticated users can update location images" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'locations' 
  AND auth.role() = 'authenticated'
);

-- DELETE: 인증된 사용자만 삭제 가능
CREATE POLICY "Authenticated users can delete location images" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'locations' 
  AND auth.role() = 'authenticated'
);

-- ============================================
-- 3. 설정 확인
-- ============================================

-- Bucket 설정 확인
SELECT 
  id as bucket_id,
  name,
  public,
  file_size_limit / 1024 / 1024 as size_limit_mb,
  allowed_mime_types,
  created_at
FROM storage.buckets
WHERE id = 'locations';

-- RLS 정책 확인
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname LIKE '%location%'
ORDER BY policyname;

-- 완료!
SELECT '✅ Storage bucket and policies created successfully!' as status;









