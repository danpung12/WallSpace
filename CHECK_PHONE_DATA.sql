-- 전화번호 데이터 확인
-- Supabase Dashboard -> SQL Editor에서 실행

-- 1. profiles 테이블에 전화번호가 있는지 확인
SELECT 
  p.id,
  p.email,
  p.name,
  p.nickname,
  p.phone,
  LENGTH(p.phone) as phone_length,
  p.user_type,
  p.created_at
FROM public.profiles p
WHERE p.email = 'danpung6863@naver.com';

-- 2. auth.users의 user_metadata 확인
SELECT 
  au.id,
  au.email,
  au.phone as auth_phone,
  au.raw_user_meta_data->>'phone' as metadata_phone,
  au.raw_user_meta_data
FROM auth.users au
WHERE au.email = 'danpung6863@naver.com';

-- 3. 모든 사용자의 전화번호 상태
SELECT 
  p.email,
  p.phone,
  CASE 
    WHEN p.phone IS NULL THEN 'NULL'
    WHEN p.phone = '' THEN 'EMPTY STRING'
    ELSE 'HAS VALUE'
  END as phone_status
FROM public.profiles p
ORDER BY p.created_at DESC;

