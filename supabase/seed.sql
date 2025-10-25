-- WallSpace 시드 데이터
-- 개발 및 테스트를 위한 초기 데이터 삽입

-- ============================================
-- 1. 카테고리 데이터 (이미 마이그레이션에서 삽입됨)
-- ============================================

-- ============================================
-- 2. 태그 데이터 (이미 마이그레이션에서 삽입됨)
-- ============================================

-- ============================================
-- 3. 샘플 공간 데이터
-- ============================================

-- 아트 스페이스 광교
INSERT INTO locations (id, name, category_id, lat, lng, address, phone, description, status_text, status_color, total_slots, reserved_slots) VALUES 
('550e8400-e29b-41d4-a716-446655440001', '아트 스페이스 광교', 
 (SELECT id FROM categories WHERE name = '갤러리'), 
 37.2842, 127.0543, '수원시 영통구 광교중앙로 140', '031-228-3800', 
 '호수공원 옆에 위치한 현대적인 건축물로, 자연과 예술이 어우러진 공간입니다. 다양한 기획 전시와 문화 프로그램을 즐길 수 있습니다.',
 '예약 가능', '#3B82F6', 5, 3);

-- 서울시립미술관
INSERT INTO locations (id, name, category_id, lat, lng, address, phone, description, status_text, status_color, total_slots, reserved_slots) VALUES 
('550e8400-e29b-41d4-a716-446655440002', '서울시립미술관', 
 (SELECT id FROM categories WHERE name = '갤러리'), 
 37.5656, 126.9753, '서울 중구 덕수궁길 61', '02-2124-8800', 
 '덕수궁 돌담길에 위치한 서울의 대표 미술관입니다. 한국 근현대 미술의 흐름을 한눈에 볼 수 있는 상설 전시가 특징입니다.',
 '문의 필요', '#F97316', 10, 8);

-- 아라리오뮤지엄
INSERT INTO locations (id, name, category_id, lat, lng, address, phone, description, status_text, status_color, total_slots, reserved_slots) VALUES 
('550e8400-e29b-41d4-a716-446655440003', '아라리오뮤지엄', 
 (SELECT id FROM categories WHERE name = '갤러리'), 
 37.5729, 126.9852, '서울 종로구 율곡로 83', '02-736-5700', 
 '오래된 공간을 개조하여 만든 독특한 분위기의 현대미술 갤러리입니다. 국내외 유명 작가들의 실험적인 작품들을 만나볼 수 있습니다.',
 '예약 가능', '#3B82F6', 8, 2);

-- D뮤지엄
INSERT INTO locations (id, name, category_id, lat, lng, address, phone, description, status_text, status_color, total_slots, reserved_slots) VALUES 
('550e8400-e29b-41d4-a716-446655440004', 'D뮤지엄', 
 (SELECT id FROM categories WHERE name = '갤러리'), 
 37.5383, 127.0125, '서울 성동구 왕십리로 83-21', '070-5097-0020', 
 '젊고 감각적인 전시로 유명한 미술관입니다. 사진, 디자인, 패션 등 다양한 장르의 예술을 경험할 수 있어 많은 사랑을 받고 있습니다.',
 '예약 불가', '#EF4444', 4, 4);

-- 국립현대미술관 서울
INSERT INTO locations (id, name, category_id, lat, lng, address, phone, description, status_text, status_color, total_slots, reserved_slots) VALUES 
('550e8400-e29b-41d4-a716-446655440005', '국립현대미술관 서울', 
 (SELECT id FROM categories WHERE name = '문화회관'), 
 37.5796, 126.9804, '서울 종로구 삼청로 30', '02-3701-9500', 
 '서울의 중심에 위치한 국립현대미술관은 한국 현대미술의 현재와 미래를 조망하는 다양한 전시를 선보입니다.',
 '예약 가능', '#3B82F6', 12, 5);

-- 페이지스 바이 페이지
INSERT INTO locations (id, name, category_id, lat, lng, address, phone, description, status_text, status_color, total_slots, reserved_slots) VALUES 
('550e8400-e29b-41d4-a716-446655440006', '페이지스 바이 페이지', 
 (SELECT id FROM categories WHERE name = '카페'), 
 37.5495, 126.9209, '서울 마포구 월드컵로14길 10', '02-3144-0726', 
 '아늑한 분위기의 북카페로, 독립 서적과 함께 맛있는 커피를 즐길 수 있는 특별한 공간입니다.',
 '문의 필요', '#F97316', 5, 2);

-- ============================================
-- 4. 공간 옵션 데이터
-- ============================================

INSERT INTO location_options (location_id, parking, pets, twenty_four_hours) VALUES 
('550e8400-e29b-41d4-a716-446655440001', true, false, false),
('550e8400-e29b-41d4-a716-446655440002', true, false, false),
('550e8400-e29b-41d4-a716-446655440003', false, false, false),
('550e8400-e29b-41d4-a716-446655440004', true, false, false),
('550e8400-e29b-41d4-a716-446655440005', true, false, false),
('550e8400-e29b-41d4-a716-446655440006', false, true, false);

-- ============================================
-- 5. 공간 이미지 데이터
-- ============================================

INSERT INTO location_images (location_id, image_url, alt_text, sort_order) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'https://picsum.photos/id/10/800/600', '아트 스페이스 광교 외관', 1),
('550e8400-e29b-41d4-a716-446655440001', 'https://picsum.photos/id/11/800/600', '아트 스페이스 광교 내부', 2),
('550e8400-e29b-41d4-a716-446655440001', 'https://picsum.photos/id/12/800/600', '아트 스페이스 광교 전시실', 3),

('550e8400-e29b-41d4-a716-446655440002', 'https://picsum.photos/id/22/800/600', '서울시립미술관 외관', 1),
('550e8400-e29b-41d4-a716-446655440002', 'https://picsum.photos/id/23/800/600', '서울시립미술관 전시실', 2),

('550e8400-e29b-41d4-a716-446655440003', 'https://picsum.photos/id/24/800/600', '아라리오뮤지엄 외관', 1),
('550e8400-e29b-41d4-a716-446655440003', 'https://picsum.photos/id/25/800/600', '아라리오뮤지엄 내부', 2),
('550e8400-e29b-41d4-a716-446655440003', 'https://picsum.photos/id/26/800/600', '아라리오뮤지엄 전시실', 3),
('550e8400-e29b-41d4-a716-446655440003', 'https://picsum.photos/id/27/800/600', '아라리오뮤지엄 작품', 4),

('550e8400-e29b-41d4-a716-446655440004', 'https://picsum.photos/id/42/800/600', 'D뮤지엄 외관', 1),
('550e8400-e29b-41d4-a716-446655440004', 'https://picsum.photos/id/43/800/600', 'D뮤지엄 내부', 2),

('550e8400-e29b-41d4-a716-446655440005', 'https://picsum.photos/id/10/800/600', '국립현대미술관 외관', 1),
('550e8400-e29b-41d4-a716-446655440005', 'https://picsum.photos/id/11/800/600', '국립현대미술관 전시실', 2),
('550e8400-e29b-41d4-a716-446655440005', 'https://picsum.photos/id/12/800/600', '국립현대미술관 작품', 3),

('550e8400-e29b-41d4-a716-446655440006', 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?q=80&w=2070&auto=format&fit=crop', '페이지스 바이 페이지 외관', 1),
('550e8400-e29b-41d4-a716-446655440006', 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=2070&auto=format&fit=crop', '페이지스 바이 페이지 내부', 2),
('550e8400-e29b-41d4-a716-446655440006', 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2106&auto=format&fit=crop', '페이지스 바이 페이지 책장', 3);

-- ============================================
-- 6. 공간-태그 연결
-- ============================================

INSERT INTO location_tags (location_id, tag_id) VALUES 
-- 아트 스페이스 광교
('550e8400-e29b-41d4-a716-446655440001', (SELECT id FROM tags WHERE name = '따뜻한')),
('550e8400-e29b-41d4-a716-446655440001', (SELECT id FROM tags WHERE name = '자연스러운')),
('550e8400-e29b-41d4-a716-446655440001', (SELECT id FROM tags WHERE name = '모던한')),
('550e8400-e29b-41d4-a716-446655440001', (SELECT id FROM tags WHERE name = '친근한')),

-- 서울시립미술관
('550e8400-e29b-41d4-a716-446655440002', (SELECT id FROM tags WHERE name = '우아한')),
('550e8400-e29b-41d4-a716-446655440002', (SELECT id FROM tags WHERE name = '클래식한')),
('550e8400-e29b-41d4-a716-446655440002', (SELECT id FROM tags WHERE name = '고급스러운')),
('550e8400-e29b-41d4-a716-446655440002', (SELECT id FROM tags WHERE name = '로맨틱한')),

-- 아라리오뮤지엄
('550e8400-e29b-41d4-a716-446655440003', (SELECT id FROM tags WHERE name = '독특한')),
('550e8400-e29b-41d4-a716-446655440003', (SELECT id FROM tags WHERE name = '힙한')),
('550e8400-e29b-41d4-a716-446655440003', (SELECT id FROM tags WHERE name = '감각적인')),
('550e8400-e29b-41d4-a716-446655440003', (SELECT id FROM tags WHERE name = '트렌디한')),

-- D뮤지엄
('550e8400-e29b-41d4-a716-446655440004', (SELECT id FROM tags WHERE name = '젊은')),
('550e8400-e29b-41d4-a716-446655440004', (SELECT id FROM tags WHERE name = '활기찬')),
('550e8400-e29b-41d4-a716-446655440004', (SELECT id FROM tags WHERE name = '트렌디한')),
('550e8400-e29b-41d4-a716-446655440004', (SELECT id FROM tags WHERE name = '감각적인')),

-- 국립현대미술관 서울
('550e8400-e29b-41d4-a716-446655440005', (SELECT id FROM tags WHERE name = '웅장한')),
('550e8400-e29b-41d4-a716-446655440005', (SELECT id FROM tags WHERE name = '정중한')),
('550e8400-e29b-41d4-a716-446655440005', (SELECT id FROM tags WHERE name = '전문적인')),
('550e8400-e29b-41d4-a716-446655440005', (SELECT id FROM tags WHERE name = '안정적인')),

-- 페이지스 바이 페이지
('550e8400-e29b-41d4-a716-446655440006', (SELECT id FROM tags WHERE name = '아늑한')),
('550e8400-e29b-41d4-a716-446655440006', (SELECT id FROM tags WHERE name = '따뜻한')),
('550e8400-e29b-41d4-a716-446655440006', (SELECT id FROM tags WHERE name = '편안한')),
('550e8400-e29b-41d4-a716-446655440006', (SELECT id FROM tags WHERE name = '친근한'));

-- ============================================
-- 7. 공간 SNS 링크
-- ============================================

INSERT INTO location_sns (location_id, platform, url) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'instagram', 'https://www.instagram.com/suwon_art_space/'),
('550e8400-e29b-41d4-a716-446655440002', 'instagram', 'https://www.instagram.com/seoulmuseumofart/'),
('550e8400-e29b-41d4-a716-446655440003', 'instagram', 'https://www.instagram.com/arariomuseum/'),
('550e8400-e29b-41d4-a716-446655440004', 'instagram', 'https://www.instagram.com/dmuseum.seoul/'),
('550e8400-e29b-41d4-a716-446655440005', 'instagram', 'https://www.instagram.com/mmca.seoul/'),
('550e8400-e29b-41d4-a716-446655440006', 'instagram', 'https://www.instagram.com/pages_by.pages/');

-- ============================================
-- 8. 공간 내 세부 공간 데이터
-- ============================================

INSERT INTO spaces (id, location_id, name, width, height, price, is_reserved, image_url) VALUES 
-- 아트 스페이스 광교
('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440001', '제 1 전시실', 1000, 500, 250000, false, 'https://picsum.photos/id/101/400/300'),
('550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440001', '멀티룸 A', 500, 300, 150000, false, 'https://picsum.photos/id/102/400/300'),
('550e8400-e29b-41d4-a716-446655440103', '550e8400-e29b-41d4-a716-446655440001', '야외 조각 공원', 2000, 2000, 500000, true, 'https://picsum.photos/id/103/400/300'),

-- 서울시립미술관
('550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440002', '본관 전시실', 1200, 600, 300000, false, 'https://picsum.photos/id/201/400/300'),
('550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440002', '프로젝트 갤러리', 400, 400, 180000, true, 'https://picsum.photos/id/202/400/300'),

-- 아라리오뮤지엄
('550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440003', '1F 갤러리', 600, 400, 200000, false, 'https://picsum.photos/id/301/400/300'),
('550e8400-e29b-41d4-a716-446655440302', '550e8400-e29b-41d4-a716-446655440003', '4F 루프탑', 700, 500, 280000, false, 'https://picsum.photos/id/302/400/300'),
('550e8400-e29b-41d4-a716-446655440303', '550e8400-e29b-41d4-a716-446655440003', '지하 상영관', 300, 200, 120000, false, 'https://picsum.photos/id/303/400/300'),

-- D뮤지엄
('550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440004', '스튜디오', 800, 500, 350000, true, 'https://picsum.photos/id/401/400/300'),
('550e8400-e29b-41d4-a716-446655440402', '550e8400-e29b-41d4-a716-446655440004', '라운지', 500, 500, 220000, true, 'https://picsum.photos/id/402/400/300'),

-- 국립현대미술관 서울
('550e8400-e29b-41d4-a716-446655440501', '550e8400-e29b-41d4-a716-446655440005', '제 1 전시실', 1500, 800, 400000, false, 'https://picsum.photos/id/501/400/300'),
('550e8400-e29b-41d4-a716-446655440502', '550e8400-e29b-41d4-a716-446655440005', '디지털 라이브러리', 700, 400, 250000, false, 'https://picsum.photos/id/502/400/300'),

-- 페이지스 바이 페이지
('550e8400-e29b-41d4-a716-446655440601', '550e8400-e29b-41d4-a716-446655440006', '메인 홀', 300, 250, 100000, false, 'https://images.pexels.com/photos/1034662/pexels-photo-1034662.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1');

-- ============================================
-- 9. 샘플 사용자 프로필 (개발용)
-- ============================================

-- 주의: 실제 운영에서는 auth.users 테이블에 사용자가 먼저 생성되어야 합니다.
-- 여기서는 개발/테스트 목적으로만 사용하세요.

-- ============================================
-- 10. 샘플 작품 데이터
-- ============================================

-- 주의: 실제 사용자 ID가 필요하므로, 실제 사용자가 생성된 후에 실행해야 합니다.
-- INSERT INTO artworks (artist_id, title, dimensions, price, image_url, alt_text) VALUES 
-- ('user-id-here', '푸른 밤의 항해', '72.7 x 60.6 cm', 3500000, 'https://images.pexels.com/photos/302804/pexels-photo-302804.jpeg?auto=compress&cs=tinysrgb&w=800', '고요한 밤바다를 항해하는 배를 그린 유화'),
-- ('user-id-here', '도시의 일몰', '90.9 x 72.7 cm', 5200000, 'https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg?auto=compress&cs=tinysrgb&w=800', '해질녘 노을에 물든 도시 풍경을 담은 아크릴화'),
-- ('user-id-here', '숲의 속삭임', '65.1 x 53.0 cm', 2800000, 'https://images.pexels.com/photos/1743165/pexels-photo-1743165.jpeg?auto=compress&cs=tinysrgb&w=800', '신비로운 안개 낀 숲속의 모습을 표현한 수채화'),
-- ('user-id-here', '기억의 조각', '53.0 x 45.5 cm', 4100000, 'https://images.pexels.com/photos/1183021/pexels-photo-1183021.jpeg?auto=compress&cs=tinysrgb&w=800', '다양한 색상의 조각들이 어우러진 추상화');

-- ============================================
-- 11. 샘플 리뷰 데이터
-- ============================================

-- 주의: 실제 사용자 ID와 예약 ID가 필요하므로, 실제 데이터가 생성된 후에 실행해야 합니다.
-- INSERT INTO location_reviews (location_id, artist_id, reservation_id, rating, comment) VALUES 
-- ('550e8400-e29b-41d4-a716-446655440001', 'user-id-here', 'reservation-id-here', 5, '자연광이 정말 아름다운 공간입니다. 제 조각 작품들이 훨씬 돋보였어요. 다음 개인전도 여기서 하고 싶네요.'),
-- ('550e8400-e29b-41d4-a716-446655440001', 'user-id-here', 'reservation-id-here', 5, '시설이 정말 깨끗하고 관리가 잘 되어있습니다. 특히 야외 공간은 설치 미술에 최적의 장소라고 생각합니다. 강력 추천!'),
-- ('550e8400-e29b-41d4-a716-446655440002', 'user-id-here', 'reservation-id-here', 4, '역사와 현대가 공존하는 멋진 곳입니다. 관람객들의 집중도도 매우 높아서 만족스러운 전시를 할 수 있었습니다.'),
-- ('550e8400-e29b-41d4-a716-446655440003', 'user-id-here', 'reservation-id-here', 5, '공간 자체가 하나의 예술 작품 같아요. 설치 미술 전시를 했는데, 공간과 작품이 잘 어우러져서 시너지가 났습니다.'),
-- ('550e8400-e29b-41d4-a716-446655440004', 'user-id-here', 'reservation-id-here', 4, '트렌디한 전시를 하기에 이보다 더 좋은 곳은 없습니다. 스태프분들도 매우 전문적이고 친절하셨어요.'),
-- ('550e8400-e29b-41d4-a716-446655440005', 'user-id-here', 'reservation-id-here', 5, '접근성이 좋고 시설이 훌륭합니다. 특히 디지털 라이브러리는 미디어 아트 전시에 최적의 환경을 제공해주었습니다.'),
-- ('550e8400-e29b-41d4-a716-446655440006', 'user-id-here', 'reservation-id-here', 4, '아늑하고 따뜻한 분위기에서 소규모 전시를 열기에 완벽한 장소입니다. 책과 예술이 함께하는 특별한 경험을 할 수 있었어요.');

-- ============================================
-- 12. 샘플 알림 데이터
-- ============================================

-- 주의: 실제 사용자 ID가 필요하므로, 실제 사용자가 생성된 후에 실행해야 합니다.
-- INSERT INTO notifications (user_id, type, title, message) VALUES 
-- ('user-id-here', 'reservation_confirmed', '예약 확정', '요청하신 \'아트 스페이스\' 예약이 확정되었습니다.'),
-- ('user-id-here', 'new_message', '새로운 메시지', '\'김작가\'님으로부터 새로운 메시지가 도착했습니다.'),
-- ('user-id-here', 'exhibition_reminder', '전시 알림', '내일 시작하는 전시를 잊지 마세요!');

-- ============================================
-- 완료 메시지
-- ============================================

-- 시드 데이터 삽입이 완료되었습니다.
-- 다음 단계:
-- 1. Supabase 프로젝트 생성 및 연결
-- 2. 환경 변수 설정
-- 3. 마이그레이션 실행
-- 4. 실제 사용자 생성 후 추가 데이터 삽입
