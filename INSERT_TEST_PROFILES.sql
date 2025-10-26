-- ==========================================
-- 테스트 계정 프로필 완전히 설정
-- ==========================================
-- 이 SQL은 Supabase Dashboard의 SQL Editor에서 실행하세요.
-- 사전에 auth.users에 계정이 생성되어 있어야 합니다.
-- ==========================================

-- 작가 계정 프로필 완전히 설정
UPDATE profiles 
SET 
  user_type = 'artist',
  full_name = '김작가',
  name = '김작가',
  nickname = '예술가김',
  phone = '010-1234-5678',
  website = 'https://instagram.com/artist_kim',
  bio = '현대 미술을 사랑하는 작가입니다.',
  updated_at = NOW()
WHERE email = 'user@spacewall.com';

-- 손님 계정 프로필 완전히 설정 (전화번호, 닉네임 없음, 생년월일과 성별 포함)
UPDATE profiles 
SET 
  user_type = 'guest',
  full_name = '이손님',
  name = '이손님',
  nickname = NULL,
  phone = NULL,
  dob = '1995-05-15',
  gender = 'female',
  bio = '예술 작품 감상을 좋아합니다.',
  updated_at = NOW()
WHERE email = 'guest@spacewall.com';

-- 확인
SELECT 
  id,
  email,
  user_type,
  full_name,
  name,
  nickname,
  phone,
  dob,
  gender,
  website,
  bio,
  created_at
FROM profiles
WHERE email IN ('user@spacewall.com', 'guest@spacewall.com')
ORDER BY email;

-- auth.users와 profiles 조인 확인
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  u.created_at as user_created_at,
  p.user_type,
  p.full_name,
  p.nickname,
  p.phone,
  p.dob,
  p.gender,
  p.website
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email IN ('user@spacewall.com', 'guest@spacewall.com')
ORDER BY u.email;

