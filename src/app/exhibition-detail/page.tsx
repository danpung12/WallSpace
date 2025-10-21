"use client";

import { Suspense, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Header from "@/app/components/Header";
import { useBottomNav } from '@/app/context/BottomNavContext';
import Footer from '@/app/components/Footer';

// Mock 전시 데이터 (dashboard에서 가져올 데이터)
const EXHIBITIONS_DATA = [
  {
    id: '#10001',
    artworkTitle: '도시의 밤',
    artworkImage: 'https://picsum.photos/id/102/400/300',
    storeName: '스티치 카페 성수점',
    storeLocation: '서울시 성동구',
    storeImage: 'https://picsum.photos/id/200/400/300',
    period: '2025.10.01 - 2025.11.30',
    startDate: '2025-10-01',
    endDate: '2025-11-30',
    daysLeft: 41,
    stats: {
      totalVisitors: 1247,
      ageGroups: [
        { range: '10대', count: 89, percentage: 7 },
        { range: '20대', count: 486, percentage: 39 },
        { range: '30대', count: 374, percentage: 30 },
        { range: '40대', count: 187, percentage: 15 },
        { range: '50대 이상', count: 111, percentage: 9 },
      ],
      gender: {
        male: 562,
        female: 685,
      },
      dailyVisitors: [
        { date: '10/15', count: 45 },
        { date: '10/16', count: 52 },
        { date: '10/17', count: 38 },
        { date: '10/18', count: 61 },
        { date: '10/19', count: 48 },
        { date: '10/20', count: 55 },
        { date: '10/21', count: 42 },
      ],
    },
    reviews: [
      { id: 1, nickname: '김민수', profileImage: 'https://i.pravatar.cc/150?img=12', comment: '작품이 정말 인상적이었어요. 도시의 야경이 너무 아름답게 표현되었네요!', date: '2025-10-19' },
      { id: 2, nickname: '이지연', profileImage: 'https://i.pravatar.cc/150?img=45', comment: '카페 분위기도 좋고 작품도 멋있어서 데이트 코스로 추천합니다 ❤️', date: '2025-10-18' },
      { id: 3, nickname: '박성호', profileImage: 'https://i.pravatar.cc/150?img=33', comment: '색감이 정말 독특하고 감각적이에요. 다음에 또 방문하고 싶습니다.', date: '2025-10-17' },
      { id: 4, nickname: '최유진', profileImage: 'https://i.pravatar.cc/150?img=23', comment: '생각보다 작품 크기가 크고 디테일이 살아있어서 좋았어요!', date: '2025-10-16' },
      { id: 5, nickname: '정우성', profileImage: 'https://i.pravatar.cc/150?img=52', comment: '예술적인 감성이 느껴지는 작품이네요. 강추합니다 👍', date: '2025-10-15' },
    ],
  },
  {
    id: '#10002',
    artworkTitle: '자연의 향기',
    artworkImage: 'https://picsum.photos/id/180/400/300',
    storeName: '스티치 갤러리 서초점',
    storeLocation: '서울시 서초구',
    storeImage: 'https://picsum.photos/id/201/400/300',
    period: '2025.09.15 - 2025.10.31',
    startDate: '2025-09-15',
    endDate: '2025-10-31',
    daysLeft: 11,
    stats: {
      totalVisitors: 892,
      ageGroups: [
        { range: '10대', count: 54, percentage: 6 },
        { range: '20대', count: 267, percentage: 30 },
        { range: '30대', count: 312, percentage: 35 },
        { range: '40대', count: 178, percentage: 20 },
        { range: '50대 이상', count: 81, percentage: 9 },
      ],
      gender: {
        male: 401,
        female: 491,
      },
      dailyVisitors: [
        { date: '10/15', count: 32 },
        { date: '10/16', count: 28 },
        { date: '10/17', count: 41 },
        { date: '10/18', count: 35 },
        { date: '10/19', count: 39 },
        { date: '10/20', count: 44 },
        { date: '10/21', count: 37 },
      ],
    },
    reviews: [
      { id: 1, nickname: '강민지', profileImage: 'https://i.pravatar.cc/150?img=5', comment: '자연의 색감이 정말 아름다워요. 힐링되는 느낌이에요 🌿', date: '2025-10-20' },
      { id: 2, nickname: '홍길동', profileImage: 'https://i.pravatar.cc/150?img=68', comment: '작가님의 감성이 잘 느껴지는 작품입니다. 좋아요!', date: '2025-10-19' },
      { id: 3, nickname: '송하늘', profileImage: 'https://i.pravatar.cc/150?img=41', comment: '갤러리 위치도 좋고 작품도 수준급이에요 ✨', date: '2025-10-18' },
    ],
  },
  {
    id: '#10003',
    artworkTitle: '추상의 세계',
    artworkImage: 'https://picsum.photos/id/164/400/300',
    storeName: '스티치 라운지 홍대점',
    storeLocation: '서울시 마포구',
    storeImage: 'https://picsum.photos/id/202/400/300',
    period: '2025.10.10 - 2025.12.10',
    startDate: '2025-10-10',
    endDate: '2025-12-10',
    daysLeft: 51,
    stats: {
      totalVisitors: 1456,
      ageGroups: [
        { range: '10대', count: 146, percentage: 10 },
        { range: '20대', count: 582, percentage: 40 },
        { range: '30대', count: 437, percentage: 30 },
        { range: '40대', count: 204, percentage: 14 },
        { range: '50대 이상', count: 87, percentage: 6 },
      ],
      gender: {
        male: 640,
        female: 816,
      },
      dailyVisitors: [
        { date: '10/15', count: 58 },
        { date: '10/16', count: 65 },
        { date: '10/17', count: 52 },
        { date: '10/18', count: 71 },
        { date: '10/19', count: 60 },
        { date: '10/20', count: 68 },
        { date: '10/21', count: 55 },
      ],
    },
    reviews: [
      { id: 1, nickname: '이서준', profileImage: 'https://i.pravatar.cc/150?img=13', comment: '추상화라 어려울 줄 알았는데 생각보다 재미있어요!', date: '2025-10-21' },
      { id: 2, nickname: '윤지우', profileImage: 'https://i.pravatar.cc/150?img=28', comment: '홍대 데이트하면서 보기 좋네요. 감각적인 작품이에요 🎨', date: '2025-10-20' },
      { id: 3, nickname: '한소희', profileImage: 'https://i.pravatar.cc/150?img=9', comment: '색채 표현이 독특하고 인상적입니다. 추천해요!', date: '2025-10-19' },
      { id: 4, nickname: '조민호', profileImage: 'https://i.pravatar.cc/150?img=60', comment: '라운지 분위기랑 작품이 잘 어울려요. 커피 마시며 감상하기 좋아요 ☕', date: '2025-10-18' },
    ],
  },
];

function ExhibitionDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [exhibition, setExhibition] = useState<typeof EXHIBITIONS_DATA[0] | null>(null);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const { setIsNavVisible } = useBottomNav();

  useEffect(() => {
    setIsNavVisible(false);
    return () => {
      setIsNavVisible(true);
    };
  }, [setIsNavVisible]);

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      const foundExhibition = EXHIBITIONS_DATA.find(ex => ex.id === id);
      setExhibition(foundExhibition || null);
    }
  }, [searchParams]);

  const formattedPeriod = useMemo(() => {
    if (!exhibition) return "";
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const startDate = new Date(exhibition.startDate).toLocaleDateString('ko-KR', options);
    const endDate = new Date(exhibition.endDate).toLocaleDateString('ko-KR', options);
    return `${startDate} ~ ${endDate}`;
  }, [exhibition]);

  const maxDailyVisitors = useMemo(() => {
    if (!exhibition) return 0;
    return Math.max(...exhibition.stats.dailyVisitors.map(d => d.count));
  }, [exhibition]);

  const handleBack = () => router.back();

  if (!exhibition) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">전시 정보를 불러오는 중이거나 찾을 수 없습니다.</p>
      </div>
    );
  }

  const malePercentage = Math.round((exhibition.stats.gender.male / exhibition.stats.totalVisitors) * 100);
  const femalePercentage = Math.round((exhibition.stats.gender.female / exhibition.stats.totalVisitors) * 100);

  return (
    <>
      <style jsx global>{`
        :root {
          --primary-color: #d2b48c; --secondary-color: #f5f5f5; --background-color: #fdfbf8;
          --text-primary: #3d2c1d; --text-secondary: #8c7853; --accent-color: #f0ead6;
        }
        body { background-color: var(--background-color); color: var(--text-primary); }
      `}</style>
      <div className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-10 bg-[var(--background-color)]/80 backdrop-blur-sm">
          <div className="flex items-center justify-between p-4">
            <button
              className="text-[var(--text-primary)] active:scale-95 transition"
              type="button"
              onClick={handleBack}
              aria-label="뒤로 가기"
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
                <path d="M19 12H5" />
                <path d="m12 19-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">
              전시 상세
            </h1>
            <div className="w-6" />
          </div>
        </header>
        
        <main className="flex-grow p-4 lg:py-8 lg:px-40">
          <div className="pt-4 lg:pt-8">
            <section className="bg-white rounded-xl shadow-sm p-5 lg:p-8 lg:flex lg:justify-between lg:items-center">
              <h1 className="text-xl font-bold">전시 상세정보</h1>
              <div className="flex items-center gap-4 mt-4 lg:mt-0">
                <p className="text-sm font-medium text-[var(--text-secondary)]">예약 ID: {exhibition.id}</p>
                <span className="text-xs font-semibold py-1 px-3 rounded-full bg-green-100 text-green-600">
                  D-{exhibition.daysLeft}
                </span>
              </div>
            </section>

            <div className="flex flex-col lg:grid lg:grid-cols-3 lg:gap-6 mt-6 gap-6">
              <div className="lg:col-span-2 space-y-6 order-1 lg:order-none">
                {/* 작품 정보 & 예약 장소 */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl shadow-sm p-5 lg:p-8">
                    <h3 className="text-lg font-bold mb-4">작품 정보</h3>
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-24 bg-center bg-no-repeat bg-cover rounded-lg flex-shrink-0" style={{ backgroundImage: `url("${exhibition.artworkImage}")` }} />
                      <div className="flex-1 space-y-1">
                        <p className="text-base font-semibold">{`"${exhibition.artworkTitle}"`}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm p-5 lg:p-8">
                    <h3 className="text-lg font-bold mb-4">예약 장소</h3>
                    <div className="flex items-center gap-4">
                       <div className="w-24 h-24 bg-center bg-no-repeat bg-cover rounded-lg flex-shrink-0" style={{ backgroundImage: `url("${exhibition.storeImage}")` }} />
                       <div className="flex-1 space-y-1">
                         <p className="text-base font-semibold">{exhibition.storeName}</p>
                         <p className="text-sm text-[var(--text-secondary)]">{exhibition.storeLocation}</p>
                       </div>
                    </div>
                  </div>
                </section>

                {/* 예약 기간 */}
                <section className="bg-white rounded-xl shadow-sm p-5 lg:p-8">
                  <h3 className="text-lg font-bold mb-4">예약 기간</h3>
                  <p>{formattedPeriod}</p>
                </section>

              {/* 한 줄 평 */}
              <section className="bg-white rounded-xl shadow-sm p-5 lg:p-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">관람객 한 줄 평</h3>
                  <span className="text-sm text-[var(--text-secondary)]">{exhibition.reviews.length}개</span>
                </div>
                <div className="space-y-4">
                  {exhibition.reviews.map((review) => (
                    <div key={review.id} className="flex gap-3 p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 rounded-full bg-center bg-cover bg-no-repeat flex-shrink-0" style={{ backgroundImage: `url("${review.profileImage}")` }} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-semibold text-[var(--text-primary)]">{review.nickname}</p>
                          <span className="text-xs text-[var(--text-secondary)]">{new Date(review.date).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}</span>
                        </div>
                        <p className="text-sm text-[var(--text-primary)] leading-relaxed">{review.comment}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
              </div>

              {/* 통계 카드 */}
              <div className="lg:col-span-1 order-2 lg:order-none">
                <section className="bg-white rounded-xl shadow-sm p-5 lg:p-8">
                  <h3 className="text-lg font-bold mb-4">통계</h3>
                  <div className="text-center py-4">
                    <p className="text-sm text-[var(--text-secondary)] mb-2">총 관람객</p>
                    <p className="text-4xl font-bold text-[var(--primary-color)]">{exhibition.stats.totalVisitors.toLocaleString()}</p>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">명</p>
                  </div>
                  <button
                    onClick={() => setIsStatsModalOpen(true)}
                    className="w-full mt-6 bg-[var(--primary-color)] text-white py-3 px-6 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                  >
                    상세 통계 보기
                  </button>
                </section>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>

      {/* 통계 모달 */}
      {isStatsModalOpen && (
        <div
          className="fixed inset-0 flex justify-center items-center z-50 p-4 bg-black/50"
          onClick={() => setIsStatsModalOpen(false)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl bg-white custom-scrollbar-thin"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 sm:px-8 pt-6 pb-4 sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">상세 통계</h2>
              <button onClick={() => setIsStatsModalOpen(false)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-6 p-6 sm:p-8">
              {/* 총 관람객 수 */}
              <section className="bg-[var(--accent-color)] rounded-xl p-6">
                <div className="text-center">
                  <p className="text-sm text-[var(--text-secondary)] mb-2">총 관람객</p>
                  <p className="text-5xl font-bold text-[var(--primary-color)]">{exhibition.stats.totalVisitors.toLocaleString()}</p>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">명</p>
                </div>
              </section>

              {/* 성별 통계 */}
              <section>
                <h3 className="text-lg font-bold mb-4 text-[var(--text-primary)]">성별 통계</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">남성</span>
                      <span className="text-sm font-semibold text-[var(--primary-color)]">{malePercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-4">
                      <div 
                        className="bg-blue-400 h-4 rounded-full transition-all duration-300" 
                        style={{ width: `${malePercentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">{exhibition.stats.gender.male.toLocaleString()}명</p>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">여성</span>
                      <span className="text-sm font-semibold text-[var(--primary-color)]">{femalePercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-4">
                      <div 
                        className="bg-pink-400 h-4 rounded-full transition-all duration-300" 
                        style={{ width: `${femalePercentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">{exhibition.stats.gender.female.toLocaleString()}명</p>
                  </div>
                </div>
              </section>

              {/* 연령대 통계 */}
              <section>
                <h3 className="text-lg font-bold mb-4 text-[var(--text-primary)]">연령대 통계</h3>
                <div className="space-y-3">
                  {exhibition.stats.ageGroups.map((age, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">{age.range}</span>
                        <span className="text-sm font-semibold text-[var(--primary-color)]">{age.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-4">
                        <div 
                          className="bg-[var(--primary-color)] h-4 rounded-full transition-all duration-300" 
                          style={{ width: `${age.percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] mt-1">{age.count.toLocaleString()}명</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* 날짜별 관람인 수 */}
              <section>
                <h3 className="text-lg font-bold mb-4 text-[var(--text-primary)]">날짜별 관람인 수 (최근 7일)</h3>
                <div className="space-y-3">
                  {exhibition.stats.dailyVisitors.map((day, idx) => {
                    const colors = [
                      '#d2b48c', '#daa520', '#cd853f', '#b8860b', '#d2691e', '#c19a6b', '#e6c896',
                    ];
                    return (
                      <div key={idx} className="flex items-center gap-3">
                        <span className="text-sm text-[var(--text-secondary)] w-12">{day.date}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
                          <div 
                            className="h-full rounded-full flex items-center justify-end pr-3 transition-all duration-300"
                            style={{ 
                              width: `${(day.count / maxDailyVisitors) * 100}%`,
                              backgroundColor: colors[idx % colors.length]
                            }}
                          >
                            <span className="text-xs font-semibold text-white">{day.count}명</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function ExhibitionDetailPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <ExhibitionDetailContent />
    </Suspense>
  );
}

