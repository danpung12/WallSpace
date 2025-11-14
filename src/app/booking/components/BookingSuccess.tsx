'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useApi } from '@/lib/swr'; // SWR 추가

interface BookingSuccessProps {
  isModal?: boolean;
  onClose?: () => void;
  onViewBooking?: () => void;
  reservationId?: string;
}

interface ReservationData {
  id: string;
  location: {
    name: string;
  };
  space: {
    name: string;
  };
  start_date: string;
  end_date: string;
  total_price: number;
  short_id?: string;
}

export default function BookingSuccess({
  isModal = false,
  onClose,
  onViewBooking,
  reservationId,
}: BookingSuccessProps) {
  const router = useRouter();
  const [reservation, setReservation] = useState<ReservationData | null>(null);

  // SWR로 예약 데이터 가져오기
  const { data: reservationData, isLoading: loading } = useApi<any>(
    reservationId ? `/api/reservations?id=${reservationId}` : null
  );

  // 예약 데이터 설정
  useEffect(() => {
    if (reservationData) {
      console.log('✅ Reservation data:', reservationData);
      // data가 배열이면 첫 번째 항목 사용, 아니면 그대로 사용
      const data = Array.isArray(reservationData) ? reservationData[0] : reservationData;
      setReservation(data);
    }
  }, [reservationData]);

  const handleViewBookingClick = () => {
    if (onViewBooking) {
      onViewBooking();
    } else if (reservationId) {
      router.push(`/bookingdetail?id=${encodeURIComponent(reservationId)}`);
    } else {
      router.push('/dashboard');
    }
  };

  const handleCloseClick = () => {
    if (onClose) {
      onClose();
    } else {
      router.push('/map'); // fallback for mobile page
    }
  };

  // 날짜 포맷 함수
  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const formatDate = (date: Date) => {
      return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
    };
    
    return `${formatDate(start)} ~ ${formatDate(end)}`;
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
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D2B48C] mx-auto"></div>
              <p className="mt-4 text-[#705D51]">예약 정보를 불러오는 중...</p>
            </div>
          ) : reservation ? (
            <div
              className={`text-left ${
                !isModal ? 'space-y-5 border-t border-[#EAE3D9] pt-8' : 'space-y-3'
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-base font-medium text-[#705D51]">예약 장소</p>
                <p className="text-base font-bold text-[#3A2E27]">
                  {reservation.space?.name || '공간 정보 없음'}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-base font-medium text-[#705D51]">일시</p>
                <p className="text-base font-bold text-[#3A2E27]">
                  {formatDateRange(reservation.start_date, reservation.end_date)}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-base font-medium text-[#705D51]">지불 금액</p>
                <p className="text-base font-bold text-[#3A2E27]">
                  ₩ {reservation.total_price?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-base font-medium text-[#705D51]">예약 ID #</p>
                <p className="text-base font-bold text-[#3A2E27]">
                  {reservation.short_id || '예약 완료'}
                </p>
              </div>
            </div>
          ) : (
            <div
              className={`text-left ${
                !isModal ? 'space-y-5 border-t border-[#EAE3D9] pt-8' : 'space-y-3'
              }`}
            >
              <div className="text-center py-4 text-[#705D51]">
                <p>예약 정보를 불러올 수 없습니다.</p>
                <p className="text-sm mt-2">예약은 정상적으로 완료되었습니다.</p>
              </div>
            </div>
          )}
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
