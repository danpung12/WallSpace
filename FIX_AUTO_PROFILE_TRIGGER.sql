-- 자동 프로필 생성 트리거 수정
-- user_type을 NULL로 남겨서 온보딩 페이지로 유도

-- 기존 트리거 함수 업데이트
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- user_type을 NULL로 남겨서 온보딩 페이지로 유도
  -- 온보딩 페이지에서 사용자가 직접 선택하게 함
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    name,
    nickname,
    avatar_url, 
    user_type,
    created_at, 
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name', 
      NEW.raw_user_meta_data->>'name', 
      split_part(NEW.email, '@', 1)
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'full_name', 
      NEW.raw_user_meta_data->>'name', 
      split_part(NEW.email, '@', 1)
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'nickname',
      split_part(NEW.email, '@', 1)
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture',
      NEW.raw_user_meta_data->>'profile_image'
    ),
    NULL,  -- user_type을 NULL로 설정 (온보딩에서 선택)
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;  -- 이미 존재하면 무시
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- profiles 테이블의 user_type 컬럼을 nullable로 변경
ALTER TABLE profiles 
ALTER COLUMN user_type DROP NOT NULL;

-- 기존 NULL user_type을 가진 사용자가 있다면 확인
SELECT id, email, user_type, name
FROM profiles
WHERE user_type IS NULL;





























