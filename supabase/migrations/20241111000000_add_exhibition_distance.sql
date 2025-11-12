-- 전시 알림 거리 설정 컬럼 추가 (기본값 5km)
ALTER TABLE notification_settings 
ADD COLUMN IF NOT EXISTS exhibition_distance INTEGER DEFAULT 5;

-- 메시지 컬럼 제거 (사용하지 않음)
ALTER TABLE notification_settings 
DROP COLUMN IF EXISTS messages;

-- user_id에 UNIQUE 제약 조건 추가 (이미 있으면 무시)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'notification_settings_user_id_key' 
    AND conrelid = 'notification_settings'::regclass
  ) THEN
    ALTER TABLE notification_settings ADD CONSTRAINT notification_settings_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- 같은 방식으로 user_settings 테이블에도 UNIQUE 제약 조건 추가
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_settings_user_id_key' 
    AND conrelid = 'user_settings'::regclass
  ) THEN
    ALTER TABLE user_settings ADD CONSTRAINT user_settings_user_id_key UNIQUE (user_id);
  END IF;
END $$;

COMMENT ON COLUMN notification_settings.exhibition_distance IS '전시 알림을 받을 거리 (km 단위)';
COMMENT ON COLUMN notification_settings.comments IS '작품 댓글 알림 수신 여부';
COMMENT ON COLUMN notification_settings.exhibitions IS '근처 전시 알림 수신 여부';

