-- ==========================================
-- 로그인 오류 긴급 수정
-- "Invalid login credentials" 오류 해결
-- ==========================================
-- Supabase Dashboard의 SQL Editor에서 실행하세요.
-- ==========================================

-- 1. 모든 미인증 사용자를 자동으로 인증 처리
UPDATE auth.users
SET 
  email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
  updated_at = NOW()
WHERE email_confirmed_at IS NULL;

-- 2. 확인: 모든 사용자의 이메일 인증 상태 체크
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  CASE 
    WHEN email_confirmed_at IS NULL THEN '❌ 미인증'
    ELSE '✅ 인증됨'
  END as status
FROM auth.users
ORDER BY created_at DESC;

-- 3. 특정 이메일만 인증하려면 (필요시 사용):
-- UPDATE auth.users
-- SET 
--   email_confirmed_at = NOW(),
--   updated_at = NOW()
-- WHERE email = '여기에_이메일_입력@example.com';

