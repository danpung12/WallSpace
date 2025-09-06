// src/app/dashboard/page.tsx
'use client';

import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();

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

      {/* 전역 스타일(스크롤바 숨김만 유지) */}
      <style jsx global>{`
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <div className="relative flex min-h-[100dvh] flex-col bg-[#FDFBF8] text-[#3D2C1D] font-pretendard">
        {/* 헤더: 햄버거 제거, 뒤로가기 추가 */}
        <header className="sticky top-0 z-10 bg-[#FDFBF8]/80 backdrop-blur-sm">
          <div className="flex items-center p-4">
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="뒤로 가기"
              className="text-[#3D2C1D] active:scale-95 transition-transform"
            >
              <svg
                fill="none"
                height="24"
                width="24"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>

            <h1 className="flex-1 text-center text-xl font-bold text-[#3D2C1D]">대시보드</h1>

            {/* 오른쪽 대칭 여백 */}
            <div className="w-7" />
          </div>
        </header>

        <main className="p-4 space-y-8 pb-24">
          {/* 내 작품 */}
          <section>
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="text-2xl font-bold text-[#3D2C1D]">내 작품</h2>
              <Link
                href="/dashboard/add"
                className="bg-[#D2B48C] text-white text-sm font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-opacity-90 transition-colors active:opacity-90"
              >
                작품 추가
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

          {/* 전시 중 */}
          <section>
            <h2 className="text-2xl font-bold text-[#3D2C1D] mb-4">전시 중</h2>
            <div className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-center text-[#8C7853]">현재 진행 중인 전시가 없습니다.</p>
            </div>
          </section>

          {/* 예정된 예약 */}
          <section>
            <h2 className="text-2xl font-bold text-[#3D2C1D] mb-4">예정된 예약</h2>
            <div className="space-y-4">
              <Link href="/bookingdetail" className="block">
                <div className="bg-white rounded-xl shadow-sm p-4 relative flex items-start gap-4 cursor-pointer">
                  <div
                    className="w-24 h-24 bg-center bg-no-repeat bg-cover rounded-lg flex-shrink-0"
                    style={{
                      backgroundImage:
                        'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB1hI9oEpCk1Pbvkp_kEABsMwq3UiQpEXgkQAjoKq3zsxh-1zCYNITVvuXmpNpLF9VoSrWCoNDyoRdxjyqMpDNrTBUpb1pjkgZe5LWlm7gnI0w_y_Q1ei5WNLT30zg7ppiyZf-7lqwmBeZH_SBYUF2jG9N9RewMBMkuchWyUez73Nu8RP_KzNk9qWCHKfu8BIpEzj-f2AZxHz8T-Bo5p7miSGc16CS856SoAquozkXt_T7iQLzYApp90MHErVPMIiIin7npi3pLCGH9")',
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
                <div className="bg-white rounded-xl shadow-sm p-4 relative flex items-start gap-4 cursor-pointer">
                  <div
                    className="w-24 h-24 bg-center bg-no-repeat bg-cover rounded-lg flex-shrink-0"
                    style={{
                      backgroundImage:
                        'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCrqrYmsEJa0Sd-hyxHCUnQfvGlC17-VRZFqnO2KJssC_FYvOvejVsv7MDblTqQo6GXa4feOkp2Q9XqoTkiTS3ieGWS7NEEh4j3q6Z4-eyXJ8dljd-kcVFiAIawmbP_BuTVX12EfItqKhwuqpNyubC79EynA2WMfBUv8XdIKZ04xV24RvUJ9eSGjWOP0XGLSb6t6Q6Zf8kMWVGlOT2lftAg6ni-rUQlECOCpekjm8vYjB8hR4N7amKCJyQx-YHmgbj3wXX_wF-XWZU4")',
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
          <section>
            <h2 className="text-2xl font-bold text-[#3D2C1D] mb-4">지난 예약</h2>

            <Link href="/bookingdetail" className="block">
              <div className="bg-gray-50 opacity-80 rounded-xl shadow-sm p-4 relative flex items-start gap-4 cursor-pointer">
                <div
                  className="w-24 h-24 bg-center bg-no-repeat bg-cover rounded-lg flex-shrink-0"
                  style={{
                    backgroundImage:
                      'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBXN0jW9dNacMfUY9Z3bjC1_xCiS15tb-fbfkWAYsD4VZCqx2nvEDgCN5wP6FL6OejGRVn4Eulfteh41r_bOXziuW42R0g6AU-l7dKL7n-hgiMCjmU9WFRSYH6kezy3-ftseDg8p36pj2mdHxEKF8_zZh6pP-sJ__iaMHZw7Xs5ohv9UbA_IWKWQfo4SMO1xKqEm0DFPbSLowGMZ3sE6YCvwt7YrBBV4vaYdyCpTJrFTrJzQRbocN3Z77WgS2xiA_y7q-hEYaBbEiiG")',
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
      </div>
    </>
  );
}
