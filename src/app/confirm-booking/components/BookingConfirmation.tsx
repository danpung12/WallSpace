'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import type { Location, Space } from '@/data/locations';
import { Artwork } from '@/types/database';
import ArtworkSelector from '@/app/map/components/ArtworkSelector';

// --- 날짜 포맷팅 유틸 함수 ---
const fmtKoreanDate = (d: Date) =>
  `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
const daysDiffInclusive = (a: Date, b: Date) =>
  Math.round((b.getTime() - a.getTime()) / 86400000) + 1;

interface BookingDetails {
  location: Location;
  space: Space;
  startDate: Date;
  endDate: Date;
}

interface BookingConfirmationProps {
  bookingDetails: BookingDetails;
  onBack: () => void;
  isModal?: boolean;
  onConfirm?: (reservationId: string) => void;
}

export default function BookingConfirmation({
  bookingDetails,
  onBack,
  isModal = false,
  onConfirm,
}: BookingConfirmationProps) {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [isLoadingArtworks, setIsLoadingArtworks] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showArtworkSelector, setShowArtworkSelector] = useState(false);

  // 사용자의 작품 목록 가져오기
  useEffect(() => {
    const fetchUserArtworks = async () => {
      setIsLoadingArtworks(true);
      try {
        console.log('🎨 Fetching user artworks...');
        const response = await fetch('/api/artworks?mine=true');
        
        console.log('📡 API Response status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('❌ Failed to fetch artworks:', errorData);
          setError(`작품을 불러올 수 없습니다: ${errorData.error || response.statusText}`);
          return;
        }

        const data = await response.json();
        console.log('✅ Artworks fetched:', data);
        setArtworks(data);
        
        // 작품이 있으면 첫 번째 작품 자동 선택
        if (data.length > 0) {
          setSelectedArtwork(data[0]);
          console.log('🖼️ Auto-selected first artwork:', data[0].title);
        } else {
          console.warn('⚠️ No artworks found');
        }
      } catch (err: any) {
        console.error('❌ Error fetching artworks:', err);
        setError(`작품을 불러오는 중 오류가 발생했습니다: ${err.message}`);
      } finally {
        setIsLoadingArtworks(false);
      }
    };

    fetchUserArtworks();
  }, []);

  if (!bookingDetails) {
    return <div>Loading...</div>;
  }

  const { location, space, startDate, endDate } = bookingDetails;

  // 비용 계산
  const durationDays = daysDiffInclusive(startDate, endDate);
  const spaceUsage = (space.price || 50000) * durationDays;
  const total = spaceUsage; // 서비스 수수료 제거

  const costDetails = {
    spaceUsage,
    total,
  };

  // 예약 생성 핸들러
  const handleConfirmBooking = async () => {
    if (!selectedArtwork) {
      alert('전시할 작품을 선택해주세요.');
      return;
    }

    // 디버깅: 데이터 확인
    console.log('📦 Booking Details:', {
      location: location,
      space: space,
      selectedArtwork: selectedArtwork,
      startDate: startDate,
      endDate: endDate
    });

    // 필수 데이터 검증
    if (!location?.id) {
      alert('장소 정보가 없습니다. 다시 시도해주세요.');
      console.error('❌ location.id is missing:', location);
      return;
    }
    if (!space?.id) {
      alert('공간 정보가 없습니다. 다시 시도해주세요.');
      console.error('❌ space.id is missing:', space);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // 날짜를 YYYY-MM-DD 형식으로 변환
      const formatDate = (date: Date) => {
        return date.toISOString().split('T')[0];
      };

      const reservationData = {
        location_id: location.id,
        space_id: space.id,
        artwork_id: selectedArtwork.id,
        start_date: formatDate(startDate),
        end_date: formatDate(endDate),
      };

      console.log('📤 Creating reservation:', reservationData);

      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reservationData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create reservation');
      }

      const result = await response.json();
      console.log('✅ Reservation created:', result);

      // 예약 성공
      if (onConfirm && result.reservation) {
        onConfirm(result.reservation.id);
      }
    } catch (err: any) {
      console.error('Error creating reservation:', err);
      setError(err.message || '예약 생성 중 오류가 발생했습니다.');
      alert(`예약 실패: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <div
        className={`font-pretendard text-[var(--text-primary)] ${
          !isModal ? 'min-h-screen bg-[var(--background-color)]' : ''
        }`}
      >
          <div className={!isModal ? "max-w-md mx-auto bg-[var(--background-color)]" : ""}>
              {!isModal && (
                   <header className="flex items-center p-4 justify-between bg-[var(--background-color)]">
                   <button onClick={onBack} className="p-1" aria-label="뒤로 가기">
                       <svg fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24">
                           <path d="m15 18-6-6 6-6"></path>
                       </svg>
                   </button>
                   <h1 className="text-lg font-bold flex-1 text-center">예약 확인</h1>
                   <div className="w-8" />
               </header>
              )}
       

          <main className={!isModal ? "p-4" : ""} style={!isModal ? { paddingBottom: "calc(var(--booking-footer-h) + 1rem)" } : {}}>
              {/* 작품 선택 섹션 */}
              <section className="mb-6">
                  <h2 className="text-lg font-bold mb-3">전시할 작품 선택</h2>
                  <div className="bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] p-4">
                      {isLoadingArtworks ? (
                          <div className="text-center py-8">
                              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary-color)] mx-auto"></div>
                              <p className="mt-4 text-[var(--text-secondary)]">작품 목록을 불러오는 중...</p>
                          </div>
                      ) : selectedArtwork ? (
                          <div className="flex items-center gap-4">
                              <Image 
                                src={selectedArtwork.image_url} 
                                alt={selectedArtwork.title} 
                                className="w-20 h-20 rounded-lg object-cover" 
                                width={80} 
                                height={80} 
                              />
                              <div className="flex-1">
                                  <p className="font-bold">&ldquo;{selectedArtwork.title}&rdquo;</p>
                                  <p className="text-sm text-[var(--text-secondary)]">{selectedArtwork.dimensions}</p>
                              </div>
                              <button
                                  onClick={() => setShowArtworkSelector(!showArtworkSelector)}
                                  className="px-4 py-2 text-sm font-medium text-[var(--primary-color)] border border-[var(--primary-color)] rounded-lg hover:bg-[var(--primary-color)] hover:text-white transition-colors"
                              >
                                  변경
                              </button>
                          </div>
                      ) : (
                          <button
                              onClick={() => setShowArtworkSelector(true)}
                              className="w-full py-4 text-center text-[var(--text-secondary)] border-2 border-dashed border-gray-300 rounded-lg hover:border-[var(--primary-color)] hover:text-[var(--primary-color)] transition-colors"
                          >
                              + 작품 선택하기
                          </button>
                      )}

                      {/* 작품 선택 드롭다운 */}
                      {showArtworkSelector && artworks.length > 0 && (
                          <div className="mt-4 max-h-64 overflow-y-auto space-y-2">
                              {artworks.map((artwork) => (
                                  <div
                                      key={artwork.id}
                                      onClick={() => {
                                          setSelectedArtwork(artwork);
                                          setShowArtworkSelector(false);
                                      }}
                                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                                          selectedArtwork?.id === artwork.id
                                              ? 'bg-[var(--primary-color)] text-white'
                                              : 'hover:bg-gray-50'
                                      }`}
                                  >
                                      <Image
                                          src={artwork.image_url}
                                          alt={artwork.title}
                                          className="w-12 h-12 rounded object-cover"
                                          width={48}
                                          height={48}
                                      />
                                      <div className="flex-1">
                                          <p className="font-medium">&ldquo;{artwork.title}&rdquo;</p>
                                          <p className="text-sm opacity-80">{artwork.dimensions}</p>
                                      </div>
                                      {selectedArtwork?.id === artwork.id && (
                                          <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                                          </svg>
                                      )}
                                  </div>
                              ))}
                          </div>
                      )}

                      {artworks.length === 0 && (
                          <div className="text-center py-4">
                              <p className="text-[var(--text-secondary)] mb-2">등록된 작품이 없습니다</p>
                              <Link 
                                  href="/dashboard/add"
                                  className="text-sm text-[var(--primary-color)] underline"
                              >
                                  작품 등록하러 가기 →
                              </Link>
                          </div>
                      )}
                  </div>
              </section>

              {/* 예약 내역 */}
              <section className="mb-6">
                  <h2 className="text-lg font-bold mb-3">예약 내역</h2>
                  <div className="bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] p-4 space-y-3 text-sm">
                      <div className="flex justify-between items-center">
                          <p className="text-[var(--text-secondary)]">장소</p>
                          <p className="font-medium">{location.name}</p>
                      </div>
                      <div className="flex justify-between items-center">
                          <p className="text-[var(--text-secondary)]">예약 공간</p>
                          <p className="font-medium">{space.name}</p>
                      </div>
                      <div className="flex justify-between items-center">
                          <p className="text-[var(--text-secondary)]">예약 날짜</p>
                          <p className="font-medium text-right">
                              {fmtKoreanDate(startDate)} - {fmtKoreanDate(endDate)} ({durationDays}일)
                          </p>
                      </div>
                  </div>
              </section>

              {/* 결제 금액 */}
              <section>
                      <h2 className="text-lg font-bold mb-3">결제 금액</h2>
                      <div className="bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] p-4 space-y-3 text-sm">
                          <div className="flex justify-between text-[var(--text-secondary)]">
                              <p>공간 이용료 ({durationDays}일)</p>
                              <p>{costDetails.spaceUsage.toLocaleString()}원</p>
                          </div>
                          <div className="flex justify-between items-center mt-3 pt-3 font-bold">
                              <p className="text-base">총 결제 금액</p>
                              <p className="text-lg text-[var(--primary-color)]">{costDetails.total.toLocaleString()}원</p>
                          </div>
                      </div>
              </section>

              {/* 에러 메시지 */}
              {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                      {error}
                  </div>
              )}
          </main>
          
          <div className={isModal ? 'mt-auto pt-4' : ''}>
              {!isModal ? (
                   <footer
                   className="fixed bottom-0 left-0 right-0 w-full max-w-md mx-auto bg-white p-4"
                  >
                      <button
                          onClick={handleConfirmBooking}
                          disabled={isSubmitting || isLoadingArtworks || !selectedArtwork}
                          className="w-full h-14 bg-[#D2B48C] hover:bg-[#C19A6B] text-white font-bold rounded-xl transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                          {isSubmitting ? '예약 중...' : isLoadingArtworks ? '작품 불러오는 중...' : `${costDetails.total.toLocaleString()}원 결제하기`}
                      </button>
                  </footer>
              ) : (
                  <div className="p-4 bg-white">
                      <button
                          onClick={handleConfirmBooking}
                          disabled={isSubmitting || isLoadingArtworks || !selectedArtwork}
                          className="w-full h-[48px] bg-[#D2B48C] hover:bg-[#C19A6B] text-white font-bold rounded-xl transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                          {isSubmitting ? '예약 중...' : isLoadingArtworks ? '작품 불러오는 중...' : `${costDetails.total.toLocaleString()}원 결제하기`}
                      </button>
                  </div>
              )}
          </div>
      </div>
      </div>
  );
}
