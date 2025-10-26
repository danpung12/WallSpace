-- 트리거 테스트
-- Supabase Dashboard -> SQL Editor에서 실행

-- ==========================================
-- 트리거 수동 테스트 (안전)
-- ==========================================

-- 1. 테스트용 임시 사용자 확인
SELECT 
  id,
  email,
  raw_user_meta_data
FROM auth.users
WHERE email = 'test-trigger@example.com';

-- 2. 테스트: 트리거 함수 직접 실행
-- (실제 사용자 데이터로 시뮬레이션)
DO $$
DECLARE
  test_user_id uuid;
  test_email text;
  test_metadata jsonb;
BEGIN
  -- 실제 사용자 중 프로필 없는 사람 찾기
  SELECT 
    au.id,
    au.email,
    au.raw_user_meta_data
  INTO test_user_id, test_email, test_metadata
  FROM auth.users au
  LEFT JOIN public.profiles p ON p.id = au.id
  WHERE p.id IS NULL
    AND au.email_confirmed_at IS NOT NULL
  LIMIT 1;
  
  IF test_user_id IS NOT NULL THEN
    RAISE NOTICE '테스트 사용자: %', test_email;
    
    -- 프로필 생성 시도
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
    VALUES (
      test_user_id,
      test_email,
      COALESCE(test_metadata->>'full_name', split_part(test_email, '@', 1)),
      COALESCE(test_metadata->>'name', split_part(test_email, '@', 1)),
      COALESCE(test_metadata->>'nickname', split_part(test_email, '@', 1)),
      COALESCE(test_metadata->>'phone', NULL),
      COALESCE((test_metadata->>'user_type')::text, 'guest'),
      NOW(),
      NOW()
    );
    
    RAISE NOTICE '✅ 프로필 생성 성공!';
  ELSE
    RAISE NOTICE '⚠️ 프로필 없는 사용자가 없습니다.';
  END IF;
END $$;

-- 3. 결과 확인
SELECT 
  au.email,
  CASE 
    WHEN p.id IS NULL THEN '❌ 프로필 없음'
    ELSE '✅ 프로필 있음'
  END as status,
  p.name,
  p.phone
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE au.email_confirmed_at IS NOT NULL
ORDER BY au.created_at DESC;

