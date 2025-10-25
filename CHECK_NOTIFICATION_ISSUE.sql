-- 알림 시스템 진단 쿼리

-- 1. rejection_reason 컬럼 확인
SELECT 
  table_name, 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('notifications', 'reservations') 
  AND column_name = 'rejection_reason'
ORDER BY table_name;

-- 2. 실제 알림 데이터 확인 (거절된 예약 관련)
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
ORDER BY created_at DESC
LIMIT 10;

-- 3. 트리거 존재 확인
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name IN ('trigger_notify_manager_on_reservation', 'trigger_notify_artist_on_status_change');

-- 4. 거절된 예약 데이터 확인
SELECT 
  id,
  artist_id,
  location_id,
  status,
  rejection_reason,
  created_at,
  updated_at
FROM reservations
WHERE status = 'cancelled'
ORDER BY updated_at DESC
LIMIT 5;

