-- notifications 테이블의 거절 알림 확인

SELECT 
  id,
  user_id,
  type,
  title,
  message,
  rejection_reason,
  is_read,
  created_at,
  related_id
FROM notifications
WHERE type = 'reservation_cancelled'
ORDER BY created_at DESC
LIMIT 10;

