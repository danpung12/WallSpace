-- 알림 시스템 구축
-- 예약 생성/수락/거절 시 자동으로 알림 생성

-- ============================================
-- 1. 예약 생성 시 매니저에게 알림
-- ============================================

CREATE OR REPLACE FUNCTION notify_manager_on_reservation()
RETURNS TRIGGER AS $$
DECLARE
  manager_id UUID;
  artist_name TEXT;
  location_name TEXT;
BEGIN
  -- 해당 공간의 매니저 ID 가져오기
  SELECT l.manager_id, l.name
  INTO manager_id, location_name
  FROM locations l
  INNER JOIN spaces s ON s.location_id = l.id
  WHERE s.id = NEW.space_id;
  
  -- 예약한 작가 이름 가져오기
  SELECT COALESCE(nickname, name, '작가')
  INTO artist_name
  FROM profiles
  WHERE id = NEW.artist_id;
  
  -- 매니저에게 알림 생성
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

DROP TRIGGER IF EXISTS trigger_notify_manager_on_reservation ON reservations;
CREATE TRIGGER trigger_notify_manager_on_reservation
  AFTER INSERT ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION notify_manager_on_reservation();

-- ============================================
-- 2. 예약 상태 변경 시 작가에게 알림
-- ============================================

CREATE OR REPLACE FUNCTION notify_artist_on_status_change()
RETURNS TRIGGER AS $$
DECLARE
  location_name TEXT;
  notification_title TEXT;
  notification_message TEXT;
BEGIN
  -- 상태가 변경되지 않았으면 무시
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;
  
  -- 장소 이름 가져오기
  SELECT name
  INTO location_name
  FROM locations
  WHERE id = NEW.location_id;
  
  -- 상태별 알림 메시지 설정
  IF NEW.status = 'confirmed' THEN
    notification_title := '예약이 승인되었습니다';
    notification_message := location_name || '의 예약이 승인되었습니다!';
  ELSIF NEW.status = 'cancelled' THEN
    notification_title := '예약이 거절되었습니다';
    notification_message := location_name || '의 예약이 거절되었습니다.';
  ELSE
    -- 다른 상태 변경은 알림 생성 안 함
    RETURN NEW;
  END IF;
  
  -- 작가에게 알림 생성
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    related_id,
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
    false,
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_notify_artist_on_status_change ON reservations;
CREATE TRIGGER trigger_notify_artist_on_status_change
  AFTER UPDATE ON reservations
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION notify_artist_on_status_change();

-- ============================================
-- 3. notifications 테이블에 related_id 컬럼 추가 (있다면)
-- ============================================

ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS related_id UUID;

COMMENT ON COLUMN notifications.related_id IS 'Related reservation ID or other entity ID';

-- ============================================
-- 4. 인덱스 추가
-- ============================================

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_related_id ON notifications(related_id);

-- 완료
SELECT '✅ Notification system created successfully!' as status;








