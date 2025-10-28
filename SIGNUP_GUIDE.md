# 회원가입 가이드 (Supabase 이메일 인증)

## 📋 작동 방식

### 1단계: 이메일 중복 확인
```
사용자 이메일 입력 → "중복확인" 버튼 클릭
↓
데이터베이스에서 이메일 존재 여부 확인
↓
중복이면 에러, 사용 가능하면 체크 표시
```

### 2단계: 회원가입
```
나머지 정보 입력 → "가입하기" 버튼 클릭
↓
Supabase Auth에 회원가입 요청
↓
Supabase가 자동으로 이메일 발송 📧
↓
"이메일을 확인해주세요" 안내 표시
```

### 3단계: 이메일 인증
```
사용자가 이메일에서 인증 링크 클릭
↓
계정 활성화 완료
↓
로그인 가능
```

## 🔧 Supabase 설정

### 1. Email Auth 설정 확인

Supabase Dashboard → Authentication → Email Auth 활성화 확인

### 2. Email Templates 설정 (선택사항)

Supabase Dashboard → Authentication → Email Templates

- **Confirm signup** 템플릿을 원하는 디자인으로 수정 가능
- 기본 템플릿도 잘 작동합니다

### 3. Site URL 설정

Supabase Dashboard → Authentication → URL Configuration

```
Site URL: http://localhost:3000 (개발)
          https://yourdomain.com (프로덕션)

Redirect URLs:
  http://localhost:3000/auth/callback (개발)
  https://yourdomain.com/auth/callback (프로덕션)
```

## 💡 주요 특징

✅ **간단한 구현** - 외부 의존성 없음  
✅ **이메일 중복 확인** - 가입 전 확인  
✅ **자동 이메일 발송** - Supabase가 처리  
✅ **보안** - Supabase Auth 기본 보안 적용  

## 🧪 테스트

1. 회원가입 모달 열기
2. 이메일 입력 후 "중복확인" 클릭
3. 나머지 정보 입력
4. "가입하기" 클릭
5. 이메일 확인 후 인증 링크 클릭
6. 로그인

## 📝 코드 구조

### API (`src/lib/api/auth.ts`)
- `checkEmailExists()` - 이메일 중복 확인
- `registerUser()` - Supabase Auth 회원가입
- `validateEmail()` - 이메일 형식 검증

### Components
- `GuestSignUpModal.tsx` - 손님 회원가입
- `ArtistSignUpModal.tsx` - 예술가/사장님 회원가입

## 🔍 트러블슈팅

### 이메일이 발송되지 않는 경우
1. Supabase Dashboard에서 Email Auth 활성화 확인
2. Site URL이 올바르게 설정되었는지 확인
3. 스팸 메일함 확인

### 중복 확인이 실패하는 경우
- `profiles` 테이블 접근 권한 확인
- Row Level Security (RLS) 정책 확인

### 회원가입 후 로그인이 안 되는 경우
- 이메일 인증 완료 여부 확인
- Supabase Dashboard → Authentication → Users에서 확인

## 🚀 프로덕션 체크리스트

- [ ] Supabase Site URL 업데이트
- [ ] Redirect URLs 설정
- [ ] Email Templates 커스터마이징 (선택)
- [ ] RLS 정책 설정
- [ ] 에러 핸들링 개선
- [ ] 로딩 상태 UI 개선










