'use client';

import Head from 'next/head';
import { useRouter } from 'next/navigation';
import { FormEvent } from 'react';

export default function AddArtworkPage() {
  const router = useRouter();

  const handleBack = () => router.back();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: 업로드 로직
    // 성공 시: router.push('/dashboard');
  };

  return (
    <>
      <Head>
        <title>작품 추가</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div className="relative flex min-h-screen flex-col overflow-x-hidden">
        <style jsx global>{`
          :root {
            --primary-color: #d2b48c;
            --secondary-color: #f5f5f5;
            --background-color: #fdfbf8;
            --text-primary: #3d2c1d;
            --text-secondary: #8c7853;
            --accent-color: #f0ead6;
            /* BottomNav 기본 높이(게이트에서 덮어씀) */
            --bottom-nav-h: 64px;
          }
          html, body { min-height: max(884px, 100dvh); }
          body {
            font-family: 'Pretendard', sans-serif;
            background-color: var(--background-color);
            color: var(--text-primary);
          }
          .button_primary {
            background: var(--primary-color);
            color: #fff;
            padding: 0.75rem 1rem;
            border-radius: 0.5rem;
            font-weight: 700;
            transition: opacity 0.2s ease, filter 0.2s ease;
          }
          .button_primary:hover { filter: brightness(0.95); }
          .input-field {
            width: 100%;
            border-radius: 0.5rem;
            border: 1px solid #d1d5db;
            padding: 0.625rem 0.75rem;
            outline: none;
            background: #fff;
            transition: box-shadow 0.2s ease, border-color 0.2s ease;
          }
          .input-field:focus {
            border-color: var(--primary-color);
            box-shadow: 0 0 0 3px rgb(210 180 140 / 30%);
          }
          .input-label {
            display: block;
            font-size: 0.875rem;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 0.25rem;
          }
        `}</style>

        {/* 헤더 */}
        <header className="sticky top-0 z-10 bg-[var(--background-color)]/80 backdrop-blur-sm">
          <div className="flex items-center justify-between p-4">
            <button
              className="text-[var(--text-primary)] active:scale-95 transition"
              type="button"
              onClick={handleBack}
              aria-label="뒤로 가기"
            >
              <svg
                fill="none"
                height="24"
                width="24"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 19 5 12l7-7" />
                <path d="M19 12H5" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">작품 추가</h1>
            <div className="w-6" />
          </div>
        </header>

        {/* 본문 */}
        <main
          className="flex-1 p-4 space-y-6"
          style={{
            // BottomNav + iOS 하단 안전영역만큼 여백
            paddingBottom: 'calc(var(--bottom-nav-h) + env(safe-area-inset-bottom) + 16px)',
          }}
        >
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* 작품명 */}
            <div>
              <label className="input-label" htmlFor="artwork-name">작품명</label>
              <input id="artwork-name" type="text" className="input-field" placeholder="예: 호수 위의 노을" />
            </div>

            {/* 작품 사진 */}
            <div>
              <label className="input-label">작품 사진</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <svg aria-hidden="true" className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 48 48" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M28 8H12a4 4 0 0 0-4 4v20" />
                    <path d="M40 20v8" />
                    <path d="M40 28v8a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4v-4" />
                    <path d="m40 28-3.172-3.172a4 4 0 0 0-5.656 0L28 28" />
                    <path d="m8 32 9.172-9.172a4 4 0 0 1 5.656 0L28 28l4 4" />
                    <path d="M40 8h8M44 4v8" />
                  </svg>
                  <div className="flex text-sm text-[var(--text-secondary)] justify-center gap-1">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-[var(--primary-color)] hover:opacity-80 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[var(--primary-color)] px-1">
                      <span>파일 업로드</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                    </label>
                    <p>또는 파일을 여기로 끌어다 놓기</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF (최대 10MB)</p>
                </div>
              </div>
            </div>

            {/* 사이즈 */}
            <div>
              <label className="input-label">사이즈</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[var(--text-secondary)]" htmlFor="height">세로</label>
                  <div className="relative mt-1">
                    <input id="height" type="number" className="input-field pr-12" placeholder="0" min="0" />
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <span className="text-gray-500 sm:text-sm">cm</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-[var(--text-secondary)]" htmlFor="width">가로</label>
                  <div className="relative mt-1">
                    <input id="width" type="number" className="input-field pr-12" placeholder="0" min="0" />
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <span className="text-gray-500 sm:text-sm">cm</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 설명 */}
            <div>
              <label className="input-label" htmlFor="description">작품 설명</label>
              <textarea id="description" rows={5} className="input-field" placeholder="갤러리에 전시되는 것처럼 작품을 소개해 주세요…" />
            </div>

            {/* 안내 박스 */}
            <div className="bg-[var(--accent-color)] p-4 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg aria-hidden="true" className="h-5 w-5 text-[var(--text-secondary)]" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M8.22 1.754a.75.75 0 0 1 1.56 0l.313 1.05a4.5 4.5 0 0 1 4.186 3.125l.835 2.503a.75.75 0 1 1-1.48.494l-.835-2.503a3 3 0 0 0-2.79-2.083l-.313-1.05a2.25 2.25 0 0 0-4.329 0l-.313 1.05a3 3 0 0 0-2.79 2.083l-.835 2.503a.75.75 0 1 1-1.48-.494l.835-2.503A4.5 4.5 0 0 1 7.07 3.805l.313-1.05a2.25 2.25 0 0 1 .838-1.001zM11.5 9.5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0V10.25a.75.75 0 0 1 .75-.75z"
                    />
                    <path d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zM1.5 10a8.5 8.5 0 1 1 17 0 8.5 8.5 0 0 1-17 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-[var(--text-primary)]">참고</h3>
                  <div className="mt-2 text-sm text-[var(--text-secondary)]">
                    <p>액자나 케이스가 포함된다면 그 크기까지 포함해 가능한 한 정확한 가로·세로 치수를 입력해 주세요.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 하단 저장 버튼 */}
            <div className="pt-2">
              <button type="submit" className="button_primary w-full text-lg font-semibold py-3">
                작품 저장
              </button>
            </div>
          </form>
        </main>
      </div>
    </>
  );
}
