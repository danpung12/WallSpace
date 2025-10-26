'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';

// --- 라이브러리 임포트 ---
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { IoNotificationsCircle } from 'react-icons/io5';
import { useMap, LocationType } from '../../context/MapContext'; // ✨ 1. 지도 컨텍스트 훅 및 MapProvider 임포트
import { useRouter } from 'next/navigation'; // 1. useRouter 훅 임포트
import { Location } from '@/data/locations';

// --- Swiper CSS 임포트 ---
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// MapDisplay 컴포넌트 임포트
import MapDisplay from '../components/MapDisplay';
import Header from '../components/Header'; // 1. Header 컴포넌트 임포트

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
}

const RecommendedPlaces = ({ onSlideChange, userLocation, locations }: RecommendedPlacesProps) => {
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

      {/* PC: Grid */}
      <div className="hidden lg:grid lg:grid-cols-2 lg:gap-6">
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

const PlaceCard = ({ place, userLocation, onImageClick }: PlaceCardProps) => {
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(place.images.length <= 1);
  const distance = userLocation
    ? calculateDistance(userLocation.lat, userLocation.lng, place.lat, place.lng)
    : null;

  return (
    <div className="backdrop-blur-lg rounded-2xl shadow-lg border h-full flex flex-col cursor-pointer bg-white/60 dark:bg-gray-800/60 border-white/20 dark:border-gray-700/30 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-colors duration-200 lg:p-5"
      style={{ 
        padding: 'clamp(0.5rem, 1.9vh, 1.25rem)'
      }}>
      <div
        className="w-full rounded-xl overflow-hidden relative group lg:h-56"
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
          className="w-full h-full"
          allowTouchMove={true}
          onSlideChange={(swiper) => {
            setIsBeginning(swiper.isBeginning);
            setIsEnd(swiper.isEnd);
          }}
          onInit={(swiper) => {
            setIsBeginning(swiper.isBeginning);
            setIsEnd(swiper.isEnd);
          }}
        >
          {place.images.map((imgUrl, index) => (
            <SwiperSlide key={index}>
              <img
                src={imgUrl}
                alt={`${place.name} ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </SwiperSlide>
          ))}
        </Swiper>

        {place.tags && place.tags.length > 0 && (
          <div className="absolute z-10"
            style={{
              top: 'clamp(0.5rem, 1.9vh, 1rem)',
              left: 'clamp(0.5rem, 1.9vh, 1rem)'
            }}>
            <span className="text-white font-bold" 
              style={{ 
                textShadow: '0px 1px 2px rgba(0, 0, 0, 0.25)',
                fontSize: 'clamp(1rem, 4.62vw, 1.5rem)'
              }}>
              #{place.tags[0]}
            </span>
          </div>
        )}

        <button
          className={`custom-prev-button-${place.id} absolute top-1/2 -translate-y-1/2 z-10 flex items-center justify-center bg-black/40 hover:bg-black/60 rounded-full text-white transition-all duration-200 hover:scale-110 ${isBeginning ? 'opacity-0 pointer-events-none' : 'opacity-70 group-hover:opacity-100'}`}
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
          className={`custom-next-button-${place.id} absolute top-1/2 -translate-y-1/2 z-10 flex items-center justify-center bg-black/40 hover:bg-black/60 rounded-full text-white transition-all duration-200 hover:scale-110 ${isEnd ? 'opacity-0 pointer-events-none' : 'opacity-70 group-hover:opacity-100'}`}
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
};


// --- 메인 페이지 컴포넌트 ---
export default function MainPage() {
  const router = useRouter();
  const [locations, setLocations] = useState<Location[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentPlaceIndex, setCurrentPlaceIndex] = useState(0);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showTopFade, setShowTopFade] = useState(false);
  const [showBottomFade, setShowBottomFade] = useState(true);

  // 추천 장소: 사용자 위치 기반 가까운 순으로 4곳
  const recommendedLocations = useMemo(() => {
    if (!userLocation || locations.length === 0) {
      return locations.slice(0, 4);
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

    // 거리순 정렬 후 상위 4개
    return locationsWithDistance
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 4);
  }, [locations, userLocation]);

  // 장소 데이터 로드
  useEffect(() => {
    const loadLocations = async () => {
      try {
        const response = await fetch('/api/locations');
        if (response.ok) {
          const data = await response.json();
          setLocations(data);
        } else {
          console.error('Failed to fetch locations');
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };
    
    loadLocations();
  }, []);

  // 알림 데이터 로드 (로그인한 사용자만)
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        // 로그인 상태 확인
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        // 로그인하지 않은 사용자는 알림을 로드하지 않음
        if (!user) {
          setNotifications([]);
          return;
        }

        const response = await fetch('/api/notifications');
        if (response.ok) {
          const data: Notification[] = await response.json();
          // 최신 3개만 표시
          setNotifications(data.slice(0, 3));
        } else {
          // 응답 실패 시 빈 배열로 설정 (오류 무시)
          setNotifications([]);
        }
      } catch (error) {
        // 오류 발생 시 빈 배열로 설정 (조용히 처리)
        console.log('알림 로드 실패 (로그인하지 않은 사용자):', error);
        setNotifications([]);
      }
    };
    
    loadNotifications();
    
    // 30초마다 알림 업데이트
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // 알림 클릭 핸들러
  const handleNotificationClick = async (notification: Notification) => {
    // 읽음 처리
    if (!notification.is_read) {
      try {
        await fetch(`/api/notifications/${notification.id}`, { method: 'PATCH' });
        setNotifications(prev => 
          prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
        );
      } catch (err) {
        console.error('Failed to mark notification as read:', err);
      }
    }

    // 페이지 이동
    if (notification.related_id) {
      let path = '';
      if (notification.type === 'reservation_request') {
        path = `/manager-booking-approval?id=${notification.related_id}`;
      } else if (notification.type === 'reservation_status_update') {
        path = `/bookingdetail?id=${notification.related_id}`;
      }
      if (path) {
        router.push(path);
      }
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
 
  return (
    <>
      <GlobalSwiperStyles />
      <Header /> {/* 2. Header 컴포넌트 추가 */}
      <div className="h-screen w-full lg:h-screen lg:overflow-hidden relative bg-[#e8e3da] dark:bg-[#1a1a1a] transition-colors duration-300 flex flex-col">

        <div className="relative z-10 mx-auto w-full max-w-screen-2xl flex-grow overflow-y-auto scrollbar-hide lg:px-8 lg:pt-12 lg:pb-0"
          style={{
            paddingTop: 'clamp(1rem, 3.79vh, 2rem)',
            paddingBottom: 'clamp(1.5rem, 5.69vh, 3rem)'
          }}>
          <div className="lg:flex lg:h-full lg:gap-8">
            <div className="lg:w-1/3">
              {notifications.length > 0 && (
                <section className="sm:px-6 lg:sticky lg:top-12 lg:px-0"
                  style={{
                    paddingLeft: 'clamp(0.625rem, 4.1vw, 1rem)',
                    paddingRight: 'clamp(0.625rem, 4.1vw, 1rem)'
                  }}>
                  <h2 className="font-bold text-[#2C2C2C] dark:text-gray-100 lg:text-2xl"
                    style={{
                      marginBottom: 'clamp(0.5rem, 1.9vh, 1rem)',
                      fontSize: 'clamp(0.9375rem, 5.13vw, 1.25rem)'
                    }}>
                    새로운 알림
                  </h2>
                  <div style={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'clamp(0.5rem, 1.42vh, 0.75rem)'
                  }}>
                    {notifications.map((notification) => (
                      <NotificationItem 
                        key={notification.id} 
                        notification={notification}
                        onClick={() => handleNotificationClick(notification)}
                      />
                    ))}
                  </div>
                </section>
              )}
            </div>

            <div className="lg:mt-0 lg:flex lg:flex-col lg:w-2/3"
              style={{
                marginTop: 'clamp(1rem, 3.79vh, 2rem)'
              }}>
              <div className="flex items-baseline sm:px-6 lg:px-0"
                style={{
                  marginBottom: 'clamp(0.5rem, 1.9vh, 1rem)',
                  paddingLeft: 'clamp(0.625rem, 4.1vw, 1rem)',
                  paddingRight: 'clamp(0.625rem, 4.1vw, 1rem)'
                }}>
                <h2 className="font-bold text-[#2C2C2C] dark:text-gray-100 lg:text-2xl"
                  style={{
                    marginRight: 'clamp(0.25rem, 2.05vw, 0.5rem)',
                    fontSize: 'clamp(0.9375rem, 5.13vw, 1.25rem)'
                  }}>
                  추천 장소
                </h2>
                <p className="font-medium lg:hidden text-[#887563] dark:text-gray-400"
                  style={{
                    fontSize: 'clamp(0.8125rem, 4.1vw, 1rem)'
                  }}>
                  {recommendedLocations[currentPlaceIndex]?.name}
                </p>
              </div>

              <div className={`lg:min-h-0 lg:flex-1`}>
                <div ref={scrollContainerRef} className="h-full w-full overflow-y-auto scrollbar-hide">
                  <RecommendedPlaces
                    onSlideChange={setCurrentPlaceIndex}
                    userLocation={userLocation}
                    locations={recommendedLocations}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
