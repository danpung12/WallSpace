'use client';
import React, { useRef } from "react";
import Head from "next/head";

/**
 * Guest Sign Up (Self-contained Next.js TSX)
 * - 모든 스타일/폰트 링크를 이 파일 내부에 포함
 * - 아이콘은 페이지 전용 클래스 `.ms-guest-signup` 사용 (다른 페이지와 충돌 없음)
 * - Tailwind CDN은 사용하지 않으며, 프로젝트 Tailwind 설정을 사용합니다.
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
  // 페이지 전용 CSS 변수 (브랜드 색 등)
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
        {/* Pretendard & Material Symbols (page-local) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Pretendard:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
          rel="stylesheet"
        />
      </Head>

      {/* 페이지 전용 스타일 (style-jsx로 컴포넌트 범위에만 적용) */}
      <style jsx>{`
        .ms-guest-signup {
          font-family: "Material Symbols Outlined";
          font-weight: normal;
          font-style: normal;
          font-size: 24px; /* 기본 아이콘 크기 */
          line-height: 1;
          display: inline-block;
          text-transform: none;
          letter-spacing: normal;
          white-space: nowrap;
          direction: ltr;
          -webkit-font-feature-settings: "liga";
          -webkit-font-smoothing: antialiased;
          font-variation-settings: "FILL" 0, "wght" 300, "GRAD" 0, "opsz" 24;
        }
        .soft-shadow {
          box-shadow: 0 2px 6px 0 rgba(197, 169, 135, 0.1);
        }
      `}</style>

      <div
        style={cssVars}
        className="bg-[var(--background-color)] min-h-screen"
      >
        <div
          className="relative flex min-h-screen flex-col justify-between"
          style={bgPattern}
        >
          {/* Main */}
          <main className="flex-grow">
            {/* Header */}
            <header className="flex items-center p-6">
              <button
                type="button"
                aria-label="Go back"
                className="text-[var(--text-primary)]"
              >
                <svg
                  fill="currentColor"
                  height="24"
                  viewBox="0 0 256 256"
                  width="24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"></path>
                </svg>
              </button>
              <h1 className="flex-1 text-center text-xl font-bold pr-6">
                손님 회원가입
              </h1>
            </header>

            {/* Form */}
            <div className="px-6 py-4 space-y-8">
              {/* User ID */}
              <div>
                <label
                  htmlFor="user-id"
                  className="block text-base font-medium pb-2 text-[var(--text-primary)]"
                >
                  아이디
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <span className="ms-guest-signup absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none">
                      person
                    </span>
                    <input
                      id="user-id"
                      type="text"
                      placeholder="아이디를 입력하세요."
                      className="w-full resize-none rounded-xl border border-transparent bg-[var(--input-bg-color)] h-14 pl-14 pr-4 text-base placeholder:text-[var(--text-secondary)] focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] soft-shadow"
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
                <label
                  htmlFor="password"
                  className="block text-base font-medium pb-2 text-[var(--text-primary)]"
                >
                  비밀번호
                </label>
                <div className="relative">
                  <span className="ms-guest-signup absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none">
                    lock
                  </span>
                  <input
                    id="password"
                    type="password"
                    placeholder="비밀번호를 입력하세요."
                    className="w-full resize-none rounded-xl border border-transparent bg-[var(--input-bg-color)] h-14 pl-14 pr-4 text-base placeholder:text-[var(--text-secondary)] focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] soft-shadow"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirm-password"
                  className="block text-base font-medium pb-2 text-[var(--text-primary)]"
                >
                  비밀번호 확인
                </label>
                <div className="relative">
                  <span className="ms-guest-signup absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none">
                    lock
                  </span>
                  <input
                    id="confirm-password"
                    type="password"
                    placeholder="비밀번호를 다시 입력하세요."
                    className="w-full resize-none rounded-xl border border-transparent bg-[var(--input-bg-color)] h-14 pl-14 pr-4 text-base placeholder:text-[var(--text-secondary)] focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] soft-shadow"
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div>
                <label
                  htmlFor="dob"
                  className="block text-base font-medium pb-2 text-[var(--text-primary)]"
                >
                  생년월일
                </label>
                <div className="relative">
                  <span onClick={openDatePicker} className="ms-guest-signup absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] cursor-pointer">calendar_month</span>
                  <input
                  ref={dobRef}
                  id="dob"
                  type="date"
                  placeholder="YYYY-MM-DD"
                  className="w-full resize-none rounded-xl border border-transparent bg-[var(--input-bg-color)] h-14 pl-14 pr-4 text-base placeholder:text-[var(--text-secondary)] focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] soft-shadow"
                />
                </div>
              </div>

              {/* Gender */}
              <div>
                <p className="text-base font-medium pb-3 text-[var(--text-primary)]">
                  성별
                </p>
                <div className="flex flex-wrap gap-3">
                  {/* Male */}
                  <label className="flex items-center justify-center rounded-xl border border-[var(--button-border-color)] bg-[var(--button-bg-color)] px-4 h-12 text-[var(--text-primary)] has-[:checked]:border-2 has-[:checked]:border-[var(--primary-color)] has-[:checked]:bg-[#fdf5ed] has-[:checked]:text-[var(--primary-color)] cursor-pointer flex-1 text-sm font-medium transition-all duration-200 has-[:checked]:soft-shadow">
                    <input defaultChecked className="sr-only" name="gender" type="radio" value="male" />
                    <span className="ms-guest-signup mr-2">male</span>
                    <span>남성</span>
                  </label>

                  {/* Female */}
                  <label className="flex items-center justify-center rounded-xl border border-[var(--button-border-color)] bg-[var(--button-bg-color)] px-4 h-12 text-[var(--text-primary)] has-[:checked]:border-2 has-[:checked]:border-[var(--primary-color)] has-[:checked]:bg-[#fdf5ed] has-[:checked]:text-[var(--primary-color)] cursor-pointer flex-1 text-sm font-medium transition-all duration-200 has-[:checked]:soft-shadow">
                    <input className="sr-only" name="gender" type="radio" value="female" />
                    <span className="ms-guest-signup mr-2">female</span>
                    <span>여성</span>
                  </label>
                </div>
              </div>
            </div>
          </main>

          {/* Footer */}
          <footer className="px-6 pb-17">
            <button
              type="button"
              className="w-full rounded-xl h-14 px-5 bg-[var(--primary-color)] text-white text-base font-bold hover:bg-opacity-90 transition-colors soft-shadow"
            >
              가입하기
            </button>
          </footer>
        </div>
      </div>
    </>
  );
}
