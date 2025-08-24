"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";

// 디자인 토큰(그대로)
const theme = {
  primary: "var(--primary-color)",
  bg: "var(--background-color)",
  text: "var(--text-primary)",
  textSub: "var(--text-secondary)",
  accent: "var(--accent-color)",
};

type Place = {
  id: string;
  name: string;
  category: "갤러리" | "카페" | "복합문화공간";
  address: string;
  distanceKm: number;
  lat: number;
  lng: number;
  img?: string | null;
  featured?: boolean;
};

const PLACES: Place[] = [
  { id: "p1", name: "스티치 갤러리", category: "갤러리", address: "서울 중구 세종대로 110", distanceKm: 0.6, lat: 37.5663, lng: 126.9779, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDJTt5ZFwI1-bnOPgYP1YprPp1i6waeofBVh7iPRnhZ4KTqmyNVWkPIvYrCDOMoi_8Nr8cruvBiNxcYfUJni-eOuBsZOOqr5BcdrIbrx9ioWmwaYZTuAhopV87HCWOEZ1E6I2AoZWcuxOjTKumLOlLzOOGMMqTZDSow233a3oFQmCWJrP85PVfMY3XRy4Ca1flYD9NHIgYr3rxbLaY9hXw4iuLYUSCGLNVD-Bo_EBeBCgtmqepGsbAPmYNZM-46-kfw_hN01JX0B8Uh", featured: true },
  { id: "p2", name: "브릭 로스터스", category: "카페", address: "서울 종로구 종로 1", distanceKm: 0.9, lat: 37.57, lng: 126.982, img: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=800&auto=format&fit=crop", featured: true },
  { id: "p3", name: "메인 스트리트 스페이스", category: "복합문화공간", address: "서울 중구 태평로", distanceKm: 1.2, lat: 37.5638, lng: 126.9825, img: "https://images.unsplash.com/photo-1487865404335-4f26c52268f8?q=80&w=800&auto=format&fit=crop", featured: true },
  { id: "p4", name: "코지 코너", category: "카페", address: "서울 중구 소공로", distanceKm: 0.4, lat: 37.5632, lng: 126.9765, img: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=800&auto=format&fit=crop" },
  { id: "p5", name: "월든 아트룸", category: "갤러리", address: "서울 종로구 팔판동", distanceKm: 1.8, lat: 37.5794, lng: 126.9849, img: "https://images.unsplash.com/photo-1511593358241-7eee65b24c5d?q=80&w=800&auto=format&fit=crop" },
  { id: "p6", name: "레이지 빔 카페", category: "카페", address: "서울 중구 남대문로", distanceKm: 1.0, lat: 37.5669, lng: 126.9822, img: "https://images.unsplash.com/photo-1453614512568-c4024d13c247?q=80&w=800&auto=format&fit=crop" },
];

const DEFAULT_CENTER = { lat: 37.5663, lng: 126.9779 };

function mapSrc(center: { lat: number; lng: number }, query?: string) {
  const q = query ? encodeURIComponent(query) : `${center.lat},${center.lng}`;
  return `https://www.google.com/maps?q=${q}&ll=${center.lat},${center.lng}&z=15&output=embed`;
}

// body 포털
function BottomSheetPortal({ children }: { children: React.ReactNode }) {
  const [mountNode, setMountNode] = React.useState<HTMLElement | null>(null);
  useEffect(() => {
    let el = document.getElementById("map-bottom-sheet-root");
    if (!el) {
      el = document.createElement("div");
      el.id = "map-bottom-sheet-root";
      document.body.appendChild(el);
    }
    setMountNode(el);
  }, []);
  if (!mountNode) return null;
  return createPortal(children, mountNode);
}

export default function ExplorePlacesPage() {
  const [activeCategory, setActiveCategory] = useState<Place["category"] | "전체">("전체");
  const [center] = useState(DEFAULT_CENTER); // 선택시 /bookingdate로 이동하므로 지도 이동은 유지 X

  const categories: (Place["category"] | "전체")[] = ["전체", "갤러리", "카페", "복합문화공간"];
  const featured = useMemo(() => PLACES.filter((p) => p.featured), []);
  const filtered = useMemo(() => {
    const base = activeCategory === "전체" ? PLACES : PLACES.filter((p) => p.category === activeCategory);
    return [...base].sort((a, b) => a.distanceKm - b.distanceKm);
  }, [activeCategory]);

  const headerLabel = "공간 찾기";

  // -------- 바텀시트 높이: 드래그로 조절 --------
  const BOTTOM_NAV_PX = 64; // 실제 바텀 내비 높이에 맞게 조정
  const SHEET_MIN_PX = 220;

  const [sheetMaxPx, setSheetMaxPx] = useState(500);
  const [sheetPx, setSheetPx] = useState(320); // 초기 값(마운트 후 실제 화면에 맞춰 재계산)
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{ startY: number; startH: number; dragging: boolean }>({
    startY: 0,
    startH: 0,
    dragging: false,
  });

  // 뷰포트 기반 초기/최대 높이 계산
  useEffect(() => {
    const h = window.innerHeight || 800;
    const max = Math.min(Math.round(h * 0.78), 520); // 최대 78vh 또는 520px
    const initial = Math.min(Math.max(Math.round(h * 0.36), SHEET_MIN_PX), 380); // 36vh ~ 380 사이
    setSheetMaxPx(max);
    setSheetPx(initial);
  }, []);

  // 드래그 핸들러
  useEffect(() => {
    function onMove(e: PointerEvent) {
      if (!dragRef.current.dragging) return;
      const dy = dragRef.current.startY - e.clientY; // 위로 드래그: dy>0
      let next = dragRef.current.startH + dy;
      if (next < SHEET_MIN_PX) next = SHEET_MIN_PX;
      if (next > sheetMaxPx) next = sheetMaxPx;
      setSheetPx(next);
    }
    function onUp() {
      dragRef.current.dragging = false;
      setDragging(false);
      // 드래그 끝나면 스크롤/선택 복원
      document.body.style.userSelect = "";
      (document.body.style as any).touchAction = "";
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    }
    if (dragRef.current.dragging) {
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerup", onUp, { passive: true });
    }
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [sheetMaxPx]);

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    // 드래그 시작
    dragRef.current.startY = e.clientY;
    dragRef.current.startH = sheetPx;
    dragRef.current.dragging = true;
    setDragging(true);
    // 페이지 스크롤/텍스트 선택 방지
    document.body.style.userSelect = "none";
    (document.body.style as any).touchAction = "none";
  }

  // 메인 콘텐츠가 바텀시트/내비에 가리지 않게 여백 확보
  const contentPaddingBottom = `calc(${Math.round(sheetPx)}px + ${BOTTOM_NAV_PX}px + 24px + env(safe-area-inset-bottom))`;

  return (
    <div className="relative flex size-full min-h-screen flex-col justify-between overflow-x-hidden bg-[var(--background-color)]">
      <div className="w-full max-w-md mx-auto bg-[var(--background-color)]">
        {/* 헤더 */}
        <header className="flex items-center p-4 pb-2 justify-between bg-[#FDFBF8] border-[#EAEAEA]">
          <Link href="/profile">
            <button className="text-[var(--text-primary)] cursor-pointer" aria-label="뒤로 가기">
              <svg fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24">
                <path d="m15 18-6-6 6-6"></path>
              </svg>
            </button>
          </Link>
          <h1 className="text-lg font-bold text-[var(--text-primary)] flex-1 text-center">{headerLabel}</h1>
          <div className="w-8" />
        </header>

        <main
          className="p-4 pb-6"
          style={{ paddingBottom: contentPaddingBottom }}
        >
          {/* 추천 */}
          <section className="mb-6">
            <h2 className="text-base font-bold text-[var(--text-primary)] mb-3">추천 장소</h2>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
              {featured.map((p) => (
                <Link
                  key={p.id}
                  href={{ pathname: "/bookingdate", query: { place: p.id } }}
                  className="min-w-[260px] max-w-[260px] text-left bg-white rounded-2xl p-3 shadow-[0_4px_12px_rgba(0,0,0,0.08)] border-2 border-transparent transition hover:border-[var(--primary-color)] hover:shadow-[0_6px_14px_rgba(197,127,57,0.25)]"
                >
                  <div className="w-full h-32 rounded-xl overflow-hidden bg-[var(--accent-color)]">
                    {p.img ? <img src={p.img} alt={p.name} className="w-full h-full object-cover" /> : null}
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-[var(--text-secondary)]">{p.category}</p>
                    <h3 className="text-base font-bold text-[var(--text-primary)]">{p.name}</h3>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">{p.address}</p>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">약 {p.distanceKm.toFixed(1)}km</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* 카테고리 */}
          <section className="mb-3">
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {categories.map((c) => {
                const active = c === activeCategory;
                return (
                  <button
                    key={c}
                    onClick={() => setActiveCategory(c)}
                    className={`px-3 py-2 rounded-full text-sm border transition ${
                      active ? "bg-[var(--accent-color)] border-[var(--primary-color)] text-[var(--primary-color)] font-semibold" : "bg-white border-[#EAEAEA] text-[var(--text-secondary)]"
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </section>

          {/* 전체 */}
          <section className="mt-3">
            <h2 className="text-base font-bold text-[var(--text-primary)] mb-3">전체 장소</h2>
            <div className="space-y-3">
              {filtered.map((p) => (
                <Link
                  key={p.id}
                  href={{ pathname: "/bookingdate", query: { place: p.id } }}
                  className="bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] overflow-hidden flex items-center p-3 border-2 border-transparent transition hover:border-[var(--primary-color)] hover:shadow-[0_6px_14px_rgba(197,127,57,0.25)]"
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
                  {/* 우측 화살표 아이콘 */}
                  <div aria-hidden className="ml-2 shrink-0 opacity-60">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </main>
      </div>

      {/* 하단 고정 지도 (드래그로 높이 조절) */}
      <BottomSheetPortal>
        <section
          role="region"
          aria-label="지도에서 보기"
          className="fixed left-0 right-0 z-[10000]"
          style={{ bottom: `calc(${BOTTOM_NAV_PX}px + env(safe-area-inset-bottom))` }}
        >
          <div className="w-full">
            <div
              className="overflow-hidden rounded-t-2xl shadow-[0_-12px_28px_rgba(0,0,0,0.12)] border bg-white/60 backdrop-blur-[2px]"
              style={{ borderColor: "var(--accent-color)" }}
            >
              <div className="relative" style={{ height: `${Math.round(sheetPx)}px`, minHeight: SHEET_MIN_PX }}>
                {/* 드래그 핸들 (iframe 위로, 상단에 고정) */}
                <div
                  role="slider"
                  aria-label="지도 높이 조절"
                  aria-valuemin={SHEET_MIN_PX}
                  aria-valuemax={sheetMaxPx}
                  aria-valuenow={Math.round(sheetPx)}
                  className={`absolute left-0 right-0 top-0 h-6 flex items-center justify-center ${dragging ? "cursor-grabbing" : "cursor-grab"} select-none`}
                  onPointerDown={onPointerDown}
                  style={{ touchAction: "none", WebkitUserSelect: "none", zIndex: 2 }}
                >
                  <div className="w-9 h-1.5 rounded-full bg-[var(--accent-color)]/80" />
                </div>

                {/* 지도 iframe */}
                <iframe
                  key={`${center.lat}-${center.lng}-${activeCategory}`}
                  title="nearby-map"
                  className="absolute inset-0 w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={mapSrc(center, activeCategory === "전체" ? undefined : `${activeCategory} near ${center.lat},${center.lng}`)}
                />

                {/* 상단 페이드 + 틴트 + 헤어라인 */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-[var(--background-color)]/95 via-[var(--background-color)]/55 to-transparent" />
                <div className="pointer-events-none absolute inset-0" style={{ backgroundColor: "var(--accent-color)", mixBlendMode: "multiply", opacity: 0.06 }} />
                <div className="pointer-events-none absolute -top-px left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, var(--accent-color), transparent)", opacity: 0.85 }} />
              </div>
            </div>
          </div>
        </section>
      </BottomSheetPortal>

      {/* 글로벌 스타일 */}
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
        html, body { margin: 0; }
        body { overflow-x: hidden; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
