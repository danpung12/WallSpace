-- 즐겨찾기 테이블 생성
CREATE TABLE IF NOT EXISTS favorites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, location_id)
);

-- RLS 활성화
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- 자신의 즐겨찾기만 조회 가능
CREATE POLICY "Users can view their own favorites"
    ON favorites FOR SELECT
    USING (auth.uid() = user_id);

-- 자신의 즐겨찾기만 추가 가능
CREATE POLICY "Users can insert their own favorites"
    ON favorites FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 자신의 즐겨찾기만 삭제 가능
CREATE POLICY "Users can delete their own favorites"
    ON favorites FOR DELETE
    USING (auth.uid() = user_id);

-- 인덱스 생성 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_location_id ON favorites(location_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_location ON favorites(user_id, location_id);

COMMENT ON TABLE favorites IS '사용자 즐겨찾기 장소';
COMMENT ON COLUMN favorites.user_id IS '사용자 ID';
COMMENT ON COLUMN favorites.location_id IS '장소 ID';


