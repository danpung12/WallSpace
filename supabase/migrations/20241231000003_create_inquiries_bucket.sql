-- 문의 이미지 저장을 위한 Storage 버킷 생성

-- ============================================
-- 1. inquiries 버킷 생성
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'inquiries',
    'inquiries',
    true,
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 2. Storage 정책 생성
-- ============================================

-- 모든 인증된 사용자가 자신의 문의 이미지를 업로드할 수 있음
CREATE POLICY "Authenticated users can upload inquiry images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'inquiries' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- 모든 사용자가 문의 이미지를 볼 수 있음 (public bucket)
CREATE POLICY "Anyone can view inquiry images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'inquiries');

-- 사용자는 자신의 문의 이미지를 삭제할 수 있음
CREATE POLICY "Users can delete their own inquiry images"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'inquiries' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- 사용자는 자신의 문의 이미지를 업데이트할 수 있음
CREATE POLICY "Users can update their own inquiry images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'inquiries' AND
    (storage.foldername(name))[1] = auth.uid()::text
);






