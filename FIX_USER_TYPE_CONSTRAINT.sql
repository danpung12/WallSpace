-- profiles 테이블의 user_type CHECK 제약 조건 수정
-- manager 타입 허용하도록 업데이트

-- 1. 기존 제약 조건 삭제
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_user_type_check;

-- 2. 새로운 제약 조건 생성 (artist, manager, guest 모두 허용)
ALTER TABLE profiles 
ADD CONSTRAINT profiles_user_type_check 
CHECK (user_type IN ('artist', 'manager', 'guest') OR user_type IS NULL);

-- 3. 현재 설정 확인
SELECT conname, pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'profiles'::regclass 
AND conname = 'profiles_user_type_check';

-- 4. 현재 사용자 정보 확인
SELECT id, email, user_type, name
FROM profiles 
WHERE email = 'aass20000916@gmail.com';





























