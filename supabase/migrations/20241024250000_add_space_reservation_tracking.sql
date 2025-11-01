-- Space 예약 추적 시스템
-- current_reservations를 자동으로 관리하는 함수 및 트리거

-- ============================================
-- 1. Space current_reservations 증가 함수
-- ============================================

CREATE OR REPLACE FUNCTION increment_space_reservations(space_id_param UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE spaces
  SET current_reservations = COALESCE(current_reservations, 0) + 1,
      updated_at = NOW()
  WHERE id = space_id_param;
  
  -- max_artworks를 초과하면 is_reserved를 true로 설정
  UPDATE spaces
  SET is_reserved = true
  WHERE id = space_id_param 
    AND current_reservations >= max_artworks;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 2. Space current_reservations 감소 함수
-- ============================================

CREATE OR REPLACE FUNCTION decrement_space_reservations(space_id_param UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE spaces
  SET current_reservations = GREATEST(COALESCE(current_reservations, 1) - 1, 0),
      is_reserved = false,
      updated_at = NOW()
  WHERE id = space_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 3. 예약 생성 시 트리거
-- ============================================

CREATE OR REPLACE FUNCTION on_reservation_created()
RETURNS TRIGGER AS $$
BEGIN
  -- Space의 current_reservations 증가
  PERFORM increment_space_reservations(NEW.space_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_reservation_created ON reservations;
CREATE TRIGGER trigger_reservation_created
  AFTER INSERT ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION on_reservation_created();

-- ============================================
-- 4. 예약 취소/완료 시 트리거
-- ============================================

CREATE OR REPLACE FUNCTION on_reservation_status_changed()
RETURNS TRIGGER AS $$
BEGIN
  -- 예약이 취소되거나 완료되면 current_reservations 감소
  IF NEW.status IN ('cancelled', 'completed') AND OLD.status NOT IN ('cancelled', 'completed') THEN
    PERFORM decrement_space_reservations(OLD.space_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_reservation_status_changed ON reservations;
CREATE TRIGGER trigger_reservation_status_changed
  AFTER UPDATE ON reservations
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION on_reservation_status_changed();

-- ============================================
-- 5. 권한 부여
-- ============================================

GRANT EXECUTE ON FUNCTION increment_space_reservations TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_space_reservations TO authenticated;

COMMENT ON FUNCTION increment_space_reservations IS 
'예약 생성 시 space의 current_reservations를 1 증가시키고, max_artworks에 도달하면 is_reserved를 true로 설정합니다';

COMMENT ON FUNCTION decrement_space_reservations IS 
'예약 취소/완료 시 space의 current_reservations를 1 감소시키고 is_reserved를 false로 설정합니다';

-- 완료
SELECT '✅ Space reservation tracking functions and triggers created successfully!' as status;













