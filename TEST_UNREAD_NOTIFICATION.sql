-- 테스트를 위해 최근 거절 알림을 읽지 않음으로 변경

-- 1. 가장 최근 거절 알림 하나를 읽지 않음으로 변경
UPDATE notifications
SET is_read = false
WHERE id = (
  SELECT id
  FROM notifications
  WHERE type = 'reservation_cancelled'
    AND rejection_reason IS NOT NULL
    AND rejection_reason != 'NULL'
  ORDER BY created_at DESC
  LIMIT 1
);

-- 2. 결과 확인
SELECT 
  id,
  user_id,
  type,
  title,
  message,
  rejection_reason,
  is_read,
  created_at
FROM notifications
WHERE type = 'reservation_cancelled'
  AND is_read = false
ORDER BY created_at DESC;

