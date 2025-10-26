-- reservations 테이블 생성
-- 예약 시스템을 위한 핵심 테이블

-- 1. reservations 테이블 생성
CREATE TABLE IF NOT EXISTS public.reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- 예약자 정보 (작가)
    artist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- 장소 및 공간 정보
    location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
    space_id UUID NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
    
    -- 전시할 작품
    artwork_id UUID NOT NULL REFERENCES public.artworks(id) ON DELETE CASCADE,
    
    -- 예약 기간
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    
    -- 예약 상태
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    
    -- 가격 정보
    total_price INTEGER NOT NULL DEFAULT 0,
    
    -- 타임스탬프
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- 제약 조건
    CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- 2. 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_reservations_artist ON public.reservations(artist_id);
CREATE INDEX IF NOT EXISTS idx_reservations_location ON public.reservations(location_id);
CREATE INDEX IF NOT EXISTS idx_reservations_space ON public.reservations(space_id);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON public.reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_dates ON public.reservations(start_date, end_date);

-- 3. RLS (Row Level Security) 활성화
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- 4. RLS 정책 생성

-- 모든 사용자는 예약 목록을 볼 수 있음
CREATE POLICY "Anyone can view reservations"
    ON public.reservations
    FOR SELECT
    USING (true);

-- 인증된 사용자(작가/매니저)는 예약 생성 가능
CREATE POLICY "Authenticated users can create reservations"
    ON public.reservations
    FOR INSERT
    WITH CHECK (
        auth.role() = 'authenticated'
        AND auth.uid() = artist_id
    );

-- 예약자 본인은 자신의 예약을 수정할 수 있음
CREATE POLICY "Users can update their own reservations"
    ON public.reservations
    FOR UPDATE
    USING (auth.uid() = artist_id)
    WITH CHECK (auth.uid() = artist_id);

-- 예약자 본인은 자신의 예약을 삭제할 수 있음
CREATE POLICY "Users can delete their own reservations"
    ON public.reservations
    FOR DELETE
    USING (auth.uid() = artist_id);

-- 5. updated_at 자동 업데이트 트리거 함수 생성
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. updated_at 트리거 적용
DROP TRIGGER IF EXISTS update_reservations_updated_at ON public.reservations;
CREATE TRIGGER update_reservations_updated_at
    BEFORE UPDATE ON public.reservations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 7. 테이블 생성 확인
SELECT 
    tablename,
    schemaname
FROM pg_tables
WHERE tablename = 'reservations'
    AND schemaname = 'public';

-- 8. 컬럼 목록 확인
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'reservations'
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 9. RLS 정책 확인
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'reservations';

SELECT '✅ reservations table created successfully!' as status;







