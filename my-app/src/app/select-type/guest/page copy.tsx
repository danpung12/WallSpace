'use client';

import React, { useRef } from "react";

/**
 * Guest Sign Up (Self-contained React TSX) - Polished & Refined
 * - All styles/font links are self-contained.
 * - Icons use a page-specific class `.ms-guest-signup` to prevent conflicts.
 * - Assumes project-level Tailwind CSS setup, no CDN is used.
 */
export default function GuestSignUpPage() {
  type DateInputWithPicker = HTMLInputElement & { showPicker?: () => void };

  const dobRef = useRef<HTMLInputElement>(null);
  const openDatePicker = () => {
    const el = dobRef.current as DateInputWithPicker | null;
    if (!el) return;

    if (typeof el.showPicker === "function") {
      el.showPicker();
    } else {
      el.focus();
      el.click?.();
    }
  };

  // Refined CSS variables for a cohesive design system
  const cssVars = {
    "--primary-color": "#A89587", // Main brand brown
    "--primary-light": "#F5F3F0", // Brand cream for inputs
    "--primary-dark": "#3E352F",  // Dark brown for text
    "--text-primary": "#181411", // Original text primary for compatibility
    "--text-secondary": "#a8998c", // Secondary text color for icons/placeholders
    "--accent-color": "#B8A698", // Softer accent
    "--background-color": "#F4F1EE", // Slightly darker background for contrast
    "--card-background-color": "#FFFFFF", // White card for the form
    "--border-color": "#EAE5E1",
    "--input-bg-color": "#F5F3F0",
    "--button-bg-color": "#F5F3F0",
    "--button-border-color": "#EAE5E1",
    "--shadow-color-light": "rgba(168, 149, 135, 0.08)",
    "--shadow-color-medium": "rgba(168, 149, 135, 0.12)",
    "--glow-color": "rgba(168, 149, 135, 0.25)",
  } as React.CSSProperties;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Pretendard:wght@400;500;700&display=swap');
        /* Corrected font import to match original working version */
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined');

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

            /* ✅ 리거처 켜기 (둘 다 넣어 안정성 확보) */
            font-feature-settings: "liga";
            -webkit-font-feature-settings: "liga";

            /* 가변 폰트 축 설정 */
            font-variation-settings: "FILL" 0, "wght" 300, "GRAD" 0, "opsz" 24;
          }
        .soft-shadow {
          box-shadow: 0 4px 16px 0 var(--shadow-color-light);
        }
        .input-container:focus-within {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px var(--glow-color);
        }
      `}</style>

      <div
        style={cssVars}
        className="bg-[var(--background-color)] min-h-screen font-['Pretendard']"
      >
        <div
          className="max-w-md mx-auto"
        >
          <div className="bg-[var(--card-background-color)] min-h-screen flex flex-col">
              {/* Header */}
              <header className="relative flex items-center justify-center p-4 border-b border-[var(--border-color)]">
                <button
                  type="button"
                  aria-label="Go back"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--primary-dark)] p-2 rounded-full hover:bg-[var(--primary-light)] transition-colors"
                >
                  <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"></path>
                  </svg>
                </button>
                <h1 className="text-lg font-bold text-[var(--primary-dark)]">
                  손님 회원가입
                </h1>
              </header>

              {/* Main Content: Form */}
              <main className="flex-grow p-6 space-y-6 pb-28">
                {/* User ID */}
                <div>
                  <label htmlFor="user-id" className="block text-sm font-medium pb-2 text-[var(--text-primary)]">아이디</label>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1 flex items-center bg-[var(--input-bg-color)] rounded-xl border-2 border-transparent input-container transition-all duration-300">
                      <span className="ms-guest-signup absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none">person</span>
                      <input id="user-id" type="text" placeholder="아이디를 입력하세요." className="w-full h-14 pl-14 pr-4 text-base bg-transparent text-[var(--primary-dark)] placeholder:text-[var(--text-secondary)] focus:outline-none"/>
                    </div>
                    <button type="button" className="flex-shrink-0 rounded-xl h-14 px-5 bg-[var(--accent-color)] text-white text-sm font-bold hover:opacity-90 transition-opacity">중복확인</button>
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium pb-2 text-[var(--text-primary)]">비밀번호</label>
                   <div className="relative flex-1 flex items-center bg-[var(--input-bg-color)] rounded-xl border-2 border-transparent input-container transition-all duration-300">
                      <span className="ms-guest-signup absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none">lock</span>
                      <input id="password" type="password" placeholder="비밀번호를 입력하세요." className="w-full h-14 pl-14 pr-4 text-base bg-transparent text-[var(--primary-dark)] placeholder:text-[var(--text-secondary)] focus:outline-none"/>
                    </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium pb-2 text-[var(--text-primary)]">비밀번호 확인</label>
                  <div className="relative flex-1 flex items-center bg-[var(--input-bg-color)] rounded-xl border-2 border-transparent input-container transition-all duration-300">
                      <span className="ms-guest-signup absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none">lock</span>
                      <input id="confirm-password" type="password" placeholder="비밀번호를 다시 입력하세요." className="w-full h-14 pl-14 pr-4 text-base bg-transparent text-[var(--primary-dark)] placeholder:text-[var(--text-secondary)] focus:outline-none"/>
                    </div>
                </div>

                {/* Date of Birth */}
                <div>
                  <label htmlFor="dob" className="block text-sm font-medium pb-2 text-[var(--text-primary)]">생년월일</label>
                  <div className="relative flex-1 flex items-center bg-[var(--input-bg-color)] rounded-xl border-2 border-transparent input-container transition-all duration-300">
                      <span onClick={openDatePicker} className="ms-guest-signup absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] cursor-pointer">calendar_month</span>
                      <input ref={dobRef} id="dob" type="date" placeholder="YYYY-MM-DD" className="w-full h-14 pl-14 pr-4 text-base bg-transparent text-[var(--primary-dark)] placeholder:text-[var(--text-secondary)] focus:outline-none"/>
                    </div>
                </div>

                {/* Gender */}
                <div>
                  <p className="text-sm font-medium pb-2 text-[var(--text-primary)]">성별</p>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center justify-center rounded-xl border-2 border-[var(--primary-light)] bg-white px-4 h-14 has-[:checked]:bg-[var(--primary-color)] has-[:checked]:text-white has-[:checked]:border-[var(--primary-color)] has-[:checked]:font-bold cursor-pointer text-sm font-medium transition-all duration-200">
                      <input defaultChecked className="sr-only" name="gender" type="radio" value="male" />
                      <span className="ms-guest-signup mr-2 text-[20px]">male</span>
                      <span>남성</span>
                    </label>
                    <label className="flex items-center justify-center rounded-xl border-2 border-[var(--primary-light)] bg-white px-4 h-14 has-[:checked]:bg-[var(--primary-color)] has-[:checked]:text-white has-[:checked]:border-[var(--primary-color)] has-[:checked]:font-bold cursor-pointer text-sm font-medium transition-all duration-200">
                      <input className="sr-only" name="gender" type="radio" value="female" />
                      <span className="ms-guest-signup mr-2 text-[20px]">female</span>
                      <span>여성</span>
                    </label>
                  </div>
                </div>
              </main>

              {/* Sticky Footer */}
              <footer className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white p-4 pt-3 border-t border-[var(--border-color)]">
                <button
                  type="submit"
                  className="w-full rounded-xl h-14 px-5 bg-[var(--primary-color)] text-white text-base font-bold transition-all duration-300 soft-shadow hover:shadow-[0_6px_20px_0_var(--shadow-color-medium)] hover:-translate-y-1"
                >
                  가입하기
                </button>
              </footer>
          </div>
        </div>
      </div>
    </>
  );
}

