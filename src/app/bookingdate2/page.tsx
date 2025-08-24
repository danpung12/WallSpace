// src/app/explore-places/page.tsx
"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";

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
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null);
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
  const [center] = useState(DEFAULT_CENTER); // 항목 클릭 시 상세로 이동

  const categories: (Place["category"] | "전체")[] = ["전체", "갤러리", "카페", "복합문화공간"];
  const featured = useMemo(() => PLACES.filter((p) => p.featured), []);
  const filtered = useMemo(() => {
    const base = activeCategory === "전체" ? PLACES : PLACES.filter((p) => p.category === activeCategory);
    return [...base].sort((a, b) => a.distanceKm - b.distanceKm);
  }, [activeCategory]);

  const headerLabel = "공간 찾기";

  // ====== 바텀시트 크기(드래그로 조절) ======
  const MIN_PX = 220;
  const MAX_VH = 0.7; // 화면 70%까지
  const DEFAULT_VH = 0.36;

  const [sheetPx, setSheetPx] = useState<number>(320);
  const [dragging, setDragging] = useState<boolean>(false);
  const startYRef = useRef<number>(0);
  const startHRef = useRef<number>(0);

  const BOTTOM_NAV_PX = 64;

  const getMaxHeightPx = (): number => {
    if (typeof window === "undefined") return 520;
    return Math.min(window.innerHeight * MAX_VH, 520);
  };

  // 초기 높이: clamp(240px, 36vh, 380px) 근사값
  useEffect(() => {
    if (typeof window === "undefined") return;
    const h = Math.max(MIN_PX, Math.min(window.innerHeight * DEFAULT_VH, 380));
    setSheetPx(Math.round(h));
  }, []);

  // 드래그 시작(핸들)
  const onHandleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    setDragging(true);
    startYRef.current = e.clientY;
    startHRef.current = sheetPx;
    document.body.style.overflow = "hidden";
    window.addEventListener("mousemove", onMouseMove, { passive: false });
    window.addEventListener("mouseup", onMouseUp, { passive: true });
  };
  const onHandleTouchStart = (e: React.TouchEvent<HTMLButtonElement>) => {
    const t = e.touches[0];
    setDragging(true);
    startYRef.current = t.clientY;
    startHRef.current = sheetPx;
    document.body.style.overflow = "hidden";
    window.addEventListener("touchmove", onTouchMove as EventListener, { passive: false });
    window.addEventListener("touchend", onTouchEnd as EventListener, { passive: true });
    window.addEventListener("touchcancel", onTouchEnd as EventListener, { passive: true });
  };

  const onMouseMove = (e: MouseEvent) => {
    e.preventDefault();
    const dy = startYRef.current - e.clientY; // 위로 드래그 = 양수
    const next = Math.max(MIN_PX, Math.min(startHRef.current + dy, getMaxHeightPx()));
    setSheetPx(Math.round(next));
  };
  const onMouseUp = () => {
    setDragging(false);
    document.body.style.overflow = "";
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  };

  const onTouchMove = (e: TouchEvent) => {
    if (!dragging) return;
    e.preventDefault();
    const t = e.touches[0];
    const dy = startYRef.current - t.clientY;
    const next = Math.max(MIN_PX, Math.min(startHRef.current + dy, getMaxHeightPx()));
    setSheetPx(Math.round(next));
  };
  const onTouchEnd = () => {
    setDragging(false);
    document.body.style.overflow = "";
    window.removeEventListener("touchmove", onTouchMove as EventListener);
    window.removeEventListener("touchend", onTouchEnd as EventListener);
    window.removeEventListener("touchcancel", onTouchEnd as EventListener);
  };

  useEffect(() => {
    // 안전 정리
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove as EventListener);
      window.removeEventListener("touchend", onTouchEnd as EventListener);
      window.removeEventListener("touchcancel", onTouchEnd as EventListener);
    };
  }, []);

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
          style={{
            paddingBottom: `calc(${sheetPx}px + ${BOTTOM_NAV_PX}px + 24px + env(safe-area-inset-bottom))`,
          }}
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

      {/* 하단 고정 지도 (드래그 핸들 포함) */}
      <BottomSheetPortal>
        <section
          role="region"
          aria-label="지도에서 보기"
          className="fixed left-0 right-0 z-[10000]"
          style={{ bottom: `calc(${BOTTOM_NAV_PX}px + env(safe-area-inset-bottom))` }}
        >
          <div className="w-full">
            <div
              className={`overflow-hidden rounded-t-2xl shadow-[0_-12px_28px_rgba(0,0,0,0.12)] border bg-white/60 backdrop-blur-[2px] ${dragging ? "select-none" : ""}`}
              style={{ borderColor: "var(--accent-color)" }}
            >
              {/* 드래그 핸들 */}
              <div className="relative">
                <button
                  aria-label="지도의 높이 조절"
                  onMouseDown={onHandleMouseDown}
                  onTouchStart={onHandleTouchStart}
                  className="w-full h-8 flex items-center justify-center cursor-row-resize touch-none"
                  style={{ WebkitTapHighlightColor: "transparent" }}
                >
                  <span className="block w-10 h-1.5 rounded-full bg-[var(--accent-color)]" />
                </button>
              </div>

              {/* 지도 */}
              <div className="relative" style={{ height: sheetPx, minHeight: MIN_PX }}>
                <iframe
                  key={`${center.lat}-${center.lng}-${activeCategory}`}
                  title="nearby-map"
                  className="absolute inset-0 w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={mapSrc(center, activeCategory === "전체" ? undefined : `${activeCategory} near ${center.lat},${center.lng}`)}
                />
                {/* 상단 그라데이션 / 틴트 / 헤어라인 */}
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
