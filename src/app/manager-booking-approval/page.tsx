'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useReservations } from '@/context/ReservationContext';
import { Reservation } from '@/data/reservations';
import Header from '../components/Header';

function ManagerBookingApprovalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reservationId = searchParams.get('id');
  const { getReservationById, updateReservationStatus } = useReservations();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionType, setActionType] = useState<'accept' | 'reject' | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadReservation = async () => {
      if (!reservationId) {
        setIsLoading(false);
        return;
      }

      // 먼저 컨텍스트에서 찾기
      const found = getReservationById(reservationId);
      console.log('🔍 Loading reservation for manager:', reservationId);
      console.log('📦 Found reservation in context:', found);
      
      if (found) {
        // API 데이터를 UI가 기대하는 형식으로 변환
        const startDateStr = (found as any).start_date || (found as any).startDate;
        const endDateStr = (found as any).end_date || (found as any).endDate;
        const period = startDateStr && endDateStr 
          ? `${new Date(startDateStr).toLocaleDateString('ko-KR')} ~ ${new Date(endDateStr).toLocaleDateString('ko-KR')}` 
          : '날짜 정보 없음';
        
        const transformed = {
          ...(found as any),
          artworkTitle: (found as any).artwork?.title || '',
          artistName: (found as any).artist?.name || '', // 실제 이름
          artistDisplayName: (found as any).artist?.nickname || (found as any).artist?.name || '', // 필명
          artistPhone: (found as any).artist?.phone || '',
          artistEmail: (found as any).artist?.email || '',
          artistImage: (found as any).artist?.avatar_url || (found as any).artist?.image_url || '',
          storeName: (found as any).location?.name || '',
          locationAddress: (found as any).location?.address || '',
          image: (found as any).artwork?.image_url || (found as any).artwork?.images?.[0] || '',
          locationImage: (found as any).location?.images?.[0] || '',
          startDate: startDateStr,
          endDate: endDateStr,
          period: period,
          price: (found as any).space?.price || (found as any).price || 0,
        };
        console.log('✅ Transformed reservation:', transformed);
        console.log('👤 Artist info:', {
          displayName: transformed.artistDisplayName,
          realName: transformed.artistName,
          phone: transformed.artistPhone,
          email: transformed.artistEmail,
          rawArtist: (found as any).artist
        });
        setReservation(transformed as any);
        setIsLoading(false);
      } else {
        // 컨텍스트에 없으면 API에서 직접 가져오기
        console.log('⚠️ Reservation not found in context, fetching from API...');
        try {
          const response = await fetch(`/api/reservations?id=${reservationId}`);
          if (response.ok) {
            const data = await response.json();
            console.log('✅ Fetched reservation from API:', data);
            
            const startDateStr = (data as any).start_date || (data as any).startDate;
            const endDateStr = (data as any).end_date || (data as any).endDate;
            const period = startDateStr && endDateStr 
              ? `${new Date(startDateStr).toLocaleDateString('ko-KR')} ~ ${new Date(endDateStr).toLocaleDateString('ko-KR')}` 
              : '날짜 정보 없음';
            
            const transformed = {
              ...(data as any),
              artworkTitle: (data as any).artwork?.title || '',
              artistName: (data as any).artist?.name || '',
              artistDisplayName: (data as any).artist?.nickname || (data as any).artist?.name || '',
              artistPhone: (data as any).artist?.phone || '',
              artistEmail: (data as any).artist?.email || '',
              artistImage: (data as any).artist?.avatar_url || (data as any).artist?.image_url || '',
              storeName: (data as any).location?.name || '',
              locationAddress: (data as any).location?.address || '',
              image: (data as any).artwork?.image_url || (data as any).artwork?.images?.[0] || '',
              locationImage: (data as any).location?.images?.[0] || '',
              startDate: startDateStr,
              endDate: endDateStr,
              period: period,
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
  }, [reservationId, getReservationById]);

  const handleAccept = () => {
    setActionType('accept');
    setShowConfirmModal(true);
  };

  const handleReject = () => {
    setShowRejectModal(true);
  };

  const handleRejectConfirm = async () => {
    if (!reservation || isSubmitting) return;
    
    setIsSubmitting(true);
    console.log('🚫 Rejecting reservation with reason:', rejectionReason);
    
    try {
      // API로 직접 상태 업데이트 (빠름)
      const response = await fetch('/api/reservations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          reservation_id: reservation.id,
          status: 'cancelled',
          rejection_reason: rejectionReason
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update reservation');
      }

      // 즉시 페이지 이동 (백그라운드 새로고침 없이)
      setShowRejectModal(false);
      setRejectionReason('');
      router.push('/dashboard');
      
      // 백그라운드에서 컨텍스트 새로고침 (기다리지 않음)
      updateReservationStatus(reservation.id, 'cancelled', rejectionReason).catch(err => {
        console.error('Background context update failed:', err);
      });
    } catch (error) {
      console.error('Failed to reject reservation:', error);
      alert('예약 거절에 실패했습니다. 다시 시도해주세요.');
      setIsSubmitting(false);
    }
  };

  const confirmAction = async () => {
    if (!reservation || !actionType || isSubmitting) return;

    setIsSubmitting(true);
    console.log('✅ Confirming reservation');
    
    try {
      if (actionType === 'accept') {
        // API로 직접 상태 업데이트 (빠름)
        const response = await fetch('/api/reservations', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            reservation_id: reservation.id,
            status: 'confirmed'
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update reservation');
        }

        // 즉시 페이지 이동
        setShowConfirmModal(false);
        router.push(`/dashboard?refresh=${Date.now()}`);
        
        // 백그라운드에서 컨텍스트 새로고침 (기다리지 않음)
        updateReservationStatus(reservation.id, 'confirmed').catch(err => {
          console.error('Background context update failed:', err);
        });
      }
    } catch (error) {
      console.error('Failed to confirm reservation:', error);
      alert('예약 승인에 실패했습니다. 다시 시도해주세요.');
      setIsSubmitting(false);
    }
  };

  const cancelAction = () => {
    setShowConfirmModal(false);
    setActionType(null);
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-[#e8e3da] dark:bg-[#1a1a1a] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D2B48C]"></div>
            <p className="text-[#8C7853] dark:text-gray-400">예약 정보를 불러오는 중...</p>
          </div>
        </div>
      </>
    );
  }

  if (!reservation) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-[#e8e3da] dark:bg-[#1a1a1a] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <p className="text-[#2C2C2C] dark:text-gray-100 text-lg">예약 정보를 찾을 수 없습니다.</p>
            <button
              onClick={() => router.back()}
              className="px-6 py-2 bg-[#D2B48C] text-white rounded-lg hover:bg-[#C19A6B] transition-colors"
            >
              돌아가기
            </button>
          </div>
        </div>
      </>
    );
  }

  const statusText = {
    confirmed: '확정됨',
    pending: '확인 중',
    completed: '종료됨',
    cancelled: '취소됨',
  };

  const statusColor = {
    confirmed: 'bg-green-100 text-green-600',
    pending: 'bg-yellow-100 text-yellow-600',
    completed: 'bg-gray-200 text-gray-600',
    cancelled: 'bg-red-100 text-red-600',
  };

  // 예약 기간 계산
  const calculateDays = () => {
    const start = new Date(reservation.startDate);
    const end = new Date(reservation.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const totalDays = calculateDays();
  const totalPrice = reservation.price * totalDays;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#e8e3da] dark:bg-[#1a1a1a] pb-24 lg:pb-8">
        {/* 헤더 - 모바일 전용 */}
        <header className="lg:hidden sticky top-0 z-10 bg-[#e8e3da]/80 dark:bg-[#1a1a1a]/80 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto flex items-center p-4">
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="뒤로 가기"
              className="text-[#3D2C1D] dark:text-gray-100 active:scale-95 transition-transform"
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
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <h1 className="flex-1 text-center text-xl font-bold text-[#3D2C1D] dark:text-gray-100">
              예약 승인
            </h1>
            <div className="w-6"></div>
          </div>
        </header>

        {/* 메인 컨텐츠 */}
        <div className="max-w-7xl mx-auto px-4 pt-6 lg:pt-8 pb-6">
          {/* 예약 상세정보 헤더 */}
          <section className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/30 p-4 lg:p-6 mb-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl lg:text-3xl font-bold text-[#3D2C1D] dark:text-gray-100">예약 상세정보</h2>
                <p className="text-sm text-[#887563] dark:text-gray-400 mt-1 truncate" title={`예약 ID: ${reservation.short_id || reservation.id}`}>
                  예약 ID: {reservation.short_id || reservation.id}
                </p>
              </div>
              <span className={`text-xs font-semibold py-2 px-3 rounded-full whitespace-nowrap flex-shrink-0 ${statusColor[reservation.status]}`}>
                {statusText[reservation.status]}
              </span>
            </div>
          </section>

          {/* PC: 2단 레이아웃, 모바일: 1단 레이아웃 */}
          <div className="lg:grid lg:grid-cols-3 lg:gap-6 space-y-6 lg:space-y-0">
            {/* 좌측 영역: 상세 정보 (PC: 2칸) */}
            <div className="lg:col-span-2 space-y-6">
          
          {/* 작품 정보 & 예약 장소 (PC: 가로 배치) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 작품 정보 */}
            <section className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/30 p-6">
              <h3 className="text-xl font-bold text-[#3D2C1D] dark:text-gray-100 mb-4">작품 정보</h3>
              <div className="flex gap-4">
                <div
                  className="w-28 h-28 lg:w-32 lg:h-32 bg-center bg-no-repeat bg-cover rounded-lg flex-shrink-0"
                  style={{ backgroundImage: `url("${(reservation as any).image || 'https://picsum.photos/200/200'}")` }}
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg font-bold text-[#3D2C1D] dark:text-gray-100">
                    &ldquo;{(reservation as any).artworkTitle || '작품 제목 없음'}&rdquo;
                  </h4>
                  <p className="text-sm text-[#887563] dark:text-gray-400 mt-1">
                    작가: {(reservation as any).artistName || '작가 정보 없음'}
                  </p>
                  <p className="text-lg font-bold text-[#3D2C1D] dark:text-gray-100 mt-3">
                    {((reservation as any).price || 0).toLocaleString()}원 / 일
                  </p>
                </div>
              </div>
            </section>

            {/* 예약 장소 */}
            <section className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/30 p-6">
              <h3 className="text-xl font-bold text-[#3D2C1D] dark:text-gray-100 mb-4">예약 장소</h3>
              <div className="flex gap-4">
                <div
                  className="w-28 h-28 lg:w-32 lg:h-32 bg-center bg-no-repeat bg-cover rounded-lg flex-shrink-0"
                  style={{ backgroundImage: `url("${(reservation as any).locationImage || 'https://picsum.photos/200/200'}")` }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-lg text-[#3D2C1D] dark:text-gray-100">{(reservation as any).storeName || '장소 정보 없음'}</p>
                  {(reservation as any).locationAddress && (
                    <p className="text-sm text-[#887563] dark:text-gray-400 mt-1">
                      {(reservation as any).locationAddress}
                    </p>
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* 예약자 정보 */}
          <section className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/30 p-6">
            <h3 className="text-xl font-bold text-[#3D2C1D] dark:text-gray-100 mb-4">예약자 정보</h3>
            <div className="flex items-start gap-4 lg:gap-6">
              {/* 프로필 사진 */}
              <div 
                className="w-20 h-20 lg:w-24 lg:h-24 bg-center bg-cover rounded-full flex-shrink-0 border-2 border-[#D2B48C] dark:border-[#E8C8A0]"
                style={{ 
                  backgroundImage: (reservation as any).artistImage 
                    ? `url("${(reservation as any).artistImage}")` 
                    : 'none',
                  backgroundColor: (reservation as any).artistImage ? 'transparent' : '#D2B48C'
                }}
              >
                {!(reservation as any).artistImage && (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-3xl">person</span>
                  </div>
                )}
              </div>
              
              {/* 작가 정보 */}
              <div className="flex-1 space-y-3">
                {/* 필명 */}
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[#D2B48C] dark:text-[#E8C8A0] text-xl flex-shrink-0">
                    badge
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#887563] dark:text-gray-400">필명</p>
                    <p className="font-bold text-lg text-[#3D2C1D] dark:text-gray-100">
                      {(reservation as any).artistDisplayName || (reservation as any).artistName || '정보 없음'}
                    </p>
                  </div>
                </div>
                
                {/* 이름 */}
                {(reservation as any).artistName && (
                  <div className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[#D2B48C] dark:text-[#E8C8A0] text-xl flex-shrink-0">
                      person
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#887563] dark:text-gray-400">이름</p>
                      <p className="font-medium text-[#3D2C1D] dark:text-gray-100">
                        {(reservation as any).artistName}
                      </p>
                    </div>
                  </div>
                )}
                
                {/* 전화번호 */}
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[#D2B48C] dark:text-[#E8C8A0] text-xl flex-shrink-0">
                    phone
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#887563] dark:text-gray-400">전화번호</p>
                    <p className="font-medium text-[#3D2C1D] dark:text-gray-100">
                      {(reservation as any).artistPhone || (reservation as any).artist?.phone || '정보 없음'}
                    </p>
                  </div>
                </div>
                
                {/* 이메일 */}
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[#D2B48C] dark:text-[#E8C8A0] text-xl flex-shrink-0">
                    email
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#887563] dark:text-gray-400">이메일</p>
                    <p 
                      className="font-medium text-[#3D2C1D] dark:text-gray-100 break-all"
                      title={(reservation as any).artistEmail || (reservation as any).artist?.email || '정보 없음'}
                    >
                      {(reservation as any).artistEmail || (reservation as any).artist?.email || '정보 없음'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 예약 기간 (모바일 전용) */}
          <section className="lg:hidden bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/30 p-6">
            <h3 className="text-xl font-bold text-[#3D2C1D] dark:text-gray-100 mb-4">예약 기간</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#D2B48C] dark:text-[#E8C8A0] text-xl">
                  calendar_today
                </span>
                <p className="text-[#3D2C1D] dark:text-gray-100">{reservation.period}</p>
              </div>
            </div>
          </section>

          {/* 모바일 버튼 영역 */}
          {reservation.status === 'pending' && (
            <div className="flex gap-4 pt-4 lg:hidden">
              <button
                onClick={handleReject}
                className="flex-1 bg-white dark:bg-gray-700 text-[#3D2C1D] dark:text-gray-100 font-bold py-4 px-6 rounded-xl border-2 border-[#D2B48C] dark:border-[#E8C8A0] hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                예약 거절
              </button>
              <button
                onClick={handleAccept}
                className="flex-1 bg-[#D2B48C] dark:bg-[#E8C8A0] text-white font-bold py-4 px-6 rounded-xl hover:bg-[#C19A6B] dark:hover:bg-[#D2B48C] transition-colors shadow-lg"
              >
                예약 수락
              </button>
            </div>
          )}
            </div>
            {/* 좌측 영역 끝 */}

            {/* 우측 영역: 비용 요약 & 버튼 (PC: 1칸, sticky) */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* 예약 기간 & 비용 요약 */}
                <section className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/30 p-6">
                  <h3 className="text-xl font-bold text-[#3D2C1D] dark:text-gray-100 mb-4">예약 기간</h3>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#D2B48C] dark:text-[#E8C8A0] text-xl">
                        calendar_today
                      </span>
                      <p className="text-sm text-[#3D2C1D] dark:text-gray-100">{reservation.period}</p>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-[#3D2C1D] dark:text-gray-100 mb-4">비용 요약</h3>
                  <div className="bg-[#F5F1EC] dark:bg-gray-700 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#887563] dark:text-gray-400">예약 일수</span>
                      <span className="font-semibold text-[#3D2C1D] dark:text-gray-100">{totalDays}일</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#887563] dark:text-gray-400">일일 가격</span>
                      <span className="font-semibold text-[#3D2C1D] dark:text-gray-100">
                        {reservation.price.toLocaleString()}원
                      </span>
                    </div>
                    <div className="border-t border-[#D2B48C]/30 dark:border-gray-600 pt-3 mt-3">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[#3D2C1D] dark:text-gray-100">총 금액</span>
                        <span className="font-bold text-[#D2B48C] dark:text-[#E8C8A0] text-xl">
                          {totalPrice.toLocaleString()}원
                        </span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* PC 버튼 영역 */}
                {reservation.status === 'pending' && (
                  <div className="space-y-3">
                    <button
                      onClick={handleAccept}
                      className="w-full bg-[#D2B48C] dark:bg-[#E8C8A0] text-white font-bold py-4 px-6 rounded-xl hover:bg-[#C19A6B] dark:hover:bg-[#D2B48C] transition-colors shadow-lg"
                    >
                      예약 수락
                    </button>
                    <button
                      onClick={handleReject}
                      className="w-full bg-white dark:bg-gray-700 text-[#3D2C1D] dark:text-gray-100 font-bold py-4 px-6 rounded-xl border-2 border-[#D2B48C] dark:border-[#E8C8A0] hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    >
                      예약 거절
                    </button>
                  </div>
                )}
              </div>
            </div>
            {/* 우측 영역 끝 */}
          </div>
          {/* 그리드 레이아웃 끝 */}
        </div>
      </div>

      {/* 수락 확인 모달 */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 mx-4 max-w-sm w-full">
            <h3 className="text-xl font-bold text-[#3D2C1D] dark:text-gray-100 mb-4 text-center">
              예약을 수락하시겠습니까?
            </h3>
            <p className="text-sm text-[#887563] dark:text-gray-400 mb-6 text-center">
              수락 후에는 예약이 확정됩니다.
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelAction}
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-[#3D2C1D] dark:text-gray-100 font-semibold py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                취소
              </button>
              <button
                onClick={confirmAction}
                className="flex-1 font-semibold py-3 rounded-lg transition-colors bg-[#D2B48C] dark:bg-[#E8C8A0] text-white hover:bg-[#C19A6B]"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 거절 사유 입력 모달 */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-[#3D2C1D] dark:text-gray-100 mb-4">
              예약 거절
            </h3>
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#5D4E3E] dark:text-gray-300 mb-2">
                거절 사유를 입력해주세요
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="예: 전시 일정이 이미 마감되었습니다."
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#D2B48C] dark:bg-gray-700 dark:text-gray-100"
                rows={4}
                maxLength={200}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">
                {rejectionReason.length}/200자
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                }}
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-[#3D2C1D] dark:text-gray-100 font-semibold py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={!rejectionReason.trim() || isSubmitting}
                className="flex-1 font-semibold py-3 rounded-lg transition-colors bg-red-500 text-white hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '처리 중...' : '거절하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function ManagerBookingApprovalPage() {
  return (
    <Suspense fallback={
      <>
        <Header />
        <div className="min-h-screen bg-[#e8e3da] dark:bg-[#1a1a1a] flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#D2B48C] border-t-transparent mb-4"></div>
            <div className="text-lg text-[#2C2C2C] dark:text-gray-100">로딩 중...</div>
          </div>
        </div>
      </>
    }>
      <ManagerBookingApprovalContent />
    </Suspense>
  );
}


