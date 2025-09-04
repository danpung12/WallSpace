'use client';

import { useRouter } from 'next/navigation';
import React from "react";

export default function WallSpaceLoginPreview() {
  const router = useRouter();
  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert("로그인 버튼 클릭 (데모) — 실제 앱에서는 router.push('/home') 등으로 연결하세요.");
  };
  const handleSignup = () => {
    router.push('/select-type');
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
          --google-blue: #4285F4;
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

        /* 공식 버튼 세로 스택 */
        .provider-stack { display:flex; flex-direction:column; gap:.75rem; }
        @media (min-width:640px){ .provider-stack{ gap:.875rem; } }

        /* 이미지 버튼 공통 (풀폭, 고정 높이 48px) */
        .brand-btn { display:block; width:100%; height:48px; border-radius:0.5rem; overflow:hidden; }
        .brand-btn img { display:block; height:48px; width:auto; margin:0 auto; object-fit:contain; }
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
            <form className="space-y-4 sm:space-y-5" onSubmit={handleLogin}>
              <div>
                <label className="sr-only" htmlFor="login-email">Email / ID</label>
                <input className="input-field" id="login-email" placeholder="아이디" type="email" autoComplete="username" />
              </div>
              <div>
                <label className="sr-only" htmlFor="login-password">Password</label>
                <input className="input-field" id="login-password" placeholder="비밀번호" type="password" autoComplete="current-password" />
              </div>
              <div className="text-right">
                <a className="text-[12px] sm:text-[13px] hover:underline" style={{ color: 'var(--text-secondary)' }} href="#">
                  비밀번호를 잊으셨나요?
                </a>
              </div>

              <div className="pt-5 sm:pt-6 space-y-3">
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

            {/* ✅ 공식 이미지 버튼: 세로 스택 (48px 통일) */}
            <div className="mt-8 provider-stack">
              {/* Google (공식 PNG) */}
              <a
                href="#"
                className="brand-btn"
                aria-label="구글로 로그인"
                onClick={(e) => { e.preventDefault(); /* TODO: 구글 로그인 연결 */ }}
              >
                <img
                  alt="Sign in with Google"
                  src="https://developers.google.com/identity/images/btn_google_signin_light_normal_web@2x.png"
                  height={48}
                  loading="lazy"
                />
              </a>

              {/* Naver (공식 리소스 PNG) */}
              <a
                href="#"
                className="brand-btn"
                aria-label="네이버로 로그인"
                onClick={(e) => { e.preventDefault(); /* TODO: 네이버 로그인 연결 */ }}
              >
                <img
                  alt="네이버 아이디로 로그인"
                  src="https://static.nid.naver.com/oauth/small_g_in.PNG"
                  height={48}
                  loading="lazy"
                />
              </a>

              {/* Kakao (public에 저장한 공식 버튼) */}
              <a
                href="#"
                className="brand-btn"
                aria-label="카카오로 로그인"
                onClick={(e) => { e.preventDefault(); /* TODO: 카카오 로그인 연결 */ }}
              >
                <img
                  alt="카카오 로그인"
                  src="/kakao_login_medium.png"
                  height={48}
                  loading="lazy"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
