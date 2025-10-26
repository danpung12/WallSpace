# Supabase Phone Auth (SMS OTP) 설정 가이드

## 1단계: Supabase Dashboard 설정

### 1-1. Phone Auth 활성화
1. Supabase Dashboard → **Authentication** → **Providers**
2. **Phone** 토글을 **ON**으로 전환
3. SMS Provider 선택

### 1-2. SMS Provider 설정

#### 옵션 A: Twilio (추천 - 한국 지원)
1. [Twilio 가입](https://www.twilio.com/try-twilio)
2. Phone Number 구매 (한국: +82)
3. Supabase에 다음 정보 입력:
   - **Twilio Account SID**: `ACxxxxxxxxxxxx`
   - **Twilio Auth Token**: `your_auth_token`
   - **Twilio Phone Number**: `+821012345678`

#### 옵션 B: Vonage (구 Nexmo)
1. [Vonage 가입](https://dashboard.nexmo.com/sign-up)
2. API Key 발급
3. Supabase에 정보 입력

#### 옵션 C: MessageBird
1. [MessageBird 가입](https://dashboard.messagebird.com/en/sign-up)
2. API Key 발급
3. Supabase에 정보 입력

---

## 2단계: 환경 변수 설정

`.env.local` 파일에 추가:

```env
# Supabase Phone Auth
NEXT_PUBLIC_ENABLE_PHONE_AUTH=true
```

---

## 3단계: 테스트용 전화번호 설정 (개발 중)

개발 단계에서는 실제 SMS를 보내지 않고 테스트할 수 있습니다:

1. Supabase Dashboard → **Authentication** → **Phone**
2. **Test Phone Numbers** 섹션에서 테스트 번호 추가:
   - Phone: `+821012345678`
   - OTP: `123456` (고정 OTP)

---

## 4단계: 요금 및 제한사항

### Twilio 요금 (2024년 기준)
- SMS 발송: 건당 약 $0.05 (한국)
- 월 기본료: 없음 (Pay-as-you-go)
- 무료 크레딧: $15 (가입 시)

### Supabase 제한
- Phone Auth는 Pro Plan 이상에서 사용 가능
- Free Plan: 제한적 사용 가능 (테스트용)

---

## 다음 단계
설정 완료 후 코드 구현을 진행합니다.

