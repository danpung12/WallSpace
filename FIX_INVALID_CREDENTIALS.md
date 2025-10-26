# "Invalid login credentials" 오류 해결 가이드

## ❌ 오류 메시지
```json
{
  "code": "invalid_credentials",
  "message": "Invalid login credentials"
}
```

---

## 🔍 원인

### 1. 이메일 인증 미완료 (가장 흔한 원인)
회원가입 후 이메일 인증을 하지 않았거나, Supabase에서 이메일 확인 설정이 켜져 있는 경우

### 2. 잘못된 로그인 정보
- 이메일 오타
- 비밀번호 오류
- 계정이 존재하지 않음

---

## ✅ 해결 방법

### 방법 1: Supabase에서 이메일 확인 비활성화 (권장)

#### 1단계: Email Provider 활성화 확인
1. **Supabase Dashboard** 접속
2. **Authentication** → **Providers** 클릭
3. **Email** 섹션 찾기
4. **Email** 토글이 **ON** 상태인지 확인 ✅

#### 2단계: 이메일 확인 비활성화
**Email** 섹션 하단에서:
- **"Confirm email"**: **OFF로 변경** ❌
- 또는 **"Enable email confirmations"**: **체크 해제** ❌
- **Save** 클릭

#### 3단계: 기존 사용자 이메일 자동 확인
**SQL Editor**에서 실행:
```sql
-- 모든 미인증 사용자를 자동으로 인증 처리
UPDATE auth.users
SET 
  email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
  updated_at = NOW()
WHERE email_confirmed_at IS NULL;
```

---

### 방법 2: 수동으로 특정 사용자 이메일 확인

특정 사용자만 인증하려면 **SQL Editor**에서:

```sql
-- 특정 이메일의 사용자 인증
UPDATE auth.users
SET 
  email_confirmed_at = NOW(),
  updated_at = NOW()
WHERE email = 'user@example.com';  -- 이메일 주소를 실제 값으로 변경
```

---

### 방법 3: Supabase Dashboard에서 수동 확인

1. **Authentication** → **Users** 클릭
2. 해당 사용자 찾기
3. 사용자 클릭 → 오른쪽 패널에서 **Confirm email** 버튼 클릭

---

## 🧪 테스트

설정 변경 후:
1. 브라우저 캐시 삭제 또는 시크릿 모드 사용
2. 로그인 재시도
3. ✅ 성공적으로 로그인되어야 함

---

## 📋 올바른 Supabase 설정

```
Authentication > Providers > Email
┌─────────────────────────────────────┐
│ Email                    [ON] ✅    │  ← 켜짐
│                                     │
│ Settings:                           │
│ ├─ Confirm email         [OFF] ❌  │  ← 꺼짐 (중요!)
│ └─ Secure email change   [ON] ✅   │
└─────────────────────────────────────┘
```

---

## 🚨 여전히 문제가 있다면?

### 1. 이메일 확인 상태 체크
**SQL Editor**에서 실행:
```sql
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users
WHERE email = 'user@example.com';  -- 실제 이메일로 변경
```

- `email_confirmed_at`이 **NULL**이면 → 이메일 미인증
- `email_confirmed_at`에 **날짜**가 있으면 → 이메일 인증됨

### 2. 계정 존재 여부 확인
```sql
SELECT 
  email,
  created_at,
  email_confirmed_at
FROM auth.users
WHERE email LIKE '%검색할이메일%';
```

### 3. 비밀번호 재설정
로그인 페이지에서 "비밀번호 찾기" 기능 사용

---

## 💡 참고

### 회원가입 후 바로 로그인하려면:
1. ✅ Email Provider: **ON**
2. ❌ Confirm email: **OFF**
3. 위 설정으로 새로 가입하는 사용자는 이메일 인증 없이 바로 로그인 가능

### 기존 사용자는:
- 위 SQL로 수동 인증 처리 필요
- 또는 Dashboard에서 수동 확인

---

## 📞 추가 지원

문제가 계속되면:
1. 브라우저 콘솔에서 에러 로그 확인
2. Supabase Dashboard → Logs 확인
3. 비밀번호 재설정 시도

