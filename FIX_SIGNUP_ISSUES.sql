-- 회원가입 문제 해결
-- Supabase Dashboard -> SQL Editor에서 실행

-- 1. auth.users 테이블에서 새 사용자 확인
SELECT 
  id,
  email,
  email_confirmed_at,
  phone,
  created_at,
  raw_user_meta_data
FROM auth.users
WHERE email = 'caragalracal@naver.com';

-- 2. 이메일 미인증 사용자 확인
SELECT 
  id,
  email,
  email_confirmed_at,
  CASE 
    WHEN email_confirmed_at IS NULL THEN '❌ 이메일 미인증'
    ELSE '✅ 인증 완료'
  END as status
FROM auth.users
WHERE email_confirmed_at IS NULL
ORDER BY created_at DESC;

-- 3. profiles 테이블에 없는 사용자 확인
SELECT 
  au.id,
  au.email,
  au.email_confirmed_at,
  au.created_at,
  CASE 
    WHEN p.id IS NULL THEN '❌ 프로필 없음'
    ELSE '✅ 프로필 있음'
  END as profile_status
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE au.email = 'caragalracal@naver.com';

-- 4. 해결 방법 A: 이메일 인증 없이 로그인 가능하도록 설정
-- (이미 가입한 사용자의 이메일 강제 인증)
UPDATE auth.users
SET 
  email_confirmed_at = NOW(),
  updated_at = NOW()
WHERE email = 'caragalracal@naver.com'
  AND email_confirmed_at IS NULL;

-- 5. 해결 방법 B: 누락된 프로필 수동 생성
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  name,
  nickname,
  phone,
  user_type,
  created_at,
  updated_at
)
SELECT 
  au.id,
  au.email,
  au.raw_user_meta_data->>'full_name',
  au.raw_user_meta_data->>'name',
  au.raw_user_meta_data->>'nickname',
  au.raw_user_meta_data->>'phone',
  COALESCE((au.raw_user_meta_data->>'user_type')::text, 'guest'),
  au.created_at,
  NOW()
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE p.id IS NULL
  AND au.email = 'caragalracal@naver.com';

-- 6. 최종 확인
SELECT 
  p.id,
  p.email,
  p.name,
  p.nickname,
  p.phone,
  p.user_type,
  au.email_confirmed_at
FROM public.profiles p
JOIN auth.users au ON au.id = p.id
WHERE p.email = 'caragalracal@naver.com';

-- 7. 모든 미인증 사용자 일괄 처리 (선택사항)
-- 주의: 이 쿼리는 모든 미인증 사용자를 인증 처리합니다!
/*
UPDATE auth.users
SET 
  email_confirmed_at = NOW(),
  updated_at = NOW()
WHERE email_confirmed_at IS NULL;

INSERT INTO public.profiles (
  id,
  email,
  full_name,
  name,
  nickname,
  phone,
  user_type,
  created_at,
  updated_at
)
SELECT 
  au.id,
  au.email,
  au.raw_user_meta_data->>'full_name',
  au.raw_user_meta_data->>'name',
  au.raw_user_meta_data->>'nickname',
  au.raw_user_meta_data->>'phone',
  COALESCE((au.raw_user_meta_data->>'user_type')::text, 'guest'),
  au.created_at,
  NOW()
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE p.id IS NULL;
*/

