# 소셜 로그인 설정 가이드

소셜 로그인이 코드에 연결되었습니다! 이제 Supabase 대시보드에서 각 OAuth 제공자를 설정해야 합니다.

## 🚀 설정 단계

### 1. Supabase 대시보드 접속
1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 프로젝트 선택
3. **Authentication** → **Providers** 메뉴로 이동

---

## 구글 (Google) 설정

### Google Cloud Console 설정
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 생성 또는 선택
3. **APIs & Services** → **Credentials** 이동
4. **Create Credentials** → **OAuth 2.0 Client ID** 선택
5. Application type: **Web application**
6. **Authorized redirect URIs** 추가:
   ```
   https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback
   ```
7. Client ID와 Client Secret 복사

### Supabase 설정
1. Supabase Dashboard → Authentication → Providers
2. **Google** 활성화
3. Client ID와 Client Secret 입력
4. **Save** 클릭

---

## 카카오 (Kakao) 설정

### Kakao Developers 설정
1. [Kakao Developers](https://developers.kakao.com/) 접속
2. 애플리케이션 추가 (또는 기존 앱 선택)
3. **앱 설정** → **플랫폼** → **Web 플랫폼 등록**
   - 사이트 도메인: `http://localhost:3000` (개발)
   - 사이트 도메인: `https://yourdomain.com` (운영)
4. **제품 설정** → **카카오 로그인** 활성화
5. **Redirect URI 등록**:
   ```
   https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback
   ```
6. **동의 항목 설정**: 
   - 닉네임 (필수)
   - 프로필 사진 (선택)
   - 카카오계정(이메일) (필수)
7. **앱 키** → **REST API 키** 복사
8. **보안** → **Client Secret** 활성화 및 코드 복사

### Supabase 설정
1. Supabase Dashboard → Authentication → Providers
2. **Kakao** 활성화
3. Client ID에 **REST API 키** 입력
4. Client Secret 입력
5. **Save** 클릭

---

## 네이버 (Naver) 설정

### Naver Developers 설정
1. [Naver Developers](https://developers.naver.com/) 접속
2. **Application** → **애플리케이션 등록**
3. 애플리케이션 정보 입력:
   - 애플리케이션 이름
   - 사용 API: **네이버 로그인**
4. **서비스 URL**: `http://localhost:3000` (개발)
5. **Callback URL**:
   ```
   https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback
   ```
6. **제공 정보 선택**: 
   - 회원이름
   - 이메일 주소
   - 프로필 사진 (선택)
7. Client ID와 Client Secret 복사

### Supabase 설정
⚠️ **주의**: Supabase는 기본적으로 Naver OAuth를 직접 지원하지 않습니다.

**해결 방법 옵션:**

#### 옵션 1: Custom OAuth Provider (권장)
Supabase에서 Custom OAuth Provider 기능을 사용하여 네이버를 추가할 수 있습니다.
자세한 내용은 [Supabase Custom OAuth 문서](https://supabase.com/docs/guides/auth/social-login/auth-custom-oauth) 참조

#### 옵션 2: 백엔드 API 라우트 생성
네이버 OAuth를 처리하는 별도의 API 라우트를 생성하고, 토큰을 받은 후 Supabase 세션을 생성합니다.

#### 옵션 3: 네이버 로그인 제거
가장 간단한 방법으로, 네이버 로그인 버튼을 제거하고 구글과 카카오만 사용합니다.

---

## 📝 코드에서 설정된 내용

```typescript
// 소셜 로그인 핸들러
const handleSocialLogin = async (provider: 'google' | 'kakao' | 'naver') => {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider,
    options: {
      redirectTo: `${window.location.origin}/`,
    },
  });
};
```

- ✅ 로그인 성공 후 자동으로 `/` (홈)으로 리다이렉트
- ✅ 에러 처리 구현
- ✅ 로딩 상태 동안 버튼 비활성화

---

## 🧪 테스트

1. 로컬에서 테스트:
   ```bash
   npm run dev
   ```
2. `/login` 페이지 접속
3. 각 소셜 로그인 버튼 클릭
4. OAuth 플로우 확인
5. 홈으로 리다이렉트 확인

---

## ⚠️ 네이버 로그인 제거 (옵션)

네이버 설정이 복잡하다면, 버튼만 제거하고 구글과 카카오만 사용할 수 있습니다:

`src/app/components/LoginClient.tsx`에서 네이버 버튼 부분 삭제:
```typescript
// 이 부분 삭제
<div className="social-icon-wrapper">
  <button 
    className="social-icon-btn" 
    style={{ backgroundColor: '#03c75a' }} 
    aria-label="네이버로 로그인"
    onClick={() => handleSocialLogin('naver')}
    disabled={isLoading}
    type="button"
  >
    <svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M15.9 12.825L9.15 3H3v18h6.15V11.175L15.9 21H21V3h-5.1v9.825z" /></svg>
  </button>
</div>
```

---

## 🔗 참고 링크

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Supabase Social Login](https://supabase.com/docs/guides/auth/social-login)
- [Google OAuth 설정](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Kakao OAuth 설정](https://supabase.com/docs/guides/auth/social-login/auth-kakao)







