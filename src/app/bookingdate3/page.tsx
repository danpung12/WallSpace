"use client";

import React from "react";
import Link from "next/link";

/**
 * ArtSpace Cafe - 공간 찾기 (한글화)
 * - Tailwind 기반 정적 페이지
 * - 상단 탭, 추천 공간 가로 스크롤, 전체 공간 리스트, 하단 탭바
 * - 색상 팔레트/토큰은 글로벌 CSS 변수로 정의
 */
export default function FindSpacePage() {
  return (
    <div className="antialiased">
      <div className="relative flex size-full min-h-screen flex-col justify-between overflow-x-hidden">
        <div className="flex-grow">
          {/* HEADER */}
          <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center p-4">
              <button className="text-[var(--text-primary)]" aria-label="뒤로 가기">
                <svg
                  fill="currentColor"
                  width="24"
                  height="24"
                  viewBox="0 0 256 256"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
                </svg>
              </button>
              <h1 className="text-lg font-bold text-center flex-1 pr-6">공간 찾기</h1>
            </div>
            <nav className="border-b border-[var(--brand-brown-lighter)] px-4">
              <div className="flex justify-between items-center -mb-px">
                <a className="flex-1 text-center py-3 text-sm font-semibold active-tab" href="#">
                  추천
                </a>
                <a className="flex-1 text-center py-3 text-sm font-semibold inactive-tab" href="#">
                  전체 공간
                </a>
                <a className="flex-1 text-center py-3 text-sm font-semibold inactive-tab" href="#">
                  지도 보기
                </a>
              </div>
            </nav>
          </header>

          {/* MAIN */}
          <main className="pb-28">
            {/* 추천 공간 */}
            <section className="pt-6">
              <h2 className="text-xl font-bold px-4 mb-4">추천 공간</h2>
              <div className="flex overflow-x-auto px-4 gap-4 pb-2 [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {/* 카드 1 */}
                <div className="flex flex-col gap-3 rounded-lg min-w-[180px] flex-shrink-0">
                  <div
                    className="w-full h-44 bg-center bg-no-repeat bg-cover rounded-xl"
                    style={{
                      backgroundImage:
                        'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDJTt5ZFwI1-bnOPgYP1YprPp1i6waeofBVh7iPRnhZ4KTqmyNVWkPIvYrCDOMoi_8Nr8cruvBiNxcYfUJni-eOuBsZOOqr5BcdrIbrx9ioWmwaYZTuAhopV87HCWOEZ1E6I2AoZWcuxOjTKumLOlLzOOGMMqTZDSow233a3oFQmCWJrP85PVfMY3XRy4Ca1flYD9NHIgYr3rxbLaY9hXw4iuLYUSCGLNVD-Bo_EBeBCgtmqepGsbAPmYNZM-46-kfw_hN01JX0B8Uh")',
                    }}
                  />
                  <div>
                    <h3 className="font-semibold text-base">코지 코너 카페</h3>
                    <p className="text-[var(--text-secondary)] text-sm">소규모 전시에 딱 좋아요</p>
                  </div>
                </div>
                {/* 카드 2 */}
                <div className="flex flex-col gap-3 rounded-lg min-w-[180px] flex-shrink-0">
                  <div
                    className="w-full h-44 bg-center bg-no-repeat bg-cover rounded-xl"
                    style={{
                      backgroundImage:
                        'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDCxUeMxF3zjzWc0X2uQIU44hlWFoAYmywA0U4DXpfOxM6x36ejDV0xpI4ND2V5dIg5lVlGreyZEWwiqhSOaksjzUEPkeRh3CXFFl66cXW62oeyHb8gOFphhxs9lyf4dxYtHqfLY26cZjVTF_h6_JEeAuqY3oJBsH5KRXZx_No5vW6qEheVPat6n3DwED7G-LDIMNz_jbvQIDFD0F39f6Ef3KNIc9WqaMr5xB-vfCfMBc0EkdMo7FimSnI9TEJjs1nfu-Gz734U248T")',
                    }}
                  />
                  <div>
                    <h3 className="font-semibold text-base">아티산 갤러리</h3>
                    <p className="text-[var(--text-secondary)] text-sm">다양한 작품 전시에 적합</p>
                  </div>
                </div>
                {/* 카드 3 */}
                <div className="flex flex-col gap-3 rounded-lg min-w-[180px] flex-shrink-0">
                  <div
                    className="w-full h-44 bg-center bg-no-repeat bg-cover rounded-xl"
                    style={{
                      backgroundImage:
                        'url("https://lh3.googleusercontent.com/aida-public/AB6AXuA-7cCbFTaJGSzpqeToW3WMo0YoN1ZzmZLoujsG4Ap3uWbF5wPNyp-PDblBJ8HrhMG2V75FM8oGnJVwWJBCI1njVSVTOyoTAjY7W3ywbBeMY5DvbdyWAYJlUsOE2BAnQNnHBMxY92ouK2gYcmKin0tNb7N4e4go5qfuODuFHWXSnDgxAs_m6RzPEsoouFPhR8YaNaGnVi0nx-fWY7D37-e9MjPWT9bPYVpPQRnQywPoJ9tBD67zGJA8Plzfrrq-ZrxA-Mk-VlG_sn3n")',
                    }}
                  />
                  <div>
                    <h3 className="font-semibold text-base">크리에이티브 허브</h3>
                    <p className="text-[var(--text-secondary)] text-sm">다채로운 예술을 위한 공간</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 전체 공간 */}
            <section className="pt-6">
              <h2 className="text-xl font-bold px-4 mb-4">전체 공간</h2>

              {/* 필터 칩 */}
              <div className="flex gap-3 px-4 pb-4 overflow-x-auto [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <button className="px-4 py-2 text-sm font-medium rounded-full shrink-0 active-filter">
                  갤러리
                </button>
                <button className="px-4 py-2 text-sm font-medium rounded-full shrink-0 inactive-filter">
                  카페
                </button>
                <button className="px-4 py-2 text-sm font-medium rounded-full shrink-0 inactive-filter">
                  복합공간
                </button>
              </div>

              {/* 리스트 */}
              <div className="flex flex-col gap-2 px-2">
                <Link
                  href="#"
                  className="flex items-center gap-4 bg-white p-2 rounded-lg hover:bg-[var(--brand-brown-lighter)] transition-colors duration-200"
                >
                  <div
                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-lg size-16 shrink-0"
                    style={{
                      backgroundImage:
                        'url("https://lh3.googleusercontent.com/aida-public/AB6AXuA2L6c-bM-PZfRo4QmyBxQWSNnEInQl5bnwd8_JEDDtCStdPn_3JCtai78gIbgQdYJIS5N2SvISWNR3QlxY77T2UGS5rL_-JKjEXRUxVUJgkyM9tGmQxchJtv0SdmGvmkFgV9WoW2XxsaS4L-u8KqhWitSXufXEQMpbLJBIOu71lJFkoJFsFF4pSYIIWdS-24cZk0dfSP4sPYUExyZLb2YjtFPc36a4UWioyyEFHa-VgeTo8WiiqQYS0BzZriB8L9woqrNSfnHOJ3M4")',
                    }}
                    aria-hidden
                  />
                  <div className="flex-grow">
                    <h3 className="font-semibold line-clamp-1">갤러리 원</h3>
                    <p className="text-[var(--text-secondary)] text-sm line-clamp-1">
                      어딘타운 메인로 123
                    </p>
                  </div>
                  <div className="text-[var(--text-secondary)]" aria-hidden>
                    <svg
                      fill="currentColor"
                      width="20"
                      height="20"
                      viewBox="0 0 256 256"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z" />
                    </svg>
                  </div>
                </Link>

                <Link
                  href="#"
                  className="flex items-center gap-4 bg-white p-2 rounded-lg hover:bg-[var(--brand-brown-lighter)] transition-colors duration-200"
                >
                  <div
                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-lg size-16 shrink-0"
                    style={{
                      backgroundImage:
                        'url("https://lh3.googleusercontent.com/aida-public/AB6AXuC78M5q07WmrQJP9BUaqZZ5DPM4KSV6aIEaBeuD0Uf8fbKqdMfNzNR33DDqVGfF2kB6ylCvPJIes-hU9CN1oqDw9Fe02AxqgfKBnqIuDiKkeI4RmdMCauz_69ZjmSTbwZBV86a2rYjZVSdRySFsHs5hLGWL8tnb8-fAUUk3oytBuSGr-5S8qimnJtS4km0X0wJOJTCYVLgWyZSfPYnP_v-KnQ2oERdob5XKB7OPLut6k5PWhrqaCIHkpKhhHYvd1RCiA6PlNndh1dA9")',
                    }}
                    aria-hidden
                  />
                  <div className="flex-grow">
                    <h3 className="font-semibold line-clamp-1">카페 투</h3>
                    <p className="text-[var(--text-secondary)] text-sm line-clamp-1">
                      어딘타운 오크가 456
                    </p>
                  </div>
                  <div className="text-[var(--text-secondary)]" aria-hidden>
                    <svg
                      fill="currentColor"
                      width="20"
                      height="20"
                      viewBox="0 0 256 256"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z" />
                    </svg>
                  </div>
                </Link>

                <Link
                  href="#"
                  className="flex items-center gap-4 bg-white p-2 rounded-lg hover:bg-[var(--brand-brown-lighter)] transition-colors duration-200"
                >
                  <div
                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-lg size-16 shrink-0"
                    style={{
                      backgroundImage:
                        'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBtrxt1U7ABG7vsjay2L7zZF39rb4-zA3tE3zaxPSgMiJLvDa7Ttm3bnhSa3apDvVeYKzORP3PFNJZHOA8LCaz4fp0gpmit84CQqt6vG1Kj_6QjAK-z0WDjyfYzj7roFO1HRiLEbS6tcsZVcJZ2C6RrGPW3vA0e-i8BlbQeyU2vaAP3T3V0IQWBjjN0ecK7CX5nb07UNmBfqud9mUcrGqDJS9xNayUX6uF0jKeIDLVWYW2yxjAfV18HOPB8aEIecMglDp_jRFXqCjq4")',
                    }}
                    aria-hidden
                  />
                  <div className="flex-grow">
                    <h3 className="font-semibold line-clamp-1">복합공간 쓰리</h3>
                    <p className="text-[var(--text-secondary)] text-sm line-clamp-1">
                      어딘타운 파인길 789
                    </p>
                  </div>
                  <div className="text-[var(--text-secondary)]" aria-hidden>
                    <svg
                      fill="currentColor"
                      width="20"
                      height="20"
                      viewBox="0 0 256 256"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z" />
                    </svg>
                  </div>
                </Link>
              </div>
            </section>
          </main>
        </div>

        {/* FOOTER NAV */}
        <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-[var(--brand-brown-lighter)]">
          <div className="flex justify-around items-center pt-2 pb-safe-bottom">
            <Link
              href="#"
              className="flex flex-col items-center justify-center gap-1 text-[var(--text-secondary)]"
            >
              <svg
                fill="currentColor"
                width="24"
                height="24"
                viewBox="0 0 256 256"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M218.83,103.77l-80-75.48a1.14,1.14,0,0,1-.11-.11,16,16,0,0,0-21.53,0l-.11.11L37.17,103.77A16,16,0,0,0,32,115.55V208a16,16,0,0,0,16,16H96a16,16,0,0,0,16-16V160h32v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V115.55A16,16,0,0,0,218.83,103.77ZM208,208H160V160a16,16,0,0,0-16-16H112a16,16,0,0,0-16,16v48H48V115.55l.11-.1L128,40l79.9,75.43.11.1Z" />
              </svg>
              <p className="text-xs font-medium">홈</p>
            </Link>
            <Link
              href="#"
              className="flex flex-col items-center justify-center gap-1 text-[var(--text-primary)]"
            >
              <svg
                fill="currentColor"
                width="24"
                height="24"
                viewBox="0 0 256 256"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" />
              </svg>
              <p className="text-xs font-medium">검색</p>
            </Link>
            <Link
              href="#"
              className="flex flex-col items-center justify-center gap-1 text-[var(--text-secondary)]"
            >
              <svg
                fill="currentColor"
                width="24"
                height="24"
                viewBox="0 0 256 256"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M184,32H72A16,16,0,0,0,56,48V224a8,8,0,0,0,12.24,6.78L128,193.43l59.77,37.35A8,8,0,0,0,200,224V48A16,16,0,0,0,184,32Zm0,16V161.57l-51.77-32.35a8,8,0,0,0-8.48,0L72,161.56V48Z" />
              </svg>
              <p className="text-xs font-medium">예약</p>
            </Link>
            <Link
              href="#"
              className="flex flex-col items-center justify-center gap-1 text-[var(--text-secondary)]"
            >
              <svg
                fill="currentColor"
                width="24"
                height="24"
                viewBox="0 0 256 256"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z" />
              </svg>
              <p className="text-xs font-medium">프로필</p>
            </Link>
          </div>
          <div className="pb-safe-bottom" />
        </footer>
      </div>

      {/* 글로벌 스타일 (팔레트 & 유틸) */}
      <style jsx global>{`
        :root {
          --brand-brown-lightest: #f9f7f5;
          --brand-brown-lighter: #efeae6;
          --brand-brown-light: #d9cfc7;
          --brand-brown-base: #c6ad9a;
          --brand-brown-dark: #8c7a6b;
          --brand-brown-darker: #594d43;
          --brand-brown-darkest: #332c26;
          --text-primary: #1c1b1a;
          --text-secondary: #736a62;
        }
        body {
          font-family: "Pretendard", sans-serif;
          background-color: var(--brand-brown-lightest);
          color: var(--text-primary);
          min-height: max(884px, 100dvh);
        }
        .active-tab {
          color: var(--text-primary);
          border-bottom: 2px solid var(--text-primary);
        }
        .inactive-tab {
          color: var(--text-secondary);
          border-bottom: 2px solid transparent;
        }
        .active-filter {
          background-color: var(--brand-brown-base);
          color: #fff;
        }
        .inactive-filter {
          background-color: var(--brand-brown-lighter);
          color: var(--text-primary);
        }
      `}</style>
    </div>
  );
}
