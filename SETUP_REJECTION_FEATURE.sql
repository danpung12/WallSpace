-- ============================================
-- 예약 거절 기능 설정
-- ============================================

-- 1. reservations 테이블에 거절 사유 컬럼 추가
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- 인덱스 추가 (옵션)
CREATE INDEX IF NOT EXISTS idx_reservations_rejection_reason 
ON reservations(rejection_reason) 
WHERE rejection_reason IS NOT NULL;

-- 2. notifications 테이블에 거절 사유 컬럼 추가
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- ============================================
-- 확인용 쿼리
-- ============================================

-- 테이블 컬럼 확인
SELECT 
    'reservations 테이블 컬럼 확인' as message,
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_name = 'reservations' 
AND column_name = 'rejection_reason';

SELECT 
    'notifications 테이블 컬럼 확인' as message,
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_name = 'notifications' 
AND column_name = 'rejection_reason';


