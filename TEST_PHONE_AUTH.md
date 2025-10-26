# Phone Auth 테스트 가이드

## 🧪 테스트 준비

### 1. Supabase Phone Auth 설정 확인

Supabase Dashboard → **Authentication** → **Providers** → **Phone**
- ✅ Phone Auth가 **활성화**되어 있는지 확인
- ✅ SMS Provider 설정 완료 (Twilio/Vonage/MessageBird)

### 2. 테스트 전화번호 설정 (개발 환경)

**개발 중에는 실제 SMS를 보내지 않고 테스트할 수 있습니다:**

1. Supabase Dashboard → **Authentication** → **Phone**
2. **Test Phone Numbers** 섹션
3. 테스트 번호 추가:
   ```
   Phone: +821012345678
   OTP: 123456
   ```

이제 `010-1234-5678`로 OTP를 요청하면 실제 SMS 없이 `123456`으로 인증할 수 있습니다!

---

## 📱 테스트 시나리오

### 시나리오 1: 회원가입 시 전화번호 인증

1. 회원가입 페이지 접속
2. **"전화번호 인증" 버튼** 클릭
3. 전화번호 입력: `010-1234-5678`
4. **"인증번호 받기"** 클릭
5. SMS로 받은 6자리 OTP 입력 (테스트: `123456`)
6. **"인증 완료"** 클릭
7. ✅ 전화번호가 입력 필드에 표시되고 "인증완료" 표시 확인
8. 나머지 회원가입 정보 입력 후 가입 완료

### 시나리오 2: 전화번호 중복 확인

1. 이미 가입된 전화번호로 인증 시도
2. 에러 메시지 확인: "이미 사용 중인 전화번호입니다."

### 시나리오 3: OTP 만료

1. OTP 발송 후 3분(180초) 대기
2. 시간 초과 후 인증 시도
3. 에러 메시지 확인
4. **"재전송"** 버튼으로 새 OTP 받기

---

## 🗄️ 데이터베이스 확인

### 1. 전화번호 저장 확인

```sql
-- 가입한 사용자의 전화번호 확인
SELECT 
  id,
  email,
  name,
  phone,
  phone_verified,
  phone_verified_at,
  user_type,
  created_at
FROM public.profiles
WHERE phone IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;
```

**기대 결과:**
- `phone`: `+821012345678` (국제 형식)
- `phone_verified`: `true`
- `phone_verified_at`: 인증 완료 시간

### 2. auth.users 확인

```sql
-- auth.users 테이블의 phone 정보 확인
SELECT 
  id,
  phone,
  phone_confirmed_at,
  email,
  created_at
FROM auth.users
WHERE phone IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;
```

---

## 🐛 트러블슈팅

### 문제 1: "OTP 발송 실패"

**원인:**
- SMS Provider 설정 오류
- 잔액 부족 (Twilio 등)
- 전화번호 형식 오류

**해결:**
1. Supabase Dashboard에서 SMS Provider 설정 확인
2. Twilio 대시보드에서 잔액 확인
3. 전화번호가 `+821012345678` 형식인지 확인

### 문제 2: "OTP 인증 실패"

**원인:**
- 잘못된 OTP 입력
- OTP 만료 (3분)
- 전화번호 불일치

**해결:**
1. SMS로 받은 최신 OTP 입력
2. 3분 이내에 입력
3. 콘솔에서 전화번호 형식 확인

### 문제 3: "profiles 테이블에 전화번호 저장 안됨"

**원인:**
- 트리거 오류
- RLS 정책 문제

**해결:**
```sql
-- 트리거 실행 확인
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 수동으로 전화번호 업데이트
UPDATE public.profiles
SET 
  phone = '+821012345678',
  phone_verified = true,
  phone_verified_at = NOW()
WHERE id = 'user-id-here';
```

---

## ✅ 성공 체크리스트

- [ ] SMS OTP 발송 성공
- [ ] OTP 인증 성공
- [ ] 전화번호가 `profiles` 테이블에 저장됨
- [ ] `phone_verified = true`로 설정됨
- [ ] 회원가입 완료 후 프로필 페이지에 전화번호 표시됨
- [ ] 전화번호 형식이 국제 형식(`+82`)으로 저장됨

---

## 📊 모니터링

### Supabase Dashboard에서 확인

1. **Authentication** → **Users**: 새로 가입한 사용자의 phone 컬럼 확인
2. **Table Editor** → **profiles**: phone, phone_verified 컬럼 확인
3. **Logs**: 오류 로그 확인

### 개발자 도구 콘솔 확인

```javascript
// 콘솔에서 확인할 로그
✅ Phone verified: +821012345678
✅ Profile updated with phone: +821012345678
```

---

테스트 완료 후 결과를 알려주세요! 🚀

