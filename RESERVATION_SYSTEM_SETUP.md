# 🎨 예약 시스템 데이터베이스 연동 완료

## ✅ 구현 완료된 기능

### 1. **API 엔드포인트**
- ✅ `/api/reservations` - 예약 생성, 조회, 업데이트
- ✅ `/api/artworks` - 작품 목록 조회
- ✅ `/api/profile/user-type` - 사용자 타입 변경

### 2. **예약 프로세스**
```
공간 선택 (LocationDetailPage)
    ↓
날짜 선택 (DateBooking)
    ↓
작품 선택 + 예약 확인 (BookingConfirmation)
    ↓
예약 생성 (reservations 테이블)
    ↓
예약 완료 (BookingSuccess)
```

### 3. **데이터베이스 함수**
- ✅ `increment_reserved_slots()` - 예약 시 slot 증가
- ✅ `decrement_reserved_slots()` - 취소 시 slot 감소
- ✅ `check_space_availability()` - 예약 가능 여부 확인
- ✅ `auto_complete_reservations()` - 자동 완료 처리

---

## 🚀 설치 및 설정

### 1️⃣ 데이터베이스 마이그레이션 실행

**Supabase Dashboard > SQL Editor**에서 다음 파일들을 **순서대로** 실행하세요:

#### A. User Type 제약 조건 수정
```sql
-- FIX_USER_TYPE_CONSTRAINT.sql
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_user_type_check;

ALTER TABLE profiles 
ADD CONSTRAINT profiles_user_type_check 
CHECK (user_type IN ('artist', 'manager', 'guest') OR user_type IS NULL);
```

#### B. Storage Bucket 생성
```sql
-- CREATE_LOCATIONS_BUCKET.sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'locations',
  'locations',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

-- RLS 정책
CREATE POLICY "Public can view location images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'locations');

CREATE POLICY "Authenticated users can upload location images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'locations' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update location images" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'locations' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete location images" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'locations' AND auth.role() = 'authenticated');
```

#### C. RLS 정책 수정
```sql
-- FIX_RLS_QUICK.sql의 내용 실행
-- (앞서 생성한 파일 참조)
```

#### D. 예약 시스템 함수 생성
```sql
-- 20241024230000_add_reservation_functions.sql
-- (파일 내용 전체 실행)
```

### 2️⃣ 개발 서버 재시작

```bash
npm run dev
```

---

## 📖 사용 방법

### **작가 모드**

1. **상단바에서 "작가" 클릭**
   - user_type이 자동으로 `artist`로 변경됨

2. **작품 등록** (`/dashboard/add`)
   - 전시할 작품 먼저 등록

3. **지도에서 공간 찾기** (`/map`)
   - 원하는 장소 선택
   - 공간 선택
   - "예약하기" 버튼 클릭

4. **예약 프로세스**
   - 날짜 선택
   - 작품 선택 (등록한 작품 목록에서)
   - 예약 내용 확인
   - "결제하기" 버튼 → 예약 생성!

5. **예약 확인**
   - `reservations` 테이블에 저장됨
   - `status: 'pending'` (승인 대기)
   - 공간 `is_reserved: true`로 변경

### **사장님 모드**

1. **상단바에서 "사장님" 클릭**
   - user_type이 자동으로 `manager`로 변경됨

2. **가게 등록** (`/dashboard/add-store`)
   - 가게 정보 입력
   - 이미지 업로드
   - 공간 등록 (크기, 가격)

3. **예약 관리**
   - 예약 요청 확인
   - 승인/거절 처리

---

## 🗄️ 데이터베이스 구조

### **reservations 테이블**
```sql
CREATE TABLE reservations (
  id UUID PRIMARY KEY,
  artist_id UUID REFERENCES profiles(id),
  location_id UUID REFERENCES locations(id),
  space_id UUID REFERENCES spaces(id),
  artwork_id UUID REFERENCES artworks(id),
  start_date DATE,
  end_date DATE,
  status reservation_status, -- 'pending', 'confirmed', 'completed', 'cancelled'
  total_price INTEGER,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### **API 엔드포인트**

#### 예약 생성
```typescript
POST /api/reservations
Body: {
  location_id: string,
  space_id: string,
  artwork_id: string,
  start_date: "2025-01-15",
  end_date: "2025-01-20"
}
```

#### 예약 조회
```typescript
GET /api/reservations
Query: ?status=pending&location_id=xxx
```

#### 예약 상태 업데이트
```typescript
PATCH /api/reservations
Body: {
  reservation_id: string,
  status: "confirmed" | "cancelled" | "completed"
}
```

#### 사용자 작품 조회
```typescript
GET /api/artworks?mine=true
```

---

## 🔍 테스트 방법

### 1. **작품 등록 테스트**
```sql
-- 작품이 있는지 확인
SELECT id, title, artist_id, image_url
FROM artworks
WHERE artist_id = '현재_사용자_ID';
```

### 2. **예약 생성 테스트**
브라우저에서:
1. `/map` 접속
2. 공간 선택
3. 날짜 선택
4. 작품 선택
5. 예약 확인 → 예약하기 버튼 클릭

콘솔 확인:
```
Creating reservation: {location_id, space_id, artwork_id, ...}
✅ Reservation created: {id, status: 'pending', ...}
```

### 3. **데이터베이스 확인**
```sql
-- 예약 조회
SELECT 
  r.*,
  l.name as location_name,
  s.name as space_name,
  a.title as artwork_title
FROM reservations r
JOIN locations l ON r.location_id = l.id
JOIN spaces s ON r.space_id = s.id
JOIN artworks a ON r.artwork_id = a.id
ORDER BY r.created_at DESC;
```

### 4. **공간 상태 확인**
```sql
-- 예약된 공간 확인
SELECT id, name, is_reserved
FROM spaces
WHERE is_reserved = true;
```

---

## 🐛 문제 해결

### 문제: "Bucket not found"
**해결**: `CREATE_LOCATIONS_BUCKET.sql` 실행

### 문제: "User type check constraint violation"
**해결**: `FIX_USER_TYPE_CONSTRAINT.sql` 실행

### 문제: "등록된 작품이 없습니다"
**해결**: 
1. 상단바에서 "작가" 클릭
2. `/dashboard/add`에서 작품 먼저 등록

### 문제: "예약이 생성되지 않음"
**확인 사항**:
1. 브라우저 콘솔에서 에러 확인
2. user_type이 'artist'인지 확인
3. 작품이 선택되었는지 확인
4. Network 탭에서 API 응답 확인

```sql
-- 사용자 타입 확인
SELECT id, email, user_type FROM profiles WHERE email = '사용자_이메일';

-- 예약 함수 권한 확인
SELECT * FROM pg_proc WHERE proname LIKE '%reserved_slots%';
```

---

## 📊 주요 변경 사항

### 새로 생성된 파일
- ✅ `src/app/api/reservations/route.ts` - 예약 API
- ✅ `src/app/api/artworks/route.ts` - 작품 API
- ✅ `src/app/api/profile/user-type/route.ts` - 사용자 타입 변경 API
- ✅ `supabase/migrations/20241024230000_add_reservation_functions.sql`

### 수정된 파일
- ✅ `src/app/components/Header.tsx` - 작가/사장님 버튼 DB 연동
- ✅ `src/app/confirm-booking/components/BookingConfirmation.tsx` - 예약 생성 로직

### SQL 파일
- ✅ `FIX_USER_TYPE_CONSTRAINT.sql`
- ✅ `CREATE_LOCATIONS_BUCKET.sql`
- ✅ `FIX_RLS_QUICK.sql`
- ✅ `FIX_STORAGE_ONLY.sql`
- ✅ `FIX_AUTO_PROFILE_TRIGGER.sql`

---

## 🎉 완료!

이제 `/map`에서 실제 데이터베이스와 연동된 예약 시스템을 사용할 수 있습니다!

**테스트 순서**:
1. SQL 파일들 실행 (A → B → C → D)
2. 개발 서버 재시작
3. 상단바에서 "작가" 클릭 (user_type → artist)
4. `/dashboard/add`에서 작품 등록
5. `/map`에서 예약 테스트
6. 예약 생성 확인!

**문제가 발생하면 알려주세요!** 🚀













