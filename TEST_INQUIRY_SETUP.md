# 문의하기 기능 에러 진단 가이드

## 1. 브라우저에서 에러 상세 정보 확인

1. **F12** 를 눌러 개발자 도구 열기
2. **Network** 탭 선택
3. 문의하기 버튼 다시 클릭
4. `inquiries` 요청 클릭
5. **Response** 탭에서 다음 정보 확인:
   - `error`
   - `details`
   - `hint`
   - `code`

이 정보를 공유해주시면 정확한 원인을 파악할 수 있습니다.

## 2. 가능한 원인들

### A. Docker가 실행되지 않음
```bash
# Docker Desktop 실행 상태 확인
docker ps

# Supabase 로컬 환경 시작
cd c:\Users\USER\Desktop\my-app-temp
npx supabase start
```

### B. 데이터베이스에 테이블이 없음
```bash
# 마이그레이션 적용
cd c:\Users\USER\Desktop\my-app-temp
npx supabase db reset --local
```

### C. 환경 변수 문제
`.env.local` 파일에 다음이 설정되어 있는지 확인:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 3. 빠른 테스트

### 직접 SQL로 테이블 생성 테스트
Supabase Dashboard → SQL Editor에서 실행:

```sql
-- inquiries 테이블 존재 확인
SELECT * FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'inquiries';

-- ENUM 타입 확인
SELECT * FROM pg_type 
WHERE typname IN ('inquiry_type', 'inquiry_status');
```

결과가 없다면 마이그레이션 파일을 수동으로 실행:
`supabase/migrations/20241231000000_create_inquiries_table.sql`

## 4. 임시 해결책 (프로덕션 환경용)

만약 로컬 환경 문제라면, Supabase Dashboard에서 직접 SQL 실행:

1. Supabase Dashboard 접속
2. SQL Editor 선택
3. `supabase/migrations/20241231000000_create_inquiries_table.sql` 내용 복사
4. 실행

---

**다음 정보를 공유해주세요:**
1. Network 탭의 Response 내용
2. Docker 실행 여부 (`docker ps` 결과)
3. `.env.local` 파일의 SUPABASE URL (앞부분만)


