# 환경 변수 설정 가이드

## 필요한 환경 변수

프로젝트를 실행하기 위해 다음 환경 변수들을 설정해야 합니다:

### 1. Supabase 설정

```bash
# Supabase 프로젝트 URL
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url

# Supabase 익명 키
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Supabase 서비스 역할 키 (서버 사이드에서 사용)
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 2. 카카오맵 API 키

```bash
# 카카오맵 JavaScript API 키
NEXT_PUBLIC_KAKAO_MAP_KEY=your_kakao_map_api_key
```

### 3. Google OAuth (선택사항)

```bash
# Google OAuth 클라이언트 ID
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=your_google_client_id

# Google OAuth 클라이언트 시크릿
SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=your_google_client_secret
```

### 4. 개발 환경 설정

```bash
# Node.js 환경
NODE_ENV=development
```

## 설정 방법

1. 프로젝트 루트에 `.env.local` 파일을 생성합니다.

2. 위의 환경 변수들을 복사하여 `.env.local` 파일에 붙여넣습니다.

3. 각 값들을 실제 값으로 교체합니다:
   - Supabase 프로젝트 URL과 키는 [Supabase Dashboard](https://supabase.com/dashboard)에서 확인할 수 있습니다.
   - 카카오맵 API 키는 [카카오 개발자 콘솔](https://developers.kakao.com/)에서 발급받을 수 있습니다.
   - Google OAuth 키는 [Google Cloud Console](https://console.cloud.google.com/)에서 설정할 수 있습니다.

## 보안 주의사항

- `.env.local` 파일은 절대 Git에 커밋하지 마세요.
- 프로덕션 환경에서는 환경 변수를 안전하게 관리하세요.
- 서비스 역할 키는 서버 사이드에서만 사용하고 클라이언트에 노출하지 마세요.
