-- 읽은 알림을 모두 삭제하는 SQL
-- Supabase Dashboard의 SQL Editor에서 실행하세요

-- 1. 현재 읽은 알림 개수 확인
SELECT COUNT(*) as read_count FROM notifications WHERE is_read = true;

-- 2. 읽은 알림 목록 확인 (선택사항)
SELECT id, user_id, title, is_read, created_at 
FROM notifications 
WHERE is_read = true 
ORDER BY created_at DESC;

-- 3. 읽은 알림 모두 삭제
DELETE FROM notifications WHERE is_read = true;

-- 4. 삭제 후 남은 알림 확인
SELECT COUNT(*) as remaining_count FROM notifications;






