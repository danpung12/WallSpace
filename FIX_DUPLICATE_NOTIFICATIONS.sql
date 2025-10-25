-- ============================================
-- 중복 알림 문제 해결
-- ============================================

-- 1. 기존 중복 알림 제거 (같은 related_id, type, user_id를 가진 알림 중 가장 최근 것만 남김)
DELETE FROM notifications
WHERE id IN (
  SELECT n1.id
  FROM notifications n1
  INNER JOIN notifications n2 ON 
    n1.user_id = n2.user_id 
    AND n1.type = n2.type 
    AND n1.related_id = n2.related_id
    AND n1.created_at < n2.created_at
  WHERE n1.type IN ('reservation_confirmed', 'reservation_cancelled')
);

-- 2. 알림 트리거 함수 생성 (예약 생성 시)
CREATE OR REPLACE FUNCTION notify_manager_on_reservation()
RETURNS TRIGGER AS $$
DECLARE
  manager_id UUID;
  artist_name TEXT;
  location_name TEXT;
BEGIN
  SELECT l.manager_id, l.name
  INTO manager_id, location_name
  FROM locations l
  INNER JOIN spaces s ON s.location_id = l.id
  WHERE s.id = NEW.space_id;
  
  SELECT COALESCE(nickname, name, '작가')
  INTO artist_name
  FROM profiles
  WHERE id = NEW.artist_id;
  
  IF manager_id IS NOT NULL THEN
    INSERT INTO notifications (
      user_id,
      type,
      title,
      message,
      related_id,
      is_read,
      created_at
    ) VALUES (
      manager_id,
      'reservation_request',
      '새로운 예약 요청',
      artist_name || '님이 ' || location_name || '에 예약을 요청했습니다.',
      NEW.id,
      false,
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. 예약 생성 트리거
DROP TRIGGER IF EXISTS trigger_notify_manager_on_reservation ON reservations;
CREATE TRIGGER trigger_notify_manager_on_reservation
  AFTER INSERT ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION notify_manager_on_reservation();

-- 4. 알림 트리거 함수 생성 (예약 상태 변경 시 - 거절 사유 포함)
CREATE OR REPLACE FUNCTION notify_artist_on_status_change()
RETURNS TRIGGER AS $$
DECLARE
  location_name TEXT;
  notification_title TEXT;
  notification_message TEXT;
BEGIN
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;
  
  SELECT name
  INTO location_name
  FROM locations
  WHERE id = NEW.location_id;
  
  IF NEW.status = 'confirmed' THEN
    notification_title := '예약이 승인되었습니다';
    notification_message := location_name || '의 예약이 승인되었습니다!';
  ELSIF NEW.status = 'cancelled' THEN
    notification_title := '예약이 거절되었습니다';
    notification_message := location_name || '의 예약이 거절되었습니다.';
  ELSE
    RETURN NEW;
  END IF;
  
  -- 거절 사유 포함한 알림 생성
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    related_id,
    rejection_reason,
    is_read,
    created_at
  ) VALUES (
    NEW.artist_id,
    CASE 
      WHEN NEW.status = 'confirmed' THEN 'reservation_confirmed'
      WHEN NEW.status = 'cancelled' THEN 'reservation_cancelled'
    END,
    notification_title,
    notification_message,
    NEW.id,
    NEW.rejection_reason,
    false,
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. 예약 상태 변경 트리거
DROP TRIGGER IF EXISTS trigger_notify_artist_on_status_change ON reservations;
CREATE TRIGGER trigger_notify_artist_on_status_change
  AFTER UPDATE ON reservations
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION notify_artist_on_status_change();

-- 6. 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_related_id ON notifications(related_id);

-- 완료
SELECT '✅ 중복 알림 문제가 해결되었습니다!' as status;

