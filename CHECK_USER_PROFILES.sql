-- 사용자 프로필 상태 확인 쿼리
-- Supabase Dashboard -> SQL Editor에서 실행

-- 1. auth.users에는 있지만 profiles에 없는 사용자 찾기
SELECT 
  au.id,
  au.email,
  au.phone,
  au.created_at as user_created_at,
  au.raw_user_meta_data
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE p.id IS NULL
ORDER BY au.created_at DESC;

-- 2. 프로필은 있지만 필수 필드가 누락된 사용자 찾기
SELECT 
  p.id,
  p.email,
  p.name,
  p.nickname,
  p.phone,
  p.user_type,
  CASE 
    WHEN p.name IS NULL THEN 'name 누락'
    WHEN p.nickname IS NULL THEN 'nickname 누락'
    WHEN p.user_type IS NULL THEN 'user_type 누락'
    ELSE 'OK'
  END as status
FROM public.profiles p
WHERE p.name IS NULL 
   OR p.nickname IS NULL 
   OR p.user_type IS NULL
ORDER BY p.created_at DESC;

-- 3. 전체 사용자 수 비교
SELECT 
  (SELECT COUNT(*) FROM auth.users) as total_users,
  (SELECT COUNT(*) FROM public.profiles) as total_profiles,
  (SELECT COUNT(*) FROM auth.users au 
   LEFT JOIN public.profiles p ON p.id = au.id 
   WHERE p.id IS NULL) as missing_profiles;

