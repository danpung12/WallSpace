-- 문의 테이블 뷰 생성 (이메일 포함)
-- Supabase Dashboard에서 사용자 이메일을 볼 수 있도록 함

-- ============================================
-- 1. 기존 뷰 삭제 (있다면)
-- ============================================
DROP VIEW IF EXISTS public.inquiries_with_user CASCADE;

-- ============================================
-- 2. 문의 + 사용자 정보 뷰 생성
-- ============================================
CREATE OR REPLACE VIEW public.inquiries_with_user AS
SELECT 
    i.id,
    i.user_id,
    p.email as user_email,
    p.name as user_name,
    p.nickname as user_nickname,
    i.subject,
    i.content,
    i.status,
    i.admin_reply,
    i.created_at,
    i.updated_at,
    i.resolved_at
FROM 
    public.inquiries i
LEFT JOIN 
    public.profiles p ON i.user_id = p.id;

-- ============================================
-- 3. 뷰에 대한 코멘트 추가
-- ============================================
COMMENT ON VIEW public.inquiries_with_user IS '사용자 정보가 포함된 문의 테이블 뷰 (Dashboard용)';

-- ============================================
-- 4. RLS 설정 (뷰는 기본 테이블의 RLS를 따름)
-- ============================================
-- 뷰는 자동으로 기본 테이블(inquiries)의 RLS 정책을 상속받습니다.






