'use client'

import Head from 'next/head'
import BottomNav from '../components/BottomNav'

export default function MyExhibitionsPage() {
  return (
    <>


      {/* Global CSS variables for theme */}
      <style jsx global>{`
        :root {
          --primary-color: #c19a6b; /* 버튼/포인트 */
          --secondary-color: #f5f5dc;
          --background-color: #fcfaf8;
          --text-primary: #3e2723;
          --text-secondary: #795548;
          --glass: rgba(255, 255, 255, 0.30);
        }
        html, body { height: 100%; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
      `}</style>

      <div
        className="relative min-h-screen bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCUwVLhxohSTKtBYQ4y5cSs8TlfDt3_qgVFVkaQnPAkTfICle2ESRdxc9Yfq2SObjLrxrwikJDPBBuDPhVKZyo6Qao_M0_ry-y8dY71Ywh95w9zGQhm1o_HdYcPJYlBJqTShYLR64t77A4gAZ439BG4zlKGxUVTMjFe7I55uwduiYiBPB_mc9Ko0gbu2sNORCWcJP99MGYphClgKgGEmi1LEzvSRceMIMoRVSJJuDSw8ThUNjfx5kCuDWUl83v6XMk9aB8m86DcGcVj')",
        }}
      >
        {/* subtle overlay + slight blur for readability */}
        <div
          className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-b from-black/10 via-transparent to-black/20"
          style={{ backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)' }}
        />

        <div className="relative z-10 flex min-h-screen flex-col justify-between overflow-x-hidden">
          {/* Intro / Profile */}
          <section className="px-6 pt-16 md:pt-24 pb-8 md:pb-12">
            <div className="flex w-full flex-col items-center gap-4">
              <div
                className="h-32 w-32 md:h-48 md:w-48 rounded-full bg-cover bg-center ring-4 ring-white/80 shadow-[0_25px_55px_rgba(0,0,0,0.45)]"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDvM8BeQVRtX-JPgzmA6JCZ0Sx8m-Ver8hiSd4I9V_JbwzHPoychRH2Ok3qqU_bmgZPSQAn_047aMc8nCL1qI5qDcnERJC5Hqq2YwObo_LB9UrvnU4GTgYEp5aGCssWwnVl91-JOk2Nx9SY2vvbx16_bIBhG1DjRKgVPd3pt3GOOA1vAWxA8oGWfQy_pK3stg40qzQ4UZ1g0ywp9k6U8BQBA4cLy-blz0639c4a5y7sWmirFsfQByuYFDQAvMn-duibl6-hECUU606Z')",
                }}
              />
              <div className="flex flex-col items-center justify-center text-center">
                <p className="text-3xl md:text-4xl font-bold tracking-tight text-white drop-shadow-[0_3px_8px_rgba(0,0,0,0.6)]">
                  환영합니다, Selena님!
                </p>
                <p className="text-lg md:text-xl font-normal text-gray-200 drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">예술가</p>
              </div>
            </div>
          </section>

          {/* Main card (Upcoming) */}
          <section className="px-6 pb-10 md:pb-16">
            <div className="w-full max-w-[360px] sm:max-w-md mx-auto text-center rounded-2xl p-6 shadow-lg border border-white/20 bg-[var(--glass)] backdrop-blur-[12px]">
              <div className="relative">
                <span className="absolute left-2 top-2 z-10 rounded-full bg-black/70 text-white text-xs font-semibold px-2.5 py-1">
                  예정
                </span>
                <img
                  className="w-full h-40 md:h-48 rounded-xl object-cover"
                  alt="전시 작품 이미지"
                  src="https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?q=80&w=1200&auto=format&fit=crop"
                />
              </div>
              <p className="mt-6 text-base sm:text-lg md:text-2xl tracking-tight text-[var(--text-secondary)] leading-tight">
                <span className="md:hidden">
                  다음 전시는 <span className="font-semibold text-[var(--text-primary)]">7월 20일</span>{' '}
                  <span className="font-semibold text-[var(--text-primary)]">공간 A</span>에서 열립니다!
                </span>
                <span className="hidden md:inline">
                  다음 전시는 <span className="font-semibold text-[var(--text-primary)]">7월 20일</span>{' '}
                  <span className="font-semibold text-[var(--text-primary)]">공간 A</span>에서 열립니다!
                </span>
              </p>
              <button className="w-full mt-4 bg-[var(--primary-color)] text-white rounded-full px-6 py-3 font-semibold hover:opacity-90 transition focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:ring-opacity-50">
                예약 상세 보기
              </button>
            </div>
          </section>

          {/* Past exhibitions */}
          <section className="relative z-10 max-w-4xl mx-auto px-6 mt-4 md:mt-8 w-full mb-20">
            <h3 className="mb-4 text-xl font-bold text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">지난 전시</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              <div className="flex items-center gap-4 rounded-2xl p-4 shadow-md border border-white/20 bg-[rgba(255,255,255,0.25)] backdrop-blur-[10px]">
                <img
                  alt="지난 전시 썸네일"
                  className="h-16 w-16 sm:h-20 sm:w-20 rounded-md object-cover shadow"
                  src="https://images.unsplash.com/photo-1526318472351-c75fcf070305?auto=format&fit=crop&w=200&q=60"
                />
                <div className="flex-1">
                  <p className="font-bold text-[var(--text-primary)]">6월 12일, 합정점</p>
                  <p className="text-sm text-[var(--text-secondary)]">'봄의 기억'</p>
                </div>
              </div>
              {/* 더 많은 아이템 가능 */}
            </div>
          </section>

          {/* Bottom nav */}
          <BottomNav />
        
      </div>
      </div>
    </>
  )
}
