# AI 자소서 분석 플랫폼

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.9+-blue.svg)
![Django](https://img.shields.io/badge/django-4.2-092E20.svg?logo=django)
![Next.js](https://img.shields.io/badge/next.js-13+-000000?logo=next.js)

## 📌 프로젝트 개요
AI 기반 자소서 분석 플랫폼은 사용자의 자소서를 AI로 분석하여 점수화하고, 개선 방향을 제시하는 서비스입니다. 회사/직무별 맞춤형 피드백을 제공하여 취업 준비생들의 자소서 작성에 도움을 줍니다.

## ✨ 주요 기능

### 1. 자소서 관리
- 자소서 작성/수정/삭제
- 템플릿 제공 및 버전 관리
- 클라우드 저장 및 동기화

### 2. AI 분석
- 문법/맞춤법 검사
- 키워드 추출 및 분석
- 회사/직무별 핵심 역량 매칭
- 경쟁력 분석 리포트

### 3. 개인화된 피드백
- 맞춤형 개선 제안
- 성공 사례 기반 추천
- 실시간 작성 가이드

## 🛠 기술 스택

### 프론트엔드
- **프레임워크**: Next.js 13+ (App Router)
- **언어**: TypeScript
- **상태 관리**: Redux Toolkit
- **스타일링**: Tailwind CSS

### 백엔드
- **프레임워크**: Django 4.2, Django REST framework
- **데이터베이스**: PostgreSQL
- **인증**: JWT
- **캐싱**: Redis

### AI/ML
- **NLP 모델**: KoBERT, KoGPT
- **벡터 DB**: Pinecone

## 🚀 시작하기

### 사전 요구사항
- Python 3.9+
- Node.js 16+
- PostgreSQL
- Redis

### 백엔드 설정
```bash
# 저장소 클론
cd mybackend

# 가상환경 생성 및 활성화
python -m venv venv
source venv/bin/activate  # Linux/Mac
# 또는 venv\Scripts\activate  # Windows

# 의존성 설치
pip install -r requirements.txt

# 환경 변수 설정 (.env 파일 생성)
cp .env.example .env

# 데이터베이스 마이그레이션
python manage.py migrate

# 개발 서버 실행
python manage.py runserver
```

### 프론트엔드 설정
```bash
cd myfront

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

## 📂 프로젝트 구조

```
/
├── mybackend/           # Django 백엔드
│   ├── myproject/       # 프로젝트 설정
│   └── myapp/          # 애플리케이션 코드
├── myfront/            # Next.js 프론트엔드
│   ├── src/
│   │   ├── app/       # Next.js App Router
│   │   └── components/ # 재사용 컴포넌트
├── .env.example        # 환경 변수 예시
└── README.md           # 이 파일
```

## 📄 라이선스
이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

