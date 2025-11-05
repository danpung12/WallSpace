-- 온보딩에서 수집하는 추가 필드 추가

-- user_type, gender, age_range 컬럼 추가
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS user_type TEXT CHECK (user_type IN ('artist', 'guest')),
ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female', 'other')),
ADD COLUMN IF NOT EXISTS age_range TEXT CHECK (age_range IN ('10s', '20s', '30s', '40s', '50s', '60s+'));

-- 인덱스 추가 (검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON public.profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_gender ON public.profiles(gender);
CREATE INDEX IF NOT EXISTS idx_profiles_age_range ON public.profiles(age_range);



















