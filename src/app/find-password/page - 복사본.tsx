'use client';

import { useRouter } from 'next/navigation'; // 미리보기 환경에서는 Next.js의 useRouter를 사용할 수 없어 주석 처리합니다.
import React from "react";

export default function WallSpaceFindPassword() {
  const router = useRouter();

  const handlePasswordReset = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // 여기에 비밀번호 재설정 이메일 발송 로직을 추가합니다.
    console.log("Password reset email sent.");
    // 성공적으로 전송 후 로그인 페이지로 이동하거나, 안내 메시지를 보여줄 수 있습니다.
    // router.push('/login'); // 실제 Next.js 환경에서 주석을 해제하고 사용하세요.
  };

  const handleGoBackToLogin = () => {
    router.push('/'); // 실제 Next.js 환경에서 주석을 해제하고 사용하세요.
  };

  return (
    <div>
      {/* Global Styles (from login page) */}
      <style>{`
        :root {
          --background-color: #fdfbf8;
          --primary-color: #c19a6b;
          --text-primary: #3d2b1f;
          --text-secondary: #7a5c52;
          --input-bg: #ffffff;
          --input-placeholder: #a99985;
          --white: #ffffff;
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
            {/* 카드 타이틀: 비밀번호 찾기 */}
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                비밀번호 찾기
              </h2>
              <p className="mt-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                가입 시 사용한 아이디(이메일)를 입력하시면<br/>비밀번호 재설정 메일을 보내드립니다.
              </p>
            </div>

            {/* 비밀번호 찾기 폼 */}
            <form className="space-y-6" onSubmit={handlePasswordReset}>
              <div>
                <label className="sr-only" htmlFor="reset-email">Email / ID</label>
                <input className="input-field" id="reset-email" placeholder="아이디(이메일)" type="email" autoComplete="email" />
              </div>

              <div className="space-y-3 pt-2">
                <button className="primary-button" type="submit"><span>인증메일 발송</span></button>
                <button className="secondary-button" type="button" onClick={handleGoBackToLogin}>로그인으로 돌아가기</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
