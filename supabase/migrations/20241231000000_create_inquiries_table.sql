-- 문의 테이블 생성
-- 사용자들의 문의사항을 저장하기 위한 테이블

-- ============================================
-- 1. 문의 타입 ENUM 생성
-- ============================================
DO $$ BEGIN
    CREATE TYPE inquiry_type AS ENUM (
        'payment_error',      -- 결제 오류
        'reservation_error',  -- 예약 오류
        'general',            -- 일반 문의
        'other'               -- 기타
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- 2. 문의 상태 ENUM 생성
-- ============================================
DO $$ BEGIN
    CREATE TYPE inquiry_status AS ENUM (
        'pending',    -- 대기중
        'in_progress', -- 처리중
        'resolved',    -- 해결됨
        'closed'       -- 종료됨
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- 3. 문의 테이블 생성
-- ============================================
CREATE TABLE IF NOT EXISTS public.inquiries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    subject inquiry_type NOT NULL,
    content TEXT NOT NULL,
    status inquiry_status DEFAULT 'pending' NOT NULL,
    admin_reply TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- 4. 인덱스 생성
-- ============================================
CREATE INDEX IF NOT EXISTS idx_inquiries_user_id ON public.inquiries(user_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON public.inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON public.inquiries(created_at DESC);

-- ============================================
-- 5. RLS (Row Level Security) 활성화
-- ============================================
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. RLS 정책 생성
-- ============================================

-- 사용자는 자신의 문의만 볼 수 있음
CREATE POLICY "Users can view their own inquiries"
    ON public.inquiries
    FOR SELECT
    USING (auth.uid() = user_id);

-- 사용자는 자신의 문의만 생성할 수 있음
CREATE POLICY "Users can create their own inquiries"
    ON public.inquiries
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 사용자는 대기중 상태의 자신의 문의만 수정할 수 있음
CREATE POLICY "Users can update their pending inquiries"
    ON public.inquiries
    FOR UPDATE
    USING (auth.uid() = user_id AND status = 'pending')
    WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- 사용자는 대기중 상태의 자신의 문의만 삭제할 수 있음
CREATE POLICY "Users can delete their pending inquiries"
    ON public.inquiries
    FOR DELETE
    USING (auth.uid() = user_id AND status = 'pending');

-- ============================================
-- 7. 업데이트 트리거 생성
-- ============================================

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_inquiries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
DROP TRIGGER IF EXISTS update_inquiries_updated_at_trigger ON public.inquiries;
CREATE TRIGGER update_inquiries_updated_at_trigger
    BEFORE UPDATE ON public.inquiries
    FOR EACH ROW
    EXECUTE FUNCTION update_inquiries_updated_at();

-- ============================================
-- 8. 코멘트 추가
-- ============================================
COMMENT ON TABLE public.inquiries IS '사용자 문의 테이블';
COMMENT ON COLUMN public.inquiries.subject IS '문의 주제 (payment_error, reservation_error, general, other)';
COMMENT ON COLUMN public.inquiries.content IS '문의 내용';
COMMENT ON COLUMN public.inquiries.status IS '처리 상태 (pending, in_progress, resolved, closed)';
COMMENT ON COLUMN public.inquiries.admin_reply IS '관리자 답변';


