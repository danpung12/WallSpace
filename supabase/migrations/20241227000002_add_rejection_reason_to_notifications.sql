-- notifications 테이블에 거절 사유 컬럼 추가
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS rejection_reason TEXT;




