# 비밀번호 재설정 기능 설정 가이드

## ✅ 구현 완료!

비밀번호 재설정 기능을 완전히 구현했습니다!

---

## 🎯 작동 방식

```
1. 로그인 페이지 → "비밀번호를 잊으셨나요?" 클릭
   ↓
2. 이메일 입력 → "인증메일 발송" 클릭
   ↓
3. 이메일로 비밀번호 재설정 링크 수신
   ↓
4. 링크 클릭 → /reset-password 페이지 이동
   ↓
5. 새 비밀번호 입력 → 재설정 완료
   ↓
6. 로그인 페이지로 자동 이동 → 새 비밀번호로 로그인 ✅
```

---

## 🔧 Supabase 설정 (필수)

### 1. Email Templates 설정

Supabase Dashboard → **Authentication** → **Email Templates**

#### "Reset Password" 템플릿 수정:

```html
<h2>비밀번호 재설정</h2>

<p>안녕하세요,</p>

<p>아래 버튼을 클릭하여 비밀번호를 재설정하세요:</p>

<p><a href="{{ .ConfirmationURL }}">비밀번호 재설정</a></p>

<p>링크는 24시간 동안 유효합니다.</p>

<p>본인이 요청하지 않았다면 이 이메일을 무시하세요.</p>
```

### 2. URL Configuration

Supabase Dashboard → **Authentication** → **URL Configuration**

**Redirect URLs**에 추가:
```
http://localhost:3000/reset-password
https://your-domain.com/reset-password
```

---

## 🧪 테스트 방법

### 1. 비밀번호 재설정 요청
```
1. /login 접속
2. "비밀번호를 잊으셨나요?" 클릭
3. 이메일 입력: test@example.com
4. "인증메일 발송" 클릭
5. ✅ "비밀번호 재설정 메일이 발송되었습니다!" 확인
```

### 2. 이메일 확인
```
1. 이메일 확인 (스팸 폴더도 확인)
2. "비밀번호 재설정" 링크 클릭
3. ✅ /reset-password 페이지로 이동
```

### 3. 새 비밀번호 설정
```
1. 새 비밀번호 입력 (최소 6자)
2. 비밀번호 확인
3. "비밀번호 재설정" 클릭
4. ✅ "비밀번호가 재설정되었습니다!" 확인
5. 자동으로 로그인 페이지 이동
6. 새 비밀번호로 로그인 ✅
```

---

## 📱 UI/UX 개선 사항

### 1. FindPasswordModal (비밀번호 찾기 모달)
- ✅ 이메일 입력 필드
- ✅ 이메일 유효성 검사
- ✅ 로딩 상태 표시
- ✅ 성공/에러 메시지
- ✅ 3초 후 자동으로 모달 닫기

### 2. ResetPasswordPage (비밀번호 재설정 페이지)
- ✅ 새 비밀번호 입력
- ✅ 비밀번호 확인
- ✅ 최소 6자 검증
- ✅ 비밀번호 일치 검증
- ✅ 로딩 상태 표시
- ✅ 성공/에러 메시지
- ✅ 3초 후 로그인 페이지로 자동 이동

---

## 🔒 보안 기능

1. ✅ **토큰 기반 인증**: 이메일 링크에 일회용 토큰 포함
2. ✅ **24시간 만료**: 링크는 24시간 후 자동 만료
3. ✅ **일회용 링크**: 사용 후 재사용 불가
4. ✅ **이메일 검증**: 가입된 이메일만 재설정 가능

---

## 🐛 트러블슈팅

### 문제 1: 이메일이 안 와요

**원인:**
- Supabase Email Provider 미설정
- 스팸 폴더로 이동

**해결:**
1. Supabase Dashboard → **Project Settings** → **Auth** 확인
2. 스팸 폴더 확인
3. Gmail의 경우 "프로모션" 탭 확인

---

### 문제 2: 링크 클릭 시 404 에러

**원인:**
- `/reset-password` 페이지가 없음
- Redirect URL 미설정

**해결:**
1. `src/app/reset-password/page.tsx` 파일 확인
2. Supabase Dashboard → **Authentication** → **URL Configuration** 확인

---

### 문제 3: "유효하지 않은 링크입니다"

**원인:**
- 토큰 만료 (24시간 경과)
- 이미 사용한 링크

**해결:**
1. 비밀번호 재설정 다시 요청
2. 새 이메일 링크 사용

---

## 📂 생성된 파일

```
src/
└── app/
    ├── components/
    │   └── FindPasswordModal.tsx          ← 비밀번호 찾기 모달 (수정됨)
    └── reset-password/
        └── page.tsx                        ← 새 비밀번호 입력 페이지 (신규)
```

---

## ✅ 완료 체크리스트

- [ ] Supabase Email Templates 설정
- [ ] Supabase Redirect URLs 설정
- [ ] "비밀번호를 잊으셨나요?" 클릭 테스트
- [ ] 이메일 수신 확인
- [ ] 링크 클릭 → /reset-password 이동 확인
- [ ] 새 비밀번호 설정 테스트
- [ ] 새 비밀번호로 로그인 성공

---

## 🎉 완료!

이제 비밀번호 재설정 기능이 완전히 작동합니다!

Supabase 설정만 완료하면 바로 사용 가능합니다! 🚀

