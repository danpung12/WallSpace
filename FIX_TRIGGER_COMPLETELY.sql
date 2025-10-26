-- 트리거 완전 재설정
-- Supabase Dashboard -> SQL Editor에서 실행

-- ==========================================
-- 1단계: 현재 상태 확인
-- ==========================================

-- 트리거 존재 확인
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 트리거 함수 확인
SELECT 
  proname as function_name,
  pg_get_functiondef(oid) as function_definition
FROM pg_proc
WHERE proname = 'handle_new_user';

-- ==========================================
-- 2단계: 기존 트리거 완전 삭제
-- ==========================================

-- 트리거 삭제
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 트리거 함수 삭제
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- ==========================================
-- 3단계: 새 트리거 함수 생성 (RLS 우회)
-- ==========================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER  -- 중요: RLS 우회
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- 로그 출력 (디버깅용)
  RAISE LOG 'Creating profile for user: %', NEW.email;
  
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
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'nickname', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'phone', NEW.phone),
    NEW.raw_user_meta_data->>'website',
    COALESCE((NEW.raw_user_meta_data->>'user_type')::text, 'guest'),
    NEW.raw_user_meta_data->>'avatar_url',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    name = COALESCE(EXCLUDED.name, public.profiles.name),
    nickname = COALESCE(EXCLUDED.nickname, public.profiles.nickname),
    phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
    website = COALESCE(EXCLUDED.website, public.profiles.website),
    user_type = COALESCE(EXCLUDED.user_type, public.profiles.user_type),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    updated_at = NOW();
  
  RAISE LOG 'Profile created successfully for user: %', NEW.email;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error creating profile for %: %', NEW.email, SQLERRM;
    RETURN NEW;  -- 에러가 나도 사용자 생성은 계속 진행
END;
$$;

-- ==========================================
-- 4단계: 새 트리거 생성
-- ==========================================

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- 5단계: 확인
-- ==========================================

-- 트리거 재확인
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 트리거 함수 재확인
SELECT 
  proname as function_name,
  prosecdef as is_security_definer
FROM pg_proc
WHERE proname = 'handle_new_user';

-- 성공 메시지
SELECT '✅ Trigger completely recreated!' as status;

-- ==========================================
-- 6단계: 기존 사용자 프로필 생성
-- ==========================================

-- 프로필 없는 사용자 확인
SELECT 
  au.email,
  au.created_at,
  '❌ 프로필 없음' as status
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE p.id IS NULL
  AND au.email_confirmed_at IS NOT NULL
ORDER BY au.created_at DESC;

-- 프로필 없는 모든 사용자에게 프로필 생성
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
  COALESCE(au.raw_user_meta_data->>'name', au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)),
  COALESCE(au.raw_user_meta_data->>'nickname', split_part(au.email, '@', 1)),
  COALESCE(au.raw_user_meta_data->>'phone', au.phone),
  au.raw_user_meta_data->>'website',
  COALESCE((au.raw_user_meta_data->>'user_type')::text, 'guest'),
  au.raw_user_meta_data->>'avatar_url',
  au.created_at,
  NOW()
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE p.id IS NULL
  AND au.email_confirmed_at IS NOT NULL;

-- ==========================================
-- 7단계: 최종 확인
-- ==========================================

SELECT 
  au.email,
  CASE 
    WHEN au.email_confirmed_at IS NULL THEN '❌ 이메일 미인증'
    ELSE '✅ 이메일 인증완료'
  END as email_status,
  CASE 
    WHEN p.id IS NULL THEN '❌ 프로필 없음'
    ELSE '✅ 프로필 있음'
  END as profile_status,
  p.name,
  p.nickname,
  p.phone,
  p.user_type
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
ORDER BY au.created_at DESC
LIMIT 10;

