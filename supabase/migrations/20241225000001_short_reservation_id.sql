-- 5자리 예약 ID 생성 함수
CREATE OR REPLACE FUNCTION generate_short_reservation_id()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ'; -- 혼동하기 쉬운 I, O 제외
  result TEXT := '';
  i INTEGER;
  random_index INTEGER;
BEGIN
  FOR i IN 1..5 LOOP
    random_index := floor(random() * length(chars) + 1)::INTEGER;
    result := result || substr(chars, random_index, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- reservations 테이블에 short_id 컬럼 추가
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS short_id TEXT UNIQUE;

-- 기존 예약에 대해 short_id 생성
DO $$
DECLARE
  reservation_record RECORD;
  new_short_id TEXT;
  is_unique BOOLEAN;
BEGIN
  FOR reservation_record IN SELECT id FROM reservations WHERE short_id IS NULL LOOP
    LOOP
      new_short_id := generate_short_reservation_id();
      
      -- 중복 확인
      SELECT NOT EXISTS (
        SELECT 1 FROM reservations WHERE short_id = new_short_id
      ) INTO is_unique;
      
      EXIT WHEN is_unique;
    END LOOP;
    
    UPDATE reservations SET short_id = new_short_id WHERE id = reservation_record.id;
  END LOOP;
END $$;

-- 새 예약 생성 시 자동으로 short_id 생성하는 트리거
CREATE OR REPLACE FUNCTION set_reservation_short_id()
RETURNS TRIGGER AS $$
DECLARE
  new_short_id TEXT;
  is_unique BOOLEAN;
BEGIN
  IF NEW.short_id IS NULL THEN
    LOOP
      new_short_id := generate_short_reservation_id();
      
      -- 중복 확인
      SELECT NOT EXISTS (
        SELECT 1 FROM reservations WHERE short_id = new_short_id
      ) INTO is_unique;
      
      EXIT WHEN is_unique;
    END LOOP;
    
    NEW.short_id := new_short_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
DROP TRIGGER IF EXISTS trigger_set_reservation_short_id ON reservations;
CREATE TRIGGER trigger_set_reservation_short_id
  BEFORE INSERT ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION set_reservation_short_id();

-- short_id에 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_reservations_short_id ON reservations(short_id);


