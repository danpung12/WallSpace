-- notifications 테이블의 RLS 정책 확인 및 수정
-- Supabase Dashboard의 SQL Editor에서 실행하세요

-- 1. 기존 정책 확인
SELECT * FROM pg_policies WHERE tablename = 'notifications';

-- 2. 사용자가 자신의 알림을 삭제할 수 있도록 정책 추가/수정
DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;

CREATE POLICY "Users can delete own notifications"
ON notifications
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 3. 사용자가 자신의 알림을 업데이트할 수 있도록 정책 추가/수정 (읽음 처리용)
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;

CREATE POLICY "Users can update own notifications"
ON notifications
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. 사용자가 자신의 알림을 조회할 수 있도록 정책 추가/수정
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;

CREATE POLICY "Users can view own notifications"
ON notifications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 5. 정책 확인
SELECT * FROM pg_policies WHERE tablename = 'notifications';






