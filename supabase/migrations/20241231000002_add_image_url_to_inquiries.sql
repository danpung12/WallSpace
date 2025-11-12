-- 문의 테이블에 이미지 URL 필드 추가

-- ============================================
-- 1. image_url 컬럼 추가
-- ============================================
ALTER TABLE public.inquiries 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- ============================================
-- 2. 코멘트 추가
-- ============================================
COMMENT ON COLUMN public.inquiries.image_url IS '문의 첨부 이미지 URL (Supabase Storage 경로)';


















