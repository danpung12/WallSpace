"use client";

import Head from 'next/head';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '../components/BottomNav';

export default function EditProfile() {
  const router = useRouter();
  const [form, setForm] = useState({
    nickname: 'Selena',
    name: '홍길동',
    email: 'selena@example.com',
    phone: '010-1234-5678',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const readOnlyInputStyle: React.CSSProperties = {
    border: '1px solid #E7DDC8',
    background: '#F5EFE4',
    color: '#8C7853',
    cursor: 'not-allowed',
  };

  return (
    <>
      <Head>
        <title>내 정보 수정</title>
        <link
          href="https://fonts.googleapis.com/css2?family=Pretendard:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      {/* 이 페이지 범위에서 모든 애니메이션/트랜지션 비활성화 */}
      <style jsx global>{`
        #app-container .animate-fadeUp,
        #app-container .animate-fadeIn,
        #app-container .animate-scaleIn,
        #app-container .animate-slideDown {
          animation: none !important;
        }
        /* tailwind transition-* 류도 비활성화 */
        #app-container [class*="transition"] {
          transition: none !important;
        }
      `}</style>

      <div
        id="app-container"
        className="relative flex flex-col min-h-screen overflow-x-hidden"
        style={{
          fontFamily: "'Pretendard', sans-serif",
          backgroundColor: '#FDFBF8',
          color: '#3D2C1D',
          minHeight: 'max(884px, 100dvh)',
        }}
      >
        {/* Header */}
        <header
          className="sticky top-0 z-10"
          style={{ background: '#FDFBF8CC', backdropFilter: 'blur(4px)' }}
        >
          <div className="flex items-center justify-between p-4">
            <button style={{ color: '#3D2C1D' }} onClick={() => router.back()}>
              <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24">
                <path d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z"></path>
              </svg>
            </button>
            <h1 className="text-xl font-bold" style={{ color: '#3D2C1D' }}>내 정보 수정</h1>
            <div className="w-6" />
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 px-4 py-4 space-y-6">
          {/* 프로필 이미지 */}
          <section className="text-center">
            <div className="relative inline-block">
              <img
                alt="User profile picture"
                className="object-cover w-24 h-24 rounded-full"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDvM8BeQVRtX-JPgzmA6JCZ0Sx8m-Ver8hiSd4I9V_JbwzHPoychRH2Ok3qqU_bmgZPSQAn_047aMc8nCL1qI5qDcnERJC5Hqq2YwObo_LB9UrvnU4GTgYEp5aGCssWwnVl91-JOk2Nx9SY2vvbx16_bIBhG1DjRKgVPd3pt3GOOA1vAWxA8oGWfQy_pK3stg40qzQ4UZ1g0ywp9k6U8BQBA4cLy-blz0639c4a5y7sWmirFsfQByuYFDQAvMn-duibl6-hECUU606Z"
              />
              <button
                className="absolute bottom-0 right-0"
                style={{
                  background: '#D2B48C',
                  borderRadius: '9999px',
                  padding: '6px',
                }}
              >
                <svg className="w-4 h-4" fill="white" viewBox="0 0 256 256">
                  <path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,164.12V208a16,16,0,0,0,16,16H92.12A15.86,15.86,0,0,0,104.24,219.31L227.31,96a16,16,0,0,0,0-22.63ZM92.12,208H48V164.12L152,60.12l43.89,43.89ZM161.37,94.63l-43.89-43.89L136,32.12,180,76.11Zm30.26-30.25-11.31-11.32,11.31-11.31,11.32,11.31Z"></path>
                </svg>
              </button>
            </div>
          </section>

          {/* 폼 */}
          <form className="max-w-md px-3 mx-auto space-y-4">
            <section className="py-4 space-y-4 shadow-sm px-7 rounded-xl" style={{ background: '#fff' }}>
              {/* 닉네임 */}
              <div>
                <label className="block mb-2 text-sm font-medium" htmlFor="nickname" style={{ color: '#A08C6E' }}>
                  필명
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg className="w-5 h-5" fill="none" stroke="#A08C6E" viewBox="0 0 24 24">
                      <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                    </svg>
                  </span>
                  <input
                    className="w-full py-2 pl-10 pr-3 text-sm rounded-lg placeholder:text-sm"
                    style={{
                      border: '1px solid #F0EAD6',
                      background: '#FAF6F0',
                      outline: 'none',
                      color: '#3D2C1D',
                    }}
                    id="nickname"
                    type="text"
                    value={form.nickname}
                    onChange={handleChange}
                    placeholder="닉네임을 입력해주세요"
                  />
                </div>
              </div>

              {/* 이름 (읽기 전용) */}
              <div>
                <label className="block mb-2 text-sm font-medium flex items-center gap-2" htmlFor="name" style={{ color: '#A08C6E' }}>
                  이름
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg className="w-5 h-5" fill="none" stroke="#A08C6E" viewBox="0 0 24 24">
                      <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                    </svg>
                  </span>
                  <input
                    className="w-full py-2 pl-10 pr-3 text-sm rounded-lg placeholder:text-sm cursor-not-allowed select-none"
                    style={readOnlyInputStyle}
                    id="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="성함을 입력해주세요"
                    disabled
                    readOnly
                    aria-disabled="true"
                    tabIndex={-1}
                    title="이름은 변경할 수 없습니다."
                  />
                </div>
              </div>

              {/* 이메일 */}
              <div>
                <label className="block mb-2 text-sm font-medium" htmlFor="email" style={{ color: '#A08C6E' }}>
                  이메일 주소
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg className="w-5 h-5" fill="none" stroke="#A08C6E" viewBox="0 0 24 24">
                      <path d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                    </svg>
                  </span>
                  <input
                    className="w-full py-2 pl-10 pr-3 text-sm rounded-lg placeholder:text-sm"
                    style={{
                      border: '1px solid #F0EAD6',
                      background: '#FAF6F0',
                      outline: 'none',
                      color: '#3D2C1D',
                    }}
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="이메일 주소를 입력해주세요"
                  />
                </div>
              </div>

              {/* 전화번호 (읽기 전용) */}
              <div>
                <label className="block mb-2 text-sm font-medium flex items-center gap-2" htmlFor="phone" style={{ color: '#A08C6E' }}>
                  전화번호
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg className="w-5 h-5" fill="none" stroke="#A08C6E" viewBox="0 0 24 24">
                      <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                    </svg>
                  </span>
                  <input
                    className="w-full py-2 pl-10 pr-3 text-sm rounded-lg placeholder:text-sm cursor-not-allowed select-none"
                    style={readOnlyInputStyle}
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="전화번호를 입력해주세요"
                    disabled
                    readOnly
                    aria-disabled="true"
                    tabIndex={-1}
                    title="전화번호는 변경할 수 없습니다."
                  />
                </div>
              </div>
            </section>

            {/* 버튼 */}
            <div className="px-2 pt-2 space-y-3">
              <button
                type="submit"
                className="flex items-center justify-center w-full gap-2 font-semibold"
                style={{
                  background: '#D2B48C',
                  color: '#fff',
                  borderRadius: '12px',
                  padding: '12px 24px',
                  fontWeight: 600,
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
                <span>저장하기</span>
              </button>
              <button
                type="button"
                className="flex items-center justify-center w-full gap-2 font-semibold text-center"
                style={{
                  background: '#EAE3D9',
                  color: '#8C7853',
                  borderRadius: '12px',
                  padding: '12px 24px',
                  fontWeight: 600,
                }}
                onClick={() => router.push('/profile')}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
                <span>취소</span>
              </button>
            </div>
          </form>
        </main>

        {/* Footer */}
        <BottomNav />
      </div>
    </>
  );
}
