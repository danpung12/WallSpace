'use client';

import Head from 'next/head';
import Link from 'next/link';
import BottomNav from '@/app/components/BottomNav';
import { useEffect, useRef, useState } from 'react';

type Artwork = {
  title: string;
  size: string;
  image: string;
  slug: string;
};

const ARTWORKS: Artwork[] = [
  {
    title: '작품 1',
    size: '50x70cm',
    slug: 'serene-waters',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBXN0jW9dNacMfUY9Z3bjC1_xCiS15tb-fbfkWAYsD4VZCqx2nvEDgCN5wP6FL6OejGRVn4Eulfteh41r_bOXziuW42R0g6AU-l7dKL7n-hgiMCjmU9WFRSYH6kezy3-ftseDg8p36pj2mdHxEKF8_zZh6pP-sJ__iaMHZw7Xs5ohv9UbA_IWKWQfo4SMO1xKqEm0DFPbSLowGMZ3sE6YCvwt7YrBBV4vaYdyCpTJrFTrJzQRbocN3Z77WgS2xiA_y7q-hEYaBbEiiG',
  },
  {
    title: '작품 2',
    size: '60x60cm',
    slug: 'urban-dreams',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCrqrYmsEJa0Sd-hyxHCUnQfvGlC17-VRZFqnO2KJssC_FYvOvejVsv7MDblTqQo6GXa4feOkp2Q9XqoTkiTS3ieGWS7NEEh4j3q6Z4-eyXJ8dljd-kcVFiAIawmbP_BuTVX12EfItqKhwuqpNyubC79EynA2WMfBUv8XdIKZ04xV24RvUJ9eSGjWOP0XGLSb6t6Q6Zf8kMWVGlOT2lftAg6ni-rUQlECOCpekjm8vYjB8hR4N7amKCJyQx-YHmgbj3wXX_wF-XWZU4',
  },
  {
    title: '작품 3',
    size: '40x80cm',
    slug: 'coastal-whispers',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB1hI9oEpCk1Pbvkp_kEABsMwq3UiQpEXgkQAjoKq3zsxh-1zCYNITVvuXmpNpLF9VoSrWCoNDyoRdxjyqMpDNrTBUpb1pjkgZe5LWlm7gnI0w_y_Q1ei5WNLT30zg7ppiyZf-7lqwmBeZH_SBYUF2jG9N9RewMBMkuchWyUez73Nu8RP_KzNk9qWCHKfu8BIpEzj-f2AZxHz8T-Bo5p7miSGc16CS856SoAquozkXt_T7iQLzYApp90MHErVPMIiIin7npi3pLCGH9',
  },
];

export default function Dashboard() {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const tickingRef = useRef(false);

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
    calcActive();
    c.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', calcActive);
    return () => {
      c.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', calcActive);
    };
  }, []);

  return (
    <>
      <Head>
        <title>Stitch Design</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      {/* 전역 스타일(애니메이션 + 스크롤바 숨김 클래스) */}
      <style jsx global>{`
        @media (prefers-reduced-motion: no-preference) {
          .animate-fadeUp {
            animation: fadeUp 600ms cubic-bezier(0.2, 0.7, 0.2, 1) forwards;
          }
          .animate-scaleIn {
            animation: scaleIn 480ms cubic-bezier(0.2, 0.7, 0.2, 1) forwards;
          }
          .animate-slideDown {
            animation: slideDown 420ms cubic-bezier(0.2, 0.7, 0.2, 1) forwards;
          }
          .animate-fadeIn {
            animation: fadeIn 360ms ease forwards;
          }
        }
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(14px);
            filter: saturate(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0);
            filter: saturate(1);
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.96);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        /* 스크롤바 숨김 유틸 */
        .no-scrollbar {
          -ms-overflow-style: none; /* IE/Edge */
          scrollbar-width: none; /* Firefox */
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none; /* Chrome/Safari */
        }
      `}</style>

      <div className="relative min-h-screen font-[Pretendard] bg-[#FDFBF8] text-[#3D2C1D] antialiased overflow-x-hidden">
        {/* 헤더 */}
        <header className="sticky top-0 z-10 bg-[#FDFBF8]/80 backdrop-blur-sm animate-slideDown">
          <div className="flex items-center justify-between p-4">
            <button className="text-[#3D2C1D] active:scale-95 transition-transform" type="button">
              <svg fill="currentColor" height="28" width="28" viewBox="0 0 256 256">
                <path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM40,72H216a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16ZM216,184H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-[#3D2C1D]">대시보드</h1>
            <div className="w-7" />
          </div>
        </header>

        <main className="p-4 space-y-8 pb-24">
          {/* My Artworks */}
          <section className="animate-fadeUp" style={{ animationDelay: '0ms' }}>
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="text-2xl font-bold text-[#3D2C1D]">내 작품</h2>
              <Link
                href="/artworks/new"
                className="bg-[#D2B48C] text-white text-sm font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-opacity-90 transition-colors active:opacity-90"
              >
                Add Artwork
              </Link>
            </div>

            <div
              ref={containerRef}
              className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth gap-4 pb-2 px-1 no-scrollbar"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {ARTWORKS.map((art, idx) => {
                const isActive = idx === activeIndex;
                return (
                  <div
                    key={art.slug}
                    ref={(el) => {
                      itemRefs.current[idx] = el;
                    }}
                    className={`snap-center flex-shrink-0 w-[75%] sm:w-[60%] transition-all duration-300 ${
                      isActive ? 'opacity-100 scale-100' : 'opacity-50 scale-[0.98]'
                    }`}
                  >
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                      <div
                        className="w-full h-40 bg-center bg-no-repeat bg-cover"
                        style={{ backgroundImage: `url("${art.image}")` }}
                      />
                      <div className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-lg text-[#3D2C1D]">{art.title}</h3>
                            <p className="text-sm text-[#8C7853] mt-1">크기: {art.size}</p>
                          </div>
                          {/* My Artworks 카드 개별 Edit */}
                          <Link
                            href={`/artworks/${art.slug}/edit`}
                            className="text-sm font-semibold text-[#8C7853] hover:text-[#3D2C1D] transition-colors"
                          >
                            Edit
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 전시중 */}
          <section className="animate-fadeUp" style={{ animationDelay: '40ms' }}>
            <h2 className="text-2xl font-bold text-[#3D2C1D] mb-4">전시중</h2>
            <div className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-center text-[#8C7853]">현재 진행 중인 전시가 없습니다.</p>
            </div>
          </section>

          {/* 예정된 예약 */}
          <section className="animate-fadeUp" style={{ animationDelay: '80ms' }}>
            <h2 className="text-2xl font-bold text-[#3D2C1D] mb-4">예정된 예약</h2>
            <div className="space-y-4">
              <Link href="/bookingdetail" className="block">
                <div
                  className="bg-white rounded-xl shadow-sm p-4 relative flex items-start gap-4 animate-scaleIn cursor-pointer"
                  style={{ animationDelay: '100ms' }}
                >
                  <div
                    className="w-24 h-24 bg-center bg-no-repeat bg-cover rounded-lg flex-shrink-0 animate-scaleIn"
                    style={{
                      backgroundImage:
                        'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB1hI9oEpCk1Pbvkp_kEABsMwq3UiQpEXgkQAjoKq3zsxh-1zCYNITVvuXmpNpLF9VoSrWCoNDyoRdxjyqMpDNrTBUpb1pjkgZe5LWlm7gnI0w_y_Q1ei5WNLT30zg7ppiyZf-7lqwmBeZH_SBYUF2jG9N9RewMBMkuchWyUez73Nu8RP_KzNk9qWCHKfu8BIpEzj-f2AZxHz8T-Bo5p7miSGc16CS856SoAquozkXt_T7iQLzYApp90MHErVPMIiIin7npi3pLCGH9")',
                      animationDelay: '120ms',
                    }}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#8C7853]">예약 ID: #12345</p>
                    <h3 className="text-lg font-bold text-[#3D2C1D] mt-1">예약 A</h3>
                    <p className="text-sm text-[#8C7853] mt-2">2025년 7월 20일 ~ 7월 27일</p>
                  </div>
                  <span className="absolute top-4 right-4 text-xs font-semibold text-green-600 bg-green-100 py-1 px-2 rounded-full">
                    확정
                  </span>
                </div>
              </Link>

              <Link href="/bookingdetail" className="block">
                <div
                  className="bg-white rounded-xl shadow-sm p-4 relative flex items-start gap-4 animate-scaleIn cursor-pointer"
                  style={{ animationDelay: '140ms' }}
                >
                  <div
                    className="w-24 h-24 bg-center bg-no-repeat bg-cover rounded-lg flex-shrink-0 animate-scaleIn"
                    style={{
                      backgroundImage:
                        'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCrqrYmsEJa0Sd-hyxHCUnQfvGlC17-VRZFqnO2KJssC_FYvOvejVsv7MDblTqQo6GXa4feOkp2Q9XqoTkiTS3ieGWS7NEEh4j3q6Z4-eyXJ8dljd-kcVFiAIawmbP_BuTVX12EfItqKhwuqpNyubC79EynA2WMfBUv8XdIKZ04xV24RvUJ9eSGjWOP0XGLSb6t6Q6Zf8kMWVGlOT2lftAg6ni-rUQlECOCpekjm8vYjB8hR4N7amKCJyQx-YHmgbj3wXX_wF-XWZU4")',
                      animationDelay: '160ms',
                    }}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#8C7853]">예약 ID: #67890</p>
                    <h3 className="text-lg font-bold text-[#3D2C1D] mt-1">예약 B</h3>
                    <p className="text-sm text-[#8C7853] mt-2">2025년 8월 1일 ~ 8월 7일</p>
                  </div>
                  <span className="absolute top-4 right-4 text-xs font-semibold text-yellow-600 bg-yellow-100 py-1 px-2 rounded-full">
                    확인 중
                  </span>
                </div>
              </Link>
            </div>
          </section>

          {/* 지난 예약 */}
          <section className="animate-fadeUp" style={{ animationDelay: '200ms' }}>
            <h2 className="text-2xl font-bold text-[#3D2C1D] mb-4">지난 예약</h2>

            <Link href="/bookingdetail" className="block">
              <div
                className="bg-gray-50 opacity-80 rounded-xl shadow-sm p-4 relative flex items-start gap-4 animate-scaleIn cursor-pointer"
                style={{ animationDelay: '240ms' }}
              >
                <div
                  className="w-24 h-24 bg-center bg-no-repeat bg-cover rounded-lg flex-shrink-0 animate-scaleIn"
                  style={{
                    backgroundImage:
                      'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBXN0jW9dNacMfUY9Z3bjC1_xCiS15tb-fbfkWAYsD4VZCqx2nvEDgCN5wP6FL6OejGRVn4Eulfteh41r_bOXziuW42R0g6AU-l7dKL7n-hgiMCjmU9WFRSYH6kezy3-ftseDg8p36pj2mdHxEKF8_zZh6pP-sJ__iaMHZw7Xs5ohv9UbA_IWKWQfo4SMO1xKqEm0DFPbSLowGMZ3sE6YCvwt7YrBBV4vaYdyCpTJrFTrJzQRbocN3Z77WgS2xiA_y7q-hEYaBbEiiG")',
                    animationDelay: '260ms',
                  }}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#8C7853]">예약 ID: #11223</p>
                  <h3 className="text-lg font-bold text-[#3D2C1D] mt-1">예약 C</h3>
                  <p className="text-sm text-[#8C7853] mt-2">Jun 15 - Jun 22, 2024</p>
                </div>
                <span className="absolute top-4 right-4 text-xs font-semibold text-gray-600 bg-gray-200 py-1 px-2 rounded-full">
                  종료
                </span>
              </div>
            </Link>
          </section>
        </main>

        {/* 네비게이션 바 */}
        <div className="animate-fadeIn" style={{ animationDelay: '360ms' }}>
          <BottomNav />
        </div>
      </div>
    </>
  );
}
