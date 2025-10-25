-- location_reviews 테이블 RLS 정책 설정

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

