'use client';

import React, { useEffect, useState, useRef } from 'react';

// --- 라이브러리 임포트 ---
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { IoNotificationsCircle } from 'react-icons/io5';
import { useMap, LocationType } from '../../context/MapContext'; // ✨ 1. 지도 컨텍스트 훅 및 MapProvider 임포트
import { locations } from '@/data/locations'; // 전체 장소 데이터 임포트
import { useRouter } from 'next/navigation'; // 1. useRouter 훅 임포트

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

const placesData = [
  { 
    id: 'place01', 
    name: '아트 스페이스 광교', 
    category: '갤러리', 
    address: '경기도 수원시',
    lat: 37.2842, 
    lng: 127.0543, 
    images: [
      'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?q=80&w=2067&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?q=80&w=1974&auto=format&fit=crop',
    ],
    spaces: [
        { name: '제 1 전시실', imageUrl: 'https://picsum.photos/id/101/400/300', isReserved: false },
        { name: '멀티룸 A', imageUrl: 'https://picsum.photos/id/102/400/300', isReserved: false },
        { name: '야외 조각 공원', imageUrl: 'https://picsum.photos/id/103/400/300', isReserved: true },
    ],
    reviews: [
        {
            artistName: 'Alexia Ray',
            artistImageUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
            comment: '자연광이 정말 아름다운 공간입니다. 제 조각 작품들이 훨씬 돋보였어요. 다음 개인전도 여기서 하고 싶네요.',
        },
        {
            artistName: 'Joon Lee',
            artistImageUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026705d',
            comment: '시설이 정말 깨끗하고 관리가 잘 되어있습니다. 특히 야외 공간은 설치 미술에 최적의 장소라고 생각합니다. 강력 추천!',
        }
    ]
  },
  { 
    id: 'place02', 
    name: '국립현대미술관 서울', 
    category: '미술관', 
    address: '서울특별시 종로구',
    lat: 37.5796, 
    lng: 126.9804, 
    images: [
      'https://picsum.photos/id/10/800/600',
      'https://picsum.photos/id/11/800/600',
      'https://picsum.photos/id/12/800/600',
    ],
    spaces: [
        { name: '제 1 전시실', imageUrl: 'https://picsum.photos/id/501/400/300', isReserved: false },
        { name: '디지털 라이브러리', imageUrl: 'https://picsum.photos/id/502/400/300', isReserved: false },
    ],
    reviews: []
  },
  { 
    id: 'place03', 
    name: '페이지스 바이 페이지', 
    category: '카페 & 서점', 
    address: '서울특별시 마포구',
    lat: 37.5495, 
    lng: 126.9209, 
    images: [
      'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2106&auto=format&fit=crop',
    ],
    spaces: [
        { name: '메인 홀', imageUrl: 'https://picsum.photos/id/601/400/300', isReserved: false },
    ],
    reviews: []
  },
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
  <div className="h-24 bg-white/70 backdrop-blur-lg rounded-2xl p-4 flex items-center space-x-3 shadow-lg border border-white/20 cursor-pointer hover:bg-white transition-colors duration-200"
    style={{ 
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      borderColor: 'rgba(255, 255, 255, 0.2)'
    }}
  >
    <IoNotificationsCircle className="text-4xl flex-shrink-0" style={{ color: 'var(--accent-color)' }} />
    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-center">
        <h3 className="font-bold truncate" style={{ color: 'var(--text-color)' }}>{title}</h3>
        <p className="text-xs flex-shrink-0 ml-2" style={{ color: 'var(--subtle-text-color)' }}>{time}</p>
      </div>
      <p className="text-sm mt-1" style={{ color: 'var(--subtle-text-color)' }}>{message}</p>
    </div>
  </div>
);

interface RecommendedPlacesProps {
  onSlideChange: (index: number) => void;
  userLocation: { lat: number; lng: number } | null;
}

const RecommendedPlaces = ({ onSlideChange, userLocation }: RecommendedPlacesProps) => {
  const { setSelectedPlace, mapInstance } = useMap();
  const router = useRouter(); // 2. router 인스턴스 생성

  const handlePlaceCardClick = (place: typeof placesData[0]) => {
    // placesData의 형식을 LocationType에 맞게 변환
    const locationData: LocationType = {
      ...place,
      id: Math.random(), // 임시 ID 생성
      statusText: '정보 확인',
      statusColor: '#888',
      description: `${place.name} - ${place.category}`,
      totalSlots: 0,
      reservedSlots: 0,
      reservationStatus: 'available'
    };
    
    if (locationData) {
      setSelectedPlace(locationData);
      if (mapInstance.current && window.kakao) {
        const moveLatLon = new window.kakao.maps.LatLng(locationData.lat, locationData.lng);
        mapInstance.current.panTo(moveLatLon);
      }
      router.push('/map'); // 3. '/map' 경로로 이동
    }
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
          {placesData.map((place) => (
            <SwiperSlide key={place.id}>
              <div onClick={() => handlePlaceCardClick(place)}>
                <PlaceCard place={place} userLocation={userLocation} />
              </div>
            </SwiperSlide>
          ))}
          <div className="swiper-pagination-outer text-center mt-4 relative z-10"></div>
        </Swiper>
      </div>

      {/* PC: Grid */}
      <div className="hidden lg:grid lg:grid-cols-2 lg:gap-6">
        {placesData.map((place) => (
          <div key={place.id} onClick={() => handlePlaceCardClick(place)}>
            <PlaceCard place={place} userLocation={userLocation} />
          </div>
        ))}
      </div>
    </>
  );
};

// --- Place Card Component (New) ---
type PlaceCardProps = {
  place: (typeof placesData)[0];
  userLocation: { lat: number; lng: number } | null;
};

const PlaceCard = ({ place, userLocation }: PlaceCardProps) => {
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(place.images.length <= 1);
  const distance = userLocation
    ? calculateDistance(userLocation.lat, userLocation.lng, place.lat, place.lng)
    : null;

  return (
    <div className="backdrop-blur-lg rounded-2xl shadow-lg p-4 border h-full flex flex-col cursor-pointer"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        borderColor: 'rgba(255, 255, 255, 0.2)'
      }}
    >
      <div className="w-full h-64 lg:h-44 rounded-xl overflow-hidden relative">
        <Swiper
          modules={[Navigation]}
          navigation={{
            nextEl: `.custom-next-button-${place.id}`,
            prevEl: `.custom-prev-button-${place.id}`,
          }}
          className="w-full h-full"
          onClick={(e) => e.stopPropagation()}
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

        <button
          className={`custom-prev-button-${place.id} absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-black/40 hover:bg-black/60 rounded-full text-white transition-all duration-200 hover:scale-110 ${isBeginning ? 'opacity-0 pointer-events-none' : 'opacity-70 hover:opacity-100'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <span className="material-symbols-outlined text-xl">
            chevron_left
          </span>
        </button>
        <button
          className={`custom-next-button-${place.id} absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-black/40 hover:bg-black/60 rounded-full text-white transition-all duration-200 hover:scale-110 ${isEnd ? 'opacity-0 pointer-events-none' : 'opacity-70 hover:opacity-100'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <span className="material-symbols-outlined text-xl">
            chevron_right
          </span>
        </button>
      </div>
      <div className="mt-4 px-2 flex-grow">
        <div className="flex items-baseline gap-2">
          <h3 className="text-xl font-bold" style={{ color: 'var(--text-color)' }}>{place.name}</h3>
          <p className="text-sm" style={{ color: 'var(--subtle-text-color)' }}>{place.category}</p>
        </div>
        <div className="flex items-baseline gap-2 mt-1 text-sm" style={{ color: 'var(--subtle-text-color)' }}>
          <p>{place.address}</p>
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
  const backgroundImageUrl = 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1974&auto=format&fit=crop';
  
  const [currentPlaceIndex, setCurrentPlaceIndex] = useState(0);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const currentPlaceName = placesData[currentPlaceIndex]?.name;

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
 
  // 지도 관련 로직은 MapProvider와 MapDisplay 컴포넌트에서 처리됩니다.
  // 여기서는 MapProvider로 감싸고 MapDisplay 컴포넌트를 렌더링합니다.
 
  return (
    <>
      <GlobalSwiperStyles />
      <Header /> {/* 2. Header 컴포넌트 추가 */}
      <div className="min-h-screen w-full lg:h-screen lg:overflow-hidden" style={{ backgroundColor: 'var(--background-color)' }}>
        {/* <div className="absolute inset-0 bg-black/60"></div> */}

        {/* <MapDisplay /> */} {/* MapDisplay 컴포넌트를 홈 화면에 직접 렌더링합니다. */}

        <div className="relative z-10 mx-auto h-full w-full max-w-7xl pt-8 pb-12 lg:px-8 lg:pt-12 lg:pb-0">
          <div className="lg:flex lg:h-full lg:gap-8">
            <div className="lg:w-1/3">
              <section className="px-4 sm:px-6 lg:sticky lg:top-12 lg:px-0">
                <h2 className="mb-4 text-xl font-bold" style={{ color: 'var(--text-color)' }}>
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
                <h2 className="mr-2 text-xl font-bold" style={{ color: 'var(--text-color)' }}>
                  추천 장소
                </h2>
                <p className="text-base font-medium lg:hidden" style={{ color: 'var(--subtle-text-color)' }}>
                  {currentPlaceName}
                </p>
              </div>

              <div className="lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
                <RecommendedPlaces
                  onSlideChange={setCurrentPlaceIndex}
                  userLocation={userLocation}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
