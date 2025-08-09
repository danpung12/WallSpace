'use client';

import Head from 'next/head';
import Link from 'next/link';
import BottomNav from '@/app/components/BottomNav';

export default function Dashboard() {
  return (
    <>
      <Head>
        <title>Stitch Design</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      {/* 애니메이션 선언 (global) */}
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
          from { opacity: 0; transform: translateY(14px); filter: saturate(0.96); }
          to   { opacity: 1; transform: translateY(0);    filter: saturate(1); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.96); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>

      <div className="relative min-h-screen font-[Pretendard] bg-[#FDFBF8] text-[#3D2C1D] antialiased overflow-x-hidden">
        {/* 헤더: 슬라이드다운 */}
        <header className="sticky top-0 z-10 bg-[#FDFBF8]/80 backdrop-blur-sm animate-slideDown">
          <div className="flex items-center justify-between p-4">
            <button className="text-[#3D2C1D] active:scale-95 transition-transform">
              <svg fill="currentColor" height="28" width="28" viewBox="0 0 256 256">
                <path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM40,72H216a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16ZM216,184H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-[#3D2C1D]">대시보드</h1>
            <div className="w-7"></div>
          </div>
        </header>

        <main className="p-4 space-y-8 pb-24">
          {/* 예정된 예약 */}
          <section className="animate-fadeUp" style={{ animationDelay: '40ms' }}>
            <h2 className="text-2xl font-bold text-[#3D2C1D] mb-4">예정된 예약</h2>
            <div className="space-y-4">

              {/* 카드 1 (클릭 시 /bookingdetail 이동) */}
              <Link href="/bookingdetail" className="block">
                <div
                  className="bg-white rounded-xl shadow-sm p-4 relative flex items-start gap-4 animate-scaleIn cursor-pointer"
                  style={{ animationDelay: '80ms' }}
                >
                  <div
                    className="w-24 h-24 bg-center bg-no-repeat bg-cover rounded-lg flex-shrink-0 animate-scaleIn"
                    style={{
                      backgroundImage:
                        'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB1hI9oEpCk1Pbvkp_kEABsMwq3UiQpEXgkQAjoKq3zsxh-1zCYNITVvuXmpNpLF9VoSrWCoNDyoRdxjyqMpDNrTBUpb1pjkgZe5LWlm7gnI0w_y_Q1ei5WNLT30zg7ppiyZf-7lqwmBeZH_SBYUF2jG9N9RewMBMkuchWyUez73Nu8RP_KzNk9qWCHKfu8BIpEzj-f2AZxHz8T-Bo5p7miSGc16CS856SoAquozkXt_T7iQLzYApp90MHErVPMIiIin7npi3pLCGH9")',
                      animationDelay: '100ms',
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

              {/* 카드 2 */}
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

          {/* 결제 내역 */}
          <section className="animate-fadeUp" style={{ animationDelay: '280ms' }}>
            <h2 className="text-2xl font-bold text-[#3D2C1D] mb-4">결제 내역</h2>
            <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-100">
              <div
                className="flex items-center justify-between p-4 animate-fadeUp"
                style={{ animationDelay: '300ms' }}
              >
                <div>
                  <p className="text-base font-semibold text-[#3D2C1D]">₩ 100,000</p>
                  <p className="text-sm text-[#8C7853]">예약 ID: #12345</p>
                </div>
                <p className="text-sm text-[#8C7853]">2025년 7월 15일</p>
              </div>
              <div
                className="flex items-center justify-between p-4 animate-fadeUp"
                style={{ animationDelay: '320ms' }}
              >
                <div>
                  <p className="text-base font-semibold text-[#3D2C1D]">₩ 120,000</p>
                  <p className="text-sm text-[#8C7853]">예약 ID: #67890</p>
                </div>
                <p className="text-sm text-[#8C7853]">2025년 7월 1일</p>
              </div>
              <div
                className="flex items-center justify-between p-4 opacity-70 animate-fadeUp"
                style={{ animationDelay: '340ms' }}
              >
                <div>
                  <p className="text-base font-semibold text-[#3D2C1D]">₩ 90,000</p>
                  <p className="text-sm text-[#8C7853]">예약 ID: #11223</p>
                </div>
                <p className="text-sm text-[#8C7853]">2025년 6월 15일</p>
              </div>
            </div>
          </section>
        </main>

        {/* 네비게이션 바: opacity만 페이드 (fixed 깨지지 않게) */}
        <div className="animate-fadeIn" style={{ animationDelay: '360ms' }}>
          <BottomNav />
        </div>
      </div>
    </>
  );
}
