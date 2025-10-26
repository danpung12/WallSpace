-- 중복 장소 확인
SELECT name, COUNT(*) as count
FROM locations
GROUP BY name
HAVING COUNT(*) > 1;

-- 모든 장소 확인
SELECT id, name, created_at
FROM locations
ORDER BY name, created_at;

-- 총 장소 개수
SELECT COUNT(*) as total_locations FROM locations;






