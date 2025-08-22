"use client";

import React, { useMemo, useRef, useState } from "react";
import Link from "next/link";

// 디자인 토큰은 기존 페이지와 동일
const theme = {
  primary: "var(--primary-color)",
  bg: "var(--background-color)",
  text: "var(--text-primary)",
  textSub: "var(--text-secondary)",
  accent: "var(--accent-color)",
};

// 샘플 장소 데이터 (좌표는 예시: 서울 중심 일대)
type Place = {
  id: string;
  name: string;
  category: "갤러리" | "카페" | "복합문화공간";
  address: string;
  distanceKm: number;
  lat: number;
  lng: number;
  img?: string | null;
  featured?: boolean; // 추천 카드에 노출
};

const PLACES: Place[] = [
  {
    id: "p1",
    name: "스티치 갤러리",
    category: "갤러리",
    address: "서울 중구 세종대로 110",
    distanceKm: 0.6,
    lat: 37.5663,
    lng: 126.9779,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDJTt5ZFwI1-bnOPgYP1YprPp1i6waeofBVh7iPRnhZ4KTqmyNVWkPIvYrCDOMoi_8Nr8cruvBiNxcYfUJni-eOuBsZOOqr5BcdrIbrx9ioWmwaYZTuAhopV87HCWOEZ1E6I2AoZWcuxOjTKumLOlLzOOGMMqTZDSow233a3oFQmCWJrP85PVfMY3XRy4Ca1flYD9NHIgYr3rxbLaY9hXw4iuLYUSCGLNVD-Bo_EBeBCgtmqepGsbAPmYNZM-46-kfw_hN01JX0B8Uh",
    featured: true,
  },
  {
    id: "p2",
    name: "브릭 로스터스",
    category: "카페",
    address: "서울 종로구 종로 1",
    distanceKm: 0.9,
    lat: 37.5700,
    lng: 126.9820,
    img: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=800&auto=format&fit=crop",
    featured: true,
  },
  {
    id: "p3",
    name: "메인 스트리트 스페이스",
    category: "복합문화공간",
    address: "서울 중구 태평로",
    distanceKm: 1.2,
    lat: 37.5638,
    lng: 126.9825,
    img: "https://images.unsplash.com/photo-1487865404335-4f26c52268f8?q=80&w=800&auto=format&fit=crop",
    featured: true,
  },
  {
    id: "p4",
    name: "코지 코너",
    category: "카페",
    address: "서울 중구 소공로",
    distanceKm: 0.4,
    lat: 37.5632,
    lng: 126.9765,
    img: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "p5",
    name: "월든 아트룸",
    category: "갤러리",
    address: "서울 종로구 팔판동",
    distanceKm: 1.8,
    lat: 37.5794,
    lng: 126.9849,
    img: "https://images.unsplash.com/photo-1511593358241-7eee65b24c5d?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "p6",
    name: "레이지 빔 카페",
    category: "카페",
    address: "서울 중구 남대문로",
    distanceKm: 1.0,
    lat: 37.5669,
    lng: 126.9822,
    img: "https://images.unsplash.com/photo-1453614512568-c4024d13c247?q=80&w=800&auto=format&fit=crop",
  },
];

// 기본 지도 중심(시청 근처)
const DEFAULT_CENTER = { lat: 37.5663, lng: 126.9779 };

// Google Maps embed src 생성 (API 키 필요 없음)
function mapSrc(center: { lat: number; lng: number }, query?: string) {
  // query가 있으면 주변 검색, 없으면 좌표 중심 표시
  const q = query ? encodeURIComponent(query) : `${center.lat},${center.lng}`;
  return `https://www.google.com/maps?q=${q}&ll=${center.lat},${center.lng}&z=15&output=embed`;
}

export default function ExplorePlacesPage() {
  const [activeCategory, setActiveCategory] = useState<Place["category"] | "전체">("전체");
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  const categories: (Place["category"] | "전체")[] = ["전체", "갤러리", "카페", "복합문화공간"];

  const featured = useMemo(
    () => PLACES.filter((p) => p.featured),
    []
  );

  const filtered = useMemo(() => {
    const base = activeCategory === "전체" ? PLACES : PLACES.filter((p) => p.category === activeCategory);
    // 가까운 순
    return [...base].sort((a, b) => a.distanceKm - b.distanceKm);
  }, [activeCategory]);

  function highlightPlace(p: Place) {
    setSelectedPlaceId(p.id);
    setCenter({ lat: p.lat, lng: p.lng });
    // 지도 섹션으로 부드럽게 스크롤
    requestAnimationFrame(() => {
      mapRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  const headerLabel = "공간 찾기";

  return (
    <div className="relative flex size-full min-h-screen flex-col justify-between overflow-x-hidden bg-[var(--background-color)]">
      <div className="w-full max-w-md mx-auto bg-[var(--background-color)]">
        {/* 헤더 */}
        <header className="flex items-center p-4 pb-2 justify-between bg-[#FDFBF8] border-[#EAEAEA]">
          <Link href="/profile" passHref>
            <button className="text-[var(--text-primary)] cursor-pointer" aria-label="뒤로 가기">
              <svg fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24">
                <path d="m15 18-6-6 6-6"></path>
              </svg>
            </button>
          </Link>
          <h1 className="text-lg font-bold text-[var(--text-primary)] flex-1 text-center">{headerLabel}</h1>
          <div className="w-8" />
        </header>

        <main className="p-4 pb-6">
          {/* 추천 장소 (가로 스크롤 카드) */}
          <section className="mb-6">
            <h2 className="text-base font-bold text-[var(--text-primary)] mb-3">추천 장소</h2>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
              {featured.map((p) => {
                const selected = selectedPlaceId === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => highlightPlace(p)}
                    className={`min-w-[260px] max-w-[260px] text-left bg-white rounded-2xl p-3 shadow-[0_4px_12px_rgba(0,0,0,0.08)] border-2 transition
                      ${selected ? "border-[var(--primary-color)] shadow-[0_6px_14px_rgba(197,127,57,0.25)]" : "border-transparent"}`}
                  >
                    <div className="w-full h-32 rounded-xl overflow-hidden bg-[var(--accent-color)]">
                      {p.img ? (
                        <img src={p.img} alt={p.name} className="w-full h-full object-cover" />
                      ) : null}
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-[var(--text-secondary)]">{p.category}</p>
                      <h3 className="text-base font-bold text-[var(--text-primary)]">{p.name}</h3>
                      <p className="text-xs text-[var(--text-secondary)] mt-1">{p.address}</p>
                      <p className="text-xs text-[var(--text-secondary)] mt-1">약 {p.distanceKm.toFixed(1)}km</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 카테고리 필터 */}
          <section className="mb-3">
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {categories.map((c) => {
                const active = c === activeCategory;
                return (
                  <button
                    key={c}
                    onClick={() => setActiveCategory(c)}
                    className={`px-3 py-2 rounded-full text-sm border transition
                      ${active ? "bg-[var(--accent-color)] border-[var(--primary-color)] text-[var(--primary-color)] font-semibold" : "bg-white border-[#EAEAEA] text-[var(--text-secondary)]"}`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </section>

          {/* 전체 장소 리스트 */}
          <section className="mt-3">
            <h2 className="text-base font-bold text-[var(--text-primary)] mb-3">전체 장소</h2>
            <div className="space-y-3">
              {filtered.map((p) => {
                const selected = selectedPlaceId === p.id;
                return (
                  <div
                    key={p.id}
                    className={`bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] overflow-hidden flex items-center p-3 border-2 transition
                      ${selected ? "border-[var(--primary-color)] shadow-[0_6px_14px_rgba(197,127,57,0.25)]" : "border-transparent"}`}
                    onClick={() => highlightPlace(p)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === " " || e.key === "Enter") {
                        e.preventDefault();
                        highlightPlace(p);
                      }
                    }}
                  >
                    <div className="w-24 h-24 rounded-xl bg-[var(--accent-color)] overflow-hidden shrink-0">
                      {p.img ? <img src={p.img} alt={p.name} className="w-full h-full object-cover" /> : null}
                    </div>
                    <div className="pl-4 flex-1">
                      <h3 className="font-bold text-base text-[var(--text-primary)]">{p.name}</h3>
                      <p className="text-sm text-[var(--text-secondary)]">{p.category}</p>
                      <p className="text-xs text-[var(--text-secondary)] mt-1">{p.address}</p>
                      <p className="text-xs text-[var(--text-secondary)] mt-1">약 {p.distanceKm.toFixed(1)}km</p>
                    </div>
                    <div aria-hidden className={`ml-2 shrink-0 transition-opacity ${selected ? "opacity-100" : "opacity-0"}`}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </main>

        {/* 지도 섹션: 아래에 꽉 차게 */}
        <section
          ref={mapRef}
          className="w-full max-w-md mx-auto bg-white border-t border-[#EAEAEA]"
        >
          <div className="p-4">
            <h2 className="text-base font-bold text-[var(--text-primary)]">지도에서 보기</h2>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              선택한 장소 또는 “{activeCategory}” 주변을 표시합니다.
            </p>
          </div>
          <div
            className="w-full"
            style={{
              // 모바일에서 "거의 꽉 차게" 보이도록: 최소 380px, 기본 60vh
              height: "min(70vh, 700px)",
              minHeight: 380,
            }}
          >
            <iframe
              key={`${center.lat}-${center.lng}-${activeCategory}`}
              title="nearby-map"
              width="100%"
              height="100%"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              // 카테고리 필터가 걸려 있으면 근처 검색어로, 아니면 좌표 중심만
              src={mapSrc(center, activeCategory === "전체" ? undefined : `${activeCategory} near ${center.lat},${center.lng}`)}
              className="border-0"
            />
          </div>
        </section>
      </div>

      {/* 글로벌 스타일 (기존 팔레트 유지) */}
      <style jsx global>{`
        :root {
          --primary-color: #c57f39;
          --background-color: #FDFBF8;
          --text-primary: #333333;
          --text-secondary: #666666;
          --accent-color: #e0d8c9;
          --card-background: #FFFFFF;
          --unavailable-color: #F3F4F6;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
