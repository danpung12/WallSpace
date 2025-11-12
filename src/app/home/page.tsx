'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import Image from 'next/image';

// --- 라이브러리 임포트 ---
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
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

      {/* PC: Grid - 화면 너비에 따라 자동 조절 (최대 3개) */}
      <div className="hidden lg:grid lg:gap-6 lg:grid-cols-2 xl:grid-cols-3">
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
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAUABQDASIAAhEBAxEB/8QAFwABAQEBAAAAAAAAAAAAAAAAAAMEAv/EACQQAAEEAgEDBQEAAAAAAAAAAAEAAgMRBCExEhNRBSIyQXFh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAH/xAAXEQEBAQEAAAAAAAAAAAAAAAABAAIR/9oADAMBAAIRAxEAPwDlkErYjMY7kxZMMsoaC3gqVs7Yy4NIIQETPtpdskG0BPE1zgxgJccAAV+/SBM2eJ0Qc1wIOx3lAsKAf/Z"
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
export default function MainPage() {
  const router = useRouter();
  const [locations, setLocations] = useState<Location[]>([]);
  const [currentPlaceIndex, setCurrentPlaceIndex] = useState(0);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showTopFade, setShowTopFade] = useState(false);
  const [showBottomFade, setShowBottomFade] = useState(true);

  // 추천 장소: 사용자 위치 기반 가까운 순으로 12곳
  const recommendedLocations = useMemo(() => {
    const maxLocations = 12;
    
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
      <Header />
      
      <div className="h-screen w-full lg:h-screen lg:overflow-hidden relative bg-[#e8e3da] dark:bg-[#1a1a1a] transition-colors duration-300 flex flex-col">

        <div className="relative z-10 mx-auto w-full max-w-screen-2xl flex-grow flex flex-col lg:overflow-y-auto lg:scrollbar-hide lg:px-8 lg:pb-0 lg:!pt-[40px]"
          style={{
            paddingTop: 'clamp(1rem, 3.79vh, 2rem)',
            paddingBottom: '0'
          }}>
          <div className="lg:flex lg:h-full lg:gap-8 flex-grow flex flex-col lg:flex-row">
            <div className="lg:mt-0 lg:flex lg:flex-col lg:w-full flex-grow flex flex-col justify-end lg:justify-start"
              style={{
                marginTop: 'clamp(1rem, 3vh, 2rem)',
                marginBottom: 'clamp(12rem, 30vh, 22rem)'
              }}>
              <div className="flex items-baseline sm:px-6 lg:px-0"
                style={{
                  marginBottom: 'clamp(1rem, 3vh, 2rem)',
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

              <div className="lg:min-h-0 lg:flex-1 pb-[calc(48px+env(safe-area-inset-bottom))] lg:pb-0">
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
