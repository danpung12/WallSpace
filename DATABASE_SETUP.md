# WallSpace 데이터베이스 설정 가이드

## 📋 개요

WallSpace 프로젝트를 위한 Supabase 데이터베이스 스키마가 완성되었습니다. 이 가이드는 데이터베이스를 설정하고 사용하는 방법을 설명합니다.

## 🗄️ 데이터베이스 구조

### 핵심 테이블들

#### 1. 사용자 관련
- **profiles**: 사용자 프로필 정보
- **notification_settings**: 알림 설정
- **user_settings**: 사용자 설정 (다크모드 등)

#### 2. 공간 관련
- **categories**: 공간 카테고리 (갤러리, 카페 등)
- **locations**: 공간 정보
- **location_options**: 공간 옵션 (주차, 24시간 등)
- **location_images**: 공간 이미지
- **location_tags**: 공간 태그 연결
- **location_sns**: 공간 SNS 링크
- **spaces**: 공간 내 세부 공간 (전시실, 라운지 등)

#### 3. 작품 관련
- **artworks**: 작품 정보

#### 4. 예약 관련
- **reservations**: 예약 정보

#### 5. 리뷰 및 알림
- **location_reviews**: 공간 리뷰
- **notifications**: 알림

### 뷰 (Views)
- **location_details**: 공간 상세 정보 (조인된 데이터)
- **reservation_details**: 예약 상세 정보 (조인된 데이터)

## 🚀 설정 방법

### 1. Supabase 프로젝트 생성

1. [Supabase Dashboard](https://supabase.com/dashboard)에 로그인
2. "New Project" 클릭
3. 프로젝트 이름: `wallspace`
4. 데이터베이스 비밀번호 설정
5. 리전 선택 (한국: `ap-northeast-2`)

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 내용을 추가:

```bash
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# 카카오맵 API 키
NEXT_PUBLIC_KAKAO_MAP_KEY=your_kakao_map_api_key

# Google OAuth (선택사항)
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=your_google_client_id
SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=your_google_client_secret
```

### 3. 마이그레이션 실행

#### 로컬 개발 환경
```bash
# Supabase CLI 설치 (아직 설치하지 않은 경우)
npm install -g supabase

# Supabase 프로젝트 초기화
supabase init

# 로컬 Supabase 시작
supabase start

# 마이그레이션 실행
supabase db reset
```

#### 프로덕션 환경
```bash
# 프로덕션 데이터베이스에 마이그레이션 적용
supabase db push --linked
```

### 4. 시드 데이터 삽입

```bash
# 시드 데이터 실행
supabase db seed
```

## 📊 주요 기능별 데이터 흐름

### 1. 사용자 등록 및 인증
```
사용자 회원가입 → auth.users 테이블 → profiles 테이블 자동 생성
```

### 2. 공간 검색 및 필터링
```
locations 테이블 → location_options, location_tags 조인 → 필터링된 결과
```

### 3. 예약 프로세스
```
공간 선택 → 날짜 선택 → 작품 선택 → reservations 테이블에 예약 생성
```

### 4. 작품 관리
```
작가 로그인 → artworks 테이블에서 사용자 작품 조회/수정
```

## 🔒 보안 설정

### Row Level Security (RLS)
모든 테이블에 RLS가 활성화되어 있으며, 다음과 같은 정책이 적용됩니다:

- **profiles**: 사용자는 자신의 프로필만 수정 가능
- **locations**: 모든 사용자가 읽기 가능, 매니저만 수정 가능
- **artworks**: 모든 사용자가 읽기 가능, 작가는 자신의 작품만 관리 가능
- **reservations**: 사용자는 자신의 예약만 조회 가능

### 인증 설정
- Supabase Auth를 통한 사용자 인증
- Google OAuth 지원 (선택사항)
- 이메일/비밀번호 인증

## 📈 성능 최적화

### 인덱스
- 위치 기반 검색: `(lat, lng)` 복합 인덱스
- 예약 조회: `artist_id`, `location_id`, `start_date`, `end_date` 인덱스
- 알림: `user_id`, `is_read` 인덱스

### 쿼리 최적화
- 뷰를 통한 조인 쿼리 최적화
- 페이지네이션을 위한 LIMIT/OFFSET 사용
- 필요한 컬럼만 선택하는 SELECT 쿼리

## 🧪 테스트 데이터

시드 데이터에는 다음이 포함됩니다:
- 6개의 샘플 공간 (갤러리, 카페, 문화회관)
- 각 공간의 이미지, 태그, 옵션 정보
- 공간 내 세부 공간 정보
- 카테고리 및 태그 데이터

## 🔄 데이터베이스 관리

### 백업
```bash
# 데이터베이스 백업
supabase db dump > backup.sql

# 특정 테이블만 백업
supabase db dump --table=locations > locations_backup.sql
```

### 복원
```bash
# 백업에서 복원
supabase db reset --file=backup.sql
```

### 모니터링
- Supabase Dashboard에서 실시간 모니터링
- 쿼리 성능 분석
- 사용자 활동 추적

## 🚨 주의사항

1. **환경 변수 보안**: `.env.local` 파일을 Git에 커밋하지 마세요
2. **RLS 정책**: 프로덕션 배포 전 RLS 정책을 철저히 테스트하세요
3. **데이터 타입**: 모든 데이터 타입이 올바르게 설정되었는지 확인하세요
4. **외래키 제약**: 데이터 삭제 시 관련 데이터도 함께 삭제되는지 확인하세요

## 📞 지원

데이터베이스 관련 문제가 있으면:
1. Supabase Dashboard의 로그 확인
2. SQL 에디터에서 직접 쿼리 실행
3. Supabase 문서 참조: https://supabase.com/docs

---

*이 가이드는 WallSpace 프로젝트의 데이터베이스 설정을 위한 것입니다. 추가 질문이나 문제가 있으면 언제든 문의해주세요.*
