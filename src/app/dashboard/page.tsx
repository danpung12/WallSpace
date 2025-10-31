'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo, lazy, Suspense } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { CardTitle, CardDescription, CardHeader, CardContent, Card } from '@/app/map/components/ui/card';

import Header from '../components/Header'; // Import UserModeToggle
import { useBottomNav } from '../context/BottomNavContext';
import { useUserMode } from '../context/UserModeContext';
import { useReservations } from '@/context/ReservationContext'; // Import useReservations
import { getUserArtworks, createArtwork, updateArtwork, deleteArtwork } from '@/lib/api/artworks';
import type { Artwork } from '@/types/database';

// 동적 임포트로 모달을 lazy load
const AddArtworkModal = dynamic(() => import('./components/AddArtworkModal'), {
  loading: () => <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
  </div>,
  ssr: false
});

const ArtworkDetailModal = dynamic(() => import('./components/ArtworkDetailModal'), {
  loading: () => <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
  </div>,
  ssr: false
});

// Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

// --- 데이터 타입 정의 ---
// Artwork type is now imported from database types

// --- UI 컴포넌트 ---

function ArtistDashboard({ 
    artworks,
    activeIndex, 
    containerRef, 
    itemRefs, 
    cardBgClass, 
    onAddArtworkClick,
    onEditArtworkClick,
    onViewArtworkClick,
    isLoadingArtworks,
}: { 
    artworks: Artwork[],
    activeIndex: number; 
    containerRef: React.RefObject<HTMLDivElement | null>; 
    itemRefs: React.MutableRefObject<(HTMLDivElement | null)[]>; 
    cardBgClass: string; 
    onAddArtworkClick: () => void;
    onEditArtworkClick: (artwork: Artwork) => void;
    onViewArtworkClick: (artwork: Artwork) => void;
    isLoadingArtworks: boolean;
}) {
  const { reservations } = useReservations(); // Get reservations from context
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  // 전시 중인 예약: 현재 날짜가 예약 기간 내에 있는 예약
  const activeExhibitions = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 오늘 자정

    return reservations
      .filter(reservation => {
        if (reservation.status === 'cancelled') return false;
        
        const startDate = new Date(reservation.start_date);
        const endDate = new Date(reservation.end_date);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);

        return today >= startDate && today <= endDate;
      })
      .map(reservation => {
        const endDate = new Date(reservation.end_date);
        const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        return {
          id: reservation.id,
          artworkTitle: reservation.artwork?.title || '작품명 없음',
          storeName: reservation.location?.name || '장소 정보 없음',
          location: reservation.location?.address || '',
          period: `${new Date(reservation.start_date).toLocaleDateString('ko-KR')} - ${new Date(reservation.end_date).toLocaleDateString('ko-KR')}`,
          image: reservation.artwork?.image_url || reservation.locationImage || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400&h=300&fit=crop',
          daysLeft,
        };
      });
  }, [reservations]);

  useEffect(() => {
    if (artworks.length <= 3) {
      setIsEnd(true);
    } else {
      setIsEnd(false);
    }
  }, [artworks.length]);

  return (
    <div className="space-y-6">
      <section className={`${cardBgClass} dark:bg-gray-700 rounded-xl shadow-md p-4 border border-gray-100 dark:border-gray-600 ${artworks.length === 0 && !isLoadingArtworks ? 'relative min-h-[400px] flex items-center justify-center' : ''}`}>
        <div className={`flex items-center justify-between ${artworks.length === 0 && !isLoadingArtworks ? 'absolute top-4 left-4 right-4' : 'mb-4'}`}>
          <h2 className="text-2xl font-bold text-[#3D2C1D] dark:text-gray-100">내 작품</h2>
          {artworks.length > 0 && (
            <>
              <Link
                href="/dashboard/add"
                className="bg-[#c19a6b] text-white text-sm font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-opacity-90 transition-colors active:opacity-90 lg:hidden"
                >
                작품 추가
              </Link>
              <button
                onClick={onAddArtworkClick}
                className="hidden lg:block bg-[#c19a6b] text-white text-sm font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-opacity-90 transition-colors active:opacity-90"
              >
                작품 추가
              </button>
            </>
          )}
        </div>
        {/* Mobile Carousel */}
        <div ref={containerRef} className={`flex overflow-x-auto snap-x snap-mandatory scroll-smooth gap-4 pb-2 no-scrollbar lg:hidden ${artworks.length === 0 && !isLoadingArtworks ? '' : ''}`} style={{ WebkitOverflowScrolling: 'touch' }}>
          {artworks.length === 0 && !isLoadingArtworks ? (
            <div className="w-full flex flex-col items-center justify-center px-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#D2B48C]/20 to-[#C19A6B]/20 flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-4xl text-[#C19A6B]">palette</span>
              </div>
              <h3 className="text-lg font-bold text-[#3D2C1D] dark:text-gray-100 mb-2">첫 작품을 등록해보세요!</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
                작품을 추가하고 전시 공간에<br/>당신의 예술을 선보이세요 ✨
              </p>
              <Link
                href="/dashboard/add"
                className="bg-gradient-to-r from-[#D2B48C] to-[#C19A6B] text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <span className="flex items-center gap-2 text-sm">
                  <span className="material-symbols-outlined text-xl">add_circle</span>
                  작품 추가하기
                </span>
              </Link>
            </div>
          ) : (
            artworks.map((art, idx) => (
              <div
                key={art.id}
                ref={(el) => { if(itemRefs.current) itemRefs.current[idx] = el; }}
                className={`snap-center flex-shrink-0 w-[75%] sm:w-[60%] transition-all duration-300`}
              >
                <ArtworkCard art={art} onEditClick={onEditArtworkClick} onViewClick={onViewArtworkClick} />
              </div>
            ))
          )}
        </div>
        {/* PC Carousel */}
         <div className="hidden lg:block relative">
           {artworks.length === 0 ? (
             <div className="w-full flex flex-col items-center justify-center px-4">
               <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#D2B48C]/20 to-[#C19A6B]/20 flex items-center justify-center mb-4">
                 <span className="material-symbols-outlined text-5xl text-[#C19A6B]">palette</span>
               </div>
               <h3 className="text-xl font-bold text-[#3D2C1D] dark:text-gray-100 mb-2">첫 작품을 등록해보세요!</h3>
               <p className="text-base text-gray-500 dark:text-gray-400 text-center mb-6">
                 작품을 추가하고 전시 공간에 당신의 예술을 선보이세요 ✨
               </p>
               <button
                 onClick={onAddArtworkClick}
                 className="bg-gradient-to-r from-[#D2B48C] to-[#C19A6B] text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
               >
                 <span className="flex items-center gap-2">
                   <span className="material-symbols-outlined">add_circle</span>
                   작품 추가하기
                 </span>
               </button>
             </div>
           ) : (
             <Swiper
                modules={[Navigation]}
                spaceBetween={16}
                slidesPerView={3}
                navigation={{
                    nextEl: '.swiper-button-next-custom',
                    prevEl: '.swiper-button-prev-custom',
                }}
                onSlideChange={(swiper) => {
                    setIsBeginning(swiper.isBeginning);
                    setIsEnd(swiper.isEnd);
                }}
                className="!pb-2 !px-8"
             >
                {artworks.map((art) => (
                    <SwiperSlide key={art.id}>
                        <ArtworkCard art={art} onEditClick={onEditArtworkClick} onViewClick={onViewArtworkClick} />
                    </SwiperSlide>
                ))}
             </Swiper>
           )}
           <div className={`swiper-button-prev-custom absolute top-1/2 -translate-y-1/2 left-2 z-10 cursor-pointer transition-opacity duration-300 ${isBeginning ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
              <div className="w-8 h-8 flex items-center justify-center bg-black/40 hover:bg-black/60 rounded-full text-white transition-all duration-200 opacity-70 hover:opacity-100 hover:scale-110">
                  <span className="material-symbols-outlined text-xl">chevron_left</span>
              </div>
           </div>
           <div className={`swiper-button-next-custom absolute top-1/2 -translate-y-1/2 right-2 z-10 cursor-pointer transition-opacity duration-300 ${isEnd ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
              <div className="w-8 h-8 flex items-center justify-center bg-black/40 hover:bg-black/60 rounded-full text-white transition-all duration-200 opacity-70 hover:opacity-100 hover:scale-110">
                  <span className="material-symbols-outlined text-xl">chevron_right</span>
              </div>
           </div>
         </div>
      </section>
      <div className="space-y-6 lg:grid lg:grid-cols-5 lg:gap-8 lg:space-y-0">
        <div className="space-y-6 lg:col-span-2">
          {/* 전시 중 카드 */}
          <section className={`${cardBgClass} dark:bg-gray-700 rounded-xl shadow-md p-4 border border-gray-100 dark:border-gray-600 ${activeExhibitions.length === 0 ? 'relative min-h-[400px] flex items-center justify-center' : ''}`}>
            <h2 className={`text-2xl font-bold text-[#3D2C1D] dark:text-gray-100 ${activeExhibitions.length === 0 ? 'absolute top-4 left-4 right-4' : 'mb-4'}`}>전시 중</h2>
            <div className="space-y-4">
              {activeExhibitions.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-4xl text-green-600">gallery_thumbnail</span>
                  </div>
                  <h4 className="text-lg font-bold text-[#3D2C1D] dark:text-gray-100 mb-2">전시 중인 작품이 없어요</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    예약을 통해<br/>작품을 전시해보세요! 🎨
                  </p>
                </div>
              ) : (
                activeExhibitions.map(exhibition => (
                <Link
                  href={`/exhibition-detail?id=${encodeURIComponent(exhibition.id)}`}
                  className="block"
                  key={exhibition.id}
                  >
                  <div className="rounded-xl shadow-md p-4 bg-white dark:bg-gray-600 flex items-start gap-4 border border-[#E5D7C6]/30 relative cursor-pointer hover:shadow-lg transition-shadow">
                    <div
                      className="w-24 h-24 bg-center bg-no-repeat bg-cover rounded-lg flex-shrink-0"
                      style={{ backgroundImage: `url("${exhibition.image}")` }}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#8C7853] dark:text-gray-300">
                        예약 ID: {(exhibition.short_id || exhibition.id).substring(0, 5).toUpperCase()}
                      </p>
                      <h3 className="text-lg font-bold text-[#3D2C1D] dark:text-gray-100 mt-1 truncate">
                        {exhibition.storeName}
                      </h3>
                      <p className="text-sm text-[#8C7853] dark:text-gray-300 mt-2">
                        {exhibition.period}
                      </p>
                    </div>
                    <span className="absolute top-4 right-4 text-xs font-semibold py-1 px-2 rounded-full bg-green-100 text-green-600">
                      D-{exhibition.daysLeft}
                    </span>
                  </div>
                </Link>
              ))
              )}
            </div>
          </section>
        </div>

        <div className="space-y-6 lg:col-span-3">
          {/* 예정된 예약 카드 */}
          <section className={`${cardBgClass} dark:bg-gray-700 rounded-xl shadow-md p-4 border border-gray-100 dark:border-gray-600 ${reservations.filter(r => r.status === 'confirmed' || r.status === 'pending').length === 0 ? 'relative min-h-[400px] flex items-center justify-center' : ''}`}>
            <h2 className={`text-2xl font-bold text-[#3D2C1D] dark:text-gray-100 ${reservations.filter(r => r.status === 'confirmed' || r.status === 'pending').length === 0 ? 'absolute top-4 left-4 right-4' : 'mb-4'}`}>예정된 예약</h2>
            <div className="space-y-4">
              {reservations.filter(r => r.status === 'confirmed' || r.status === 'pending').length > 0 ? (
                reservations.filter(r => r.status === 'confirmed' || r.status === 'pending').map(reservation => {
                  console.log('📦 Reservation for card:', { id: reservation.id, status: reservation.status });
                  return (
                    <Link
                      href={`/bookingdetail?id=${encodeURIComponent(reservation.id)}`}
                      className="block"
                      key={reservation.id}
                    >
                      <ReservationCard reservation={reservation} userType="artist" />
                    </Link>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center px-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-4xl text-blue-600">event_available</span>
                  </div>
                  <h4 className="text-lg font-bold text-[#3D2C1D] dark:text-gray-100 mb-2">예정된 예약이 없어요</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    새로운 예약이 이곳에 표시됩니다 📅
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

const ArtworkCard = React.memo(({ art, onEditClick, onViewClick }: { art: Artwork; onEditClick: (artwork: Artwork) => void; onViewClick: (artwork: Artwork) => void; }) => (
    <div className="bg-white dark:bg-gray-600 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-500 h-full">
        <div 
            className="w-full h-40 bg-center bg-no-repeat bg-cover cursor-pointer hover:opacity-90 transition-opacity" 
            style={{ backgroundImage: `url("${art.image_url || 'https://via.placeholder.com/400x300'}")` }}
            onClick={() => onViewClick(art)}
        />
        <div className="p-4">
            <div className="flex items-start justify-between">
                <div className="flex-1 cursor-pointer" onClick={() => onViewClick(art)}>
                    <h3 className="font-bold text-lg text-[#3D2C1D] dark:text-gray-100 hover:text-[#8C7853] transition-colors">{art.title}</h3>
                    <p className="text-sm text-[#8C7853] dark:text-gray-300 mt-1">크기: {art.dimensions}</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); onEditClick(art); }} className="text-sm font-semibold text-[#8C7853] dark:text-gray-300 hover:text-[#3D2C1D] dark:hover:text-gray-100 transition-colors">
                    Edit
                </button>
            </div>
        </div>
    </div>
), (prevProps, nextProps) => {
    return prevProps.art.id === nextProps.art.id && prevProps.art.image_url === nextProps.art.image_url;
});

// 🏬 사장님 대시보드 컴포넌트
function ManagerDashboard({ 
  activeIndex, 
  containerRef, 
  itemRefs, 
  cardBgClass,
  locations,
  isLoadingLocations
}: { 
  activeIndex: number; 
  containerRef: React.RefObject<HTMLDivElement | null>; 
  itemRefs: React.MutableRefObject<(HTMLDivElement | null)[]>; 
  cardBgClass: string;
  locations: any[];
  isLoadingLocations: boolean;
}) {
  const { reservations } = useReservations(); // Get reservations from context
  const [locationReservationCounts, setLocationReservationCounts] = useState<Record<string, { confirmed: number, total: number }>>({});

  // 각 장소의 실시간 예약 수 계산
  useEffect(() => {
    const calculateLocationCounts = async () => {
      if (!locations || locations.length === 0) return;
      
      const counts: Record<string, { confirmed: number, total: number }> = {};
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      for (const location of locations) {
        if (!location.spaces || location.spaces.length === 0) {
          counts[location.id] = { confirmed: 0, total: location.spaces?.length || 0 };
          continue;
        }
        
        let confirmedCount = 0;
        const totalSpaces = location.spaces.length;
        
        // 각 공간의 예약 수 확인
        for (const space of location.spaces) {
          try {
            const response = await fetch(`/api/reservations?space_id=${space.id}`);
            if (response.ok) {
              const data = await response.json();
              // confirmed 상태이면서 유효한 예약 카운트
              const spaceConfirmedCount = (data || []).filter((r: any) => {
                if (r.status !== 'confirmed') return false;
                const endDate = new Date(r.end_date);
                endDate.setHours(23, 59, 59, 999);
                return endDate >= today;
              }).length;
              
              if (spaceConfirmedCount > 0) {
                confirmedCount++;
              }
            }
          } catch (error) {
            console.error(`Failed to fetch reservations for space ${space.id}:`, error);
          }
        }
        
        counts[location.id] = { confirmed: confirmedCount, total: totalSpaces };
        console.log(`📊 Location ${location.name}: ${confirmedCount}/${totalSpaces} spaces reserved`);
      }
      
      setLocationReservationCounts(counts);
    };
    
    if (locations && locations.length > 0) {
      calculateLocationCounts();
    }
  }, [locations]);

  return (
    <>
      <div className="space-y-6 lg:grid lg:grid-cols-3 lg:gap-8">
        <div className="lg:col-span-3 space-y-6">
  {/* 내 가게 카드 */}
  <section className={`${cardBgClass} dark:bg-gray-700 rounded-xl shadow-md p-4 border border-gray-100 dark:border-gray-600 ${locations.length === 0 && !isLoadingLocations ? 'relative min-h-[340px] flex items-center justify-center' : ''}`}>
      <div className={`flex items-center justify-between ${locations.length === 0 && !isLoadingLocations ? 'absolute top-4 left-4 right-4' : 'mb-4'}`}>
          <h2 className="text-2xl font-bold text-[#3D2C1D] dark:text-gray-100">내 가게</h2>
          {locations.length > 0 && (
            <Link
              href="/dashboard/add-store"
              className="bg-[#c19a6b] text-white text-sm font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-opacity-90 transition-colors active:opacity-90"
              >
                가게 추가
            </Link>
          )}
      </div>
      <div ref={containerRef} className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth gap-4 pb-2 no-scrollbar lg:grid lg:grid-cols-3 lg:overflow-visible" style={{ WebkitOverflowScrolling: 'touch' }}>
          {isLoadingLocations ? (
            <div className="w-full text-center py-8 text-gray-500">
              가게 정보를 불러오는 중...
            </div>
          ) : locations.length === 0 ? (
            <div className="w-full flex flex-col items-center justify-center px-4 lg:col-span-3">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#D2B48C]/20 to-[#C19A6B]/20 flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-4xl text-[#C19A6B]">storefront</span>
              </div>
              <h3 className="text-lg font-bold text-[#3D2C1D] dark:text-gray-100 mb-2">첫 가게를 등록해보세요!</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
                가게를 추가하고 예술가들의<br/>작품을 전시하세요 🏪
              </p>
              <Link
                href="/dashboard/add-store"
                className="bg-gradient-to-r from-[#D2B48C] to-[#C19A6B] text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <span className="flex items-center gap-2 text-sm">
                  <span className="material-symbols-outlined text-xl">add_business</span>
                  가게 추가하기
                </span>
              </Link>
            </div>
          ) : (
            locations.map((location, idx) => (
              <div
                  key={location.id}
                  ref={(el) => { if(itemRefs.current) itemRefs.current[idx] = el; }}
                  className={`snap-center flex-shrink-0 w-[75%] sm:w-[60%] lg:w-full transition-all duration-300 ${idx === activeIndex ? 'opacity-100 scale-100' : 'opacity-100 scale-100 lg:opacity-100'}`}
              >
                  <Link href={`/location-detail?id=${location.id}`}>
                    <div className="bg-white dark:bg-gray-600 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-500 cursor-pointer hover:shadow-lg transition-shadow">
                        <div className="w-full h-40 bg-center bg-no-repeat bg-cover" style={{ backgroundImage: `url("${location.images?.[0] || 'https://via.placeholder.com/400x300'}")` }} />
                        <div className="p-4">
                            <div>
                                <h3 className="font-bold text-lg text-[#3D2C1D] dark:text-gray-100">{location.name}</h3>
                                <p className="text-sm text-[#8C7853] dark:text-gray-300 mt-1">{location.address}</p>
                                <div className="text-sm font-bold text-[#3D2C1D] dark:text-gray-100 mt-2">
                                    {locationReservationCounts[location.id] ? (
                                      <span>{locationReservationCounts[location.id].confirmed}/{locationReservationCounts[location.id].total} 공간 예약됨</span>
                                    ) : (
                                      <span className="flex items-center gap-2">
                                        <div className="w-3 h-3 border-2 border-[#D2B48C] border-t-transparent rounded-full animate-spin"></div>
                                        로딩 중...
                                      </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                  </Link>
              </div>
            ))
          )}
      </div>
  </section>
</div>
      <div className="lg:col-span-3 space-y-6">
        {/* 예약 요청 카드 */}
        <section className={`${cardBgClass} dark:bg-gray-700 rounded-xl shadow-md p-4 border border-gray-100 dark:border-gray-600 ${reservations.filter(r => r.status === 'confirmed' || r.status === 'pending').length === 0 ? 'relative min-h-[400px] flex items-center justify-center' : ''}`}>
          <h2 className={`text-2xl font-bold text-[#3D2C1D] dark:text-gray-100 ${reservations.filter(r => r.status === 'confirmed' || r.status === 'pending').length === 0 ? 'absolute top-4 left-4 right-4' : 'mb-4'}`}>예약 요청</h2>
          <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4">
            {reservations.filter(r => r.status === 'confirmed' || r.status === 'pending').length > 0 ? (
              reservations.filter(r => r.status === 'confirmed' || r.status === 'pending').map(reservation => (
                <Link
                  href={`/manager-booking-approval?id=${encodeURIComponent(reservation.id)}`}
                  className="block"
                  key={reservation.id}
                  >
                  <ReservationCard reservation={reservation} userType="manager" />
                </Link>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center px-4 lg:col-span-2">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-4xl text-blue-600">event_available</span>
                </div>
                <h4 className="text-lg font-bold text-[#3D2C1D] dark:text-gray-100 mb-2">예약 요청이 없어요</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  새로운 예약 요청이 이곳에 표시됩니다 📅
                </p>
              </div>
            )}
          </div>
        </section>
        </div>
      </div>

    </>
  );
}

// 🕐 지난 예약 섹션 컴포넌트
function PastReservationsSection({ 
  reservations, 
  cardBgClass, 
  userType 
}: { 
  reservations: any[]; 
  cardBgClass: string; 
  userType: 'artist' | 'manager';
}) {
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;
  
  // 최근 3개만 표시
  const recentReservations = reservations.slice(0, 3);
  
  // 페이지네이션 계산
  const totalPages = Math.ceil(reservations.length / ITEMS_PER_PAGE);
  const paginatedReservations = reservations.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  
  const linkHref = (reservationId: string) => {
    return userType === 'artist' 
      ? `/bookingdetail?id=${encodeURIComponent(reservationId)}`
      : `/manager-booking-approval?id=${encodeURIComponent(reservationId)}`;
  };
  
  return (
    <>
      <section className={`${cardBgClass} dark:bg-gray-700 rounded-xl shadow-md p-4 border border-gray-100 dark:border-gray-600`}>
        <h2 className="text-2xl font-bold text-[#3D2C1D] dark:text-gray-100 mb-4">지난 예약</h2>
        <div className={`space-y-4 ${userType === 'manager' ? 'lg:grid lg:grid-cols-2 lg:gap-4' : ''}`}>
          {recentReservations.length > 0 ? (
            recentReservations.map(reservation => (
              <Link
                href={linkHref(reservation.id)}
                className="block"
                key={reservation.id}
                >
                <ReservationCard reservation={reservation} userType={userType} />
              </Link>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-slate-100 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-4xl text-gray-400">history</span>
              </div>
              <h4 className="text-lg font-bold text-[#3D2C1D] dark:text-gray-100 mb-2">지난 예약이 없어요</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                예약 기록이 이곳에 표시됩니다 📋
              </p>
            </div>
          )}
        </div>
        
        {/* 더 보기 버튼 */}
        {reservations.length > 3 && (
          <button
            onClick={() => setShowModal(true)}
            className="w-full mt-4 py-3 px-4 bg-[#D2B48C] hover:bg-[#C19A6B] text-white font-semibold rounded-lg transition-colors"
          >
            더 보기 ({reservations.length - 3}개)
          </button>
        )}
      </section>
      
      {/* 모든 지난 예약 팝업 */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] px-4"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between p-6">
              <h3 className="text-2xl font-bold text-[#3D2C1D] dark:text-gray-100">
                모든 지난 예약
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            {/* 컨텐츠 */}
            <div className="flex-1 overflow-y-auto p-6 pt-0" style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#D2B48C #F5F5F5'
            }}>
              <style jsx>{`
                div::-webkit-scrollbar {
                  width: 6px;
                }
                div::-webkit-scrollbar-track {
                  background: transparent;
                }
                div::-webkit-scrollbar-thumb {
                  background-color: #D2B48C;
                  border-radius: 3px;
                }
                div::-webkit-scrollbar-thumb:hover {
                  background-color: #C19A6B;
                }
                :global(.dark) div::-webkit-scrollbar-thumb {
                  background-color: #D2B48C;
                }
                :global(.dark) div::-webkit-scrollbar-thumb:hover {
                  background-color: #E8C8A0;
                }
              `}</style>
              <div className={`space-y-4 ${userType === 'manager' ? 'lg:grid lg:grid-cols-2 lg:gap-4' : ''}`}>
                {paginatedReservations.map(reservation => (
                  <Link
                    href={linkHref(reservation.id)}
                    className="block"
                    key={reservation.id}
                    onClick={() => setShowModal(false)}
                  >
                    <ReservationCard reservation={reservation} userType={userType} />
                  </Link>
                ))}
              </div>
            </div>
            
            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 p-6 pt-4">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  &lt;
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-1 rounded-lg font-semibold transition-colors ${
                      currentPage === page
                        ? 'bg-[#D2B48C] text-white'
                        : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  &gt;
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// 🎫 예약 카드 공통 컴포넌트
const ReservationCard = React.memo(({ reservation, userType }: { reservation: any; userType: 'artist' | 'manager' }) => {
  const statusStyles = {
    confirmed: 'text-green-600 bg-green-100',
    pending: 'text-yellow-600 bg-yellow-100',
    completed: 'text-gray-600 bg-gray-200',
    cancelled: 'text-red-600 bg-red-100',
  };
  const statusText = {
    confirmed: '확정',
    pending: '확인 중',
    completed: '종료',
    cancelled: '취소됨',
  };

  const isCompleted = reservation.status === 'completed' || reservation.status === 'cancelled';

  // API에서 받은 데이터 구조에 맞게 변환
  const artworkImage = reservation.artwork?.image_url || reservation.artwork?.images?.[0] || 'https://picsum.photos/200/200';
  const artworkTitle = reservation.artwork?.title || '제목 없음';
  const locationName = reservation.location?.name || '장소 정보 없음';
  const spaceName = reservation.space?.name || '';
  const artistName = reservation.artist?.nickname || reservation.artist?.name || '작가 정보 없음';
  const startDate = reservation.start_date ? new Date(reservation.start_date).toLocaleDateString('ko-KR') : '';
  const endDate = reservation.end_date ? new Date(reservation.end_date).toLocaleDateString('ko-KR') : '';
  const period = startDate && endDate ? `${startDate} - ${endDate}` : '날짜 정보 없음';

  return (
    <div className={`rounded-xl shadow-md p-4 relative flex items-start gap-4 cursor-pointer ${isCompleted ? 'bg-gray-50 dark:bg-gray-700 opacity-80' : 'bg-white dark:bg-gray-600'}`}>
      <div
        className="w-24 h-24 bg-center bg-no-repeat bg-cover rounded-lg flex-shrink-0"
        style={{ backgroundImage: `url("${artworkImage}")` }}
      />
      <div className="flex-1">
        <p className="text-sm font-medium text-[#8C7853] dark:text-gray-300">
          {userType === 'manager' ? locationName : `예약 ID: ${reservation.short_id || reservation.id}`}
        </p>
        <h3 className="text-lg font-bold text-[#3D2C1D] dark:text-gray-100 mt-1 truncate">
          {userType === 'manager' 
            ? `'${artistName}' 작가의 '${artworkTitle}'`
            : locationName
          }
        </h3>
        {userType === 'artist' && spaceName && (
          <p className="text-sm text-[#8C7853] dark:text-gray-300 mt-1">
            📍 {spaceName}
          </p>
        )}
        <p className="text-sm text-[#8C7853] dark:text-gray-300 mt-2">
          {period}
        </p>
      </div>
      {userType === 'artist' && (
        <span className={`absolute top-4 right-4 text-xs font-semibold py-1 px-2 rounded-full ${statusStyles[reservation.status as keyof typeof statusStyles]}`}>
          {statusText[reservation.status as keyof typeof statusText]}
        </span>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
    return prevProps.reservation.id === nextProps.reservation.id && 
           prevProps.reservation.status === nextProps.reservation.status;
});

ReservationCard.displayName = 'ReservationCard';

// --- 내부 대시보드 컴포넌트 ---
function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [viewingArtwork, setViewingArtwork] = useState<Artwork | null>(null);
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);
  const [isLoadingArtworks, setIsLoadingArtworks] = useState(true);
  const [locations, setLocations] = useState<any[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);
  
  const [activeIndex, setActiveIndex] = useState(0);
  const { userMode, setUserMode } = useUserMode();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const tickingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { setIsNavVisible } = useBottomNav();

  useEffect(() => {
    // Ensure the bottom nav is visible when the dashboard is mounted
    setIsNavVisible(true);
  }, [setIsNavVisible]);

  // 병렬로 데이터 로드 (최적화)
  useEffect(() => {
    const fetchData = async () => {
      if (userMode === 'artist') {
        try {
          setIsLoadingArtworks(true);
          const data = await getUserArtworks();
          setArtworks(data);
        } catch (error) {
          console.error('Failed to fetch artworks:', error);
        } finally {
          setIsLoadingArtworks(false);
        }
      } else if (userMode === 'manager') {
        try {
          setIsLoadingLocations(true);
          const response = await fetch('/api/locations?myLocations=true', {
            next: { revalidate: 60 } // 60초 캐싱
          });
          if (response.ok) {
            const data = await response.json();
            setLocations(data);
          } else {
            console.error('Failed to fetch locations');
          }
        } catch (error) {
          console.error('Error fetching locations:', error);
        } finally {
          setIsLoadingLocations(false);
        }
      }
    };

    fetchData();
  }, [userMode, searchParams]);

  // 중앙에 위치한 카드를 계산하고 해당 카드로 스크롤하는 함수
  const snapToCenter = useCallback(() => {
      const c = containerRef.current;
      if (!c) return;

      const centerX = c.scrollLeft + c.clientWidth / 2;
      let bestIdx = -1;
      let bestDist = Infinity;

      itemRefs.current.forEach((el, idx) => {
          if (!el) return;
          const cardCenter = el.offsetLeft + el.clientWidth / 2;
          const dist = Math.abs(cardCenter - centerX);
          if (dist < bestDist) {
              bestDist = dist;
              bestIdx = idx;
          }
      });

      if (bestIdx !== -1) {
          setActiveIndex(bestIdx);
          // 이 부분이 스크롤 위치를 강제로 변경하여 문제를 일으켰습니다. 제거합니다.
          // const targetEl = itemRefs.current[bestIdx];
          // if (targetEl) {
          //     const targetScrollLeft = targetEl.offsetLeft + targetEl.clientWidth / 2 - c.clientWidth / 2;
          //     c.scrollTo({ left: targetScrollLeft, behavior: 'auto' });
          // }
      }
  }, []); // 의존성 배열을 비워서 함수가 재생성되지 않도록 합니다.

  // 스크롤 이벤트 핸들러 (디바운싱 적용)
  const onScroll = () => {
      if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(snapToCenter, 100);
  };

  useEffect(() => {
      const c = containerRef.current;
      if (!c) return;

      // userMode가 변경될 때 캐러셀 상태를 초기화
      itemRefs.current = itemRefs.current.slice(0, userMode === 'artist' ? artworks.length : locations.length);
      c.scrollTo({ left: 0, behavior: 'auto' });
      setActiveIndex(0);

      // 'scrollend' 이벤트가 지원되는 경우 사용하고, 아니면 'scroll' 이벤트에 타이머를 사용합니다.
      const eventName = 'onscrollend' in window ? 'scrollend' : 'scroll';
      const listener = eventName === 'scrollend' ? snapToCenter : onScroll;
      
      c.addEventListener(eventName, listener, { passive: true });
      window.addEventListener('resize', snapToCenter);

      // 초기 로드 시 중앙 카드 계산
      const initialTimeout = setTimeout(snapToCenter, 100);

      return () => {
          c.removeEventListener(eventName, listener);
          window.removeEventListener('resize', snapToCenter);
          if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
          clearTimeout(initialTimeout);
      };
  }, [userMode, snapToCenter, artworks.length, locations.length]);

  const handleAddArtworkClick = () => {
    setEditingArtwork(null);
    setModalOpen(true);
  };

  const handleEditArtworkClick = (artwork: Artwork) => {
    setEditingArtwork(artwork);
    setModalOpen(true);
  };

  const handleViewArtworkClick = (artwork: Artwork) => {
    setViewingArtwork(artwork);
    setDetailModalOpen(true);
  };

  const handleSaveArtwork = async (savedArtwork: {
    id?: number | string;
    title: string;
    dimensions: string;
    description: string;
    price: string;
    file: File | null;
  }) => {
    try {
      if (savedArtwork.id) {
        // 기존 작품 수정
        const updatedArtwork = await updateArtwork(savedArtwork.id as string, {
          title: savedArtwork.title,
          dimensions: savedArtwork.dimensions,
          description: savedArtwork.description,
          price: parseFloat(savedArtwork.price) || 0,
          file: savedArtwork.file,
        });
        setArtworks(artworks.map(art => art.id === savedArtwork.id ? updatedArtwork : art));
      } else {
        // 새 작품 추가
        if (!savedArtwork.file) {
          alert('이미지를 선택해주세요.');
          return;
        }
        const newArtwork = await createArtwork({
          title: savedArtwork.title,
          dimensions: savedArtwork.dimensions,
          description: savedArtwork.description,
          price: parseFloat(savedArtwork.price) || 0,
          file: savedArtwork.file,
        });
        setArtworks([newArtwork, ...artworks]);
      }
      setModalOpen(false);
      setEditingArtwork(null);
    } catch (error) {
      console.error('Failed to save artwork:', error);
      alert('작품 저장에 실패했습니다.');
    }
  };

  const handleDeleteArtwork = async (id: number | string) => {
    try {
      await deleteArtwork(id as string);
      setArtworks(prevArtworks => prevArtworks.filter(artwork => artwork.id !== id));
      setModalOpen(false);
      setDetailModalOpen(false);
    } catch (error) {
      console.error('Failed to delete artwork:', error);
      alert('작품 삭제에 실패했습니다.');
    }
  };


  const artistBgClass = "bg-[#FDFBF8]"; // 기존 아티스트 모드 배경
  const managerBgClass = "bg-[#F5F1EC]"; // 기존 사장님 모드 배경
  
  // 사용자 모드에 따라 각 섹션 카드의 배경색을 더 연하게, 명확하게 동적으로 설정
  // 기존 #f7f7f7 대신 완전한 흰색 또는 메인 배경보다 살짝 밝은 톤으로 조정
  const cardBgClass = userMode === 'artist' ? 'bg-white' : 'bg-[#FCFBF8]'; // 아티스트 모드는 완전 흰색, 사장님 모드는 아주 연한 미색

  // 로딩 화면 표시
  const isLoading = (userMode === 'artist' && isLoadingArtworks && artworks.length === 0) ||
                    (userMode === 'manager' && isLoadingLocations && locations.length === 0);
  
  if (isLoading) {
    return (
      <div className="flex min-h-[100dvh] w-full h-full items-center justify-center font-pretendard" style={{ backgroundColor: 'var(--background-color)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--accent-color)' }}></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Stitch - Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <style jsx global>{`
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .bg-\\[\\#FDFBF8\\] { --tw-bg-opacity: 1; background-color: rgb(253 251 248 / var(--tw-bg-opacity)); }
        .bg-\\[\\#F5F1EC\\] { --tw-bg-opacity: 1; background-color: rgb(245 241 236 / var(--tw-bg-opacity)); }
        /* Newly added lighter card colors */
        .bg-\\[\\#FAF8F5\\] { --tw-bg-opacity: 1; background-color: rgb(250 248 245 / var(--tw-bg-opacity)); }
        .bg-\\[\\#F3EFEA\\] { --tw-bg-opacity: 1; background-color: rgb(243 239 234 / var(--tw-bg-opacity)); }
        .bg-\\[\\#FCFBF8\\] { --tw-bg-opacity: 1; background-color: rgb(252 251 248 / var(--tw-bg-opacity)); } /* 사장님 모드 카드 배경 추가 */
      `}</style>
      
      <div className={`transition-all duration-300 ${isModalOpen ? 'blur-sm' : ''}`}>
        <Header />
        <div className={`relative flex min-h-[100dvh] flex-col text-[#3D2C1D] font-pretendard transition-colors duration-300 ${userMode === 'artist' ? artistBgClass : managerBgClass} dark:bg-gray-900`}>
          <header className={`sticky top-0 z-10 backdrop-blur-sm transition-colors duration-300 ${userMode === 'artist' ? 'bg-[#FDFBF8]/80 dark:bg-gray-900/80' : 'bg-[#F5F1EC]/80 dark:bg-gray-900/80'} lg:hidden`}>
            <div className="flex items-center p-4">
              <button type="button" onClick={() => router.back()} aria-label="뒤로 가기" className="text-[#3D2C1D] dark:text-gray-100 active:scale-95 transition-transform">
                <svg fill="none" height="24" width="24" stroke="currentColor" viewBox="0 0 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
              <h1 className="flex-1 text-center text-xl font-bold text-[#3D2C1D] dark:text-gray-100">대시보드</h1>
              <div className="flex items-center text-xs font-semibold p-1 rounded-lg bg-[#EAE5DE]">
                <button type="button" onClick={() => setUserMode('artist')} className={`px-3 py-1 rounded-md transition-all duration-300 ${userMode === 'artist' ? 'bg-white shadow-sm text-[#3D2C1D]' : 'text-[#8C7853]'}`}>
                  작가
                </button>
                <button type="button" onClick={() => setUserMode('manager')} className={`px-3 py-1 rounded-md transition-all duration-300 ${userMode === 'manager' ? 'bg-white shadow-sm text-[#3D2C1D]' : 'text-[#8C7853]'}`}>
                  사장님
                </button>
              </div>
            </div>
          </header>
          <main className="w-full p-4 space-y-8 pb-24 lg:pt-8">
            <div className="max-w-7xl mx-auto lg:px-8">
              {userMode === 'artist' ? (
                <ArtistDashboard
                  artworks={artworks}
                  activeIndex={activeIndex}
                  containerRef={containerRef}
                  itemRefs={itemRefs}
                  cardBgClass={cardBgClass}
                  onAddArtworkClick={handleAddArtworkClick}
                  onEditArtworkClick={handleEditArtworkClick}
                  onViewArtworkClick={handleViewArtworkClick}
                  isLoadingArtworks={isLoadingArtworks}
                />
              ) : (
                <ManagerDashboard 
                  activeIndex={activeIndex} 
                  containerRef={containerRef} 
                  itemRefs={itemRefs} 
                  cardBgClass={cardBgClass}
                  locations={locations}
                  isLoadingLocations={isLoadingLocations}
                />
              )}
            </div>
          </main>
        </div>
      </div>
      <AddArtworkModal 
        isOpen={isModalOpen} 
        onClose={() => setModalOpen(false)} 
        onSave={handleSaveArtwork}
        artworkToEdit={editingArtwork}
        onDelete={handleDeleteArtwork}
      />
      <ArtworkDetailModal 
        isOpen={isDetailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        artwork={viewingArtwork}
        onDelete={handleDeleteArtwork}
      />
    </>
  );
}

// --- 메인 대시보드 페이지 (Suspense로 감싸기) ---
export default function Dashboard() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[100dvh] w-full h-full items-center justify-center font-pretendard bg-[#FDFBF8] dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C19A6B]"></div>
          <p className="text-[#8C7853] dark:text-gray-400">대시보드를 불러오는 중...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}