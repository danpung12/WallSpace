-- 특정 사용자의 전화번호 업데이트
-- Supabase Dashboard -> SQL Editor에서 실행

-- 김돌순 계정에 전화번호 추가
UPDATE public.profiles
SET 
  phone = '010-1234-5678',  -- ⚠️ 실제 전화번호로 변경하세요
  updated_at = NOW()
WHERE email = 'danpung6863@naver.com';

-- 업데이트 확인
SELECT 
  email, 
  name,
  phone,
  updated_at
FROM public.profiles 
WHERE email = 'danpung6863@naver.com';

-- 또는 모든 사용자의 전화번호가 비어있다면
UPDATE public.profiles p
SET 
  phone = au.raw_user_meta_data->>'phone',
  updated_at = NOW()
FROM auth.users au
WHERE p.id = au.id
  AND (p.phone IS NULL OR p.phone = '')
  AND au.raw_user_meta_data->>'phone' IS NOT NULL;

