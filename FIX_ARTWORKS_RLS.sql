-- Artworks 테이블 RLS 정책 수정
-- 작가가 자신의 작품을 조회할 수 있도록 수정

-- ============================================
-- 1. 기존 정책 삭제
-- ============================================
DROP POLICY IF EXISTS "Anyone can view artworks" ON artworks;
DROP POLICY IF EXISTS "Artists can manage own artworks" ON artworks;
DROP POLICY IF EXISTS "Users can view own artworks" ON artworks;
DROP POLICY IF EXISTS "Artists can insert artworks" ON artworks;
DROP POLICY IF EXISTS "Artists can update own artworks" ON artworks;
DROP POLICY IF EXISTS "Artists can delete own artworks" ON artworks;

-- ============================================
-- 2. 새로운 정책 생성
-- ============================================

-- SELECT: 모든 사용자가 모든 작품 조회 가능
CREATE POLICY "Anyone can view artworks" 
ON artworks FOR SELECT 
USING (true);

-- INSERT: 인증된 사용자만 작품 생성 가능
CREATE POLICY "Authenticated users can insert artworks" 
ON artworks FOR INSERT 
WITH CHECK (
  auth.role() = 'authenticated'
  AND artist_id = auth.uid()
);

-- UPDATE: 작가 본인만 자신의 작품 수정 가능
CREATE POLICY "Artists can update own artworks" 
ON artworks FOR UPDATE 
USING (artist_id = auth.uid())
WITH CHECK (artist_id = auth.uid());

-- DELETE: 작가 본인만 자신의 작품 삭제 가능
CREATE POLICY "Artists can delete own artworks" 
ON artworks FOR DELETE 
USING (artist_id = auth.uid());

-- ============================================
-- 3. 정책 확인
-- ============================================
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'artworks'
ORDER BY policyname;

-- ============================================
-- 4. 테스트 쿼리
-- ============================================
-- 현재 사용자의 작품 조회 테스트
SELECT 
  id,
  title,
  artist_id,
  image_url,
  dimensions,
  price,
  is_available,
  created_at
FROM artworks
WHERE artist_id = '785567e5-327c-490a-bb84-35aafc10f73e'
ORDER BY created_at DESC;

SELECT '✅ Artworks RLS policies fixed!' as status;








