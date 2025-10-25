-- Mock 데이터: 공간 데이터 삽입
-- locations.tsx의 mock 데이터를 실제 데이터베이스에 삽입합니다.

-- ============================================
-- 1. 아트 스페이스 광교
-- ============================================

-- 공간 삽입
WITH location AS (
  INSERT INTO locations (name, category_id, lat, lng, address, phone, description, status_text, status_color, total_slots, reserved_slots)
  SELECT 
    '아트 스페이스 광교',
    c.id,
    37.2842,
    127.0543,
    '수원시 영통구 광교중앙로 140',
    '031-228-3800',
    '호수공원 옆에 위치한 현대적인 건축물로, 자연과 예술이 어우러진 공간입니다. 다양한 기획 전시와 문화 프로그램을 즐길 수 있습니다.',
    '예약 가능',
    '#3B82F6',
    5,
    3
  FROM categories c WHERE c.name = '갤러리'
  RETURNING id
),
-- 옵션 삽입
options AS (
  INSERT INTO location_options (location_id, parking, pets, twenty_four_hours)
  SELECT id, true, false, false FROM location
  RETURNING location_id
),
-- 이미지 삽입
images AS (
  INSERT INTO location_images (location_id, image_url, sort_order)
  SELECT id, image_url, sort_order FROM location,
  (VALUES 
    ('https://picsum.photos/id/10/800/600', 0),
    ('https://picsum.photos/id/11/800/600', 1),
    ('https://picsum.photos/id/12/800/600', 2)
  ) AS imgs(image_url, sort_order)
  RETURNING location_id
),
-- SNS 삽입
sns AS (
  INSERT INTO location_sns (location_id, platform, url)
  SELECT id, 'instagram', 'https://www.instagram.com/suwon_art_space/' FROM location
  RETURNING location_id
),
-- 태그 연결
tags_linked AS (
  INSERT INTO location_tags (location_id, tag_id)
  SELECT l.id, t.id FROM location l, tags t
  WHERE t.name IN ('따뜻한', '자연스러운', '모던한', '친근한')
  RETURNING location_id
)
-- 세부 공간 삽입
INSERT INTO spaces (location_id, name, width, height, price, is_reserved, image_url, size)
SELECT id, name, width, height, price, is_reserved, image_url, size FROM location,
(VALUES 
  ('제 1 전시실', 1000, 500, 250000, false, 'https://picsum.photos/id/101/400/300', '1000 x 500 cm'),
  ('멀티룸 A', 500, 300, 150000, false, 'https://picsum.photos/id/102/400/300', '500 x 300 cm'),
  ('야외 조각 공원', 2000, 2000, 500000, true, 'https://picsum.photos/id/103/400/300', '2000 x 2000 cm')
) AS sp(name, width, height, price, is_reserved, image_url, size);

-- ============================================
-- 2. 서울시립미술관
-- ============================================

WITH location AS (
  INSERT INTO locations (name, category_id, lat, lng, address, phone, description, status_text, status_color, total_slots, reserved_slots)
  SELECT 
    '서울시립미술관',
    c.id,
    37.5656,
    126.9753,
    '서울 중구 덕수궁길 61',
    '02-2124-8800',
    '덕수궁 돌담길에 위치한 서울의 대표 미술관입니다. 한국 근현대 미술의 흐름을 한눈에 볼 수 있는 상설 전시가 특징입니다.',
    '문의 필요',
    '#F97316',
    10,
    8
  FROM categories c WHERE c.name = '갤러리'
  RETURNING id
),
options AS (
  INSERT INTO location_options (location_id, parking, pets, twenty_four_hours)
  SELECT id, true, false, false FROM location
  RETURNING location_id
),
images AS (
  INSERT INTO location_images (location_id, image_url, sort_order)
  SELECT id, image_url, sort_order FROM location,
  (VALUES 
    ('https://picsum.photos/id/22/800/600', 0),
    ('https://picsum.photos/id/23/800/600', 1)
  ) AS imgs(image_url, sort_order)
  RETURNING location_id
),
sns AS (
  INSERT INTO location_sns (location_id, platform, url)
  SELECT id, 'instagram', 'https://www.instagram.com/seoulmuseumofart/' FROM location
  RETURNING location_id
),
tags_linked AS (
  INSERT INTO location_tags (location_id, tag_id)
  SELECT l.id, t.id FROM location l, tags t
  WHERE t.name IN ('우아한', '클래식한', '고급스러운', '로맨틱한')
  RETURNING location_id
)
INSERT INTO spaces (location_id, name, width, height, price, is_reserved, image_url, size)
SELECT id, name, width, height, price, is_reserved, image_url, size FROM location,
(VALUES 
  ('본관 전시실', 1200, 600, 300000, false, 'https://picsum.photos/id/201/400/300', '1200 x 600 cm'),
  ('프로젝트 갤러리', 400, 400, 180000, true, 'https://picsum.photos/id/202/400/300', '400 x 400 cm')
) AS sp(name, width, height, price, is_reserved, image_url, size);

-- ============================================
-- 3. 아라리오뮤지엄
-- ============================================

WITH location AS (
  INSERT INTO locations (name, category_id, lat, lng, address, phone, description, status_text, status_color, total_slots, reserved_slots)
  SELECT 
    '아라리오뮤지엄',
    c.id,
    37.5729,
    126.9852,
    '서울 종로구 율곡로 83',
    '02-736-5700',
    '오래된 공간을 개조하여 만든 독특한 분위기의 현대미술 갤러리입니다. 국내외 유명 작가들의 실험적인 작품들을 만나볼 수 있습니다.',
    '예약 가능',
    '#3B82F6',
    8,
    2
  FROM categories c WHERE c.name = '갤러리'
  RETURNING id
),
options AS (
  INSERT INTO location_options (location_id, parking, pets, twenty_four_hours)
  SELECT id, false, false, false FROM location
  RETURNING location_id
),
images AS (
  INSERT INTO location_images (location_id, image_url, sort_order)
  SELECT id, image_url, sort_order FROM location,
  (VALUES 
    ('https://picsum.photos/id/24/800/600', 0),
    ('https://picsum.photos/id/25/800/600', 1),
    ('https://picsum.photos/id/26/800/600', 2),
    ('https://picsum.photos/id/27/800/600', 3)
  ) AS imgs(image_url, sort_order)
  RETURNING location_id
),
sns AS (
  INSERT INTO location_sns (location_id, platform, url)
  SELECT id, 'instagram', 'https://www.instagram.com/arariomuseum/' FROM location
  RETURNING location_id
),
tags_linked AS (
  INSERT INTO location_tags (location_id, tag_id)
  SELECT l.id, t.id FROM location l, tags t
  WHERE t.name IN ('독특한', '힙한', '감각적인', '트렌디한')
  RETURNING location_id
)
INSERT INTO spaces (location_id, name, width, height, price, is_reserved, image_url, size)
SELECT id, name, width, height, price, is_reserved, image_url, size FROM location,
(VALUES 
  ('1F 갤러리', 600, 400, 200000, false, 'https://picsum.photos/id/301/400/300', '600 x 400 cm'),
  ('4F 루프탑', 700, 500, 280000, false, 'https://picsum.photos/id/302/400/300', '700 x 500 cm'),
  ('지하 상영관', 300, 200, 120000, false, 'https://picsum.photos/id/303/400/300', '300 x 200 cm')
) AS sp(name, width, height, price, is_reserved, image_url, size);

-- ============================================
-- 4. D뮤지엄
-- ============================================

WITH location AS (
  INSERT INTO locations (name, category_id, lat, lng, address, phone, description, status_text, status_color, total_slots, reserved_slots)
  SELECT 
    'D뮤지엄',
    c.id,
    37.5383,
    127.0125,
    '서울 성동구 왕십리로 83-21',
    '070-5097-0020',
    '젊고 감각적인 전시로 유명한 미술관입니다. 사진, 디자인, 패션 등 다양한 장르의 예술을 경험할 수 있어 많은 사랑을 받고 있습니다.',
    '예약 불가',
    '#EF4444',
    4,
    4
  FROM categories c WHERE c.name = '갤러리'
  RETURNING id
),
options AS (
  INSERT INTO location_options (location_id, parking, pets, twenty_four_hours)
  SELECT id, true, false, false FROM location
  RETURNING location_id
),
images AS (
  INSERT INTO location_images (location_id, image_url, sort_order)
  SELECT id, image_url, sort_order FROM location,
  (VALUES 
    ('https://picsum.photos/id/42/800/600', 0),
    ('https://picsum.photos/id/43/800/600', 1)
  ) AS imgs(image_url, sort_order)
  RETURNING location_id
),
sns AS (
  INSERT INTO location_sns (location_id, platform, url)
  SELECT id, 'instagram', 'https://www.instagram.com/dmuseum.seoul/' FROM location
  RETURNING location_id
),
tags_linked AS (
  INSERT INTO location_tags (location_id, tag_id)
  SELECT l.id, t.id FROM location l, tags t
  WHERE t.name IN ('젊은', '활기찬', '트렌디한', '감각적인')
  RETURNING location_id
)
INSERT INTO spaces (location_id, name, width, height, price, is_reserved, image_url, size)
SELECT id, name, width, height, price, is_reserved, image_url, size FROM location,
(VALUES 
  ('스튜디오', 800, 500, 350000, true, 'https://picsum.photos/id/401/400/300', '800 x 500 cm'),
  ('라운지', 500, 500, 220000, true, 'https://picsum.photos/id/402/400/300', '500 x 500 cm')
) AS sp(name, width, height, price, is_reserved, image_url, size);

-- ============================================
-- 5. 국립현대미술관 서울
-- ============================================

WITH location AS (
  INSERT INTO locations (name, category_id, lat, lng, address, phone, description, status_text, status_color, total_slots, reserved_slots)
  SELECT 
    '국립현대미술관 서울',
    c.id,
    37.5796,
    126.9804,
    '서울 종로구 삼청로 30',
    '02-3701-9500',
    '서울의 중심에 위치한 국립현대미술관은 한국 현대미술의 현재와 미래를 조망하는 다양한 전시를 선보입니다.',
    '예약 가능',
    '#3B82F6',
    12,
    5
  FROM categories c WHERE c.name = '문화회관'
  RETURNING id
),
options AS (
  INSERT INTO location_options (location_id, parking, pets, twenty_four_hours)
  SELECT id, true, false, false FROM location
  RETURNING location_id
),
images AS (
  INSERT INTO location_images (location_id, image_url, sort_order)
  SELECT id, image_url, sort_order FROM location,
  (VALUES 
    ('https://picsum.photos/id/10/800/600', 0),
    ('https://picsum.photos/id/11/800/600', 1),
    ('https://picsum.photos/id/12/800/600', 2)
  ) AS imgs(image_url, sort_order)
  RETURNING location_id
),
sns AS (
  INSERT INTO location_sns (location_id, platform, url)
  SELECT id, 'instagram', 'https://www.instagram.com/mmca.seoul/' FROM location
  RETURNING location_id
),
tags_linked AS (
  INSERT INTO location_tags (location_id, tag_id)
  SELECT l.id, t.id FROM location l, tags t
  WHERE t.name IN ('웅장한', '정중한', '전문적인', '안정적인')
  RETURNING location_id
)
INSERT INTO spaces (location_id, name, width, height, price, is_reserved, image_url, size)
SELECT id, name, width, height, price, is_reserved, image_url, size FROM location,
(VALUES 
  ('제 1 전시실', 1500, 800, 400000, false, 'https://picsum.photos/id/501/400/300', '1500 x 800 cm'),
  ('디지털 라이브러리', 700, 400, 250000, false, 'https://picsum.photos/id/502/400/300', '700 x 400 cm')
) AS sp(name, width, height, price, is_reserved, image_url, size);

-- ============================================
-- 6. 페이지스 바이 페이지
-- ============================================

WITH location AS (
  INSERT INTO locations (name, category_id, lat, lng, address, phone, description, status_text, status_color, total_slots, reserved_slots)
  SELECT 
    '페이지스 바이 페이지',
    c.id,
    37.5495,
    126.9209,
    '서울 마포구 월드컵로14길 10',
    '02-3144-0726',
    '아늑한 분위기의 북카페로, 독립 서적과 함께 맛있는 커피를 즐길 수 있는 특별한 공간입니다.',
    '문의 필요',
    '#F97316',
    5,
    2
  FROM categories c WHERE c.name = '카페'
  RETURNING id
),
options AS (
  INSERT INTO location_options (location_id, parking, pets, twenty_four_hours)
  SELECT id, false, true, false FROM location
  RETURNING location_id
),
images AS (
  INSERT INTO location_images (location_id, image_url, sort_order)
  SELECT id, image_url, sort_order FROM location,
  (VALUES 
    ('https://images.unsplash.com/photo-1495446815901-a7297e633e8d?q=80&w=2070&auto=format&fit=crop', 0),
    ('https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=2070&auto=format&fit=crop', 1),
    ('https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2106&auto=format&fit=crop', 2)
  ) AS imgs(image_url, sort_order)
  RETURNING location_id
),
sns AS (
  INSERT INTO location_sns (location_id, platform, url)
  SELECT id, 'instagram', 'https://www.instagram.com/pages_by.pages/' FROM location
  RETURNING location_id
),
tags_linked AS (
  INSERT INTO location_tags (location_id, tag_id)
  SELECT l.id, t.id FROM location l, tags t
  WHERE t.name IN ('아늑한', '따뜻한', '편안한', '친근한')
  RETURNING location_id
)
INSERT INTO spaces (location_id, name, width, height, price, is_reserved, image_url, size)
SELECT id, name, width, height, price, is_reserved, image_url, size FROM location,
(VALUES 
  ('메인 홀', 300, 250, 100000, false, 'https://images.pexels.com/photos/1034662/pexels-photo-1034662.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', '300 x 250 cm')
) AS sp(name, width, height, price, is_reserved, image_url, size);

