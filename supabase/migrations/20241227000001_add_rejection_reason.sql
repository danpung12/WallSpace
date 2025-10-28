-- reservations 테이블에 거절 사유 컬럼 추가
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- 인덱스 추가 (옵션)
CREATE INDEX IF NOT EXISTS idx_reservations_rejection_reason ON reservations(rejection_reason) WHERE rejection_reason IS NOT NULL;





