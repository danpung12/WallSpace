'use client';

import React, { useEffect, useState, useRef } from 'react';

// --- 라이브러리 임포트 ---
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { IoNotificationsCircle } from 'react-icons/io5';
import { useMap, LocationType } from '../../context/MapContext'; // ✨ 1. 지도 컨텍스트 훅 및 MapProvider 임포트
import { locations } from '@/data/locations'; // 전체 장소 데이터 임포트
import { useRouter } from 'next/navigation'; // 1. useRouter 훅 임포트
import { Location } from '@/data/locations';

// --- Swiper CSS 임포트 ---
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// MapDisplay 컴포넌트 임포트
import MapDisplay from '../components/MapDisplay';
import Header from '../components/Header'; // 1. Header 컴포넌트 임포트

// --- 샘플 데이터 ---
const notificationsData = [
  { id: 1, title: '예약 확정', message: '요청하신 \'아트 스페이스 광교\' 예약이 확정되었습니다.', time: '방금 전' },
  { id: 2, title: '새로운 메시지', message: '\'김작가\'님으로부터 새로운 메시지가 도착했습니다.', time: '15분 전' },
];

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
  title: string;
  message: string;
  time: string;
}

const NotificationItem = ({ title, message, time }: NotificationItemProps) => (
  <div className="h-24 lg:h-28 bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl p-4 lg:p-5 flex items-center space-x-3 shadow-lg border border-white/20 dark:border-gray-700/30 cursor-pointer hover:bg-white dark:hover:bg-gray-800 transition-colors duration-200">
    <IoNotificationsCircle className="text-4xl lg:text-5xl flex-shrink-0 text-[#D2B48C] dark:text-[#E8C8A0]" />
    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-center">
        <h3 className="font-bold truncate text-base lg:text-lg text-[#2C2C2C] dark:text-gray-100">{title}</h3>
        <p className="text-xs lg:text-sm flex-shrink-0 ml-2 text-[#887563] dark:text-gray-400">{time}</p>
      </div>
      <p className="text-sm lg:text-base mt-1 text-[#887563] dark:text-gray-400">{message}</p>
    </div>
  </div>
);

interface RecommendedPlacesProps {
  onSlideChange: (index: number) => void;
  userLocation: { lat: number; lng: number } | null;
}

const RecommendedPlaces = ({ onSlideChange, userLocation }: RecommendedPlacesProps) => {
  const router = useRouter(); // 2. router 인스턴스 생성

  const handlePlaceCardClick = (place: Location) => {
    router.push(`/map?placeId=${place.id}`); // 3. '/map' 경로로 placeId와 함께 이동
  };

  return (
    <>
      {/* Mobile: Swiper */}
      <div className="lg:hidden">
        <Swiper
          modules={[Pagination]}
          className="w-full peek-swiper"
          spaceBetween={16}
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
          <div className="swiper-pagination-outer text-center mt-4 relative z-10"></div>
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
    <div className="backdrop-blur-lg rounded-2xl shadow-lg p-4 lg:p-5 border h-full flex flex-col cursor-pointer bg-white/60 dark:bg-gray-800/60 border-white/20 dark:border-gray-700/30 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-colors duration-200">
      <div
        className="w-full h-64 lg:h-56 rounded-xl overflow-hidden relative group"
        onClick={onImageClick}
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
          <div className="absolute top-4 left-4 z-10">
            <span className="text-white text-lg font-bold" style={{ textShadow: '0px 1px 4px rgba(0, 0, 0, 0.5)' }}>
              #{place.tags[0]}
            </span>
          </div>
        )}

        <button
          className={`custom-prev-button-${place.id} absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-black/40 hover:bg-black/60 rounded-full text-white transition-all duration-200 hover:scale-110 ${isBeginning ? 'opacity-0 pointer-events-none' : 'opacity-70 group-hover:opacity-100'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <span className="material-symbols-outlined text-xl">
            chevron_left
          </span>
        </button>
        <button
          className={`custom-next-button-${place.id} absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-black/40 hover:bg-black/60 rounded-full text-white transition-all duration-200 hover:scale-110 ${isEnd ? 'opacity-0 pointer-events-none' : 'opacity-70 group-hover:opacity-100'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <span className="material-symbols-outlined text-xl">
            chevron_right
          </span>
        </button>
      </div>
      <div className="mt-4 px-2 flex-grow">
        <div className="flex items-baseline gap-2">
          <h3 className="text-xl lg:text-2xl font-bold text-[#2C2C2C] dark:text-gray-100">{place.name}</h3>
          <p className="text-sm lg:text-base text-[#887563] dark:text-gray-400">{place.category}</p>
        </div>
        <div className="flex items-baseline gap-2 mt-1 text-sm lg:text-base text-[#887563] dark:text-gray-400">
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
  const [currentPlaceIndex, setCurrentPlaceIndex] = useState(0);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const currentPlaceName = locations[currentPlaceIndex]?.name;

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showTopFade, setShowTopFade] = useState(false);
  const [showBottomFade, setShowBottomFade] = useState(true);

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
      <div className="min-h-screen w-full lg:h-screen lg:overflow-hidden relative bg-[#e8e3da] dark:bg-[#1a1a1a] transition-colors duration-300">

        <div className="relative z-10 mx-auto h-full w-full max-w-screen-2xl pt-8 pb-12 lg:px-8 lg:pt-12 lg:pb-0">
          <div className="lg:flex lg:h-full lg:gap-8">
            <div className="lg:w-1/3">
              <section className="px-4 sm:px-6 lg:sticky lg:top-12 lg:px-0">
                <h2 className="mb-4 text-xl lg:text-2xl font-bold text-[#2C2C2C] dark:text-gray-100">
                  새로운 알림
                </h2>
                <div className="space-y-3">
                  {notificationsData.map((notification) => (
                    <NotificationItem key={notification.id} {...notification} />
                  ))}
                </div>
              </section>
            </div>

            <div className="mt-8 lg:mt-0 lg:flex lg:w-2/3 lg:flex-col">
              <div className="mb-4 flex items-baseline px-4 sm:px-6 lg:px-0">
                <h2 className="mr-2 text-xl lg:text-2xl font-bold text-[#2C2C2C] dark:text-gray-100">
                  추천 장소
                </h2>
                <p className="text-base font-medium lg:hidden text-[#887563] dark:text-gray-400">
                  {currentPlaceName}
                </p>
              </div>

              <div className={`lg:min-h-0 lg:flex-1 fade-scroll-container ${showTopFade ? 'show-top-fade' : ''} ${showBottomFade ? 'show-bottom-fade' : ''}`}>
                <div ref={scrollContainerRef} className="h-full w-full overflow-y-auto scrollbar-hide">
                  <RecommendedPlaces
                    onSlideChange={setCurrentPlaceIndex}
                    userLocation={userLocation}
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
