-- Phone Auth 데이터베이스 설정
-- Supabase Dashboard -> SQL Editor에서 실행

-- 1. profiles 테이블에 phone_verified 컬럼 추가 (이미 있으면 무시됨)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'phone_verified'
  ) THEN
    ALTER TABLE public.profiles 
    ADD COLUMN phone_verified BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- 2. profiles 테이블에 phone_verified_at 컬럼 추가
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'phone_verified_at'
  ) THEN
    ALTER TABLE public.profiles 
    ADD COLUMN phone_verified_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- 3. 트리거 함수 업데이트: Phone Auth로 가입한 사용자 자동 인증 처리
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
    phone_verified,
    phone_verified_at,
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
    -- Phone Auth로 가입한 경우 자동으로 verified = true
    CASE WHEN NEW.phone IS NOT NULL AND NEW.phone_confirmed_at IS NOT NULL THEN TRUE ELSE FALSE END,
    NEW.phone_confirmed_at,
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
    phone_verified = EXCLUDED.phone_verified,
    phone_verified_at = EXCLUDED.phone_verified_at,
    website = COALESCE(EXCLUDED.website, public.profiles.website),
    user_type = COALESCE(EXCLUDED.user_type, public.profiles.user_type),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. 전화번호로 사용자 조회하는 함수 생성 (중복 확인용)
CREATE OR REPLACE FUNCTION public.check_phone_exists(phone_number TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE phone = phone_number AND phone_verified = TRUE
  ) INTO user_exists;
  
  RETURN user_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. RLS 정책 추가: 사용자는 자신의 전화번호 정보만 볼 수 있음
-- (이미 profiles 테이블에 RLS가 설정되어 있다면 이 단계는 건너뛰어도 됨)

-- 6. 확인 쿼리
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND column_name IN ('phone', 'phone_verified', 'phone_verified_at')
ORDER BY ordinal_position;

-- 7. 기존 사용자들의 phone_verified 상태 업데이트
UPDATE public.profiles p
SET 
  phone_verified = TRUE,
  phone_verified_at = p.created_at,
  updated_at = NOW()
FROM auth.users au
WHERE p.id = au.id
  AND p.phone IS NOT NULL
  AND p.phone != ''
  AND au.phone_confirmed_at IS NOT NULL;

-- 완료 메시지
SELECT 'Phone Auth database setup completed!' as message;

