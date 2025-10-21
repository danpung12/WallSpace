'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface BookingSuccessProps {
  isModal?: boolean;
  onClose?: () => void;
  onViewBooking?: () => void;
}

export default function BookingSuccess({
  isModal = false,
  onClose,
  onViewBooking,
}: BookingSuccessProps) {
  const router = useRouter();

  const handleViewBookingClick = () => {
    if (onViewBooking) {
      onViewBooking();
    } else {
      router.push('/bookingdetail'); // fallback for mobile page
    }
  };

  const handleCloseClick = () => {
    if (onClose) {
      onClose();
    } else {
      router.push('/map'); // fallback for mobile page
    }
  };

  return (
    <div
      className={`relative font-[Pretendard] text-[#3A2E27] ${
        !isModal ? 'min-h-screen bg-[#FDFBF7]' : 'h-full flex flex-col'
      }`}
    >
      {!isModal && (
        <header className="flex items-center justify-between p-4">
          <button onClick={handleCloseClick} className="text-[#3A2E27]">
            <svg fill="currentColor" height="24" width="24" viewBox="0 0 256 256">
              <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
            </svg>
          </button>
          <h1 className="flex-1 text-center text-lg font-bold text-[#3A2E27]">
            예약 확인
          </h1>
          <div className="w-6"></div>
        </header>
      )}

      <main
        className={`text-center ${
          !isModal ? 'px-6 py-8 pb-0' : 'flex flex-1 flex-col justify-center p-4'
        }`}
      >
        <div
          className={
            !isModal
              ? 'p-8 shadow-sm bg-white/50 rounded-2xl backdrop-blur-md'
              : 'p-4'
          }
        >
          <div className="inline-block p-3 mb-6 bg-green-100 rounded-full">
            <svg
              className="h-10 w-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M5 13l4 4L19 7"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              ></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#3A2E27] mb-3">
            예약이 확정되었습니다
          </h2>
          <p className="text-base text-[#705D51] mb-8">
            곧 공간에서 당신의 작품을 만나보세요.
          </p>
          <div
            className={`text-left ${
              !isModal ? 'space-y-5 border-t border-[#EAE3D9] pt-8' : 'space-y-3'
            }`}
          >
            {/* Mock data for display, in a real app, you'd pass this as props */}
            <div className="flex items-center justify-between">
              <p className="text-base font-medium text-[#705D51]">예약 장소</p>
              <p className="text-base font-bold text-[#3A2E27]">Wall Space 1</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-base font-medium text-[#705D51]">일시</p>
              <p className="text-base font-bold text-[#3A2E27]">
                2025년 8월 15일 ~ 22일
              </p>
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

        <div
          className={`mt-auto space-y-3 ${
            isModal ? 'pt-8' : 'pb-25 mt-12 mb-0'
          }`}
        >
          <button
            onClick={handleViewBookingClick}
            className="block w-full rounded-lg bg-[#D2B48C] mt-5 py-3 px-6 text-base font-bold text-white shadow-md transition-colors duration-300 hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-[#D2B48C] focus:ring-opacity-50"
          >
            내 예약 보기
          </button>
          <button
            onClick={handleCloseClick}
            className="block w-full rounded-lg bg-[#EAE3D9] py-3 px-6 text-base font-bold text-[#3A2E27] transition-colors duration-300 hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-[#D2B48C] focus:ring-opacity-50"
          >
            {isModal ? '닫기' : '돌아가기'}
          </button>
        </div>
      </main>
    </div>
  );
}
