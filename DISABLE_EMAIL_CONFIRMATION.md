# 이메일 인증 비활성화 가이드

## 🎯 목적
회원가입 시 이메일 인증을 건너뛰고 바로 로그인할 수 있도록 설정합니다.

---

## 📋 Supabase Dashboard 설정

### ⚠️ 중요: Email Provider는 반드시 활성화 상태여야 합니다!

### 1. Authentication 설정 확인

1. **Supabase Dashboard** 접속
2. 왼쪽 메뉴에서 **Authentication** 클릭
3. 상단 탭에서 **Providers** 클릭
4. **Email** 섹션 찾기

### 2. Email Provider 활성화 확인 (필수!)

**Email** 섹션 상단에서:
- **"Email"** 토글이 **ON(켜짐)** 상태인지 확인 ✅
- ⚠️ 이 토글을 끄면 "Email logins are disabled" 오류 발생!

### 3. 이메일 확인만 비활성화

**Email** 섹션 하단의 **설정**에서:

- **"Confirm email"**: **OFF로 변경** ❌
  - 또는 **"Enable email confirmations"**: **체크 해제** ❌
  - 이 옵션만 끄면 이메일 인증 없이 바로 가입 완료됩니다.

### 4. 저장

- 화면 하단의 **Save** 버튼 클릭

---

## ✅ 올바른 설정 확인

설정이 올바르게 되었는지 확인:

### Email 섹션
```
Email                           [ON] ✅  ← 이것은 켜져 있어야 함!
├─ Confirm email               [OFF] ❌  ← 이것만 꺼야 함!
└─ Secure email change          [ON] ✅
```

**요약:**
- ✅ **Email Provider**: **ON** (켜짐)
- ❌ **Confirm email**: **OFF** (꺼짐)

---

## 🚨 문제 해결: "Email logins are disabled" 오류

만약 회원가입/로그인 시 다음 오류가 발생하면:
```
{
  code: "email_provider_disabled",
  message: "Email logins are disabled"
}
```

**원인:** Email Provider 자체를 끈 경우

**해결 방법:**
1. **Providers** 탭에서 **Email** 섹션 찾기
2. **Email** 토글을 **ON(켜짐)** 상태로 변경 ✅
3. **Confirm email**만 **OFF**로 설정 ❌
4. **Save** 클릭

자세한 내용은 `FIX_EMAIL_LOGIN_DISABLED.md` 참고

---

## ✅ 완료!

이제 새로운 사용자가 회원가입하면:
1. ✅ 이메일 중복 확인만 수행
2. ✅ 이메일 인증 없이 바로 계정 생성
3. ✅ 바로 로그인 가능

---

## 🔍 테스트 방법

1. 새 계정으로 회원가입
2. 이메일 인증 없이 바로 로그인 시도
3. ✅ 성공적으로 로그인되어야 함

---

## 📝 참고사항

### auth.users 테이블의 email_confirmed_at 필드
- 이메일 인증을 비활성화하면 `email_confirmed_at` 필드가 **자동으로 현재 시간으로 설정**됩니다.
- 따라서 테이블에서 별도로 필드를 제거할 필요가 없습니다.

### 기존 사용자
- 이미 가입한 사용자는 영향을 받지 않습니다.
- 새로 가입하는 사용자부터 이메일 인증이 건너뛰어집니다.

---

## 🚨 보안 고려사항

이메일 인증을 비활성화하면:
- ⚠️ 유효하지 않은 이메일로도 가입 가능
- ⚠️ 스팸 계정 생성 가능성 증가
- ✅ 사용자 경험(UX)은 향상됨

필요시 나중에 다시 활성화할 수 있습니다.

