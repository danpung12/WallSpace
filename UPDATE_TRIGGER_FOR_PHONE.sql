-- 트리거 업데이트: user_metadata에서 phone 가져오기
-- Supabase Dashboard -> SQL Editor에서 실행

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
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 기존 사용자의 프로필에 user_metadata의 phone 동기화
UPDATE public.profiles p
SET 
  phone = COALESCE(p.phone, au.raw_user_meta_data->>'phone'),
  updated_at = NOW()
FROM auth.users au
WHERE p.id = au.id
  AND (p.phone IS NULL OR p.phone = '')
  AND au.raw_user_meta_data->>'phone' IS NOT NULL;

