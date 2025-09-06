'use client';
import React, { useRef } from "react";
import Head from "next/head";
import { useRouter } from "next/navigation"; // ✅ 추가

export default function GuestSignUpPage() {
  const router = useRouter(); // ✅ 추가

  type DateInputWithPicker = HTMLInputElement & { showPicker?: () => void };

  const dobRef = useRef<HTMLInputElement>(null);
  const openDatePicker = () => {
    const el = dobRef.current as DateInputWithPicker | null;
    if (!el) return;
    if (typeof el.showPicker === "function") el.showPicker();
    else { el.focus(); el.click?.(); }
  };

  // ✅ 뒤로가기 핸들러 (히스토리 없으면 홈으로 폴백)
  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  const cssVars = {
    "--primary-color": "#c5a987",
    "--secondary-color": "#f9f6f3",
    "--background-color": "#fdfaf7",
    "--text-primary": "#181411",
    "--text-secondary": "#a8998c",
    "--border-color": "#e5e0dc",
    "--accent-color": "#d1bfae",
    "--shadow-color": "rgba(197, 169, 135, 0.1)",
    "--input-bg-color": "#f4f0ec",
    "--button-bg-color": "#f4f0ec",
    "--button-border-color": "#e0d9d3",
  } as React.CSSProperties;

  const bgPattern = {
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f4f2f0' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
  } as React.CSSProperties;

  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Pretendard:wght@400;500;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />
      </Head>

      <style jsx>{`
        .ms-guest-signup {
          font-family: "Material Symbols Outlined";
          font-weight: normal;
          font-style: normal;
          font-size: 24px;
          line-height: 1;
          display: inline-block;
          text-transform: none;
          letter-spacing: normal;
          white-space: nowrap;
          direction: ltr;
          font-feature-settings: "liga";
          -webkit-font-feature-settings: "liga";
          -webkit-font-smoothing: antialiased;
          font-variation-settings: "FILL" 0, "wght" 300, "GRAD" 0, "opsz" 24;
        }
        .soft-shadow { box-shadow: 0 2px 6px 0 rgba(197, 169, 135, 0.1); }
        /* ✅ 인풋 래퍼 포커스 글로우 (여백/칸 크기만 추가) */
        .input-container { transition: all 0.3s ease; }
        .input-container:focus-within {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(197, 169, 135, 0.25);
          background: #fff;
        }
      `}</style>

      <div style={cssVars} className="bg-[var(--background-color)] min-h-screen">
        <div className="relative flex min-h-screen flex-col justify-between" style={bgPattern}>
          <main className="flex-grow">
            <header className="flex items-center p-6">
              <button
                type="button"
                aria-label="Go back"
                className="text-[var(--text-primary)]"
                onClick={handleBack}           
              >
                <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"></path>
                </svg>
              </button>
              <h1 className="flex-1 text-center text-xl font-bold pr-6">손님 회원가입</h1>
            </header>

            {/* 📏 여백/칸 크기만 조정 */}
            <div className="p-6 space-y-6 pb-[calc(96px+env(safe-area-inset-bottom))]">
              {/* User ID */}
              <div>
                <label htmlFor="user-id" className="block text-sm font-medium pb-2 text-[var(--text-primary)]">아이디</label>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1 flex items-center bg-[var(--input-bg-color)] rounded-xl border-2 border-transparent input-container">
                    <span className="ms-guest-signup absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none">person</span>
                    <input
                      id="user-id"
                      type="text"
                      placeholder="아이디를 입력하세요."
                      className="w-full h-14 pl-14 pr-4 text-base bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    className="flex-shrink-0 rounded-xl h-14 px-5 bg-[var(--accent-color)] text-white text-sm font-bold hover:bg-opacity-90 transition-colors soft-shadow"
                  >
                    중복확인
                  </button>
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium pb-2 text-[var(--text-primary)]">비밀번호</label>
                <div className="relative flex-1 flex items-center bg-[var(--input-bg-color)] rounded-xl border-2 border-transparent input-container">
                  <span className="ms-guest-signup absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none">lock</span>
                  <input
                    id="password"
                    type="password"
                    placeholder="비밀번호를 입력하세요."
                    className="w-full h-14 pl-14 pr-4 text-base bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium pb-2 text-[var(--text-primary)]">비밀번호 확인</label>
                <div className="relative flex-1 flex items-center bg-[var(--input-bg-color)] rounded-xl border-2 border-transparent input-container">
                  <span className="ms-guest-signup absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none">lock</span>
                  <input
                    id="confirm-password"
                    type="password"
                    placeholder="비밀번호를 다시 입력하세요."
                    className="w-full h-14 pl-14 pr-4 text-base bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none"
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div>
                <label htmlFor="dob" className="block text-sm font-medium pb-2 text-[var(--text-primary)]">생년월일</label>
                <div className="relative flex-1 flex items-center bg-[var(--input-bg-color)] rounded-xl border-2 border-transparent input-container">
                  <span onClick={openDatePicker} className="ms-guest-signup absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] cursor-pointer">calendar_month</span>
                  <input
                    ref={dobRef}
                    id="dob"
                    type="date"
                    placeholder="YYYY-MM-DD"
                    className="w-full h-14 pl-14 pr-4 text-base bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none"
                  />
                </div>
              </div>

              {/* Gender */}
              <div>
                <p className="text-base font-medium pb-3 text-[var(--text-primary)]">성별</p>
                <div className="flex flex-wrap gap-3">
                  {/* Male */}
                  <label className="flex items-center justify-center rounded-xl border border-[var(--button-border-color)] bg-[var(--button-bg-color)] px-4 h-14 text-[var(--text-primary)] has-[:checked]:border-2 has-[:checked]:border-[var(--primary-color)] has-[:checked]:bg-[#fdf5ed] has-[:checked]:text-[var(--primary-color)] cursor-pointer flex-1 text-sm font-medium transition-all duration-200 has-[:checked]:soft-shadow">
                    <input defaultChecked className="sr-only" name="gender" type="radio" value="male" />
                    <span className="ms-guest-signup mr-2">male</span>
                    <span>남성</span>
                  </label>

                  {/* Female */}
                  <label className="flex items-center justify-center rounded-xl border border-[var(--button-border-color)] bg-[var(--button-bg-color)] px-4 h-14 text-[var(--text-primary)] has-[:checked]:border-2 has-[:checked]:border-[var(--primary-color)] has-[:checked]:bg-[#fdf5ed] has-[:checked]:text-[var(--primary-color)] cursor-pointer flex-1 text-sm font-medium transition-all duration-200 has-[:checked]:soft-shadow">
                    <input className="sr-only" name="gender" type="radio" value="female" />
                    <span className="ms-guest-signup mr-2">female</span>
                    <span>여성</span>
                  </label>
                </div>
              </div>
            </div>
          </main>

          {/* Footer: 고정 버튼 (그대로 유지) */}
          <footer className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border-color)] bg-[var(--background-color)]/85 backdrop-blur">
            <div className="max-w-md mx-auto px-6 py-3">
              <button
                type="button"
                className="w-full rounded-xl h-14 px-5 bg-[var(--primary-color)] text-white text-base font-bold hover:bg-opacity-90 transition-colors soft-shadow"
              >
                가입하기
              </button>
              <div className="h-[env(safe-area-inset-bottom)]" />
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}
