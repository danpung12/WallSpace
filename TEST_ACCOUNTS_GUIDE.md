# 테스트 계정 생성 가이드

## 📋 생성할 계정 정보

### 1. 작가/사장님 계정
- **이메일**: user@spacewall.com
- **비밀번호**: user1234!!
- **타입**: artist
- **이름**: 김작가
- **닉네임**: 예술가김
- **전화번호**: 010-1234-5678
- **웹사이트**: https://instagram.com/artist_kim
- **소개**: 현대 미술을 사랑하는 작가입니다.

### 2. 손님 계정
- **이메일**: guest@spacewall.com
- **비밀번호**: guest1234!!
- **타입**: guest
- **이름**: 이손님
- **생년월일**: 1995-05-15
- **성별**: female
- **소개**: 예술 작품 감상을 좋아합니다.

---

## 🚀 방법 1: Supabase Dashboard (가장 쉬움, 권장)

1. **Supabase Dashboard 접속**
   - https://supabase.com/dashboard 로그인

2. **프로젝트 선택**
   - 현재 프로젝트 선택

3. **Authentication 메뉴**
   - 왼쪽 사이드바에서 "Authentication" 클릭
   - "Users" 탭 선택

4. **작가 계정 생성**
   - "Add user" 버튼 클릭
   - Email: `user@spacewall.com`
   - Password: `user1234!!`
   - Auto Confirm User: ✅ 체크 (이메일 인증 건너뛰기)
   - "Create user" 클릭

5. **손님 계정 생성**
   - 다시 "Add user" 버튼 클릭
   - Email: `guest@spacewall.com`
   - Password: `guest1234!!`
   - Auto Confirm User: ✅ 체크
   - "Create user" 클릭

6. **user_type 수정 (SQL Editor)**
   - 왼쪽 사이드바에서 "SQL Editor" 클릭
   - "New query" 버튼 클릭
   - 아래 SQL 복사 & 실행:

```sql
-- 작가 계정 프로필 완전히 설정
UPDATE profiles 
SET 
  user_type = 'artist',
  full_name = '김작가',
  name = '김작가',
  nickname = '예술가김',
  phone = '010-1234-5678',
  website = 'https://instagram.com/artist_kim',
  bio = '현대 미술을 사랑하는 작가입니다.',
  updated_at = NOW()
WHERE email = 'user@spacewall.com';

-- 손님 계정 프로필 완전히 설정
UPDATE profiles 
SET 
  user_type = 'guest',
  full_name = '이손님',
  name = '이손님',
  nickname = NULL,
  phone = NULL,
  dob = '1995-05-15',
  gender = 'female',
  bio = '예술 작품 감상을 좋아합니다.',
  updated_at = NOW()
WHERE email = 'guest@spacewall.com';

-- 확인
SELECT 
  id,
  email,
  user_type,
  full_name,
  nickname,
  phone,
  dob,
  gender,
  website
FROM profiles
WHERE email IN ('user@spacewall.com', 'guest@spacewall.com');
```

---

## 🔧 방법 2: Node.js 스크립트 실행

### 전제조건
`.env.local` 파일에 다음 환경변수가 필요합니다:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 실행 명령어
```bash
node create-test-accounts.js
```

---

## ✅ 생성 확인

### SQL로 확인:
```sql
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  p.user_type,
  p.full_name,
  p.nickname
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email IN ('user@spacewall.com', 'guest@spacewall.com')
ORDER BY u.email;
```

### 또는 로그인해서 확인:
1. 앱 실행: `npm run dev`
2. http://localhost:3000/login 접속
3. 각 계정으로 로그인 테스트

---

## 🎉 완료!

생성된 계정으로 로그인하여 테스트할 수 있습니다.

