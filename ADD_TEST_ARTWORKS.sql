-- ============================================
-- 테스트 계정에 작품 추가 스크립트
-- ============================================
-- 
-- 작가 계정: user@spacewall.com
-- 테스트용 작품 3개 추가
--
-- 실행 방법:
-- Supabase Dashboard > SQL Editor > New Query
-- 이 스크립트 전체를 붙여넣고 실행
-- ============================================

-- 작가 ID 가져오기
DO $$
DECLARE
  artist_user_id UUID;
BEGIN
  -- user@spacewall.com의 ID 가져오기
  SELECT id INTO artist_user_id
  FROM auth.users
  WHERE email = 'user@spacewall.com';

  IF artist_user_id IS NULL THEN
    RAISE EXCEPTION 'Artist user not found. Please create the test account first.';
  END IF;

  -- 기존 테스트 작품 삭제 (있다면)
  DELETE FROM artworks
  WHERE artist_id = artist_user_id
    AND title IN ('Sunset Dreams', 'Urban Rhythm', 'Silent Forest');

  -- 작품 1: Sunset Dreams
  INSERT INTO artworks (
    id,
    artist_id,
    title,
    dimensions,
    price,
    image_url,
    alt_text,
    description,
    is_available,
    created_at,
    updated_at
  ) VALUES (
    uuid_generate_v4(),
    artist_user_id,
    'Sunset Dreams',
    '90 x 120 cm',
    1500000,
    'https://images.unsplash.com/photo-1549887534-1541e9326642?w=800',
    'A vibrant abstract painting with sunset colors',
    '저녁 노을의 따뜻한 색감을 담은 추상화 작품입니다. 오렌지, 핑크, 보라색이 조화롭게 어우러져 있습니다.',
    true,
    NOW(),
    NOW()
  );

  -- 작품 2: Urban Rhythm
  INSERT INTO artworks (
    id,
    artist_id,
    title,
    dimensions,
    price,
    image_url,
    alt_text,
    description,
    is_available,
    created_at,
    updated_at
  ) VALUES (
    uuid_generate_v4(),
    artist_user_id,
    'Urban Rhythm',
    '60 x 80 cm',
    950000,
    'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800',
    'A modern cityscape painting with geometric shapes',
    '도시의 활기찬 리듬을 기하학적 형태로 표현한 작품입니다. 현대적이고 세련된 느낌을 줍니다.',
    true,
    NOW(),
    NOW()
  );

  -- 작품 3: Silent Forest
  INSERT INTO artworks (
    id,
    artist_id,
    title,
    dimensions,
    price,
    image_url,
    alt_text,
    description,
    is_available,
    created_at,
    updated_at
  ) VALUES (
    uuid_generate_v4(),
    artist_user_id,
    'Silent Forest',
    '70 x 100 cm',
    1200000,
    'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800',
    'A serene forest landscape painting',
    '고요한 숲 속의 평화로운 순간을 담은 풍경화입니다. 초록빛과 자연의 아름다움이 느껴집니다.',
    true,
    NOW(),
    NOW()
  );

  RAISE NOTICE '✅ 3 test artworks added successfully!';
END $$;

-- 추가된 작품 확인
SELECT 
  a.id,
  a.title,
  a.dimensions,
  a.price,
  a.is_available,
  p.email as artist_email,
  p.name as artist_name
FROM artworks a
JOIN profiles p ON a.artist_id = p.id
WHERE p.email = 'user@spacewall.com'
ORDER BY a.created_at DESC;

-- 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '====================================';
  RAISE NOTICE '테스트 작품 추가 완료!';
  RAISE NOTICE '====================================';
  RAISE NOTICE '작가: user@spacewall.com (김아트)';
  RAISE NOTICE '작품 수: 3개';
  RAISE NOTICE '';
  RAISE NOTICE '1. Sunset Dreams (90 x 120 cm) - ₩1,500,000';
  RAISE NOTICE '2. Urban Rhythm (60 x 80 cm) - ₩950,000';
  RAISE NOTICE '3. Silent Forest (70 x 100 cm) - ₩1,200,000';
  RAISE NOTICE '====================================';
END $$;





