-- ==========================================
-- Add dob and gender columns to profiles table
-- ==========================================

-- Add dob (date of birth) column
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS dob DATE;

-- Add gender column
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS gender VARCHAR(10);

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.dob IS '생년월일 (Date of Birth)';
COMMENT ON COLUMN public.profiles.gender IS '성별 (Gender: male, female, other)';

-- Create index for filtering by gender (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_profiles_gender ON public.profiles(gender);

-- Update the trigger function to include dob and gender
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE LOG 'Creating profile for user: %', NEW.email;
  
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
    dob,
    gender,
    created_at, 
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'nickname', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'phone', NEW.phone),
    NEW.raw_user_meta_data->>'website',
    COALESCE((NEW.raw_user_meta_data->>'user_type')::text, 'guest'),
    NEW.raw_user_meta_data->>'avatar_url',
    (NEW.raw_user_meta_data->>'dob')::date,
    NEW.raw_user_meta_data->>'gender',
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
    dob = COALESCE(EXCLUDED.dob, public.profiles.dob),
    gender = COALESCE(EXCLUDED.gender, public.profiles.gender),
    updated_at = NOW();
  
  RAISE LOG 'Profile created successfully for user: %', NEW.email;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error creating profile for %: %', NEW.email, SQLERRM;
    RETURN NEW;
END;
$$;

