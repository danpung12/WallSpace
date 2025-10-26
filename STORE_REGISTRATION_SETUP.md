# 가게 등록 기능 설정 가이드

가게 등록 기능을 사용하기 위해 Supabase 대시보드에서 다음 SQL을 **순서대로** 실행해주세요.

---

## 1단계: `manager_id` 컬럼 추가

```sql
-- Add manager_id to locations table
ALTER TABLE locations
ADD COLUMN IF NOT EXISTS manager_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_locations_manager ON locations(manager_id);
```

---

## 2단계: `locations` Storage Bucket 생성

```sql
-- Create storage bucket for location images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'locations',
  'locations',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS for locations bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view location images (public bucket)
CREATE POLICY "Anyone can view location images"
ON storage.objects FOR SELECT
USING (bucket_id = 'locations');

-- Policy: Authenticated managers can upload location images
CREATE POLICY "Managers can upload location images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'locations' 
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.user_type = 'manager'
  )
);

-- Policy: Managers can update their own location images
CREATE POLICY "Managers can update their location images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'locations' 
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.user_type = 'manager'
  )
);

-- Policy: Managers can delete their own location images
CREATE POLICY "Managers can delete their location images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'locations' 
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.user_type = 'manager'
  )
);
```

---

## 3단계 (선택사항): 테스트용 가게 할당

기존 mock 데이터 가게들을 본인 계정에 할당하려면:

```sql
-- 1. 본인의 사장님 ID 확인
SELECT id, email, display_name FROM profiles WHERE user_type = 'manager';

-- 2. 가게 할당 (YOUR_MANAGER_ID를 위에서 확인한 ID로 교체)
UPDATE locations 
SET manager_id = 'YOUR_MANAGER_ID' 
WHERE name IN ('아트 스페이스 광교', '서울시립미술관');
```

---

## 실행 후 확인 사항

1. ✅ `locations` 테이블에 `manager_id` 컬럼이 추가되었는지 확인
2. ✅ Supabase Storage에 `locations` 버킷이 생성되었는지 확인
3. ✅ 브라우저 새로고침 후 가게 등록 테스트

---

## 테스트 방법

1. 사장님 계정으로 로그인
2. 대시보드 → **가게 추가** 클릭
3. 가게 정보 입력:
   - 가게 이름
   - **주소 검색** (중요!)
   - 카테고리 선택
   - 이미지 업로드 (선택)
   - 공간 추가 (선택)
4. **제출하고 등록 완료하기** 클릭
5. 대시보드에서 "내 가게"에 표시되는지 확인

---

## 문제 해결

### "Bucket not found" 오류
→ 2단계 SQL을 실행하지 않았습니다. 다시 실행해주세요.

### "Could not find the 'manager_id' column" 오류
→ 1단계 SQL을 실행하지 않았습니다. 다시 실행해주세요.

### "주소에서 좌표를 가져올 수 없습니다" 오류
→ 주소 검색 버튼을 사용하여 정확한 주소를 선택했는지 확인하세요.

### 브라우저를 새로고침해도 오류가 계속 발생하는 경우
→ 개발 서버를 재시작해주세요 (터미널에서 Ctrl+C 후 `npm run dev`)






