-- 작품이 표시되지 않는 문제 진단 SQL

-- ============================================
-- 1. 현재 사용자 정보 확인
-- ============================================
SELECT 
  id, 
  email, 
  user_type,
  name
FROM profiles 
WHERE email = 'aass20000916@gmail.com';

-- ============================================
-- 2. 작품 데이터 확인
-- ============================================
SELECT 
  id,
  title,
  artist_id,
  image_url,
  is_available,
  created_at
FROM artworks
WHERE artist_id = '785567e5-327c-490a-bb84-35aafc10f73e';

-- ============================================
-- 3. Artworks 테이블의 RLS 정책 확인
-- ============================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'artworks'
ORDER BY policyname;

-- ============================================
-- 4. RLS 활성화 여부 확인
-- ============================================
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'artworks';





