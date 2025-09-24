'use client';

// Note: Removed 'next/head' and 'next/link' imports as they are specific to a Next.js environment
// and were causing compilation errors. Standard HTML elements will be used instead.

export default function SelectUserType() {
  const handleBack = () => {
    try {
      if (typeof window !== 'undefined') {
        // If there's a previous entry, go back; otherwise, fall back to home
        if (window.history.length > 1) {
          window.history.back();
        } else {
          window.location.href = '/';
        }
      }
    } catch (e) {
      // As a final fallback, hard navigate to home
      if (typeof window !== 'undefined') window.location.href = '/';
    }
  };

  return (
    <>
      {/* The <head> section is typically managed outside of a single React component.
        For this component to be portable, meta and font links should be in the main HTML file.
        I'm keeping the global styles here for component encapsulation.
      */}
      <style>{`
        :root {
          --brand-brown: #A89587;
          --brand-cream: #F5F3F0;
          --brand-dark-brown: #3E352F;
        }
        /* It's good practice to ensure the font is loaded in the main HTML file */
        @import url('https://fonts.googleapis.com/css2?family=Pretendard:wght@400;500;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');
        
        body {
          font-family: 'Pretendard', sans-serif;
          background-color: var(--brand-cream);
        }
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 48;
        }
        /* Focus visibility for keyboards */
        .focus-ring:focus { outline: 2px solid var(--brand-brown); outline-offset: 2px; }
      `}</style>

      <div className="bg-[var(--brand-cream)] min-h-screen flex flex-col">
        <div className="w-full max-w-md mx-auto flex flex-col flex-grow p-4">
          <header className="relative flex-shrink-0 text-center py-8">
            <div className="absolute left-0 top-1/2 -translate-y-1/2">
              <button
                type="button"
                onClick={handleBack}
                aria-label="Go back"
                title="뒤로 가기"
                className="focus-ring text-[var(--brand-dark-brown)] p-2 rounded-full hover:bg-black/5 transition-colors"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M15 19l-7-7 7-7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  ></path>
                </svg>
                <span className="sr-only">뒤로 가기</span>
              </button>
            </div>
            <h1 className="text-xl font-bold text-[var(--brand-dark-brown)] tracking-tight">
              가입 유형 선택
            </h1>
          </header>

          <main className="flex flex-col flex-grow justify-center gap-6">
            {/* Artist/Owner Card - Replaced Next's <Link> with a standard <a> tag */}
            <a
              href="/select-type/artist"
              className="group flex flex-grow flex-col items-center justify-center p-8 bg-gradient-to-br from-[var(--brand-brown)] to-[#9a8679] text-white rounded-3xl shadow-lg shadow-black/15 border border-white/20 transform hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 ease-in-out no-underline"
            >
              <div className="text-center">
                <div className="mb-5 inline-block bg-white/20 rounded-full p-4 transform group-hover:scale-110 transition-transform duration-300 ease-in-out">
                  <span className="material-symbols-outlined leading-none !text-6xl">palette</span>
                </div>
                <h2 className="text-2xl font-bold">예술가 / 사장님</h2>
                <p className="text-base opacity-80 mt-1">공간을 등록하고 작품을 알려보세요.</p>
              </div>
            </a>

            {/* Guest Card - Replaced Next's <Link> with a standard <a> tag */}
            <a
              href="/select-type/guest"
              className="group flex flex-grow flex-col items-center justify-center p-8 bg-white/90 backdrop-blur-sm text-[var(--brand-dark-brown)] rounded-3xl shadow-lg shadow-black/15 border border-[var(--brand-brown)]/20 transform hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 ease-in-out no-underline"
            >
              <div className="text-center">
                <div className="mb-5 inline-block bg-[var(--brand-cream)] rounded-full p-4 transform group-hover:scale-110 transition-transform duration-300 ease-in-out">
                    <span className="material-symbols-outlined leading-none !text-6xl">person</span>
                </div>
                <h2 className="text-2xl font-bold">손님</h2>
                <p className="text-base opacity-70 mt-1">
                  예술 작품을 둘러보고 카페를 즐겨보세요.
                </p>
              </div>
            </a>
          </main>
        </div>
      </div>
    </>
  );
}
