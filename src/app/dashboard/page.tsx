'use client';

import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useCallback } from 'react';
import { CardTitle, CardDescription, CardHeader, CardContent, Card } from '@/app/map/components/ui/card';
import { ResponsiveLine } from '@nivo/line';
import { ResponsiveBar } from '@nivo/bar';
import Header from '../components/Header'; // Import UserModeToggle
import { useBottomNav } from '../context/BottomNavContext';
import { useUserMode } from '../context/UserModeContext';
import { userArtworks as initialArtworksData } from '@/data/artworks';
import { useReservations } from '@/context/ReservationContext'; // Import useReservations
import AddArtworkModal from './components/AddArtworkModal';

// Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

// --- 데이터 타입 정의 ---
type Artwork = (typeof initialArtworksData)[0];

type Store = {
  name: string;
  location: string;
  image: string;
  slug:string;
  totalSpaces: number;
  reservedSpaces: number;
};

// Reservation type is now imported via reservationsData, so we can remove the local definition.

// --- 목업(Mockup) 데이터 ---
const STORES: Store[] = [
    { name: '스티치 카페 성수점', location: '서울시 성동구', slug: 'store-1', image: 'https://picsum.photos/id/200/400/300', totalSpaces: 5, reservedSpaces: 3 },
    { name: '스티치 갤러리 서초점', location: '서울시 서초구', slug: 'store-2', image: 'https://picsum.photos/id/201/400/300', totalSpaces: 8, reservedSpaces: 8 },
    { name: '스티치 라운지 홍대점', location: '서울시 마포구', slug: 'store-3', image: 'https://picsum.photos/id/202/400/300', totalSpaces: 10, reservedSpaces: 4 },
];

// RESERVATIONS array is removed from here

// --- UI 컴포넌트 ---

function ArtistDashboard({ 
    artworks,
    activeIndex, 
    containerRef, 
    itemRefs, 
    cardBgClass, 
    onAddArtworkClick,
    onEditArtworkClick,
}: { 
    artworks: Artwork[],
    activeIndex: number; 
    containerRef: React.RefObject<HTMLDivElement | null>; 
    itemRefs: React.MutableRefObject<(HTMLDivElement | null)[]>; 
    cardBgClass: string; 
    onAddArtworkClick: () => void;
    onEditArtworkClick: (artwork: Artwork) => void;
}) {
  const { reservations } = useReservations(); // Get reservations from context
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  useEffect(() => {
    if (artworks.length <= 3) {
      setIsEnd(true);
    } else {
      setIsEnd(false);
    }
  }, [artworks.length]);

  return (
    <div className="space-y-6 lg:grid lg:grid-cols-3 lg:gap-8">
      <div className="lg:col-span-3 space-y-6">
        <section className={`${cardBgClass} rounded-xl shadow-md p-4 border border-gray-100`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-[#3D2C1D]">내 작품</h2>
            <Link href="/dashboard/add" className="bg-[#c19a6b] text-white text-sm font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-opacity-90 transition-colors active:opacity-90 lg:hidden">
              작품 추가
            </Link>
            <button
              onClick={onAddArtworkClick}
              className="hidden lg:block bg-[#c19a6b] text-white text-sm font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-opacity-90 transition-colors active:opacity-90"
            >
              작품 추가
            </button>
          </div>
          {/* Mobile Carousel */}
          <div ref={containerRef} className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth gap-4 pb-2 no-scrollbar lg:hidden" style={{ WebkitOverflowScrolling: 'touch' }}>
            {artworks.map((art, idx) => (
              <div
                key={art.id}
                ref={(el) => { if(itemRefs.current) itemRefs.current[idx] = el; }}
                className={`snap-center flex-shrink-0 w-[75%] sm:w-[60%] transition-all duration-300`}
              >
                <ArtworkCard art={art} onEditClick={onEditArtworkClick}/>
              </div>
            ))}
          </div>
          {/* PC Carousel */}
           <div className="hidden lg:block relative">
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
                        <ArtworkCard art={art} onEditClick={onEditArtworkClick} />
                    </SwiperSlide>
                ))}
             </Swiper>
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
      </div>

      <div className="lg:col-span-1 space-y-6">
        {/* 전시 중 카드 */}
        <section className={`${cardBgClass} rounded-xl shadow-md p-4 border border-gray-100`}>
          <h2 className="text-2xl font-bold text-[#3D2C1D] mb-4">전시 중</h2>
          <div className="bg-white rounded-xl p-4">
            <p className="text-center text-[#8C7853]">현재 진행 중인 전시가 없습니다.</p>
          </div>
        </section>
      </div>

      <div className="lg:col-span-2 space-y-6">
        {/* 예정된 예약 카드 */}
        <section className={`${cardBgClass} rounded-xl shadow-md p-4 border border-gray-100`}>
          <h2 className="text-2xl font-bold text-[#3D2C1D] mb-4">예정된 예약</h2>
          <div className="space-y-4">
            {reservations.filter(r => r.status === 'confirmed' || r.status === 'pending').map(reservation => (
              <Link href={`/bookingdetail?id=${encodeURIComponent(reservation.id)}`} className="block" key={reservation.id}>
                <ReservationCard reservation={reservation} userType="artist" />
              </Link>
            ))}
          </div>
        </section>

        {/* 지난 예약 카드 */}
        <section className={`${cardBgClass} rounded-xl shadow-md p-4 border border-gray-100`}>
          <h2 className="text-2xl font-bold text-[#3D2C1D] mb-4">지난 예약</h2>
          <div className="space-y-4">
            {reservations.filter(r => r.status === 'completed' || r.status === 'cancelled').map(reservation => (
              <Link href={`/bookingdetail?id=${encodeURIComponent(reservation.id)}`} className="block" key={reservation.id}>
                <ReservationCard reservation={reservation} userType="artist" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

const ArtworkCard = ({ art, onEditClick }: { art: Artwork; onEditClick: (artwork: Artwork) => void; }) => (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 h-full">
        <div className="w-full h-40 bg-center bg-no-repeat bg-cover" style={{ backgroundImage: `url("${art.imageUrl}")` }} />
        <div className="p-4">
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="font-bold text-lg text-[#3D2C1D]">{art.title}</h3>
                    <p className="text-sm text-[#8C7853] mt-1">크기: {art.dimensions}</p>
                </div>
                <button onClick={() => onEditClick(art)} className="text-sm font-semibold text-[#8C7853] hover:text-[#3D2C1D] transition-colors">
                    Edit
                </button>
            </div>
        </div>
    </div>
);

// 🏬 사장님 대시보드 컴포넌트
function ManagerDashboard({ activeIndex, containerRef, itemRefs, cardBgClass }: { activeIndex: number; containerRef: React.RefObject<HTMLDivElement | null>; itemRefs: React.MutableRefObject<(HTMLDivElement | null)[]>; cardBgClass: string; }) {
  const { reservations } = useReservations(); // Get reservations from context
  return (
    <div className="space-y-6 lg:grid lg:grid-cols-3 lg:gap-8">
        <div className="lg:col-span-3 space-y-6">
            {/* 내 가게 카드 */}
            <section className={`${cardBgClass} rounded-xl shadow-md p-4 border border-gray-100`}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-[#3D2C1D]">내 가게</h2>
                    <Link href="/dashboard/add-store" className="bg-[#c19a6b] text-white text-sm font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-opacity-90 transition-colors active:opacity-90">
                        가게 추가
                    </Link>
                </div>
                <div ref={containerRef} className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth gap-4 pb-2 no-scrollbar lg:grid lg:grid-cols-3 lg:overflow-visible" style={{ WebkitOverflowScrolling: 'touch' }}>
                    {STORES.map((store, idx) => (
                        <div
                            key={store.slug}
                            ref={(el) => { if(itemRefs.current) itemRefs.current[idx] = el; }}
                            className={`snap-center flex-shrink-0 w-[75%] sm:w-[60%] lg:w-full transition-all duration-300 ${idx === activeIndex ? 'opacity-100 scale-100' : 'opacity-100 scale-100 lg:opacity-100'}`}
                        >
                            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                                <div className="w-full h-40 bg-center bg-no-repeat bg-cover" style={{ backgroundImage: `url("${store.image}")` }} />
                                <div className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-bold text-lg text-[#3D2C1D]">{store.name}</h3>
                                            <p className="text-sm text-[#8C7853] mt-1">{store.location}</p>
                                            <p className="text-sm font-bold text-[#3D2C1D] mt-2">
                                                {store.reservedSpaces}/{store.totalSpaces} 공간 예약됨
                                            </p>
                                        </div>
                                        <Link href={`/stores/${store.slug}/edit`} className="text-sm font-semibold text-[#8C7853] hover:text-[#3D2C1D] transition-colors">
                                            Edit
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
      
      <div className="lg:col-span-3 space-y-6">
        {/* 예약 요청 카드 */}
        <section className={`${cardBgClass} rounded-xl shadow-md p-4 border border-gray-100`}>
          <h2 className="text-2xl font-bold text-[#3D2C1D] mb-4">예약 요청</h2>
          <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4">
            {reservations.filter(r => r.status === 'confirmed' || r.status === 'pending').map(reservation => (
              <Link href={`/bookingdetail?id=${encodeURIComponent(reservation.id)}`} className="block" key={reservation.id}>
                <ReservationCard reservation={reservation} userType="manager" />
              </Link>
            ))}
          </div>
        </section>
      </div>

      <div className="lg:col-span-3 space-y-6">
        {/* 지난 예약 카드 */}
        <section className={`${cardBgClass} rounded-xl shadow-md p-4 border border-gray-100`}>
          <h2 className="text-2xl font-bold text-[#3D2C1D] mb-4">지난 예약</h2>
          <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4">
            {reservations.filter(r => r.status === 'completed' || r.status === 'cancelled').map(reservation => (
              <Link href={`/bookingdetail?id=${encodeURIComponent(reservation.id)}`} className="block" key={reservation.id}>
                <ReservationCard reservation={reservation} userType="manager" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

// 🎫 예약 카드 공통 컴포넌트
function ReservationCard({ reservation, userType }: { reservation: any; userType: 'artist' | 'manager' }) { // Changed type to 'any' as Reservation type is removed
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

  return (
    <div className={`bg-white rounded-xl shadow-md p-4 relative flex items-start gap-4 cursor-pointer ${isCompleted ? 'bg-gray-50 opacity-80' : 'bg-white'}`}>
      <div
        className="w-24 h-24 bg-center bg-no-repeat bg-cover rounded-lg flex-shrink-0"
        style={{ backgroundImage: `url("${reservation.image}")` }}
      />
      <div className="flex-1">
        <p className="text-sm font-medium text-[#8C7853]">
          {userType === 'manager' ? reservation.storeName : `예약 ID: ${reservation.id}`}
        </p>
        <h3 className="text-lg font-bold text-[#3D2C1D] mt-1 truncate">
          {userType === 'manager' 
            ? `'${reservation.artistName}' 작가의 '${reservation.artworkTitle}'`
            : reservation.storeName
          }
        </h3>
        <p className="text-sm text-[#8C7853] mt-2">
          {reservation.period}
        </p>
      </div>
      {userType === 'artist' && (
        <span className={`absolute top-4 right-4 text-xs font-semibold py-1 px-2 rounded-full ${statusStyles[reservation.status]}`}>
          {statusText[reservation.status]}
        </span>
      )}
    </div>
  );
}

// --- 메인 대시보드 페이지 ---
export default function Dashboard() {
  const router = useRouter();
  const [artworks, setArtworks] = useState(initialArtworksData);
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  
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

  const handleAddArtworkClick = () => {
    setEditingArtwork(null);
    setModalOpen(true);
  };

  const handleEditArtworkClick = (artwork: (typeof initialArtworksData)[0]) => {
    setEditingArtwork(artwork);
    setModalOpen(true);
  };

  const handleSaveArtwork = (savedArtwork: { id: number; title: string; dimensions: string; file: File | null }) => {
    setArtworks(currentArtworks => {
        const exists = currentArtworks.some(art => art.id === savedArtwork.id);
        if (exists) {
            // Edit existing
            return currentArtworks.map(art => {
                if (art.id === savedArtwork.id) {
                    // If a new file is uploaded, create a new URL. Otherwise, keep the old one.
                    const newImageUrl = savedArtwork.file ? URL.createObjectURL(savedArtwork.file) : art.imageUrl;
                    return { ...art, ...savedArtwork, imageUrl: newImageUrl, slug: art.slug };
                }
                return art;
            });
        } else {
            // Add new
            const newImageUrl = savedArtwork.file ? URL.createObjectURL(savedArtwork.file) : '/placeholder.jpg'; // Placeholder for new artworks without image
            return [...currentArtworks, { ...savedArtwork, imageUrl: newImageUrl, slug: `artwork-${savedArtwork.id}` }];
        }
    });
    setModalOpen(false);
  };

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
      itemRefs.current = itemRefs.current.slice(0, userMode === 'artist' ? artworks.length : STORES.length);
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
  }, [userMode, snapToCenter, artworks.length]);

  const handleAddArtworkClick = () => {
    setEditingArtwork(null);
    setModalOpen(true);
  };

  const handleEditArtworkClick = (artwork: Artwork) => {
    setEditingArtwork(artwork);
    setModalOpen(true);
  };

  const handleSaveArtwork = (savedArtwork: { id?: number; title: string; dimensions: string; file: File | null }) => {
    setArtworks(currentArtworks => {
        const isEditing = savedArtwork.id !== undefined;
        if (isEditing) {
            return currentArtworks.map(art => {
                if (art.id === savedArtwork.id) {
                    const newImageUrl = savedArtwork.file ? URL.createObjectURL(savedArtwork.file) : art.imageUrl;
                    return { ...art, title: savedArtwork.title, dimensions: savedArtwork.dimensions, imageUrl: newImageUrl };
                }
                return art;
            });
        } else {
            const newId = Date.now();
            const newImageUrl = savedArtwork.file ? URL.createObjectURL(savedArtwork.file) : '/placeholder.jpg';
            const newArtwork: Artwork = {
                id: newId,
                title: savedArtwork.title,
                dimensions: savedArtwork.dimensions,
                imageUrl: newImageUrl,
                slug: `artwork-${newId}`
            };
            return [...currentArtworks, newArtwork];
        }
    });
    setModalOpen(false);
  };

  const handleDeleteArtwork = (id: string) => {
    setArtworks(prevArtworks => prevArtworks.filter(artwork => artwork.id !== id));
    setModalOpen(false);
  };

  const artistBgClass = "bg-[#FDFBF8]"; // 기존 아티스트 모드 배경
  const managerBgClass = "bg-[#F5F1EC]"; // 기존 사장님 모드 배경
  
  // 사용자 모드에 따라 각 섹션 카드의 배경색을 더 연하게, 명확하게 동적으로 설정
  // 기존 #f7f7f7 대신 완전한 흰색 또는 메인 배경보다 살짝 밝은 톤으로 조정
  const cardBgClass = userMode === 'artist' ? 'bg-white' : 'bg-[#FCFBF8]'; // 아티스트 모드는 완전 흰색, 사장님 모드는 아주 연한 미색

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
        <div className={`relative flex min-h-[100dvh] flex-col text-[#3D2C1D] font-pretendard transition-colors duration-300 ${userMode === 'artist' ? artistBgClass : managerBgClass}`}>
          <header className={`sticky top-0 z-10 backdrop-blur-sm transition-colors duration-300 ${userMode === 'artist' ? 'bg-[#FDFBF8]/80' : 'bg-[#F5F1EC]/80'} lg:hidden`}>
            <div className="flex items-center p-4">
              <button type="button" onClick={() => router.back()} aria-label="뒤로 가기" className="text-[#3D2C1D] active:scale-95 transition-transform">
                <svg fill="none" height="24" width="24" stroke="currentColor" viewBox="0 0 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
              <h1 className="flex-1 text-center text-xl font-bold text-[#3D2C1D]">대시보드</h1>
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
                />
              ) : (
                <ManagerDashboard activeIndex={activeIndex} containerRef={containerRef} itemRefs={itemRefs} cardBgClass={cardBgClass} />
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
    </>
  );
}