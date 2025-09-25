'use client';

import React, { useEffect, useState, useRef } from 'react';

// --- 라이브러리 임포트 ---
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { IoNotificationsCircle } from 'react-icons/io5';
import { MapProvider, useMap } from '../../context/MapContext'; // ✨ 1. 지도 컨텍스트 훅 및 MapProvider 임포트

// --- Swiper CSS 임포트 ---
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// MapDisplay 컴포넌트 임포트
import MapDisplay from '../components/MapDisplay';

// --- 샘플 데이터 ---
const notificationsData = [
  { id: 1, title: '예약 확정', message: '요청하신 \'아트 스페이스 광교\' 예약이 확정되었습니다.', time: '방금 전' },
  { id: 2, title: '새로운 메시지', message: '\'김작가\'님으로부터 새로운 메시지가 도착했습니다.', time: '15분 전' },
];

const placesData = [
  { id: 'place01', name: '아트 스페이스 광교', category: '갤러리', images: [
    'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?q=80&w=2067&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?q=80&w=1974&auto=format&fit=crop',
  ]},
  { id: 'place02', name: '국립현대미술관 서울', category: '미술관', images: [
    'https://picsum.photos/id/10/800/600',
    'https://picsum.photos/id/11/800/600',
    'https://picsum.photos/id/12/800/600',
  ]},
  { id: 'place03', name: '페이지스 바이 페이지', category: '카페 & 서점', images: [
    'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2106&auto=format&fit=crop',
  ]},
];


// --- CSS 스타일 ---
const GlobalSwiperStyles = () => {
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      body { margin: 0; padding: 0; }
      .swiper-pagination-bullet { background-color: #d1d5db !important; opacity: 1 !important; }
      .swiper-pagination-bullet-active { background-color: #ffffff !important; }
      
      .peek-swiper .swiper-slide {
        width: 85%;
        opacity: 0.5;
        transition: opacity 300ms;
      }
      .peek-swiper .swiper-slide-active { opacity: 1; }
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
  <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-4 flex items-start space-x-3 shadow-lg border border-white/20">
    <IoNotificationsCircle className="text-blue-500 text-4xl mt-1 flex-shrink-0" />
    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-gray-900 truncate">{title}</h3>
        <p className="text-xs text-gray-600 flex-shrink-0 ml-2">{time}</p>
      </div>
      <p className="text-sm text-gray-700 mt-1">{message}</p>
    </div>
  </div>
);

interface RecommendedPlacesProps {
  onSlideChange: (index: number) => void;
}

const RecommendedPlaces = ({ onSlideChange }: RecommendedPlacesProps) => (
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
          <div className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-lg p-4 border border-white/20">
            <div className="w-full h-64 rounded-xl overflow-hidden relative">
              <Swiper
                modules={[Navigation]}
                navigation={{ 
                  nextEl: `.custom-next-button-${place.id}`, 
                  prevEl: `.custom-prev-button-${place.id}` 
                }}
                className="w-full h-full"
              >
                {place.images.map((imgUrl, index) => (
                  <SwiperSlide key={index}>
                    <img src={imgUrl} alt={`${place.name} ${index + 1}`} className="w-full h-full object-cover" />
                  </SwiperSlide>
                ))}
              </Swiper>

              <button className={`custom-prev-button-${place.id} absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-black/40 hover:bg-black/60 rounded-full text-white transition-all duration-200 opacity-70 hover:opacity-100 hover:scale-110`}>
                  <span className="material-symbols-outlined text-xl">chevron_left</span>
              </button>
              <button className={`custom-next-button-${place.id} absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-black/40 hover:bg-black/60 rounded-full text-white transition-all duration-200 opacity-70 hover:opacity-100 hover:scale-110`}>
                  <span className="material-symbols-outlined text-xl">chevron_right</span>
              </button>
            </div>
            <div className="mt-4 px-2">
              <h3 className="text-xl font-bold text-gray-900">{place.name}</h3>
              <p className="text-gray-700">{place.category}</p>
            </div>
          </div>
        </SwiperSlide>
      ))}
      <div className="swiper-pagination-outer text-center mt-4 relative z-10"></div>
    </Swiper>
);


// --- 메인 페이지 컴포넌트 ---
export default function MainPage() {
  const backgroundImageUrl = 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1974&auto=format&fit=crop';
  
  const [currentPlaceIndex, setCurrentPlaceIndex] = useState(0);
  const currentPlaceName = placesData[currentPlaceIndex]?.name;
 
  // 지도 관련 로직은 MapProvider와 MapDisplay 컴포넌트에서 처리됩니다.
  // 여기서는 MapProvider로 감싸고 MapDisplay 컴포넌트를 렌더링합니다.
 
  return (
    <>
      <GlobalSwiperStyles />
      {/* MapProvider로 MapDisplay 컴포넌트를 감쌉니다. */}
      <MapProvider>
        <div
          className="min-h-screen w-full bg-[#FDFBF8]"
        >
          {/* <div className="absolute inset-0 bg-black/60"></div> */}
          
          {/* <MapDisplay /> */} {/* MapDisplay 컴포넌트를 홈 화면에 직접 렌더링합니다. */}
           
          <div className="relative z-10 w-full space-y-8 pt-8 pb-12">
            
            <section>
              <div className="container mx-auto px-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">새로운 알림</h2>
                <div className="space-y-3">
                  {notificationsData.map((notification) => (
                    <NotificationItem key={notification.id} {...notification} />
                  ))}
                </div>
              </div>
            </section>
 
            <section className="w-full">
              <div className="container mx-auto px-6">
                <div className="flex items-baseline mb-4">
                  <h2 className="text-xl font-bold text-gray-800 mr-2">추천 장소</h2>
                  <p className="text-base font-medium text-gray-600">{currentPlaceName}</p>
                </div>
              </div>
              
              <RecommendedPlaces onSlideChange={setCurrentPlaceIndex} />
            </section>
 
          </div>
        </div>
      </MapProvider>
    </>
  );
}
