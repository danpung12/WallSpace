-- ==========================================
-- 기존 사용자들의 이메일 자동 확인 처리
-- ==========================================
-- 이메일 인증이 안 된 기존 사용자들을 자동으로 확인 처리합니다.
-- Supabase Dashboard에서 "Confirm email" 설정을 OFF로 변경한 후 실행하세요.
-- ==========================================

-- 이메일이 확인되지 않은 모든 사용자를 자동 확인 처리
UPDATE auth.users
SET 
  email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
  updated_at = NOW()
WHERE email_confirmed_at IS NULL;

-- 확인
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  updated_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

