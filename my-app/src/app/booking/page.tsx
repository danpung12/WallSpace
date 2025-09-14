'use client';

import Head from 'next/head';
import BottomNav from '../components/BottomNav';
import Link from 'next/link';

export default function BookingConfirmation() {
  return (
    <>
      <Head>
        <title>Booking Confirmation</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <div className="relative min-h-screen font-[Pretendard] bg-[#FDFBF7] text-[#3A2E27]">
        <header className="flex items-center justify-between p-4">
          <button className="text-[#3A2E27]">
            <svg fill="currentColor" height="24" width="24" viewBox="0 0 256 256">
              <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-center flex-1 text-[#3A2E27]">예약 확인</h1>
          <div className="w-6"></div>
        </header>

        <main className="px-6 py-8 pb-0 text-center">
          <div className="p-8 shadow-sm bg-white/50 rounded-2xl backdrop-blur-md">
            <div className="inline-block p-3 mb-6 bg-green-100 rounded-full">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[#3A2E27] mb-3">예약이 확정되었습니다</h2>
            <p className="text-base text-[#705D51] mb-8">
              곧 카페에서 당신의 작품을 만나보세요.
            </p>
            <div className="space-y-5 text-left border-t border-[#EAE3D9] pt-8">
              <div className="flex items-center justify-between">
                <p className="text-base font-medium text-[#705D51]">예약 장소</p>
                <p className="text-base font-bold text-[#3A2E27]">Wall Space 1</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-base font-medium text-[#705D51]">일시</p>
                <p className="text-base font-bold text-[#3A2E27]">2025년 8월 15일 ~ 22일</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-base font-medium text-[#705D51]">지불 금액</p>
                <p className="text-base font-bold text-[#3A2E27]">₩ 100,000</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-base font-medium text-[#705D51]">예약 ID #</p>
                <p className="text-base font-bold text-[#3A2E27]">BK123456789</p>
              </div>
            </div>
          </div>

          {/* 버튼 그룹 아래쪽 완전 붙이기! */}
          <div className="pb-25 mt-8 mb-0 space-y-3">
            <Link href="/bookingday" passHref>
              <button
                className="block w-full bg-[#D2B48C] text-white py-3 px-6 rounded-lg text-base font-bold shadow-md hover:bg-opacity-90 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#D2B48C] focus:ring-opacity-50 mb-3"
              >
                내 예약 보기
              </button>
            </Link>
            <Link href="/bookingdate" passHref>
              <button
                className="block w-full bg-[#EAE3D9] text-[#3A2E27] py-3 px-6 rounded-lg text-base font-bold hover:bg-opacity-80 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#D2B48C] focus:ring-opacity-50"
              >
                돌아가기
              </button>
            </Link>
          </div>
        </main>

        {/* 고정 네비게이션 */}
        <BottomNav />
      </div>
    </>
  );
}
