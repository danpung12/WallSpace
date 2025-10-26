-- ==========================================
-- 테스트 계정 생성 스크립트
-- ==========================================
-- 
-- 이 스크립트는 Supabase Dashboard의 SQL Editor에서 실행해주세요.
-- 또는 터미널에서: npx supabase db execute --file CREATE_TEST_ACCOUNTS.sql
--
-- 참고: Supabase Auth를 사용하므로, 실제로는 회원가입 프로세스를 통해 
-- 계정을 생성하는 것이 가장 안전합니다.
-- ==========================================

-- 1. 작가/사장님 계정 생성을 위한 준비
-- 이메일: user@spacewall.com
-- 비밀번호: user1234!!
-- user_type: artist

-- 2. 손님 계정 생성을 위한 준비  
-- 이메일: guest@spacewall.com
-- 비밀번호: guest1234!!
-- user_type: guest

-- ==========================================
-- 방법 1: Supabase Dashboard를 통한 수동 생성 (권장)
-- ==========================================
-- 1. Supabase Dashboard > Authentication > Users
-- 2. "Add user" 버튼 클릭
-- 3. 이메일과 비밀번호 입력
-- 4. "Create user" 클릭
-- 5. 생성된 후 profiles 테이블에 자동으로 프로필이 생성됩니다 (트리거)

-- ==========================================
-- 방법 2: profiles 테이블 수동 업데이트 (이미 auth.users에 있는 경우)
-- ==========================================
-- 만약 auth.users에 이미 계정이 생성되어 있다면,
-- profiles 테이블을 수동으로 업데이트할 수 있습니다:

-- 작가 계정의 user_type 설정 (auth.users에 이미 있는 경우)
-- UPDATE profiles 
-- SET 
--   user_type = 'artist',
--   full_name = '테스트 작가',
--   nickname = '작가테스트',
--   phone = '010-1234-5678',
--   updated_at = NOW()
-- WHERE email = 'user@spacewall.com';

-- 손님 계정의 user_type 설정 (auth.users에 이미 있는 경우)
-- UPDATE profiles 
-- SET 
--   user_type = 'guest',
--   full_name = '테스트 손님',
--   nickname = '손님테스트',
--   updated_at = NOW()
-- WHERE email = 'guest@spacewall.com';

-- ==========================================
-- 방법 3: Supabase CLI를 사용한 생성 (개발 환경)
-- ==========================================
-- 터미널에서 다음 명령어 실행:
-- npx supabase functions invoke create-test-user --data '{"email":"user@spacewall.com","password":"user1234!!","user_type":"artist"}'

-- ==========================================
-- 확인 쿼리
-- ==========================================
-- 생성된 계정 확인:
SELECT 
  u.id,
  u.email,
  u.created_at,
  p.user_type,
  p.full_name,
  p.nickname
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email IN ('user@spacewall.com', 'guest@spacewall.com')
ORDER BY u.email;

