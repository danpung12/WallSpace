-- 예약 시스템을 위한 DB 함수 추가

-- ============================================
-- 1. reserved_slots 증가 함수
-- ============================================

CREATE OR REPLACE FUNCTION increment_reserved_slots(location_id_param UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE locations
  SET reserved_slots = COALESCE(reserved_slots, 0) + 1,
      updated_at = NOW()
  WHERE id = location_id_param;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 2. reserved_slots 감소 함수
-- ============================================

CREATE OR REPLACE FUNCTION decrement_reserved_slots(location_id_param UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE locations
  SET reserved_slots = GREATEST(COALESCE(reserved_slots, 1) - 1, 0),
      updated_at = NOW()
  WHERE id = location_id_param;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 3. 예약 가능 여부 확인 함수
-- ============================================

CREATE OR REPLACE FUNCTION check_space_availability(
  space_id_param UUID,
  start_date_param DATE,
  end_date_param DATE
)
RETURNS BOOLEAN AS $$
DECLARE
  overlapping_count INTEGER;
BEGIN
  -- 날짜가 겹치는 예약이 있는지 확인
  SELECT COUNT(*)
  INTO overlapping_count
  FROM reservations
  WHERE space_id = space_id_param
    AND status NOT IN ('cancelled')
    AND (
      -- 새 예약의 시작일이 기존 예약 기간 내에 있거나
      (start_date_param >= start_date AND start_date_param <= end_date)
      OR
      -- 새 예약의 종료일이 기존 예약 기간 내에 있거나
      (end_date_param >= start_date AND end_date_param <= end_date)
      OR
      -- 새 예약이 기존 예약을 완전히 포함하는 경우
      (start_date_param <= start_date AND end_date_param >= end_date)
    );
  
  -- 겹치는 예약이 없으면 TRUE 반환
  RETURN overlapping_count = 0;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 4. 예약 상태 자동 업데이트 트리거
-- ============================================

-- 예약 종료일이 지나면 자동으로 'completed'로 변경
CREATE OR REPLACE FUNCTION auto_complete_reservations()
RETURNS TRIGGER AS $$
BEGIN
  -- 매일 자정에 실행되어 종료된 예약을 완료 처리
  UPDATE reservations
  SET status = 'completed',
      updated_at = NOW()
  WHERE status = 'confirmed'
    AND end_date < CURRENT_DATE;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. 권한 확인
-- ============================================

COMMENT ON FUNCTION increment_reserved_slots IS 
'예약 생성 시 location의 reserved_slots를 1 증가시킵니다';

COMMENT ON FUNCTION decrement_reserved_slots IS 
'예약 취소 시 location의 reserved_slots를 1 감소시킵니다';

COMMENT ON FUNCTION check_space_availability IS 
'지정된 날짜에 공간 예약이 가능한지 확인합니다';

-- 함수 실행 권한 부여
GRANT EXECUTE ON FUNCTION increment_reserved_slots TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_reserved_slots TO authenticated;
GRANT EXECUTE ON FUNCTION check_space_availability TO authenticated;

-- 완료
SELECT '✅ Reservation functions created successfully!' as status;













