-- profiles 테이블에서 전화번호 확인
-- Supabase Dashboard -> SQL Editor에서 실행

-- 1. profiles 테이블의 전화번호 확인
SELECT 
  p.id,
  p.email,
  p.name,
  p.nickname,
  p.phone,
  p.user_type,
  p.created_at
FROM public.profiles p
ORDER BY p.created_at DESC;

-- 2. auth.users의 user_metadata에 phone 정보 확인
SELECT 
  au.id,
  au.email,
  au.phone as auth_phone,
  au.raw_user_meta_data->>'phone' as metadata_phone,
  au.raw_user_meta_data->>'full_name' as full_name,
  au.raw_user_meta_data->>'user_type' as user_type
FROM auth.users au
ORDER BY au.created_at DESC;

-- 3. 전화번호가 있는 사용자 수 확인
SELECT 
  COUNT(*) as total_users,
  COUNT(p.phone) as users_with_phone,
  COUNT(*) - COUNT(p.phone) as users_without_phone
FROM public.profiles p;

