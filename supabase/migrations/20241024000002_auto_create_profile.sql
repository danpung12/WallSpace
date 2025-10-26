-- 소셜 로그인 시 자동으로 profiles 테이블에 레코드 생성하는 트리거

-- Function: 새 사용자가 생성되면 profiles 테이블에 자동으로 레코드 생성
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
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
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'nickname', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'phone', NEW.phone),  -- user_metadata의 phone 우선, 없으면 auth phone
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
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: auth.users에 새 사용자가 생성될 때마다 실행
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 기존에 소셜 로그인으로 생성된 사용자들에게 profile 추가 (있으면 건너뜀)
INSERT INTO public.profiles (id, email, full_name, avatar_url, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name', split_part(au.email, '@', 1)),
  au.raw_user_meta_data->>'avatar_url',
  NOW(),
  NOW()
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE p.id IS NULL;







