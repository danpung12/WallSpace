-- 기존 회원가입된 계정의 프로필 문제 해결
-- Supabase Dashboard -> SQL Editor에서 실행

-- 1. auth.users에는 있지만 profiles에 없는 사용자들을 위한 프로필 생성
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
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name', split_part(au.email, '@', 1)),
  COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name', split_part(au.email, '@', 1)),
  COALESCE(au.raw_user_meta_data->>'nickname', split_part(au.email, '@', 1)),
  au.phone,
  au.raw_user_meta_data->>'website',
  COALESCE((au.raw_user_meta_data->>'user_type')::text, 'guest'),
  au.raw_user_meta_data->>'avatar_url',
  NOW(),
  NOW()
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE p.id IS NULL;

-- 2. 기존 프로필에 누락된 필드 업데이트 (phone, nickname, user_type 등)
UPDATE public.profiles p
SET 
  phone = COALESCE(p.phone, au.phone),
  nickname = COALESCE(p.nickname, au.raw_user_meta_data->>'nickname', split_part(p.email, '@', 1)),
  name = COALESCE(p.name, au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name', p.full_name),
  user_type = COALESCE(p.user_type, (au.raw_user_meta_data->>'user_type')::text, 'guest'),
  website = COALESCE(p.website, au.raw_user_meta_data->>'website'),
  avatar_url = COALESCE(p.avatar_url, au.raw_user_meta_data->>'avatar_url'),
  updated_at = NOW()
FROM auth.users au
WHERE p.id = au.id
  AND (
    p.phone IS NULL OR 
    p.nickname IS NULL OR 
    p.name IS NULL OR
    p.user_type IS NULL
  );

-- 3. user_type이 NULL인 프로필을 'guest'로 설정
UPDATE public.profiles
SET user_type = 'guest', updated_at = NOW()
WHERE user_type IS NULL;

-- 4. 생성된/업데이트된 프로필 확인
SELECT 
  p.id,
  p.email,
  p.name,
  p.nickname,
  p.phone,
  p.user_type,
  p.created_at
FROM public.profiles p
ORDER BY p.created_at DESC
LIMIT 10;

