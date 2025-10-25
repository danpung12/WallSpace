-- ============================================
-- location_reviews 테이블 생성
-- ============================================

-- 기존 테이블이 있으면 삭제 (개발용)
-- DROP TABLE IF EXISTS location_reviews CASCADE;

-- 공간 리뷰 테이블 생성
CREATE TABLE IF NOT EXISTS location_reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    artist_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    reservation_id UUID REFERENCES reservations(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_location_reviews_location ON location_reviews(location_id);
CREATE INDEX IF NOT EXISTS idx_location_reviews_artist ON location_reviews(artist_id);
CREATE INDEX IF NOT EXISTS idx_location_reviews_reservation ON location_reviews(reservation_id);
CREATE INDEX IF NOT EXISTS idx_location_reviews_created ON location_reviews(created_at DESC);

-- ============================================
-- RLS (Row Level Security) 정책 설정
-- ============================================

-- RLS 활성화
ALTER TABLE location_reviews ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 (있을 경우)
DROP POLICY IF EXISTS "Anyone can view location reviews" ON location_reviews;
DROP POLICY IF EXISTS "Authenticated users can create location reviews" ON location_reviews;
DROP POLICY IF EXISTS "Users can delete their own location reviews" ON location_reviews;
DROP POLICY IF EXISTS "Users can update their own location reviews" ON location_reviews;

-- 모든 사용자가 리뷰 조회 가능
CREATE POLICY "Anyone can view location reviews"
ON location_reviews FOR SELECT
USING (true);

-- 로그인한 사용자만 리뷰 작성 가능
CREATE POLICY "Authenticated users can create location reviews"
ON location_reviews FOR INSERT
WITH CHECK (auth.uid() = artist_id);

-- 본인이 작성한 리뷰만 삭제 가능
CREATE POLICY "Users can delete their own location reviews"
ON location_reviews FOR DELETE
USING (auth.uid() = artist_id);

-- 본인이 작성한 리뷰만 수정 가능
CREATE POLICY "Users can update their own location reviews"
ON location_reviews FOR UPDATE
USING (auth.uid() = artist_id);

-- ============================================
-- 확인용 쿼리
-- ============================================

-- 테이블 생성 확인
SELECT 
    'location_reviews 테이블이 성공적으로 생성되었습니다!' as message,
    (SELECT COUNT(*) FROM location_reviews) as review_count;

-- RLS 정책 확인
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'location_reviews'
ORDER BY policyname;

