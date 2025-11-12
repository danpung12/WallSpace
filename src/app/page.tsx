'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import Image from 'next/image';

// --- 라이브러리 임포트 ---
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { IoNotificationsCircle } from 'react-icons/io5';
import { useMap, LocationType } from '../context/MapContext'; // ✨ 1. 지도 컨텍스트 훅 및 MapProvider 임포트
import { useRouter } from 'next/navigation'; // 1. useRouter 훅 임포트
import { Location } from '@/data/locations';
import { createClient } from '@/lib/supabase/client';
import { useReservations } from '@/context/ReservationContext';

// --- Swiper CSS 임포트 ---
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// MapDisplay 컴포넌트 임포트
import MapDisplay from './components/MapDisplay';
import Header from './components/Header'; // 1. Header 컴포넌트 임포트
import NotificationListModal from './components/NotificationListModal'; // 알림 모달 임포트

// --- 타입 정의 ---
interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  related_id: string | null;
  created_at: string;
  rejection_reason?: string | null;
}

// --- 유틸리티 함수 ---
const getTimeAgo = (dateString: string): string => {
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return '방금 전';
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;
  return past.toLocaleDateString('ko-KR');
};

// --- 유틸리티 함수 ---
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d.toFixed(1); // Return distance with 1 decimal place
};


// --- CSS 스타일 ---
const GlobalSwiperStyles = () => {
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      body { 
        margin: 0; 
        padding: 0; 
        background-color: var(--background-color);
      }
      .swiper-pagination-bullet { 
        background-color: var(--accent-color) !important; 
        opacity: 0.5 !important; 
      }
      .swiper-pagination-bullet-active { 
        opacity: 1 !important; 
      }
      
      .peek-swiper .swiper-slide {
        width: 85%;
        opacity: 0.5;
        transition: opacity 300ms;
      }
      .peek-swiper .swiper-slide-active { opacity: 1; }

      /* PC 스크롤 강제 비활성화 */
      @media (min-width: 1024px) {
        html, body {
          overflow: hidden;
        }
      }

      .custom-scrollbar::-webkit-scrollbar {
        width: 8px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background-color: transparent; 
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background-color: rgba(0, 0, 0, 0.2);
        border-radius: 4px;
      }
      .dark .custom-scrollbar::-webkit-scrollbar-thumb {
        background-color: rgba(255, 255, 255, 0.2);
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background-color: rgba(0, 0, 0, 0.4);
      }
      .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background-color: rgba(255, 255, 255, 0.4);
      }

      .fade-scroll-container {
        position: relative;
      }
      .fade-scroll-container::before,
      .fade-scroll-container::after {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        pointer-events: none;
        z-index: 5;
        opacity: 0;
        transition: opacity 0.3s ease-in-out;
      }
      .fade-scroll-container::before {
        top: 0;
        height: 75px;
        background: linear-gradient(to bottom, #e8e3da 30%, transparent);
      }
      .dark .fade-scroll-container::before {
        background: linear-gradient(to bottom, #1a1a1a 30%, transparent);
      }
      .fade-scroll-container::after {
        bottom: 0;
        height: 250px;
        background: linear-gradient(to top, #e8e3da, transparent);
      }
      .dark .fade-scroll-container::after {
        background: linear-gradient(to top, #1a1a1a, transparent);
      }
      .fade-scroll-container.show-top-fade::before {
        opacity: 1;
      }
      .fade-scroll-container.show-bottom-fade::after {
        opacity: 1;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  return null;
};


// --- 하위 컴포넌트 ---
interface NotificationItemProps {
  notification: Notification;
  onClick: () => void;
}

const NotificationItem = ({ notification, onClick }: NotificationItemProps) => {
  const timeAgo = getTimeAgo(notification.created_at);
  
  return (
    <div 
      className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl flex items-center shadow-lg border border-white/20 dark:border-gray-700/30 cursor-pointer hover:bg-white dark:hover:bg-gray-800 transition-colors duration-200"
      onClick={onClick}
      style={{ 
        height: 'clamp(4.75rem, 11.37vh, 7rem)',
        padding: 'clamp(0.5rem, 1.9vh, 1.25rem)',
        gap: 'clamp(0.375rem, 0.77vw, 0.75rem)'
      }}
    >
      <IoNotificationsCircle 
        className={`flex-shrink-0 ${notification.is_read ? 'text-gray-400' : 'text-[#D2B48C] dark:text-[#E8C8A0]'}`}
        style={{ fontSize: 'clamp(1.75rem, 9.23vw, 2.5rem)' }}
      />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <h3 className={`font-bold truncate ${notification.is_read ? 'text-gray-500' : 'text-[#2C2C2C] dark:text-gray-100'}`}
            style={{ fontSize: 'clamp(0.8125rem, 4.1vw, 1.125rem)' }}>
            {notification.title}
          </h3>
          <p className="flex-shrink-0 text-[#887563] dark:text-gray-400"
            style={{ 
              fontSize: 'clamp(0.625rem, 3.08vw, 0.875rem)',
              marginLeft: 'clamp(0.25rem, 0.77vw, 0.5rem)'
            }}>
            {timeAgo}
          </p>
        </div>
        <p className="text-[#887563] dark:text-gray-400 truncate"
          style={{ 
            fontSize: 'clamp(0.6875rem, 3.59vw, 0.9375rem)',
            marginTop: 'clamp(0.0625rem, 0.3vh, 0.25rem)'
          }}>
          {notification.message}
        </p>
      </div>
    </div>
  );
};

interface RecommendedPlacesProps {
  onSlideChange: (index: number) => void;
  userLocation: { lat: number; lng: number } | null;
  locations: Location[];
  hasNotifications: boolean;
}

const RecommendedPlaces = ({ onSlideChange, userLocation, locations, hasNotifications }: RecommendedPlacesProps) => {
  const router = useRouter(); // 2. router 인스턴스 생성

  const handlePlaceCardClick = (place: Location) => {
    router.push(`/map?placeId=${place.id}`); // 3. '/map' 경로로 placeId와 함께 이동
  };

  const [spaceBetween, setSpaceBetween] = React.useState(16);
  
  React.useEffect(() => {
    const updateSpaceBetween = () => {
      const vw = window.innerWidth;
      // clamp(12px, 4.1vw, 16px) 계산 - iPhone 12 Pro에서 정확히 16px
      const calculatedSpace = Math.max(12, Math.min(vw * 0.041, 16));
      setSpaceBetween(calculatedSpace);
    };
    
    updateSpaceBetween();
    window.addEventListener('resize', updateSpaceBetween);
    return () => window.removeEventListener('resize', updateSpaceBetween);
  }, []);

  return (
    <>
      {/* Mobile: Swiper */}
      <div className="lg:hidden">
        <Swiper
          modules={[Pagination]}
          className="w-full peek-swiper"
          spaceBetween={spaceBetween}
          slidesPerView={'auto'}
          centeredSlides={true}
          pagination={{ clickable: true, el: '.swiper-pagination-outer' }}
          onSlideChange={(swiper) => onSlideChange(swiper.activeIndex)}
        >
          {locations.map((place) => (
            <SwiperSlide key={place.id}>
              <PlaceCard
                place={place}
                userLocation={userLocation}
                onImageClick={() => handlePlaceCardClick(place)}
              />
            </SwiperSlide>
          ))}
          <div className="swiper-pagination-outer text-center relative z-10"
            style={{ marginTop: 'clamp(0.5rem, 1.9vh, 1rem)' }}></div>
        </Swiper>
      </div>

      {/* PC: Grid - 화면 너비에 따라 자동 조절 (최대 3개) */}
      <div className={`hidden lg:grid lg:gap-6 ${hasNotifications ? 'lg:grid-cols-1 xl:grid-cols-2' : 'lg:grid-cols-2 xl:grid-cols-3'}`}>
        {locations.map((place) => (
          <PlaceCard
            key={place.id}
            place={place}
            userLocation={userLocation}
            onImageClick={() => handlePlaceCardClick(place)}
          />
        ))}
      </div>
    </>
  );
};

// --- Place Card Component (New) ---
type PlaceCardProps = {
  place: Location;
  userLocation: { lat: number; lng: number } | null;
  onImageClick: () => void;
};

const PlaceCard = React.memo(({ place, userLocation, onImageClick }: PlaceCardProps) => {
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(place.images.length <= 1);
  const [activeIndex, setActiveIndex] = useState(0);
  const distance = userLocation
    ? calculateDistance(userLocation.lat, userLocation.lng, place.lat, place.lng)
    : null;

  return (
    <div className="group/card bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/30 h-full flex flex-col cursor-pointer transition-all duration-300 ease-out hover:shadow-xl hover:scale-[1.02] hover:bg-white/80 dark:hover:bg-gray-800/80 lg:p-5"
      style={{ 
        padding: 'clamp(0.5rem, 1.9vh, 1.25rem)'
      }}>
      <div
        className="w-full rounded-xl overflow-hidden relative group/image lg:h-56"
        onClick={onImageClick}
        style={{
          height: 'clamp(10rem, 30.33vh, 16rem)'
        }}
      >
        <Swiper
          modules={[Navigation]}
          navigation={{
            nextEl: `.custom-next-button-${place.id}`,
            prevEl: `.custom-prev-button-${place.id}`,
          }}
          slidesPerView={1}
          spaceBetween={0}
          className="w-full h-full"
          allowTouchMove={true}
          onSlideChange={(swiper) => {
            setIsBeginning(swiper.isBeginning);
            setIsEnd(swiper.isEnd);
            setActiveIndex(swiper.activeIndex);
          }}
          onInit={(swiper) => {
            setIsBeginning(swiper.isBeginning);
            setIsEnd(swiper.isEnd);
          }}
        >
          {place.images.map((imgUrl, index) => (
            <SwiperSlide key={index} className="overflow-hidden">
              <div className="relative w-full h-full overflow-hidden">
                <Image
                  src={imgUrl}
                  alt={`${place.name} ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 85vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover/card:scale-105"
                  priority={index === 0}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAUABQDASIAAhEBAxEB/8QAFwABAQEBAAAAAAAAAAAAAAAAAAMEAv/EACQQAAEEAgEDBQEAAAAAAAAAAAEAAgMRBCExEhNRBSIyQXFh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAH/xAAXEQEBAQEAAAAAAAAAAAAAAAABAAIR/9oADAMBAAIRAxEAPwDlkErYjMY7kxZMMcsoaC3gqVs7Yy4NIIQETPtpdskG0BPE1zgxgJccAAV+/SBM2eJ0Qc1wIOx3lAsKAf/Z"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {place.tags && place.tags.length > 0 && (
          <div className="absolute z-10 flex gap-1.5"
            style={{
              top: 'clamp(0.5rem, 1.9vh, 1rem)',
              left: 'clamp(0.5rem, 1.9vh, 1rem)'
            }}>
            {place.tags.slice(0, 2).map((tag, i) => (
              <span 
                key={i} 
                className="px-2 py-0.5 text-white bg-black/30 backdrop-blur-md rounded-full border border-white/10 shadow-sm font-bold" 
                style={{ 
                  fontSize: 'clamp(0.6875rem, 3.59vw, 0.875rem)'
                }}>
                #{tag}
              </span>
            ))}
          </div>
        )}

        <button
          className={`custom-prev-button-${place.id} absolute top-1/2 -translate-y-1/2 z-10 flex items-center justify-center bg-black/40 hover:bg-black/60 rounded-full text-white transition-all duration-200 hover:scale-110 ${isBeginning ? 'opacity-0 pointer-events-none' : 'opacity-70 group-hover/image:opacity-100'}`}
          onClick={(e) => e.stopPropagation()}
          style={{
            left: 'clamp(0.25rem, 2.05vw, 0.5rem)',
            width: 'clamp(1.625rem, 8.21vw, 2rem)',
            height: 'clamp(1.625rem, 8.21vw, 2rem)'
          }}
        >
          <span className="material-symbols-outlined"
            style={{ fontSize: 'clamp(0.9375rem, 5.13vw, 1.25rem)' }}>
            chevron_left
          </span>
        </button>
        <button
          className={`custom-next-button-${place.id} absolute top-1/2 -translate-y-1/2 z-10 flex items-center justify-center bg-black/40 hover:bg-black/60 rounded-full text-white transition-all duration-200 hover:scale-110 ${isEnd ? 'opacity-0 pointer-events-none' : 'opacity-70 group-hover/image:opacity-100'}`}
          onClick={(e) => e.stopPropagation()}
          style={{
            right: 'clamp(0.25rem, 2.05vw, 0.5rem)',
            width: 'clamp(1.625rem, 8.21vw, 2rem)',
            height: 'clamp(1.625rem, 8.21vw, 2rem)'
          }}
        >
          <span className="material-symbols-outlined"
            style={{ fontSize: 'clamp(0.9375rem, 5.13vw, 1.25rem)' }}>
            chevron_right
          </span>
        </button>
      </div>
      <div className="flex-grow lg:px-2"
        style={{
          marginTop: 'clamp(0.5rem, 1.9vh, 1rem)',
          paddingLeft: 'clamp(0.25rem, 2.05vw, 0.5rem)',
          paddingRight: 'clamp(0.25rem, 2.05vw, 0.5rem)'
        }}>
        <div className="flex items-baseline"
          style={{ gap: 'clamp(0.25rem, 2.05vw, 0.5rem)' }}>
          <h3 className="font-bold text-[#2C2C2C] dark:text-gray-100 lg:text-2xl"
            style={{ fontSize: 'clamp(0.9375rem, 5.13vw, 1.25rem)' }}>{place.name}</h3>
          <p className="text-[#887563] dark:text-gray-400 lg:text-base"
            style={{ fontSize: 'clamp(0.6875rem, 3.59vw, 0.875rem)' }}>
            {typeof place.category === 'string' ? place.category : (place.category as any)?.name || '기타'}
          </p>
        </div>
        <div className="flex items-baseline text-[#887563] dark:text-gray-400 lg:text-base"
          style={{ 
            gap: 'clamp(0.25rem, 2.05vw, 0.5rem)',
            marginTop: 'clamp(0.0625rem, 0.47vh, 0.25rem)',
            fontSize: 'clamp(0.6875rem, 3.59vw, 0.875rem)'
          }}>
          <p>{place.address.split(' ').slice(0, 2).join(' ')}</p>
          {distance && (
            <>
              <span>·</span>
              <p>여기서 {distance}km</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // 커스텀 비교 함수로 불필요한 리렌더링 방지
  return (
    prevProps.place.id === nextProps.place.id &&
    prevProps.userLocation?.lat === nextProps.userLocation?.lat &&
    prevProps.userLocation?.lng === nextProps.userLocation?.lng
  );
});

PlaceCard.displayName = 'PlaceCard';


// --- 메인 페이지 컴포넌트 ---
export default function HomePage() {
  const router = useRouter();
  const { refreshReservations } = useReservations();
  const [isLoading, setIsLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [favorites, setFavorites] = useState<Location[]>([]);
  const [currentPlaceIndex, setCurrentPlaceIndex] = useState(0);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showTopFade, setShowTopFade] = useState(false);
  const [showBottomFade, setShowBottomFade] = useState(true);

  // 거절 사유 팝업 state
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [selectedRejection, setSelectedRejection] = useState<{
    reason: string;
    title: string;
  } | null>(null);

  // 추천 장소: 사용자 위치 기반 가까운 순으로 (알림 있으면 4곳, 없으면 12곳)
  const recommendedLocations = useMemo(() => {
    const maxLocations = notifications.length > 0 ? 4 : 12;
    
    if (!userLocation || locations.length === 0) {
      return locations.slice(0, maxLocations);
    }

    // 거리 계산하여 정렬
    const locationsWithDistance = locations.map(location => ({
      ...location,
      distance: parseFloat(calculateDistance(
        userLocation.lat,
        userLocation.lng,
        location.lat,
        location.lng
      ))
    }));

    // 거리순 정렬 후 상위 N개
    return locationsWithDistance
      .sort((a, b) => a.distance - b.distance)
      .slice(0, maxLocations);
  }, [locations, userLocation, notifications.length]);

  // 인증 확인 및 데이터 로드
  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.replace('/login');
        return;
      }

      // 장소 데이터, 알림, 즐겨찾기 병렬 로드로 속도 향상
      try {
        const [locationsResponse, notificationsResponse, favoritesResponse] = await Promise.allSettled([
          fetch('/api/locations'),
          fetch('/api/notifications'),
          fetch('/api/favorites')
        ]);

        // 장소 데이터 처리
        if (locationsResponse.status === 'fulfilled' && locationsResponse.value.ok) {
          const data = await locationsResponse.value.json();
          setLocations(data);
        } else {
          console.error('Failed to fetch locations');
        }

        // 알림 데이터 처리
        if (notificationsResponse.status === 'fulfilled' && notificationsResponse.value.ok) {
          const data = await notificationsResponse.value.json();
          setNotifications(data.slice(0, 3));
          const unread = data.filter((n: any) => !n.is_read).length;
          setUnreadCount(unread);
        }

        // 즐겨찾기 데이터 처리
        if (favoritesResponse.status === 'fulfilled' && favoritesResponse.value.ok) {
          const data = await favoritesResponse.value.json();
          // 즐겨찾기된 장소 정보 추출
          const favoriteLocations = data.map((fav: any) => fav.locations).filter(Boolean);
          setFavorites(favoriteLocations);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuthAndLoadData();
  }, [router]);

  // 알림 폴링 (30초마다 - 초기 로드는 위에서 처리)
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setNotifications([]);
          setUnreadCount(0);
          return;
        }

        const response = await fetch('/api/notifications');
        if (response.ok) {
          const data: Notification[] = await response.json();
          setNotifications(data.slice(0, 3));
          const unread = data.filter((n: any) => !n.is_read).length;
          setUnreadCount(unread);
        } else {
          setNotifications([]);
          setUnreadCount(0);
        }
      } catch (error) {
        console.log('알림 로드 실패:', error);
        setNotifications([]);
        setUnreadCount(0);
      }
    };
    
    // 30초마다 알림 업데이트 (초기 로드는 제외)
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // 알림 클릭 핸들러
  const handleNotificationClick = async (notification: Notification) => {
    console.log('🖱️ === 홈 알림 클릭 DEBUG ===');
    console.log('전체 알림 데이터:', notification);
    console.log('Type:', notification.type);
    console.log('Type check result:', notification.type === 'reservation_cancelled');
    console.log('Rejection reason:', notification.rejection_reason);
    console.log('Has rejection reason:', !!notification.rejection_reason);
    console.log('Both conditions:', notification.type === 'reservation_cancelled' && !!notification.rejection_reason);
    
    // 알림 목록에서 즉시 제거
    setNotifications(prev => prev.filter(n => n.id !== notification.id));
    
    // 거절 알림이고 거절 사유가 있으면 팝업 표시
    if (notification.type === 'reservation_cancelled' && notification.rejection_reason) {
      console.log('✅✅✅ 거절 사유 팝업 표시!');
      setSelectedRejection({
        reason: notification.rejection_reason,
        title: notification.title || '예약이 거절되었습니다'
      });
      setShowRejectionModal(true);
      
      // 읽음 처리 및 삭제
      if (!notification.is_read) {
        try {
          await fetch(`/api/notifications/${notification.id}`, { method: 'PATCH' });
        } catch (err) {
          console.error('Failed to mark notification as read:', err);
        }
      }
      
      // 백그라운드에서 삭제
      fetch(`/api/notifications?id=${notification.id}`, {
        method: 'DELETE',
      }).catch(error => {
        console.error('Failed to delete notification:', error);
      });
      return;
    }
    
    // 로딩 시작
    setIsNavigating(true);
    
    try {
      // 읽음 처리 및 삭제 (백그라운드에서 비동기로)
      if (!notification.is_read) {
        fetch(`/api/notifications/${notification.id}`, { method: 'PATCH' }).catch(err => {
          console.error('Failed to mark notification as read:', err);
        });
      }
      
      fetch(`/api/notifications?id=${notification.id}`, {
        method: 'DELETE',
      }).catch(error => {
        console.error('Failed to delete notification:', error);
      });

      // 예약 데이터 새로고침을 백그라운드에서 실행 (기다리지 않음)
      refreshReservations().catch(err => {
        console.error('Background refresh failed:', err);
      });

      // 페이지로 바로 이동 (상세 페이지에서 API 폴백으로 데이터 로드)
      if (notification.related_id) {
        let path = '';
        if (notification.type === 'reservation_request') {
          path = `/manager-booking-approval?id=${notification.related_id}`;
        } else if (notification.type === 'reservation_status_update' || notification.type === 'reservation_confirmed') {
          path = `/bookingdetail?id=${notification.related_id}`;
        }
        if (path) {
          router.push(path);
          // 로딩은 페이지가 로드되면서 자동으로 해제됩니다
        } else {
          setIsNavigating(false);
        }
      } else {
        setIsNavigating(false);
      }
    } catch (error) {
      console.error('Error handling notification click:', error);
      setIsNavigating(false);
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting user location:", error);
          // Handle error or set a default location
        }
      );
    }
  }, []);
 
  useEffect(() => {
    const el = scrollContainerRef.current;

    const handleScroll = () => {
      if (!el) return;
      const { scrollTop, scrollHeight, clientHeight } = el;
      const tolerance = 5;
      const isAtTop = scrollTop < tolerance;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < tolerance;
      
      setShowTopFade(!isAtTop);
      setShowBottomFade(!isAtBottom);
    };

    if (el) {
      handleScroll();
      el.addEventListener('scroll', handleScroll, { passive: true });
      const resizeObserver = new ResizeObserver(handleScroll);
      resizeObserver.observe(el);

      return () => {
        el.removeEventListener('scroll', handleScroll);
        resizeObserver.unobserve(el);
      };
    }
  }, []);

  // 지도 관련 로직은 MapProvider와 MapDisplay 컴포넌트에서 처리됩니다.
  // 여기서는 MapProvider로 감싸고 MapDisplay 컴포넌트를 렌더링합니다.

  // 로딩 중이면 빈 화면 표시
  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#e8e3da] dark:bg-[#1a1a1a]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D2B48C]"></div>
      </div>
    );
  }
 
  return (
    <>
      <GlobalSwiperStyles />
      <Header /> {/* 2. Header 컴포넌트 추가 (PC만) */}
      
      {/* 모바일 헤더 */}
      <header className="lg:hidden sticky top-0 z-50 bg-[#e8e3da] dark:bg-[#1a1a1a]">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-2xl font-bold text-[#3D2C1D] dark:text-gray-100">WallSpace</h1>
          <button
            onClick={() => setShowNotificationModal(true)}
            className="relative p-2 hover:bg-[#D2B48C]/20 dark:hover:bg-gray-700 rounded-full transition-colors"
            aria-label="알림"
          >
            <IoNotificationsCircle size={28} className="text-[#3D2C1D] dark:text-gray-100" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            )}
          </button>
        </div>
      </header>
      
      {/* 알림 모달 */}
      <NotificationListModal
        open={showNotificationModal}
        onClose={() => {
          setShowNotificationModal(false);
          // 모달 닫을 때 알림 개수 다시 로드
          const loadUnreadCount = async () => {
            try {
              const response = await fetch('/api/notifications');
              if (response.ok) {
                const data = await response.json();
                const unread = data.filter((n: any) => !n.is_read).length;
                setUnreadCount(unread);
              }
            } catch (error) {
              console.error('Failed to reload notification count:', error);
            }
          };
          loadUnreadCount();
        }}
      />
      
      {/* 로딩 오버레이 */}
      {isNavigating && (
        <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#D2B48C]"></div>
            <p className="text-lg font-medium text-gray-700 dark:text-gray-200">페이지 이동 중...</p>
          </div>
        </div>
      )}
      
      <div className="h-screen w-full lg:h-screen lg:overflow-hidden relative bg-[#e8e3da] dark:bg-[#1a1a1a] transition-colors duration-300 flex flex-col">

        <div className={`relative z-10 mx-auto w-full max-w-screen-2xl flex-grow overflow-y-auto scrollbar-hide lg:px-0 lg:pb-0 flex flex-col ${notifications.length === 0 ? 'lg:!pt-[40px]' : 'lg:pt-12'}`}
          style={{
            paddingTop: 'clamp(1rem, 3.79vh, 2rem)',
            paddingBottom: 'clamp(1.5rem, 5.69vh, 3rem)'
          }}>
          <div className="lg:flex lg:h-full lg:gap-8 flex-grow flex flex-col lg:flex-row">
            {/* 모바일: 즐겨찾기 표시, PC: 즐겨찾기만 */}
            <div className={`lg:w-1/6 ${favorites.length === 0 ? 'lg:hidden' : ''}`}>
              <section className="sm:px-6 lg:sticky lg:top-12 lg:px-0"
                style={{
                  paddingLeft: 'clamp(0.625rem, 4.1vw, 1rem)',
                  paddingRight: 'clamp(0.625rem, 4.1vw, 1rem)',
                  paddingTop: 0,
                  marginTop: 0
                }}>
                {/* PC: 즐겨찾기 섹션 - 세로 레이아웃 (이미지 위, 텍스트 아래) */}
                <div className="hidden lg:block">
                  <div className="mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#D2B48C] text-xl">bookmark</span>
                    <h2 className="font-bold text-[#2C2C2C] dark:text-gray-100"
                      style={{
                        fontSize: '1.125rem',
                        lineHeight: '1.2',
                        marginTop: 0,
                        paddingTop: 0,
                        height: 'auto'
                      }}>
                      즐겨찾기
                    </h2>
                  </div>
                  {favorites.length > 0 ? (
                    <div className="space-y-3">
                      {favorites.map((place) => (
                        <div
                          key={place.id}
                          onClick={() => router.push(`/map?placeId=${place.id}`)}
                          className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-md border border-white/30 dark:border-gray-700/40 cursor-pointer hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 overflow-hidden hover:shadow-lg hover:scale-[1.02]"
                        >
                          {place.images && place.images[0] && (
                            <div className="relative w-full overflow-hidden"
                              style={{ height: '120px' }}>
                              <Image
                                src={place.images[0]}
                                alt={place.name}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-110"
                                sizes="(max-width: 1024px) 16vw, 200px"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          )}
                          <div className="p-3">
                            <h3 className="font-bold text-[#2C2C2C] dark:text-gray-100 truncate text-sm mb-1">
                              {place.name}
                            </h3>
                            <p className="text-xs text-[#887563] dark:text-gray-400 truncate">
                              {typeof place.category === 'string' ? place.category : (place.category as any)?.name || '기타'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gradient-to-br from-white/60 to-white/40 dark:from-gray-800/60 dark:to-gray-800/40 backdrop-blur-lg rounded-2xl flex flex-col items-center justify-center shadow-lg border border-white/30 dark:border-gray-700/40 py-10 px-6">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#D2B48C]/30 to-[#C19A6B]/30 flex items-center justify-center mb-4 shadow-inner">
                        <span className="material-symbols-outlined text-[#C19A6B] text-3xl">bookmark</span>
                      </div>
                      <p className="text-sm font-medium text-[#887563] dark:text-gray-400 text-center">
                        즐겨찾기한 장소가 없습니다
                      </p>
                      <p className="text-xs text-[#887563]/70 dark:text-gray-500 text-center mt-1">
                        마음에 드는 장소를 저장해보세요
                      </p>
                    </div>
                  )}
                </div>

                {/* 모바일: 즐겨찾기 섹션 - 개선된 디자인 */}
                <div className="lg:hidden mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-[#D2B48C]"
                      style={{ fontSize: 'clamp(1.125rem, 5.5vw, 1.375rem)' }}>bookmark</span>
                    <h2 className="font-bold text-[#2C2C2C] dark:text-gray-100"
                      style={{
                        fontSize: 'clamp(0.9375rem, 5.13vw, 1.25rem)'
                      }}>
                      즐겨찾기
                    </h2>
                  </div>
                  
                  {favorites.length > 0 ? (
                    <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide"
                      style={{
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        WebkitOverflowScrolling: 'touch'
                      }}>
                      {favorites.map((place) => (
                        <div
                          key={place.id}
                          onClick={() => router.push(`/map?placeId=${place.id}`)}
                          className="group flex-shrink-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-md border border-white/30 dark:border-gray-700/40 cursor-pointer hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 overflow-hidden active:scale-95"
                          style={{ width: 'clamp(7rem, 35vw, 9rem)' }}
                        >
                          {place.images && place.images[0] && (
                            <div className="relative w-full overflow-hidden"
                              style={{ 
                                height: 'clamp(5.5rem, 25vw, 7.5rem)'
                              }}>
                              <Image
                                src={place.images[0]}
                                alt={place.name}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-110"
                                sizes="(max-width: 768px) 35vw, 9rem"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          )}
                          <div className="p-2.5">
                            <h3 className="font-bold text-[#2C2C2C] dark:text-gray-100 truncate leading-tight"
                              style={{ fontSize: 'clamp(0.75rem, 3.5vw, 0.875rem)' }}>
                              {place.name}
                            </h3>
                            <p className="text-xs text-[#887563] dark:text-gray-400 truncate mt-0.5">
                              {typeof place.category === 'string' ? place.category : (place.category as any)?.name || '기타'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gradient-to-br from-white/60 to-white/40 dark:from-gray-800/60 dark:to-gray-800/40 backdrop-blur-lg rounded-2xl flex flex-col items-center justify-center shadow-lg border border-white/30 dark:border-gray-700/40"
                      style={{ 
                        height: 'clamp(5rem, 22vh, 10rem)',
                        padding: 'clamp(0.75rem, 2.5vh, 1.5rem)',
                        gap: 'clamp(0.5rem, 1.5vh, 0.875rem)'
                      }}>
                      <div style={{ 
                        width: 'clamp(3rem, 7vh, 4.5rem)', 
                        height: 'clamp(3rem, 7vh, 4.5rem)' 
                      }} className="rounded-full bg-gradient-to-br from-[#D2B48C]/30 to-[#C19A6B]/30 flex items-center justify-center shadow-inner">
                        <span className="material-symbols-outlined text-[#C19A6B]" style={{ fontSize: 'clamp(1.75rem, 5vh, 2.75rem)' }}>bookmark</span>
                      </div>
                      <div className="text-center">
                        <h4 className="font-bold text-[#2C2C2C] dark:text-gray-100"
                          style={{ 
                            fontSize: 'clamp(0.8125rem, 3vh, 1rem)',
                            marginBottom: 'clamp(0.125rem, 0.5vh, 0.25rem)'
                          }}>
                          즐겨찾기한 장소가 없습니다
                        </h4>
                        <p className="text-[#887563] dark:text-gray-400"
                          style={{ fontSize: 'clamp(0.6875rem, 2vh, 0.8125rem)' }}>
                          마음에 드는 장소를 저장해보세요
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </div>

            <div className={`lg:mt-0 lg:flex lg:flex-col ${favorites.length > 0 ? 'lg:w-5/6' : 'lg:w-full'} flex-grow flex flex-col ${favorites.length === 0 ? 'justify-end lg:justify-start' : 'lg:justify-start'}`}
              style={{
                marginTop: 0,
                paddingTop: 0
              }}>
              {/* 모바일: 추천 장소 섹션 - 하단 네비게이션 바로 위에 위치 */}
              <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 pointer-events-none"
                style={{
                  paddingBottom: 'calc(64px + env(safe-area-inset-bottom))'
                }}>
                <div className="bg-gradient-to-t from-[#e8e3da] via-[#e8e3da]/95 to-transparent dark:from-[#1a1a1a] dark:via-[#1a1a1a]/95 pointer-events-auto"
                  style={{
                    paddingTop: 'clamp(1.5rem, 4vh, 2.5rem)',
                    paddingLeft: 'clamp(0.625rem, 4.1vw, 1rem)',
                    paddingRight: 'clamp(0.625rem, 4.1vw, 1rem)',
                    paddingBottom: 'clamp(1rem, 2.5vh, 1.5rem)'
                  }}>
                  <div className="flex items-start mb-3"
                    style={{
                      marginBottom: 'clamp(0.5rem, 1.5vh, 0.875rem)'
                    }}>
                    <h2 className="font-bold text-[#2C2C2C] dark:text-gray-100"
                      style={{
                        marginRight: 'clamp(0.25rem, 2.05vw, 0.5rem)',
                        fontSize: 'clamp(0.9375rem, 5.13vw, 1.25rem)',
                        lineHeight: '1.2'
                      }}>
                      추천 장소
                    </h2>
                    <p className="font-medium text-[#887563] dark:text-gray-400"
                      style={{
                        fontSize: 'clamp(0.8125rem, 4.1vw, 1rem)'
                      }}>
                      {recommendedLocations[currentPlaceIndex]?.name}
                    </p>
                  </div>
                  <div className="overflow-x-auto scrollbar-hide -mx-4 px-4"
                    style={{
                      scrollbarWidth: 'none',
                      msOverflowStyle: 'none',
                      WebkitOverflowScrolling: 'touch'
                    }}>
                    <RecommendedPlaces
                      onSlideChange={setCurrentPlaceIndex}
                      userLocation={userLocation}
                      locations={recommendedLocations}
                      hasNotifications={notifications.length > 0}
                    />
                  </div>
                </div>
              </div>

              {/* PC: 추천 장소 섹션 */}
              <div className="hidden lg:block">
                <div className="flex items-start sm:px-6 lg:px-0"
                  style={{
                    marginBottom: 'clamp(0.5rem, 1.9vh, 1rem)',
                    paddingLeft: 'clamp(0.625rem, 4.1vw, 1rem)',
                    paddingRight: 'clamp(0.625rem, 4.1vw, 1rem)',
                    marginTop: 0,
                    paddingTop: 0
                  }}>
                  <h2 className="font-bold text-[#2C2C2C] dark:text-gray-100 lg:text-2xl"
                    style={{
                      marginRight: 'clamp(0.25rem, 2.05vw, 0.5rem)',
                      fontSize: 'clamp(0.9375rem, 5.13vw, 1.25rem)',
                      lineHeight: '1.2',
                      marginTop: 0,
                      paddingTop: 0,
                      height: 'auto'
                    }}>
                    추천 장소
                  </h2>
                </div>

                <div className="lg:min-h-0 lg:flex-1">
                  <div ref={scrollContainerRef} className="h-full w-full overflow-y-auto scrollbar-hide lg:pb-0">
                    <RecommendedPlaces
                      onSlideChange={setCurrentPlaceIndex}
                      userLocation={userLocation}
                      locations={recommendedLocations}
                      hasNotifications={notifications.length > 0}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 거절 사유 팝업 */}
      {showRejectionModal && selectedRejection && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] px-4"
          onClick={() => {
            setShowRejectionModal(false);
            setSelectedRejection(null);
          }}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#3D2C1D] dark:text-gray-100">
                {selectedRejection.title}
              </h3>
              <button
                onClick={() => {
                  setShowRejectionModal(false);
                  setSelectedRejection(null);
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="mb-6">
              <p className="text-sm font-medium text-[#5D4E3E] dark:text-gray-300 mb-2">
                거절 사유
              </p>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <p className="text-[#3D2C1D] dark:text-gray-100 leading-relaxed">
                  {selectedRejection.reason}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setShowRejectionModal(false);
                setSelectedRejection(null);
              }}
              className="w-full bg-[#D2B48C] dark:bg-[#E8C8A0] text-white font-semibold py-3 rounded-lg hover:bg-[#C19A6B] dark:hover:bg-[#D2B48C] transition-colors"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </>
  );
}
