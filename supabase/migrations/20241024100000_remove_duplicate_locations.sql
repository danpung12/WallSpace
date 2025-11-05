-- 중복된 장소 데이터 삭제
-- 각 장소 이름별로 가장 오래된 것만 남기고 나머지 삭제

-- 1. 먼저 삭제할 ID들을 확인
DO $$
DECLARE
    location_names TEXT[] := ARRAY[
        '아트 스페이스 광교',
        '서울시립미술관',
        '아라리오뮤지엄',
        'D뮤지엄',
        '국립현대미술관 서울',
        '페이지스 바이 페이지'
    ];
    location_name TEXT;
BEGIN
    -- 각 장소 이름에 대해
    FOREACH location_name IN ARRAY location_names
    LOOP
        -- 가장 오래된 것만 남기고 나머지 삭제
        DELETE FROM locations
        WHERE name = location_name
        AND id NOT IN (
            SELECT id
            FROM locations
            WHERE name = location_name
            ORDER BY created_at ASC
            LIMIT 1
        );
    END LOOP;
END $$;

-- 2. 결과 확인
SELECT name, COUNT(*) as count
FROM locations
GROUP BY name
ORDER BY name;


















