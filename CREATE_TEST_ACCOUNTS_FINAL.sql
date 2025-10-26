-- ============================================
-- 테스트 계정 생성 스크립트
-- ============================================
-- 
-- 계정 정보:
-- 1. 작가/사장님: user@spacewall.com / user1234!!
-- 2. 손님/유저: guest@spacewall.com / guest1234!!
--
-- 실행 방법:
-- Supabase Dashboard > SQL Editor > New Query
-- 이 스크립트 전체를 붙여넣고 실행
-- ============================================

-- 1단계: 기존 계정이 있다면 삭제
DO $$
BEGIN
  -- profiles 테이블에서 먼저 삭제 (FK 제약조건 때문)
  DELETE FROM public.profiles 
  WHERE email IN ('user@spacewall.com', 'guest@spacewall.com');
  
  -- auth.users에서 삭제
  DELETE FROM auth.users 
  WHERE email IN ('user@spacewall.com', 'guest@spacewall.com');
  
  RAISE NOTICE '기존 테스트 계정 삭제 완료';
END $$;

-- ============================================
-- 2단계: 작가/사장님 계정 생성
-- ============================================
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at,
  is_sso_user,
  deleted_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'user@spacewall.com',
  crypt('user1234!!', gen_salt('bf')), -- 비밀번호 해시
  NOW(), -- 이메일 인증 완료
  NULL,
  '',
  NULL,
  '',
  NULL,
  '',
  '',
  NULL,
  NOW(), -- 마지막 로그인
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object(
    'full_name', '김아트',
    'name', '김아트',
    'nickname', '아티스트Kim',
    'user_type', 'artist',
    'phone', '010-1234-5678',
    'website', 'https://art-portfolio.com'
  ),
  FALSE,
  NOW(),
  NOW(),
  NULL, -- phone은 user_metadata에만 저장
  NULL,
  '',
  '',
  NULL,
  '',
  0,
  NULL,
  '',
  NULL,
  FALSE,
  NULL
);

-- 작가/사장님 프로필 생성
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  name,
  nickname,
  phone,
  website,
  user_type,
  avatar_url,
  created_at,
  updated_at
)
SELECT 
  u.id,
  'user@spacewall.com',
  '김아트',
  '김아트',
  '아티스트Kim',
  '010-1234-5678',
  'https://art-portfolio.com',
  'artist',
  NULL,
  NOW(),
  NOW()
FROM auth.users u
WHERE u.email = 'user@spacewall.com'
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  name = EXCLUDED.name,
  nickname = EXCLUDED.nickname,
  phone = EXCLUDED.phone,
  website = EXCLUDED.website,
  user_type = EXCLUDED.user_type,
  updated_at = NOW();

-- ============================================
-- 3단계: 손님/유저 계정 생성
-- ============================================
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at,
  is_sso_user,
  deleted_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'guest@spacewall.com',
  crypt('guest1234!!', gen_salt('bf')), -- 비밀번호 해시
  NOW(), -- 이메일 인증 완료
  NULL,
  '',
  NULL,
  '',
  NULL,
  '',
  '',
  NULL,
  NOW(), -- 마지막 로그인
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object(
    'full_name', '이손님',
    'name', '이손님',
    'user_type', 'guest',
    'dob', '1995-08-20',
    'gender', 'male'
  ),
  FALSE,
  NOW(),
  NOW(),
  NULL,
  NULL,
  '',
  '',
  NULL,
  '',
  0,
  NULL,
  '',
  NULL,
  FALSE,
  NULL
);

-- 손님 프로필 생성
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  name,
  nickname,
  phone,
  user_type,
  dob,
  gender,
  avatar_url,
  created_at,
  updated_at
)
SELECT 
  u.id,
  'guest@spacewall.com',
  '이손님',
  '이손님',
  NULL, -- 손님은 nickname 없음
  NULL, -- 손님은 phone 없음
  'guest',
  '1995-08-20',
  'male',
  NULL,
  NOW(),
  NOW()
FROM auth.users u
WHERE u.email = 'guest@spacewall.com'
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  name = EXCLUDED.name,
  nickname = EXCLUDED.nickname,
  phone = EXCLUDED.phone,
  user_type = EXCLUDED.user_type,
  dob = EXCLUDED.dob,
  gender = EXCLUDED.gender,
  updated_at = NOW();

-- ============================================
-- 4단계: 생성된 계정 확인
-- ============================================
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  u.created_at,
  u.raw_user_meta_data,
  p.full_name,
  p.nickname,
  p.phone,
  p.user_type,
  p.dob,
  p.gender
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email IN ('user@spacewall.com', 'guest@spacewall.com')
ORDER BY u.email;

-- 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '====================================';
  RAISE NOTICE '테스트 계정 생성 완료!';
  RAISE NOTICE '====================================';
  RAISE NOTICE '1. 작가/사장님 계정:';
  RAISE NOTICE '   이메일: user@spacewall.com';
  RAISE NOTICE '   비밀번호: user1234!!';
  RAISE NOTICE '   이름: 김아트';
  RAISE NOTICE '   필명: 아티스트Kim';
  RAISE NOTICE '   전화번호: 010-1234-5678';
  RAISE NOTICE '   웹사이트: https://art-portfolio.com';
  RAISE NOTICE '';
  RAISE NOTICE '2. 손님/유저 계정:';
  RAISE NOTICE '   이메일: guest@spacewall.com';
  RAISE NOTICE '   비밀번호: guest1234!!';
  RAISE NOTICE '   이름: 이손님';
  RAISE NOTICE '   생년월일: 1995-08-20';
  RAISE NOTICE '   성별: male';
  RAISE NOTICE '====================================';
END $$;

