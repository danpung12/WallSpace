-- WallSpace 데이터베이스 스키마
-- 작가와 공간을 연결하는 플랫폼을 위한 테이블 설계

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ============================================
-- 1. 사용자 관련 테이블
-- ============================================

-- 사용자 프로필 테이블 (Supabase Auth와 연동)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    nickname TEXT UNIQUE NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    user_type TEXT NOT NULL CHECK (user_type IN ('artist', 'manager', 'guest')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 사용자 알림 설정
CREATE TABLE notification_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    comments BOOLEAN DEFAULT true,
    exhibitions BOOLEAN DEFAULT true,
    messages BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 사용자 설정 (다크모드 등)
CREATE TABLE user_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    dark_mode BOOLEAN DEFAULT false,
    language TEXT DEFAULT 'ko',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. 공간 관련 테이블
-- ============================================

-- 공간 카테고리
CREATE TABLE categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 공간 테이블
CREATE TABLE locations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    category_id UUID REFERENCES categories(id),
    lat DECIMAL(10, 8) NOT NULL,
    lng DECIMAL(11, 8) NOT NULL,
    address TEXT NOT NULL,
    phone TEXT,
    description TEXT,
    status_text TEXT DEFAULT '예약 가능',
    status_color TEXT DEFAULT '#3B82F6',
    total_slots INTEGER DEFAULT 0,
    reserved_slots INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 공간 옵션 (주차, 24시간, 반려동물 등)
CREATE TABLE location_options (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    parking BOOLEAN DEFAULT false,
    pets BOOLEAN DEFAULT false,
    twenty_four_hours BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 공간 이미지
CREATE TABLE location_images (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 공간 태그
CREATE TABLE tags (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 공간-태그 연결 테이블
CREATE TABLE location_tags (
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (location_id, tag_id)
);

-- 공간 SNS 링크
CREATE TABLE location_sns (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    platform TEXT NOT NULL, -- 'instagram', 'facebook', 'website'
    url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 공간 내 세부 공간 (전시실, 라운지 등)
CREATE TABLE spaces (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    width INTEGER NOT NULL, -- cm 단위
    height INTEGER NOT NULL, -- cm 단위
    price INTEGER NOT NULL, -- 하루 당 비용 (원)
    is_reserved BOOLEAN DEFAULT false,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. 작품 관련 테이블
-- ============================================

-- 작품 테이블
CREATE TABLE artworks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    artist_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    dimensions TEXT NOT NULL, -- "72.7 x 60.6 cm"
    price INTEGER NOT NULL, -- 작품 가격 (원)
    image_url TEXT NOT NULL,
    alt_text TEXT,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 4. 예약 관련 테이블
-- ============================================

-- 예약 상태 ENUM
CREATE TYPE reservation_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');

-- 예약 테이블
CREATE TABLE reservations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    artist_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    space_id UUID REFERENCES spaces(id) ON DELETE CASCADE,
    artwork_id UUID REFERENCES artworks(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status reservation_status DEFAULT 'pending',
    total_price INTEGER NOT NULL, -- 총 예약 금액
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK (end_date >= start_date)
);

-- ============================================
-- 5. 리뷰 및 후기
-- ============================================

-- 공간 리뷰
CREATE TABLE location_reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    artist_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    reservation_id UUID REFERENCES reservations(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 6. 알림 관련 테이블
-- ============================================

-- 알림 타입 ENUM
CREATE TYPE notification_type AS ENUM ('reservation_confirmed', 'reservation_cancelled', 'new_message', 'exhibition_reminder');

-- 알림 테이블
CREATE TABLE notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 7. 인덱스 생성
-- ============================================

-- 위치 기반 검색을 위한 인덱스
CREATE INDEX idx_locations_lat_lng ON locations(lat, lng);
CREATE INDEX idx_locations_category ON locations(category_id);
CREATE INDEX idx_locations_active ON locations(is_active);

-- 예약 관련 인덱스
CREATE INDEX idx_reservations_artist ON reservations(artist_id);
CREATE INDEX idx_reservations_location ON reservations(location_id);
CREATE INDEX idx_reservations_dates ON reservations(start_date, end_date);
CREATE INDEX idx_reservations_status ON reservations(status);

-- 작품 관련 인덱스
CREATE INDEX idx_artworks_artist ON artworks(artist_id);
CREATE INDEX idx_artworks_available ON artworks(is_available);

-- 알림 관련 인덱스
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read);

-- ============================================
-- 8. RLS (Row Level Security) 정책
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_sns ENABLE ROW LEVEL SECURITY;
ALTER TABLE spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles 정책
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Locations 정책 (모든 사용자가 읽기 가능)
CREATE POLICY "Anyone can view locations" ON locations FOR SELECT USING (true);
CREATE POLICY "Managers can manage locations" ON locations FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.user_type = 'manager'
    )
);

-- Artworks 정책
CREATE POLICY "Anyone can view artworks" ON artworks FOR SELECT USING (true);
CREATE POLICY "Artists can manage own artworks" ON artworks FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.id = artworks.artist_id
        AND profiles.user_type = 'artist'
    )
);

-- Reservations 정책
CREATE POLICY "Users can view own reservations" ON reservations FOR SELECT USING (
    artist_id = auth.uid() OR 
    EXISTS (
        SELECT 1 FROM locations 
        WHERE locations.id = reservations.location_id 
        AND EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.user_type = 'manager'
        )
    )
);

CREATE POLICY "Artists can create reservations" ON reservations FOR INSERT WITH CHECK (
    artist_id = auth.uid() AND
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.user_type = 'artist'
    )
);

-- ============================================
-- 9. 트리거 함수 (자동 업데이트)
-- ============================================

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- updated_at 트리거 적용
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_spaces_updated_at BEFORE UPDATE ON spaces FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_artworks_updated_at BEFORE UPDATE ON artworks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON reservations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 10. 초기 데이터 삽입
-- ============================================

-- 카테고리 데이터
INSERT INTO categories (name, description) VALUES 
('갤러리', '전시 공간'),
('카페', '카페 공간'),
('문화회관', '문화 시설'),
('복합문화공간', '다양한 문화 활동이 가능한 공간');

-- 태그 데이터
INSERT INTO tags (name) VALUES 
('따뜻한'), ('자연스러운'), ('모던한'), ('친근한'),
('우아한'), ('클래식한'), ('고급스러운'), ('로맨틱한'),
('독특한'), ('힙한'), ('감각적인'), ('트렌디한'),
('젊은'), ('활기찬'), ('웅장한'), ('정중한'),
('전문적인'), ('안정적인'), ('아늑한'), ('편안한');

-- ============================================
-- 11. 뷰 생성 (자주 사용되는 쿼리)
-- ============================================

-- 공간 상세 정보 뷰
CREATE VIEW location_details AS
SELECT 
    l.*,
    c.name as category_name,
    lo.parking,
    lo.pets,
    lo.twenty_four_hours,
    array_agg(DISTINCT t.name) as tags,
    array_agg(DISTINCT li.image_url ORDER BY li.sort_order) as images
FROM locations l
LEFT JOIN categories c ON l.category_id = c.id
LEFT JOIN location_options lo ON l.id = lo.location_id
LEFT JOIN location_tags lt ON l.id = lt.location_id
LEFT JOIN tags t ON lt.tag_id = t.id
LEFT JOIN location_images li ON l.id = li.location_id
WHERE l.is_active = true
GROUP BY l.id, c.name, lo.parking, lo.pets, lo.twenty_four_hours;

-- 예약 상세 정보 뷰
CREATE VIEW reservation_details AS
SELECT 
    r.*,
    p_artist.name as artist_name,
    p_artist.nickname as artist_nickname,
    l.name as location_name,
    l.address as location_address,
    s.name as space_name,
    a.title as artwork_title,
    a.image_url as artwork_image
FROM reservations r
JOIN profiles p_artist ON r.artist_id = p_artist.id
JOIN locations l ON r.location_id = l.id
JOIN spaces s ON r.space_id = s.id
JOIN artworks a ON r.artwork_id = a.id;
