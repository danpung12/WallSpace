'use client';

import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

// --- 데이터 타입 정의 ---
type Artwork = {
  title: string;
  size: string;
  image: string;
  slug: string;
};

type Store = {
  name: string;
  location: string;
  image: string;
  slug:string;
  totalSpaces: number;
  reservedSpaces: number;
};

type Reservation = {
  id: string;
  artworkTitle: string;
  artistName: string;
  storeName: string;
  period: string;
  status: 'confirmed' | 'pending' | 'completed';
  image: string;
};


// --- 목업(Mockup) 데이터 ---
const ARTWORKS: Artwork[] = [
  { title: '작품 1', size: '50x70cm', slug: 'artwork-1', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBXN0jW9dNacMfUY9Z3bjC1_xCiS15tb-fbfkWAYsD4VZCqx2nvEDgCN5wP6FL6OejGRVn4Eulfteh41r_bOXziuW42R0g6AU-l7dKL7n-hgiMCjmU9WFRSYH6kezy3-ftseDg8p36pj2mdHxEKF8_zZh6pP-sJ__iaMHZw7Xs5ohv9UbA_IWKWQfo4SMO1xKqEm0DFPbSLowGMZ3sE6YCvwt7YrBBV4vaYdyCpTJrFTrJzQRbocN3Z77WgS2xiA_y7q-hEYaBbEiiG' },
  { title: '작품 2', size: '60x60cm', slug: 'artwork-2', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrqrYmsEJa0Sd-hyxHCUnQfvGlC17-VRZFqnO2KJssC_FYvOvejVsv7MDblTqQo6GXa4feOkp2Q9XqoTkiTS3ieGWS7NEEh4j3q6Z4-eyXJ8dljd-kcVFiAIawmbP_BuTVX12EfItqKhwuqpNyubC79EynA2WMfBUv8XdIKZ04xV24RvUJ9eSGjWOP0XGLSb6t6Q6Zf8kMWVGlOT2lftAg6ni-rUQlECOCpekjm8vYjB8hR4N7amKCJyQx-YHmgbj3wXX_wF-XWZU4' },
  { title: '작품 3', size: '40x80cm', slug: 'artwork-3', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB1hI9oEpCk1Pbvkp_kEABsMwq3UiQpEXgkQAjoKq3zsxh-1zCYNITVvuXmpNpLF9VoSrWCoNDyoRdxjyqMpDNrTBUpb1pjkgZe5LWlm7gnI0w_y_Q1ei5WNLT30zg7ppiyZf-7lqwmBeZH_SBYUF2jG9N9RewMBMkuchWyUez73Nu8RP_KzNk9qWCHKfu8BIpEzj-f2AZxHz8T-Bo5p7miSGc16CS856SoAquozkXt_T7iQLzYApp90MHErVPMIiIin7npi3pLCGH9' },
];

const STORES: Store[] = [
    { name: '스티치 카페 성수점', location: '서울시 성동구', slug: 'store-1', image: 'https://picsum.photos/id/200/400/300', totalSpaces: 5, reservedSpaces: 3 },
    { name: '스티치 갤러리 서초점', location: '서울시 서초구', slug: 'store-2', image: 'https://picsum.photos/id/201/400/300', totalSpaces: 8, reservedSpaces: 8 },
    { name: '스티치 라운지 홍대점', location: '서울시 마포구', slug: 'store-3', image: 'https://picsum.photos/id/202/400/300', totalSpaces: 10, reservedSpaces: 4 },
];

const RESERVATIONS: Reservation[] = [
  { id: '#12345', artworkTitle: '작품 3', artistName: '김수민', storeName: '스티치 카페 성수점', period: '2025년 10월 20일 ~ 10월 27일', status: 'confirmed', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB1hI9oEpCk1Pbvkp_kEABsMwq3UiQpEXgkQAjoKq3zsxh-1zCYNITVvuXmpNpLF9VoSrWCoNDyoRdxjyqMpDNrTBUpb1pjkgZe5LWlm7gnI0w_y_Q1ei5WNLT30zg7ppiyZf-7lqwmBeZH_SBYUF2jG9N9RewMBMkuchWyUez73Nu8RP_KzNk9qWCHKfu8BIpEzj-f2AZxHz8T-Bo5p7miSGc16CS856SoAquozkXt_T7iQLzYApp90MHErVPMIiIin7npi3pLCGH9'},
  { id: '#67890', artworkTitle: '작품 2', artistName: '이현우', storeName: '스티치 라운지 홍대점', period: '2025년 11월 1일 ~ 11월 7일', status: 'pending', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrqrYmsEJa0Sd-hyxHCUnQfvGlC17-VRZFqnO2KJssC_FYvOvejVsv7MDblTqQo6GXa4feOkp2Q9XqoTkiTS3ieGWS7NEEh4j3q6Z4-eyXJ8dljd-kcVFiAIawmbP_BuTVX12EfItqKhwuqpNyubC79EynA2WMfBUv8XdIKZ04xV24RvUJ9eSGjWOP0XGLSb6t6Q6Zf8kMWVGlOT2lftAg6ni-rUQlECOCpekjm8vYjB8hR4N7amKCJyQx-YHmgbj3wXX_wF-XWZU4'},
  { id: '#11223', artworkTitle: '작품 1', artistName: '박지영', storeName: '스티치 카페 성수점', period: '2025년 9월 15일 ~ 9월 22일', status: 'completed', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBXN0jW9dNacMfUY9Z3bjC1_xCiS15tb-fbfkWAYsD4VZCqx2nvEDgCN5wP6FL6OejGRVn4Eulfteh41r_bOXziuW42R0g6AU-l7dKL7n-hgiMCjmU9WFRSYH6kezy3-ftseDg8p36pj2mdHxEKF8_zZh6pP-sJ__iaMHZw7Xs5ohv9UbA_IWKWQfo4SMO1xKqEm0DFPbSLowGMZ3sE6YCvwt7YrBBV4vaYdyCpTJrFTrJzQRbocN3Z77WgS2xiA_y7q-hEYaBbEiiG'},
]

// --- UI 컴포넌트 ---

// 🧑‍🎨 작가 대시보드 컴포넌트
function ArtistDashboard({ activeIndex, containerRef, itemRefs, cardBgClass }: { activeIndex: number; containerRef: React.RefObject<HTMLDivElement | null>; itemRefs: React.MutableRefObject<(HTMLDivElement | null)[]>; cardBgClass: string; }) {
  return (
    <>
      {/* 내 작품 카드 */}
      <section className={`${cardBgClass} rounded-xl shadow-md p-4`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-[#3D2C1D]">내 작품</h2>
          <Link href="/dashboard/add" className="bg-[#c19a6b] text-white text-sm font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-opacity-90 transition-colors active:opacity-90">
            작품 추가
          </Link>
        </div>
        <div ref={containerRef} className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth gap-4 pb-2 no-scrollbar" style={{ WebkitOverflowScrolling: 'touch' }}>
          {ARTWORKS.map((art, idx) => (
            <div
              key={art.slug}
              ref={(el) => { if(itemRefs.current) itemRefs.current[idx] = el; }}
              className={`snap-center flex-shrink-0 w-[75%] sm:w-[60%] transition-all duration-300 ${idx === activeIndex ? 'opacity-100 scale-100' : 'opacity-50 scale-[0.98]'}`}
            >
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                <div className="w-full h-40 bg-center bg-no-repeat bg-cover" style={{ backgroundImage: `url("${art.image}")` }} />
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-lg text-[#3D2C1D]">{art.title}</h3>
                      <p className="text-sm text-[#8C7853] mt-1">크기: {art.size}</p>
                    </div>
                    <Link href={`/artworks/${art.slug}/edit`} className="text-sm font-semibold text-[#8C7853] hover:text-[#3D2C1D] transition-colors">
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 전시 중 카드 */}
      <section className={`${cardBgClass} rounded-xl shadow-md p-4`}>
        <h2 className="text-2xl font-bold text-[#3D2C1D] mb-4">전시 중</h2>
        <div className="bg-white rounded-xl p-4">
          <p className="text-center text-[#8C7853]">현재 진행 중인 전시가 없습니다.</p>
        </div>
      </section>

      {/* 예정된 예약 카드 */}
      <section className={`${cardBgClass} rounded-xl shadow-md p-4`}>
        <h2 className="text-2xl font-bold text-[#3D2C1D] mb-4">예정된 예약</h2>
        <div className="space-y-4">
          {RESERVATIONS.filter(r => r.status !== 'completed').map(reservation => (
            <Link href="/bookingdetail" className="block" key={reservation.id}>
              <ReservationCard reservation={reservation} userType="artist" />
            </Link>
          ))}
        </div>
      </section>

      {/* 지난 예약 카드 */}
      <section className={`${cardBgClass} rounded-xl shadow-md p-4`}>
        <h2 className="text-2xl font-bold text-[#3D2C1D] mb-4">지난 예약</h2>
        <div className="space-y-4">
          {RESERVATIONS.filter(r => r.status === 'completed').map(reservation => (
            <Link href="/bookingdetail" className="block" key={reservation.id}>
              <ReservationCard reservation={reservation} userType="artist" />
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

// 🏬 사장님 대시보드 컴포넌트
function ManagerDashboard({ activeIndex, containerRef, itemRefs, cardBgClass }: { activeIndex: number; containerRef: React.RefObject<HTMLDivElement | null>; itemRefs: React.MutableRefObject<(HTMLDivElement | null)[]>; cardBgClass: string; }) {
  return (
    <>
      {/* 내 가게 카드 */}
      <section className={`${cardBgClass} rounded-xl shadow-md p-4`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-[#3D2C1D]">내 가게</h2>
          <Link href="/dashboard/add-store" className="bg-[#c19a6b] text-white text-sm font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-opacity-90 transition-colors active:opacity-90">
            가게 추가
          </Link>
        </div>
        <div ref={containerRef} className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth gap-4 pb-2 no-scrollbar" style={{ WebkitOverflowScrolling: 'touch' }}>
          {STORES.map((store, idx) => (
            <div
              key={store.slug}
              ref={(el) => { if(itemRefs.current) itemRefs.current[idx] = el; }}
              className={`snap-center flex-shrink-0 w-[75%] sm:w-[60%] transition-all duration-300 ${idx === activeIndex ? 'opacity-100 scale-100' : 'opacity-50 scale-[0.98]'}`}
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
      
      {/* 예약 요청 카드 */}
      <section className={`${cardBgClass} rounded-xl shadow-md p-4`}>
        <h2 className="text-2xl font-bold text-[#3D2C1D] mb-4">예약 요청</h2>
        <div className="space-y-4">
          {RESERVATIONS.filter(r => r.status !== 'completed').map(reservation => (
            <Link href="/bookingdetail" className="block" key={reservation.id}>
              <ReservationCard reservation={reservation} userType="manager" />
            </Link>
          ))}
        </div>
      </section>

      {/* 지난 예약 카드 */}
      <section className={`${cardBgClass} rounded-xl shadow-md p-4`}>
        <h2 className="text-2xl font-bold text-[#3D2C1D] mb-4">지난 예약</h2>
        <div className="space-y-4">
          {RESERVATIONS.filter(r => r.status === 'completed').map(reservation => (
            <Link href="/bookingdetail" className="block" key={reservation.id}>
              <ReservationCard reservation={reservation} userType="manager" />
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

// 🎫 예약 카드 공통 컴포넌트
function ReservationCard({ reservation, userType }: { reservation: Reservation; userType: 'artist' | 'manager' }) {
  const statusStyles = {
    confirmed: 'text-green-600 bg-green-100',
    pending: 'text-yellow-600 bg-yellow-100',
    completed: 'text-gray-600 bg-gray-200',
  };
  const statusText = {
    confirmed: '확정',
    pending: '확인 중',
    completed: '종료',
  };

  const isCompleted = reservation.status === 'completed';

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
  const [activeIndex, setActiveIndex] = useState(0);
  const [userMode, setUserMode] = useState<'artist' | 'manager'>('artist');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const tickingRef = useRef(false);

  // 캐러셀 스크롤 관련 로직
  const calcActive = () => {
    const c = containerRef.current;
    if (!c) return;
    const centerX = c.scrollLeft + c.clientWidth / 2;
    let bestIdx = 0;
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
    setActiveIndex(bestIdx);
  };

  const onScroll = () => {
    if (tickingRef.current) return;
    tickingRef.current = true;
    requestAnimationFrame(() => {
      calcActive();
      tickingRef.current = false;
    });
  };

  useEffect(() => {
    const c = containerRef.current;
    if (!c) return;
    itemRefs.current = [];
    c.scrollTo({ left: 0, behavior: 'smooth' });
    setActiveIndex(0);
    calcActive();
    c.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', calcActive);
    return () => {
      c.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', calcActive);
    };
  }, [userMode]);

  const artistBgClass = "bg-[#FDFBF8]";
  const managerBgClass = "bg-[#F5F1EC]";
  
  // 사용자 모드에 따라 카드 배경색을 더 연하게 동적으로 설정
  const cardBgClass = userMode === 'artist' ? 'bg-[#f7f7f7]' : 'bg-[#F7F7F7]';

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
      `}</style>

      <div className={`relative flex min-h-[100dvh] flex-col text-[#3D2C1D] font-pretendard transition-colors duration-300 ${userMode === 'artist' ? artistBgClass : managerBgClass}`}>
        <header className={`sticky top-0 z-10 backdrop-blur-sm transition-colors duration-300 ${userMode === 'artist' ? 'bg-[#FDFBF8]/80' : 'bg-[#F5F1EC]/80'}`}>
          <div className="flex items-center p-4">
            <button type="button" onClick={() => router.back()} aria-label="뒤로 가기" className="text-[#3D2C1D] active:scale-95 transition-transform">
              <svg fill="none" height="24" width="24" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

        <main className="p-4 space-y-8 pb-24">
          {userMode === 'artist' ? (
            <ArtistDashboard activeIndex={activeIndex} containerRef={containerRef} itemRefs={itemRefs} cardBgClass={cardBgClass} />
          ) : (
            <ManagerDashboard activeIndex={activeIndex} containerRef={containerRef} itemRefs={itemRefs} cardBgClass={cardBgClass} />
          )}
        </main>
      </div>
    </>
  );
}