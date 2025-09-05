'use client';

import Head from "next/head";
import Link from "next/link";

export default function SelectUserType() {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Select User Type</title>
        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Pretendard:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </Head>

      {/* Local page styles (kept from original) */}
      <style jsx global>{`
        :root {
          --brand-brown: #A89587;
          --brand-cream: #F5F3F0;
          --brand-dark-brown: #3E352F;
        }
        body {
          font-family: 'Pretendard', sans-serif;
          background-color: var(--brand-cream);
          min-height: max(884px, 100dvh);
        }
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 48;
        }
      `}</style>

      <div className="bg-[var(--brand-cream)] min-h-screen h-[100vh]">
        <div className="flex flex-col h-screen p-4">
          <header className="relative flex-shrink-0 text-center py-8">
            <div className="absolute left-0 top-1/2 -translate-y-1/2">
              <button
                type="button"
                aria-label="Go back"
                className="text-[var(--brand-dark-brown)]"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15 19l-7-7 7-7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  ></path>
                </svg>
              </button>
            </div>
            <h2 className="text-xl font-bold text-[var(--brand-dark-brown)] tracking-wider">
              가입 유형 선택
            </h2>
          </header>

          <div className="flex flex-col flex-grow justify-center space-y-6">
            <Link
              href="/select-type/guest"
              className="flex-grow flex flex-col items-center justify-center p-6 bg-[var(--brand-brown)] text-white rounded-3xl shadow-lg shadow-black/10 hover:shadow-xl hover:brightness-105 hover:scale-[1.02] transition-all duration-300 ease-in-out"
              style={{ maxHeight: "40vh" }}
            >
              <div className="text-center">
                <span className="material-symbols-outlined leading-none !text-[clamp(64px,12vw,112px)] mb-4">palette</span>
                <h1 className="text-2xl font-bold">예술가 / 사장님</h1>
                <p className="text-base opacity-80 mt-1">공간을 예약하거나 관리하세요.</p>
              </div>
            </Link>

            <Link
              href="/select-type/guest"
              className="flex-grow flex flex-col items-center justify-center p-6 bg-white text-[var(--brand-dark-brown)] rounded-3xl shadow-lg shadow-black/10 hover:shadow-xl hover:brightness-105 hover:scale-[1.02] transition-all duration-300 ease-in-out"
              style={{ maxHeight: "40vh" }}
            >
              <div className="text-center">
                <span className="material-symbols-outlined leading-none !text-[clamp(64px,12vw,112px)] mb-4">person</span>
                <h1 className="text-2xl font-bold">손님</h1>
                <p className="text-base opacity-80 mt-1">
                  예술 작품을 둘러보고 카페를 즐겨보세요.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
