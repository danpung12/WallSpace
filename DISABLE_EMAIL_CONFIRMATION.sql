-- 이메일 인증 비활성화 (개발 환경용)
-- Supabase Dashboard에서 수동 설정 필요

/*
✅ Supabase Dashboard 설정 방법:

1. Supabase Dashboard 접속
   → Authentication
   → Settings (또는 Providers)
   
2. "Enable email confirmations" 찾기
   → 토글을 OFF로 전환
   
3. "Enable Signup" 확인
   → ON 상태 유지
   
4. Save (저장)

이제 새로 가입하는 사용자는 이메일 인증 없이 바로 로그인 가능합니다!
*/

-- ============================================
-- 기존 사용자들 이메일 인증 일괄 처리 (SQL)
-- ============================================

-- 1. 미인증 사용자 확인
SELECT 
  email,
  created_at,
  CASE 
    WHEN email_confirmed_at IS NULL THEN '미인증'
    ELSE '인증완료'
  END as status
FROM auth.users
WHERE email_confirmed_at IS NULL
ORDER BY created_at DESC;

-- 2. 모든 미인증 사용자 강제 인증
UPDATE auth.users
SET 
  email_confirmed_at = NOW(),
  updated_at = NOW()
WHERE email_confirmed_at IS NULL;

-- 3. 확인
SELECT 
  COUNT(*) as total_users,
  COUNT(email_confirmed_at) as confirmed_users,
  COUNT(*) - COUNT(email_confirmed_at) as unconfirmed_users
FROM auth.users;

-- 결과: unconfirmed_users = 0이어야 함 ✅

