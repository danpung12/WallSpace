-- Storage 정책만 집중적으로 수정
-- Supabase Dashboard > SQL Editor에서 실행하세요

-- ============================================
-- 1. 기존 Storage 정책 완전히 제거
-- ============================================

DROP POLICY IF EXISTS "Anyone can view location images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view location images" ON storage.objects;
DROP POLICY IF EXISTS "Managers can upload location images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload location images" ON storage.objects;
DROP POLICY IF EXISTS "Managers can update their location images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update their location images" ON storage.objects;
DROP POLICY IF EXISTS "Managers can delete their location images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete their location images" ON storage.objects;

-- ============================================
-- 2. 매우 간단한 정책으로 시작 (테스트용)
-- ============================================

-- 읽기: 누구나 가능
CREATE POLICY "Public read access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'locations');

-- 업로드: 인증된 사용자만 가능 (폴더 제한 없이)
CREATE POLICY "Authenticated users can upload" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'locations' 
  AND auth.role() = 'authenticated'
);

-- 업데이트: 인증된 사용자만 가능
CREATE POLICY "Authenticated users can update" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'locations' 
  AND auth.role() = 'authenticated'
);

-- 삭제: 인증된 사용자만 가능
CREATE POLICY "Authenticated users can delete" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'locations' 
  AND auth.role() = 'authenticated'
);

-- ============================================
-- 3. 현재 사용자 프로필 확인 (결과를 복사해서 보내주세요)
-- ============================================

SELECT 
  id, 
  email, 
  user_type,
  name,
  created_at
FROM profiles 
WHERE email = 'aass20000916@gmail.com';

-- ============================================
-- 4. Storage bucket 설정 확인
-- ============================================

SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
WHERE id = 'locations';













