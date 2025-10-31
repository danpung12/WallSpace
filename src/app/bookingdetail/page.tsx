"use client";

import { Suspense, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useReservations } from '@/context/ReservationContext';
import { Reservation } from '@/data/reservations';
import CancelModal from './components/CancelModal';
import Header from "@/app/components/Header";
import { useBottomNav } from '@/app/context/BottomNavContext';
import Footer from '@/app/components/Footer';
import { useMap } from '@/context/MapContext';

function BookingDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getReservationById, updateReservationStatus } = useReservations();
  const { refreshLocations } = useMap();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const { setIsNavVisible } = useBottomNav();

  useEffect(() => {
    // Hide BottomNav when this component mounts
    setIsNavVisible(false);
    // Show BottomNav when this component unmounts
    return () => {
      setIsNavVisible(true);
    };
  }, [setIsNavVisible]);

  useEffect(() => {
    const loadReservation = async () => {
      const id = searchParams.get('id');
      console.log('🔍 Loading reservation:', id);
      
      if (!id) {
        setIsLoading(false);
        return;
      }

      // 먼저 컨텍스트에서 찾기
      const foundReservation = getReservationById(id);
      console.log('📦 Found reservation in context:', foundReservation);
      
      if (foundReservation) {
        // API 데이터를 UI가 기대하는 형식으로 변환
        const transformed = {
          ...(foundReservation as any),
          // 기존 필드 유지하면서 추가
          artworkTitle: (foundReservation as any).artwork?.title || '',
          artistName: (foundReservation as any).artist?.nickname || (foundReservation as any).artist?.name || '', // 필명 우선, 없으면 이름
          storeName: (foundReservation as any).location?.name || '',
          image: (foundReservation as any).artwork?.image_url || (foundReservation as any).artwork?.images?.[0] || '',
          locationImage: (foundReservation as any).location?.images?.[0] || (foundReservation as any).location?.image_url || '',
          startDate: (foundReservation as any).start_date || (foundReservation as any).startDate,
          endDate: (foundReservation as any).end_date || (foundReservation as any).endDate,
          price: (foundReservation as any).space?.price || (foundReservation as any).price || 0,
        };
        console.log('✅ Transformed reservation:', transformed);
        console.log('🖼️ Images:', { 
          artwork: transformed.image, 
          location: transformed.locationImage 
        });
        setReservation(transformed as any);
        setIsLoading(false);
      } else {
        // 컨텍스트에 없으면 API에서 직접 가져오기
        console.log('⚠️ Reservation not found in context, fetching from API...');
        try {
          const response = await fetch(`/api/reservations?id=${id}`);
          if (response.ok) {
            const data = await response.json();
            console.log('✅ Fetched reservation from API:', data);
            
            // API 데이터를 UI가 기대하는 형식으로 변환
            const transformed = {
              ...(data as any),
              artworkTitle: (data as any).artwork?.title || '',
              artistName: (data as any).artist?.nickname || (data as any).artist?.name || '',
              storeName: (data as any).location?.name || '',
              image: (data as any).artwork?.image_url || (data as any).artwork?.images?.[0] || '',
              locationImage: (data as any).location?.images?.[0] || (data as any).location?.image_url || '',
              startDate: (data as any).start_date || (data as any).startDate,
              endDate: (data as any).end_date || (data as any).endDate,
              price: (data as any).space?.price || (data as any).price || 0,
            };
            setReservation(transformed as any);
          } else {
            console.error('❌ Failed to fetch reservation from API');
            setReservation(null);
          }
        } catch (error) {
          console.error('❌ Error fetching reservation:', error);
          setReservation(null);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadReservation();
  }, [searchParams, getReservationById]);

  // --- Start of Original UI Logic ---
  const durationDays = useMemo(() => {
    if (!reservation) return 0;
    if (!(reservation as any).startDate || !(reservation as any).endDate) return 0;
    const start = new Date((reservation as any).startDate);
    const end = new Date((reservation as any).endDate);
    // Add 1 for inclusive day counting
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  }, [reservation]);

  const totalCost = useMemo(() => {
    if (!reservation) return 0;
    const totalPrice = (reservation as any).total_price;
    if (totalPrice) return totalPrice;
    return durationDays * ((reservation as any).price || 0);
  }, [reservation, durationDays]);

  const formattedPeriod = useMemo(() => {
    if (!reservation) return "";
    if (!(reservation as any).startDate || !(reservation as any).endDate) return "";
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const startFormatted = new Date((reservation as any).startDate).toLocaleDateString('ko-KR', options);
    const endFormatted = new Date((reservation as any).endDate).toLocaleDateString('ko-KR', options);
    return `${startFormatted} ~ ${endFormatted}`;
  }, [reservation]);
  // --- End of Original UI Logic ---

  const handleBack = () => router.back();
  const handleCancelClick = () => setModalOpen(true);
  const handleConfirmCancel = async () => {
    if (reservation) {
      // 예약 취소
      await updateReservationStatus(reservation.id, 'cancelled');
      
      // /map 페이지 장소 데이터 새로고침 (백그라운드)
      refreshLocations().catch(err => {
        console.error('Failed to refresh locations:', err);
      });
      
      // Go back to the dashboard to see the updated list
      router.push('/dashboard');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--background-color)]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D2B48C]"></div>
          <p className="text-gray-500">예약 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--background-color)]">
        <div className="flex flex-col items-center gap-4">
          <p className="text-gray-500 text-lg">예약 정보를 찾을 수 없습니다.</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-[#D2B48C] text-white rounded-lg hover:bg-[#C19A6B] transition-colors"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* <Header /> */} {/* Header 컴포넌트 호출 제거 */}
      <style jsx global>{`
        :root {
          --primary-color: #d2b48c; --secondary-color: #f5f5f5; --background-color: #fdfbf8;
          --text-primary: #3d2c1d; --text-secondary: #8c7853; --accent-color: #f0ead6;
        }
        body { background-color: var(--background-color); color: var(--text-primary); }
      `}</style>
      <div className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-10 bg-[var(--background-color)]/80 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
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
                <path d="M19 12H5" />
                <path d="m12 19-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">
              예약 상세
            </h1>
            <div className="w-6" />
          </div>
        </header>
        
        <main className="flex-grow p-4 lg:py-8">
          <div className="max-w-6xl mx-auto">
            <div className="pt-4 lg:pt-8">
              <section className="bg-white rounded-xl shadow-sm p-5 lg:p-8 lg:flex lg:justify-between lg:items-center">
                <h1 className="text-xl font-bold">예약 상세정보</h1>
                <div className="flex items-center gap-4 mt-4 lg:mt-0">
                  <p className="text-sm font-medium text-[var(--text-secondary)]">예약 ID: {reservation.short_id || reservation.id}</p>
                  <span className={`text-xs font-semibold py-1 px-3 rounded-full ${
                    reservation.status === "confirmed" ? "text-green-600 bg-green-100" 
                    : reservation.status === "pending" ? "text-yellow-600 bg-yellow-100"
                    : "text-red-600 bg-red-100"
                  }`}>
                    {reservation.status === "confirmed" ? "확정" : reservation.status === "pending" ? "확인 중" : "취소됨"}
                  </span>
                </div>
              </section>
              <div className="lg:grid lg:grid-cols-3 lg:gap-6 mt-6">
                <div className="lg:col-span-2 space-y-6">
                  <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl shadow-sm p-5 lg:p-8 hover:shadow-md transition-shadow">
                      <h3 className="text-lg font-bold mb-4">작품 정보</h3>
                      <div className="flex items-center gap-4">
                        <div className="w-24 h-24 bg-center bg-no-repeat bg-cover rounded-lg flex-shrink-0" style={{ backgroundImage: `url("${reservation.image}")` }} />
                        <div className="flex-1 space-y-1">
                          <p className="text-base font-semibold">{`"${reservation.artworkTitle}"`}</p>
                          <p className="text-sm text-[var(--text-secondary)]">by {reservation.artistName}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-5 lg:p-8 hover:shadow-md transition-shadow">
                      <h3 className="text-lg font-bold mb-4">예약 장소</h3>
                      <div className="flex items-center gap-4">
                         <div className="w-24 h-24 bg-center bg-no-repeat bg-cover rounded-lg flex-shrink-0" style={{ backgroundImage: `url("${(reservation as any).locationImage || 'https://picsum.photos/200/200'}")` }} />
                         <div className="flex-1 space-y-1">
                           <p className="text-base font-semibold">{reservation.storeName}</p>
                           {(reservation as any).space?.name && (
                             <p className="text-sm text-[var(--text-secondary)] flex items-center gap-1">
                               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                               </svg>
                               {(reservation as any).space.name}
                             </p>
                           )}
                         </div>
                      </div>
                    </div>
                  </section>
                  <section className="bg-white rounded-xl shadow-sm p-5 lg:p-8 hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-bold mb-4">예약 기간</h3>
                    <p>{formattedPeriod}</p>
                  </section>
                </div>
                <div className="lg:col-span-1 space-y-6 mt-6 lg:mt-0">
                  <section className="bg-white rounded-xl shadow-sm p-5 lg:p-8">
                    <h3 className="text-lg font-bold mb-4">비용 요약</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-[var(--text-secondary)]">일일 요금</p>
                        <p className="text-sm">{reservation.price.toLocaleString()}원 x {durationDays}일</p>
                      </div>
                      <div className="border-t border-dashed border-gray-200 my-3" />
                      <div className="flex items-center justify-between">
                        <p className="text-base font-bold">총 비용</p>
                        <p className="text-xl font-bold text-[var(--primary-color)]">{totalCost.toLocaleString()}원</p>
                      </div>
                    </div>
                  </section>

                  <div>
                    <div className="mt-6 flex justify-between items-center lg:px-2">
                        <span className="text-lg font-bold text-gray-800">총 결제 금액</span>
                        <span className="text-2xl font-bold text-[var(--primary-color)]">{totalCost.toLocaleString()}원</span>
                    </div>
                    <div className="pt-4 space-y-3 lg:px-2">
                        <button 
                          onClick={() => setShowReceiptModal(true)}
                          className="bg-[var(--primary-color)] text-white py-3 px-6 rounded-lg w-full hover:opacity-90 transition-opacity"
                        >
                          영수증 보기
                        </button>
                        {/* Desktop-only cancel button */}
                        <button
                            onClick={handleCancelClick}
                            disabled={reservation.status !== 'confirmed' && reservation.status !== 'pending'}
                            className="hidden lg:block bg-transparent border border-[var(--text-secondary)] text-[var(--text-secondary)] py-3 px-6 rounded-lg w-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                        >
                            {reservation.status === 'cancelled' ? '취소된 예약' : reservation.status === 'completed' ? '완료된 예약' : '예약 취소'}
                        </button>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>

      {/* Mobile-only sticky footer for Cancel button */}
      {reservation && (reservation.status === 'confirmed' || reservation.status === 'pending') && (
        <footer 
          className="sticky bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-200 lg:hidden"
          style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
        >
          <button
            onClick={handleCancelClick}
            className="w-full h-12 rounded-xl bg-transparent border border-[var(--text-secondary)] text-[var(--text-secondary)] font-semibold transition-colors hover:bg-gray-50"
          >
            예약 취소
          </button>
        </footer>
      )}

      <CancelModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} onConfirm={handleConfirmCancel} />
      
      {/* 영수증 모달 */}
      {showReceiptModal && (
        <div
          className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowReceiptModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full shadow-2xl transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 헤더 */}
            <div className="bg-gradient-to-r from-[#D2B48C] to-[#C19A6B] p-6 rounded-t-2xl text-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold">영수증</h3>
                <button
                  onClick={() => setShowReceiptModal(false)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="text-sm opacity-90">
                <p>예약 ID: {reservation.short_id || reservation.id.substring(0, 8).toUpperCase()}</p>
                <p className="mt-1">발급일: {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>

            {/* 내용 */}
            <div className="p-6 space-y-6">
              {/* 예약 정보 */}
              <div className="space-y-3">
                <h4 className="font-bold text-gray-900 dark:text-gray-100 text-lg pb-2 border-b-2 border-[#D2B48C]">
                  예약 정보
                </h4>
                
                {/* 작가 정보 */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">예약자</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{reservation.artistName}</p>
                </div>

                {/* 작품 정보 */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">작품</p>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-16 h-16 rounded-lg bg-cover bg-center flex-shrink-0"
                      style={{ backgroundImage: `url("${reservation.image}")` }}
                    />
                    <p className="font-semibold text-gray-900 dark:text-gray-100">&ldquo;{reservation.artworkTitle}&rdquo;</p>
                  </div>
                </div>

                {/* 장소 & 공간 정보 */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">전시 장소</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{reservation.storeName}</p>
                  {(reservation as any).space?.name && (
                    <p className="text-sm text-[#8C7853] dark:text-gray-400 mt-1">
                      📍 {(reservation as any).space.name}
                    </p>
                  )}
                </div>

                {/* 예약 기간 */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">예약 기간</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{formattedPeriod}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">({durationDays}일)</p>
                </div>
              </div>

              {/* 결제 정보 */}
              <div className="space-y-3">
                <h4 className="font-bold text-gray-900 dark:text-gray-100 text-lg pb-2 border-b-2 border-[#D2B48C]">
                  결제 내역
                </h4>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">일일 요금</span>
                    <span className="text-gray-900 dark:text-gray-100">{reservation.price.toLocaleString()}원</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">이용 일수</span>
                    <span className="text-gray-900 dark:text-gray-100">{durationDays}일</span>
                  </div>
                  
                  <div className="border-t-2 border-dashed border-gray-300 dark:border-gray-600 my-3" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900 dark:text-gray-100">총 결제 금액</span>
                    <span className="text-2xl font-bold text-[#D2B48C]">{totalCost.toLocaleString()}원</span>
                  </div>
                </div>
              </div>

              {/* 상태 */}
              <div className="bg-gradient-to-r from-[#D2B48C]/10 to-[#C19A6B]/10 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">예약 상태</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    reservation.status === 'confirmed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                    : reservation.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                    : reservation.status === 'completed' ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                  }`}>
                    {reservation.status === 'confirmed' ? '확정'
                      : reservation.status === 'pending' ? '확인 중'
                      : reservation.status === 'completed' ? '완료'
                      : '취소됨'
                    }
                  </span>
                </div>
              </div>

              {/* 닫기 버튼 */}
              <button
                onClick={() => setShowReceiptModal(false)}
                className="w-full py-3 bg-[#D2B48C] hover:bg-[#C19A6B] text-white font-semibold rounded-lg transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function BookingDetailPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
            <BookingDetailContent />
        </Suspense>
    )
}
