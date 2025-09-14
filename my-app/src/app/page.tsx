'use client';

import { useRouter } from 'next/navigation'; // 미리보기 환경에서는 Next.js의 useRouter를 사용할 수 없어 주석 처리합니다.
import React from "react";

export default function WallSpaceLoginPreview() {
  const router = useRouter(); // 실제 Next.js 환경에서 주석을 해제하고 사용하세요.
  
  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    router.push('/home'); // 실제 Next.js 환경에서 주석을 해제하고 사용하세요.
    
  };

  const handleSignup = () => {
    router.push('/select-type'); // 실제 Next.js 환경에서 주석을 해제하고 사용하세요.
    
  };

  return (
    <div>
      {/* Global Styles */}
      <style>{`
        :root {
          --background-color: #fdfbf8;
          --primary-color: #c19a6b;
          --text-primary: #3d2b1f;
          --text-secondary: #7a5c52;
          --input-bg: #ffffff;
          --input-placeholder: #a99985;
          --white: #ffffff;
          --naver-green: #03c75a;
          --kakao-yellow: #FEE500;
        }
        html, body {
          font-family: 'Pretendard', system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
          background-color: var(--background-color);
          background-image: url('https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=2047&auto=format&fit=crop');
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
          min-height: max(884px, 100dvh);
        }
        .input-field {
          width: 100%;
          height: 3rem;
          background: var(--input-bg);
          border-radius: 0.5rem;
          color: var(--text-primary);
          padding-left: 1rem;
          font-size: 0.95rem;
          font-weight: 400;
          border: 1px solid #e5e7eb;
          transition: all 0.3s;
          box-shadow: 0 1px 2px 0 rgba(16, 24, 40, 0.04);
        }
        .input-field:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(193, 154, 107, 0.18);
        }
        .input-field::placeholder { color: var(--input-placeholder); opacity: 1; }

        .primary-button {
          width: 100%;
          height: 3rem;
          background: var(--primary-color);
          color: var(--white);
          font-size: 1rem;
          font-weight: 700;
          border-radius: 0.5rem;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.3s;
          box-shadow: 0 1px 2px 0 rgba(16,24,40,0.04);
          letter-spacing: 0.015em;
        }
        .primary-button:hover { opacity: .9; transform: scale(1.02); box-shadow: 0 4px 12px -2px rgba(193,154,107,.5); }
        .primary-button:active { transform: scale(.98); }

        .secondary-button {
          width: 100%; height: 3rem; background: transparent; color: var(--primary-color);
          border: 1px solid var(--primary-color); font-size: 1rem; font-weight: 700; border-radius: .5rem;
          display:flex; align-items:center; justify-content:center; transition: all .3s; box-shadow: 0 1px 2px rgba(16,24,40,.04);
          letter-spacing: .015em;
        }
        .secondary-button:hover { background: rgba(255,255,255,.2); transform: scale(1.02); }
        
        /* --- ✅ 간편 로그인 UI 스타일 --- */
        .social-login-horizontal {
          display: flex;
          justify-content: center;
          align-items: center; /* flex-start에서 center로 변경하여 수직 중앙 정렬 */
          gap: 1.5rem; /* 아이콘 간격 */
        }
        .social-icon-wrapper {
          position: relative;
          text-align: center;
        }
        .social-icon-btn {
          width: 56px; /* 아이콘 버튼 크기 */
          height: 56px;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }
        .social-icon-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }
        .social-icon-btn svg {
          width: 28px;
          height: 28px;
        }
      `}</style>

      <div className="relative min-h-screen">
        <div className="relative flex flex-col min-h-screen justify-center px-6 md:px-8 py-12 md:py-16">
          <div className="text-center mb-12 md:mb-16">
            <h1 className="text-3xl font-bold text-white tracking-tight">WallSpace</h1>
            <p className="text-base text-white/90 mt-2">당신의 작품으로 벽을 채우세요</p>
          </div>

          <div
            className="relative p-6 sm:p-8 rounded-2xl shadow-2xl max-w-md w-full mx-auto border border-white/60 ring-1 ring-black/5"
            style={{ background: 'rgba(255,255,255,0.90)' }}
          >
            {/* 카드 타이틀: 로그인 */}
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                로그인
              </h2>
            </div>

            {/* 로그인 폼 */}
            <form className="space-y-4" onSubmit={handleLogin}>
              <div>
                <label className="sr-only" htmlFor="login-email">Email / ID</label>
                <input className="input-field" id="login-email" placeholder="아이디" type="email" autoComplete="username" />
              </div>
              <div>
                <label className="sr-only" htmlFor="login-password">Password</label>
                <input className="input-field" id="login-password" placeholder="비밀번호" type="password" autoComplete="current-password" />
              </div>
              {/* 여백 수정 */}
              <div className="text-right py-1">
                <a className="text-[12px] sm:text-[13px] hover:underline" style={{ color: 'var(--text-secondary)' }} href="#">
                  비밀번호를 잊으셨나요?
                </a>
              </div>

              {/* 여백 수정 */}
              <div className="space-y-3">
                <button className="primary-button" type="submit"><span>로그인</span></button>
                <button className="secondary-button" type="button" onClick={handleSignup}>회원가입</button>
              </div>
            </form>

            {/* 구분선 */}
            <div className="mt-8 flex items-center">
              <div className="flex-grow" style={{ borderTop: '1px solid #d1d5db' }} />
              <span className="flex-shrink mx-4 text-[11px] sm:text-xs" style={{ color: 'var(--text-secondary)' }}>
                간편 로그인
              </span>
              <div className="flex-grow" style={{ borderTop: '1px solid #d1d5db' }} />
            </div>
            
            {/* 간편 로그인 UI (✅ 모바일 마진 수정) */}
            <div className="mt-6 sm:mt-8 social-login-horizontal">
              {/* Naver */}
              <div className="social-icon-wrapper">
                <button className="social-icon-btn" style={{ backgroundColor: 'var(--naver-green)' }} aria-label="네이버로 로그인">
                  <svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M15.9 12.825L9.15 3H3v18h6.15V11.175L15.9 21H21V3h-5.1v9.825z"/></svg>
                </button>
              </div>

              {/* Kakao */}
              <div className="social-icon-wrapper">
                <button className="social-icon-btn" style={{ backgroundColor: 'var(--kakao-yellow)' }} aria-label="카카오로 로그인">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#181600"><path d="M12 2C6.477 2 2 5.82 2 10.5C2 13.533 3.808 16.202 6.48 17.539L6 22l4.33-2.598C10.896 19.46 11.442 19.5 12 19.5c5.523 0 10-3.82 10-9S17.523 2 12 2z"/></svg>
                </button>
              </div>

              {/* Google */}
              <div className="social-icon-wrapper">
                 <button className="social-icon-btn" style={{ backgroundColor: '#ffffff', border: '1px solid #e0e0e0' }} aria-label="구글로 로그인">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                 </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

