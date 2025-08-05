'use client';

import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <>
      <Head>
        <title>WallSpace - Sign Up / Login</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Pretendard:wght@400;500;700&display=swap" rel="stylesheet" />
      </Head>

      <main className="bg-[#FAF8F6] min-h-screen flex flex-col justify-center px-6 font-[Pretendard]">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-[#3D2B1F] tracking-tight">WallSpace</h1>
          <p className="text-base text-[#7A5C52] mt-2">빈 공간을 당신의 작품으로 채우세요</p>
        </div>

        <div className="p-8 shadow-lg bg-white/50 backdrop-blur-sm rounded-2xl">
          <div className="flex mb-6">
            <button
              className={`flex-1 pb-2 border-b-2 font-semibold ${
                isLogin
                  ? 'border-[#C19A6B] text-[#3D2B1F]'
                  : 'border-transparent text-[#7A5C52]'
              }`}
              onClick={() => setIsLogin(true)}
            >
              로그인
            </button>
            <button
              className={`flex-1 pb-2 border-b-2 font-semibold ${
                !isLogin
                  ? 'border-[#C19A6B] text-[#3D2B1F]'
                  : 'border-transparent text-[#7A5C52]'
              }`}
              onClick={() => setIsLogin(false)}
            >
              회원가입
            </button>
          </div>

          {isLogin ? (
            <form className="space-y-6">
              <input
                type="email"
                placeholder="이메일"
                className="w-full h-14 bg-white rounded-lg text-[#3D2B1F] placeholder-[#A99985] px-4 text-base border border-transparent focus:outline-none focus:ring-2 focus:ring-[#C19A6B] shadow"
              />
              <input
                type="password"
                placeholder="비밀번호"
                className="w-full h-14 bg-white rounded-lg text-[#3D2B1F] placeholder-[#A99985] px-4 text-base border border-transparent focus:outline-none focus:ring-2 focus:ring-[#C19A6B] shadow"
              />
            <div className="mt-[-4] mb-4 text-right">
            <a className="text-sm text-[#7A5C52] hover:text-[#C19A6B]" href="#">
                비밀번호를 잊으셨나요?
            </a>
            </div>
            <Link href="/profile" passHref>
              <button
                
                className="w-full h-14 bg-[#C19A6B] text-white font-bold text-base rounded-lg flex items-center justify-center shadow hover:bg-opacity-90 transition"
              >
                로그인
              </button>
              </Link>
            </form>
          ) : (
            <form className="space-y-6">
              <input
                type="text"
                placeholder="이름"
                className="w-full h-14 bg-white rounded-lg text-[#3D2B1F] placeholder-[#A99985] px-4 text-base border border-transparent focus:outline-none focus:ring-2 focus:ring-[#C19A6B] shadow"
              />
              <input
                type="email"
                placeholder="이메일"
                className="w-full h-14 bg-white rounded-lg text-[#3D2B1F] placeholder-[#A99985] px-4 text-base border border-transparent focus:outline-none focus:ring-2 focus:ring-[#C19A6B] shadow"
              />
              <input
                type="password"
                placeholder="비밀번호"
                className="w-full h-14 bg-white rounded-lg text-[#3D2B1F] placeholder-[#A99985] px-4 text-base border border-transparent focus:outline-none focus:ring-2 focus:ring-[#C19A6B] shadow"
              />
            <input
                type="password"
                placeholder="비밀번호 확인"
                className="w-full h-14 bg-white rounded-lg text-[#3D2B1F] placeholder-[#A99985] px-4 text-base border border-transparent focus:outline-none focus:ring-2 focus:ring-[#C19A6B] shadow"
              />
              <button
                type="submit"
                className="w-full h-14 bg-[#C19A6B] text-white font-bold text-base rounded-lg flex items-center justify-center shadow hover:bg-opacity-90 transition"
              >
                회원가입
              </button>
            </form>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-[#7A5C52]">
            {isLogin ? (
              <>
                계정이 없으신가요?{' '}
                <button
                  className="text-[#C19A6B] underline text-sm font-medium"
                  onClick={() => setIsLogin(false)}
                >
                  가입하기
                </button>
              </>
            ) : (
              <>
                 이미 계정이 있으신가요?{' '}
                <button
                  className="text-[#C19A6B] underline text-sm font-medium"
                  onClick={() => setIsLogin(true)}
                >
                  로그인
                </button>
              </>
            )}
          </p>
        </div>
      </main>
    </>
  );
}
