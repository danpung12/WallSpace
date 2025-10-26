# 이메일 로그인 오류 해결 가이드

## ❌ 오류 메시지
```
{
  code: "email_provider_disabled",
  message: "Email logins are disabled"
}
```

---

## 🔍 원인
Supabase에서 **Email Provider 자체를 비활성화**한 경우 발생합니다.

---

## ✅ 해결 방법

### 1. Supabase Dashboard 접속
1. **Supabase Dashboard** (https://supabase.com/dashboard)
2. 프로젝트 선택
3. 왼쪽 메뉴 **Authentication** 클릭
4. 상단 탭 **Providers** 클릭

### 2. Email Provider 활성화
**Email** 섹션에서:
- **Email** 토글을 **ON(켜짐)** 상태로 변경 ✅
- **Save** 버튼 클릭

### 3. 이메일 인증만 비활성화 (선택)
회원가입 시 이메일 인증을 건너뛰려면:
- **Email** 섹션 하단의 **"Confirm email"**을 **OFF**로 변경 ❌
- **Save** 버튼 클릭

---

## 📋 올바른 설정

```
Authentication > Providers > Email
┌─────────────────────────────────────┐
│ Email                    [ON] ✅    │  ← 반드시 켜져 있어야 함!
│                                     │
│ Settings:                           │
│ ├─ Confirm email         [OFF] ❌  │  ← 이메일 인증 건너뛰기
│ ├─ Secure email change   [ON] ✅   │
│ └─ ...                              │
└─────────────────────────────────────┘
```

**핵심:**
- ✅ **Email Provider**: **ON** (활성화)
- ❌ **Confirm email**: **OFF** (이메일 인증만 비활성화)

---

## 🧪 테스트

설정 후 테스트:
1. 새 계정으로 회원가입 시도
2. 이메일 인증 없이 가입 완료
3. 바로 로그인 가능

---

## 🚨 주의사항

### Email Provider를 끄면 안 되는 이유:
- ❌ 회원가입 불가
- ❌ 로그인 불가
- ❌ 비밀번호 재설정 불가

### Confirm email을 끄면:
- ✅ 회원가입 시 이메일 인증 건너뛰기
- ✅ 바로 로그인 가능
- ⚠️ 유효하지 않은 이메일로도 가입 가능

---

## 📞 문제가 계속되면?

1. 브라우저 캐시 삭제
2. 시크릿 모드에서 재시도
3. Supabase Dashboard에서 설정 다시 확인
4. 몇 분 후 재시도 (설정 반영 시간)

