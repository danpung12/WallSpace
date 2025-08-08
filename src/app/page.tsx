'use client';

import { useState } from "react";

export default function WallSpaceAuthPage() {
  const [form, setForm] = useState<'login'|'signup'>('login');

  return (
    <div>
      {/* Google Fonts, Custom CSS */}
      <style jsx global>{`
        :root {
          --background-color: #FDFBF8;
          --primary-color: #C19A6B;
          --text-primary: #3D2B1F;
          --text-secondary: #7A5C52;
          --input-bg: #FFFFFF;
          --input-placeholder: #A99985;
          --white: #FFFFFF;
          --naver-green: #03C75A;
          --google-blue: #4285F4;
        }
        body, html {
          font-family: 'Pretendard', sans-serif;
          background-color: var(--background-color);
          background-image: url('https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=2047&auto=format&fit=crop');
          background-size: cover;
          background-position: center;
          background-attachment: fixed
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
          box-shadow: 0 1px 2px 0 rgba(16,24,40,0.04);
        }
        .input-field:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(193, 154, 107, 0.18);
        }
        .input-field::placeholder {
          color: var(--input-placeholder);
          opacity: 1;
        }
        .primary-button {
          width: 100%;
          height: 3rem;
          background: var(--primary-color);
          color: var(--white);
          font-size: 1rem;
          font-weight: 700;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 1px 2px 0 rgba(16,24,40,0.04);
          letter-spacing: 0.015em;
        }
        .primary-button:hover {
          background: var(--primary-color);
          opacity: 0.90;
          transform: scale(1.02);
          box-shadow: 0 4px 12px -2px rgba(193, 154, 107, 0.5);
        }
        .primary-button:active {
          transform: scale(0.98);
        }
        .secondary-button {
          color: var(--primary-color);
          font-size: 0.89rem;
          font-weight: 500;
          text-decoration: underline;
        }
        .social-button {
          width: 100%;
          height: 3rem;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s;
          color: var(--white);
          font-size: 1rem;
          font-weight: 700;
          box-shadow: 0 1px 2px 0 rgba(16,24,40,0.04);
        }
        .social-button:hover {
          transform: scale(1.02);
        }
        .social-button:active {
          transform: scale(0.98);
        }
        .naver-button {
          background: var(--naver-green);
        }
        .google-button {
          background: var(--google-blue);
        }
        .social-icon {
          width: 20px;
          height: 20px;
          margin-right: 12px;
        }
      `}</style>
      {/* Pretendard + Google Fonts */}
    <div className="relative min-h-screen h-[100vw]">
      {/* Blur Overlay */}
      <div
  className="absolute inset-0 bg-black/10 min-h-screen"
  style={{ backdropFilter: "blur(2px)", WebkitBackdropFilter: "blur(2px)" }}
></div>
      <div className="relative flex flex-col min-h-screen justify-center px-6 height-[100vw]">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-[var(--white)] tracking-tight">WallSpace</h1>
          <p className="text-base text-white/90 mt-2">당신의 작품으로 벽을 채우세요</p>
        </div>
        <div className="bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-2xl">
          <div className="flex mb-6">
            <button
              className={`flex-1 pb-2 border-b-2 font-semibold text-sm
                ${form === 'login'
                  ? 'border-[var(--primary-color)] text-[var(--text-primary)]'
                  : 'border-transparent text-[var(--text-secondary)]'
                }`}
              onClick={() => setForm('login')}
              type="button"
            >로그인</button>
            <button
              className={`flex-1 pb-2 border-b-2 font-semibold text-sm
                ${form === 'signup'
                  ? 'border-[var(--primary-color)] text-[var(--text-primary)]'
                  : 'border-transparent text-[var(--text-secondary)]'
                }`}
              onClick={() => setForm('signup')}
              type="button"
            >회원가입</button>
          </div>
          {/* 로그인 폼 */}
          {form === 'login' && (
            <div>
              <form className="space-y-4">
                <div>
                  <label className="sr-only" htmlFor="login-email">Email</label>
                  <input className="input-field" id="login-email" placeholder="아이디" type="email" autoComplete="username"/>
                </div>
                <div>
                  <label className="sr-only" htmlFor="login-password">Password</label>
                  <input className="input-field" id="login-password" placeholder="비밀번호" type="password" autoComplete="current-password"/>
                </div>
                <div className="text-right py-[px]">
                  <a className="text-[13px] text-[var(--text-secondary)] hover:text-[var(--primary-color)]" href="#">비밀번호를 잊으셨나요?</a>
                </div>
                <div className="">
                  <button className="primary-button" type="submit">
                    <span>로그인</span>
                  </button>
                </div>
              </form>
              <div className="mt-6 flex items-center">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink mx-4 text-xs text-[var(--text-secondary)]">간편 로그인</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>
              <div className="mt-6 space-y-4">
                <button className="social-button naver-button " type="button">
                  <img alt="Naver logo" className="social-icon"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuC9ptjK8I4NQFf3U0hwQkTFAMrLQfQAOJfME3-OVOEDc-3MkhrXyvMQTcXoZt7bbZW7cXGlF2s6SsN3THcMxB8cvpoVz4xTdTLrRbXeJ9BSi-46ywd19xuZFGUSResV5ECS0nziFdsrPWMxSjtr5TVPhrDdOXrK44VEoqwGvjxHyE-nkUAI_DQQGK4RhK0TaHnIbUhzuGsSkCqqEa__Nb7t8BIciJvvzHfPAhdX7PgdZ4Jf98apCyFevIokMSCf44wh3rYXKjECJbVx"/>
                  <span className="text-sm">네이버로 로그인</span>
                </button>
                <button className="social-button google-button" type="button">
                  <img alt="Google logo" className="social-icon"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCSlUKHVMMkv7wtqFXy5hetjFiHu-WjKQygB3_QGAkQQ_4H49-1NrSbtbDIFoylXzbfsAAiC4l1TN_fBhKBEyukYCF8DL4UMAJ3cpr3n47sRs9HMoGLFEic144MpP7qg4CYObZAZ3jznERvI1iFvtFJSQ_bQeC2VJ3miEpSMXjy-gXeYBQ3N3nThKVxxmLt-IlrDizUBokGIw_it0LPUgIpSF8Ic5iFHf4ROPclwonXV4hXMcr6zLfIZoQy82BG2eOmUXmBBFse9S10"/>
                  <span className="text-sm">구글로 로그인</span>
                </button>
              </div>
            </div>
          )}
          {/* 회원가입 폼 */}
          {form === 'signup' && (
            <div>
              <form className="space-y-4">
                <div>
                  <label className="sr-only" htmlFor="signup-name">Name</label>
                  <input className="input-field" id="signup-name" placeholder="이름" type="text" autoComplete="name"/>
                </div>
                <div>
                  <label className="sr-only" htmlFor="signup-email">Email</label>
                  <input className="input-field" id="signup-email" placeholder="아이디" type="email" autoComplete="username"/>
                </div>
                <div>
                  <label className="sr-only" htmlFor="signup-password">Password</label>
                  <input className="input-field" id="signup-password" placeholder="비밀번호" type="password" autoComplete="new-password"/>
                </div>
                <div>
                  <label className="sr-only" htmlFor="signup-password">PasswordOk</label>
                  <input className="input-field" id="signup-passwordok" placeholder="비밀번호 확인" type="password" autoComplete="new-password"/>
                </div>
                <div className="pt-4">
                  <button className="primary-button" type="submit">
                    <span>로그인</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
        <div className="text-center mt-6">
          {form === 'login' ? (
            <p className="text-sm text-white/90">
              계정이 아직 없으신가요?{' '}
              <button className="secondary-button !text-white font-semibold !text-sm"
                onClick={() => setForm('signup')}
                type="button"
              >회원가입</button>
            </p>
          ) : (
            <p className="text-sm text-white/90">
               이미 계정이 있으신가요?{' '}
              <button className="secondary-button !text-white font-semibold !text-sm"
                onClick={() => setForm('login')}
                type="button"
              >로그인</button>
            </p>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}
