# WallSpace 프로젝트 문서

## 📋 프로젝트 개요

**WallSpace**는 작가와 공간을 연결하는 플랫폼으로, 예술가들이 전시 공간을 찾고 예약할 수 있는 서비스입니다.

### 🎯 주요 기능
- **지도 기반 공간 검색**: 카카오맵을 활용한 전시 공간 탐색
- **예약 시스템**: 날짜 선택 및 공간 예약 기능
- **사용자 관리**: 작가/게스트 구분 및 프로필 관리
- **다크모드 지원**: 사용자 설정에 따른 테마 변경
- **반응형 디자인**: 모바일/데스크톱 대응

## 🏗️ 기술 스택

### Frontend
- **Framework**: Next.js 15.4.4 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4.1.11
- **Animation**: Framer Motion 12.23.12
- **Icons**: React Icons 5.5.0
- **Carousel**: Swiper 12.0.2

### Backend & Database
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **API**: Next.js API Routes

### Development Tools
- **Linting**: ESLint 9
- **Testing**: Jest 30.1.3, Testing Library
- **Bundle Analysis**: @next/bundle-analyzer
- **Build**: TypeScript, PostCSS, Autoprefixer

## 📁 프로젝트 구조

```
WallSpace/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API 라우트
│   │   │   └── profile/         # 사용자 프로필 API
│   │   ├── components/         # 재사용 가능한 컴포넌트
│   │   ├── context/            # React Context
│   │   ├── dashboard/          # 대시보드 페이지
│   │   ├── map/                # 지도 관련 페이지
│   │   ├── booking*/           # 예약 관련 페이지
│   │   ├── layout.tsx          # 루트 레이아웃
│   │   ├── page.tsx            # 홈페이지
│   │   └── providers.tsx       # Context Provider 통합
│   ├── context/                # 전역 상태 관리
│   │   ├── MapContext.tsx      # 지도 상태
│   │   └── ReservationContext.tsx # 예약 상태
│   ├── data/                   # 정적 데이터
│   │   ├── locations.tsx       # 공간 데이터
│   │   ├── profile.ts          # 사용자 프로필 타입
│   │   └── reservations.ts     # 예약 데이터
│   ├── lib/                    # 유틸리티
│   │   └── supabase/           # Supabase 클라이언트
│   └── types/                  # TypeScript 타입 정의
│       └── kakao.d.ts         # 카카오맵 타입
├── public/                     # 정적 파일
├── supabase/                   # Supabase 설정
├── package.json               # 의존성 관리
├── next.config.ts             # Next.js 설정
├── tailwind.config.ts         # Tailwind 설정
└── tsconfig.json              # TypeScript 설정
```

## 🎨 디자인 시스템

### 색상 팔레트
```css
:root {
  --primary-color: #3E352F;    /* 다크 브라운 */
  --accent-color: #A89587;      /* 베이지 */
  --background-color: #F5F1EC;  /* 라이트 베이지 */
  --surface-color: #FFFFFF;   /* 화이트 */
  --border-color: #EAE5DE;      /* 보더 */
  --text-color: #3D2C1D;        /* 텍스트 */
}
```

### 다크모드 색상
```css
.dark {
  --primary-color: #E5D5C3;    /* 라이트 브라운 */
  --accent-color: #D2B48C;     /* 골드 */
  --background-color: #1F2937;  /* 다크 그레이 */
  --surface-color: #374151;      /* 서피스 */
  --text-color: #F3F4F6;        /* 라이트 텍스트 */
}
```

### 폰트
- **Primary**: Pretendard (한국어 최적화)
- **Icons**: Material Symbols Outlined

## 🗺️ 주요 페이지 및 기능

### 1. 로그인 페이지 (`/`)
- **컴포넌트**: `LoginClient.tsx`
- **기능**: 
  - 소셜 로그인 (네이버, 카카오, 구글)
  - 회원가입 모달 (작가/게스트 구분)
  - 비밀번호 찾기
- **반응형**: 모바일/데스크톱 대응

### 2. 홈 페이지 (`/home`)
- **기능**: 추천 공간 및 전시 정보
- **컴포넌트**: 다양한 카드 레이아웃

### 3. 지도 페이지 (`/map`)
- **기능**: 
  - 카카오맵 연동
  - 공간 검색 및 필터링
  - 마커 클릭으로 상세 정보
- **컨텍스트**: `MapContext.tsx`

### 4. 예약 시스템
- **날짜 선택**: `bookingdate/`, `bookingdate2/`
- **예약 확인**: `confirm-booking/`
- **예약 상세**: `bookingdetail/`

### 5. 대시보드 (`/dashboard`)
- **기능**: 사용자별 맞춤 대시보드
- **작가**: 작품 관리, 전시 일정
- **게스트**: 예약 내역, 관심 공간

### 6. 프로필 (`/profile`)
- **기능**: 사용자 정보 관리
- **API**: `/api/profile` (GET, PUT)

## 🔧 핵심 컴포넌트

### 1. MapContext
```typescript
interface MapContextType {
  mapInstance: React.RefObject<KakaoMap | null>;
  selectedPlace: Location | null;
  initializeMap: (container: HTMLElement) => void;
  // ... 기타 지도 관련 상태
}
```

### 2. Location 데이터 구조
```typescript
interface Location {
  id: number;
  name: string;
  category: string;
  lat: number;
  lng: number;
  address: string;
  spaces: Space[];
  reviews: Review[];
  // ... 기타 속성
}
```

### 3. 사용자 프로필
```typescript
interface UserProfile {
  id: string;
  name: string;
  nickname: string;
  email: string;
  avatarUrl: string;
  notificationSettings: {
    comments: boolean;
    exhibitions: boolean;
    messages: boolean;
  };
  userSettings: {
    darkMode: boolean;
  };
}
```

## 🗄️ 데이터베이스 구조

### Supabase 연동
- **클라이언트**: `src/lib/supabase/client.js`
- **서버**: `src/lib/supabase/server.js`
- **인증**: Supabase Auth
- **실시간**: Supabase Realtime

## 🚀 개발 환경 설정

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_KAKAO_MAP_KEY=your_kakao_map_key
```

### 3. 개발 서버 실행
```bash
npm run dev
```

### 4. 빌드 및 배포
```bash
npm run build
npm start
```

## 📱 반응형 디자인

### 브레이크포인트
- **Mobile**: < 768px
- **Desktop**: ≥ 768px

### 주요 반응형 기능
- 모바일: 하단 네비게이션
- 데스크톱: 사이드바 및 모달

## 🎨 UI/UX 특징

### 1. 애니메이션
- **Framer Motion**: 페이지 전환, 모달 애니메이션
- **CSS Transitions**: 호버 효과, 상태 변화

### 2. 접근성
- **ARIA 라벨**: 스크린 리더 지원
- **키보드 네비게이션**: 탭 순서 최적화
- **색상 대비**: WCAG 가이드라인 준수

### 3. 사용자 경험
- **로딩 상태**: 지도 로딩, 데이터 페칭
- **에러 처리**: 사용자 친화적 에러 메시지
- **오프라인 지원**: 기본 기능 오프라인 동작

## 🔒 보안 및 성능

### 보안
- **환경 변수**: 민감한 정보 보호
- **CORS 설정**: 적절한 도메인 제한
- **입력 검증**: 사용자 입력 sanitization

### 성능 최적화
- **이미지 최적화**: Next.js Image 컴포넌트
- **코드 스플리팅**: 동적 import
- **번들 분석**: `npm run analyze`

## 🧪 테스트

### 테스트 도구
- **Jest**: 단위 테스트
- **Testing Library**: 컴포넌트 테스트
- **테스트 스크립트**: `npm test`

## 📈 배포 및 모니터링

### 배포 환경
- **개발**: 로컬 개발 서버
- **스테이징**: Vercel Preview
- **프로덕션**: Vercel Production

### 모니터링
- **에러 추적**: Vercel Analytics
- **성능 모니터링**: Core Web Vitals
- **사용자 분석**: 사용자 행동 추적

## 🔄 상태 관리

### Context API 사용
1. **MapContext**: 지도 관련 상태
2. **UserModeContext**: 사용자 모드 (작가/게스트)
3. **ReservationContext**: 예약 상태
4. **BottomNavContext**: 하단 네비게이션
5. **DarkModeContext**: 다크모드 상태

### 상태 흐름
```
User Action → Context Update → Component Re-render → UI Update
```

## 🚧 향후 개발 계획

### 단기 계획
- [ ] 결제 시스템 연동
- [ ] 실시간 알림 기능
- [ ] 고급 검색 필터

### 장기 계획
- [ ] 모바일 앱 개발
- [ ] AI 추천 시스템
- [ ] 소셜 기능 추가

## 📞 지원 및 문의

### 개발팀 연락처
- **프로젝트 관리**: WallSpace Team
- **기술 지원**: 개발팀
- **버그 리포트**: GitHub Issues

---

*이 문서는 WallSpace 프로젝트의 전체적인 구조와 기능을 설명합니다. 추가 질문이나 상세한 구현 내용이 필요하시면 언제든 문의해주세요.*
