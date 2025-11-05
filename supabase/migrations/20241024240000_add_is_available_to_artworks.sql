-- artworks 테이블에 is_available 컬럼 추가 (선택사항)
-- 이 컬럼은 작품이 예약 가능한지 여부를 나타냅니다

-- 컬럼 추가
ALTER TABLE artworks
ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true;

-- 기존 데이터는 모두 available로 설정
UPDATE artworks
SET is_available = true
WHERE is_available IS NULL;

-- 인덱스 추가 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_artworks_available 
ON artworks(is_available) 
WHERE is_available = true;

-- 확인
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'artworks' 
  AND column_name = 'is_available';

SELECT '✅ is_available column added to artworks table!' as status;

















