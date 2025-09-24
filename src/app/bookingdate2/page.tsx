"use client";

/* eslint-disable @next/next/no-img-element */
import React, { useMemo, useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";

/* =========================
 * 타입/유틸
 * ========================= */
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
type LatLng = { lat: number; lng: number };

// Kakao Map 타입들은 전역 kakao.d.ts 파일에서 불러오므로 여기서는 삭제합니다.

/* 데이터 */
const PLACES: Place[] = [
  { id: "p1", name: "스티치 갤러리", category: "갤러리", address: "서울 중구 세종대로 110", distanceKm: 0.6, lat: 37.5663, lng: 126.9779, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDJTt5ZFwI1-bnOPgYP1YprPp1i6waeofBVh7iPRnhZ4KTqmyNVWkPIvYrCDOMoi_8Nr8cruvBiNxcYfUJni-eOuBsZOOqr5BcdrIbrx9ioWmwaYZTuAhopV87HCWOEZ1E6I2AoZWcuxOjTKumLOlLzOOGMMqTZDSow233a3oFQmCWJrP85PVfMY3XRy4Ca1flYD9NHIgYr3rxbLaY9hXw4iuLYUSCGLNVD-Bo_EBeBCgtmqepGsbAPmYNZM-46-kfw_hN01JX0B8Uh", featured: true },
  { id: "p2", name: "브릭 로스터스", category: "카페", address: "서울 종로구 종로 1", distanceKm: 0.9, lat: 37.57, lng: 126.982, img: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=800&auto=format&fit=crop", featured: true },
  { id: "p3", name: "메인 스트리트 스페이스", category: "복합문화공간", address: "서울 중구 태평로", distanceKm: 1.2, lat: 37.5638, lng: 126.9825, img: "https://images.unsplash.com/photo-1487865404335-4f26c52268f8?q=80&w=800&auto=format&fit=crop", featured: true },
  { id: "p4", name: "코지 코너", category: "카페", address: "서울 중구 소공로", distanceKm: 0.4, lat: 37.5632, lng: 126.9765, img: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=800&auto=format&fit=crop" },
  { id: "p5", name: "월든 아트룸", category: "갤러리", address: "서울 종로구 팔판동", distanceKm: 1.8, lat: 37.5794, lng: 126.9849, img: "https://images.unsplash.com/photo-1511593358241-7eee65b24c5d?q=80&w=800&auto=format&fit=crop" },
  { id: "p6", name: "레이지 빔 카페", category: "카페", address: "서울 중구 남대문로", distanceKm: 1.0, lat: 37.5669, lng: 126.9822, img: "https://images.unsplash.com/photo-1453614512568-c4024d13c247?q=80&w=800&auto=format&fit=crop" },
];

const DEFAULT_CENTER: LatLng = { lat: 37.5663, lng: 126.9779 };

/* 공통: 스크립트 로더 */
function loadScriptOnce(src: string, id: string) {
  return new Promise<void>((resolve, reject) => {
    if (document.getElementById(id)) return resolve();
    const s = document.createElement("script");
    s.id = id;
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Fail to load: ${src}`));
    document.head.appendChild(s);
  });
}

/* =========================
 * 포털
 * ========================= */
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

/* =========================
 * Kakao Map 뷰 (고정)
 * ========================= */
function KakaoMapView({ center }: { center: LatLng }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any | null>(null); // KakaoMap 타입을 전역에서 가져옵니다.

  // SDK 로드 + 지도 초기화(초기 center는 고정값 → 의존성 경고X)
  useEffect(() => {
    let canceled = false;
    (async () => {
      const appKey = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
      if (!appKey) return;

      await loadScriptOnce(
        `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false`,
        "kakao-map-sdk"
      );
      if (canceled) return;
      window.kakao?.maps.load(() => {
        if (!containerRef.current || canceled) return;
        const init = new window.kakao!.maps.LatLng(37.5663, 126.9779);
        const map = new window.kakao!.maps.Map(containerRef.current, {
          center: init,
          level: 5,
        });
        new window.kakao!.maps.Marker({ map, position: init });
        mapRef.current = map;
      });
    })();
    return () => {
      canceled = true;
    };
  }, []);

  // center 변경 시 지도 업데이트
  useEffect(() => {
    const m = mapRef.current;
    if (!m || !window.kakao) return;
    const latlng = new window.kakao.maps.LatLng(center.lat, center.lng);
    m.setCenter(latlng);
    new window.kakao.maps.Marker({ map: m, position: latlng });
  }, [center.lat, center.lng]);

  return <div ref={containerRef} className="absolute inset-0" />;
}

/* =========================
 * 드래그로 높이 조절되는 바텀시트 지도
 * ========================= */
function DraggableMapSheet({
  center,
  bottomOffsetPx = 64,
  minHeight = 200,
  maxHeight = 520,
  initialHeightPx = 260,
  onHeightChange,
}: {
  center: LatLng;
  bottomOffsetPx?: number;
  minHeight?: number;
  maxHeight?: number;
  initialHeightPx?: number;
  onHeightChange?: (h: number) => void;
}) {
  // 첫 페인트에서 0이 보이지 않도록 초기값을 바로 세팅
  const [height, setHeight] = useState<number>(initialHeightPx);

  useEffect(() => {
    const v = Math.min(Math.max(initialHeightPx, minHeight), maxHeight);
    setHeight(v);
    onHeightChange?.(v);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dragRef = useRef<{ startY: number; startH: number; dragging: boolean }>(
    { startY: 0, startH: 0, dragging: false }
  );

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current = { startY: e.clientY, startH: height, dragging: true };
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.dragging) return;
    const dy = dragRef.current.startY - e.clientY;
    const next = Math.min(Math.max(dragRef.current.startH + dy, minHeight), maxHeight);
    setHeight(next);
    onHeightChange?.(next);
  };
  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current.dragging = false;
    (e.currentTarget as HTMLDivElement).releasePointerCapture?.(e.pointerId);
  };

  return (
    <section
      role="region"
      aria-label="지도에서 보기"
      className="fixed left-0 right-0 z-[10000]"
      style={{ bottom: `calc(${bottomOffsetPx}px + env(safe-area-inset-bottom))` }}
    >
      <div className="w-full">
        <div
          className="overflow-hidden rounded-t-2xl shadow-[0_-12px_28px_rgba(0,0,0,0.12)] border bg-white/60 backdrop-blur-[2px]"
          style={{ borderColor: "var(--accent-color)" }}
        >
          <div className="relative" style={{ height }}>
            {/* 지도 (Kakao 고정) */}
            <KakaoMapView center={center} />

            {/* 지도 위 전체 드래그 오버레이 */}
            <div
              className="absolute inset-0"
              style={{
                touchAction: "none",
                cursor: "ns-resize",
                background: "transparent",
                userSelect: "none",
                zIndex: 5,
              }}
              aria-label="드래그하여 지도 높이 조절"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
            />

            {/* 시각 보정 */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-[var(--background-color)]/95 via-[var(--background-color)]/55 to-transparent" />
            <div className="pointer-events-none absolute inset-0" style={{ backgroundColor: "var(--accent-color)", mixBlendMode: "multiply", opacity: 0.06 }} />
            <div className="pointer-events-none absolute -top-px left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, var(--accent-color), transparent)", opacity: 0.85 }} />
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================
 * 페이지
 * ========================= */
const CATEGORIES = ["전체", "갤러리", "카페", "복합문화공간"] as const;
type Category = typeof CATEGORIES[number];

export default function ExplorePlacesPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("전체");
  const [center, setCenter] = useState<LatLng>(DEFAULT_CENTER);
  const [mapHeight, setMapHeight] = useState<number>(260);
  const [locError, setLocError] = useState<string | null>(null);

  // 추천 카드 스냅/중앙감지
  const featuredContainerRef = useRef<HTMLDivElement | null>(null);
  const featuredItemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [featuredActiveIdx, setFeaturedActiveIdx] = useState(0);
  const tickingRef = useRef(false);

  const calcFeaturedActive = useCallback(() => {
    const c = featuredContainerRef.current;
    if (!c) return;
    const centerX = c.scrollLeft + c.clientWidth / 2;
    let bestIdx = 0;
    let bestDist = Infinity;
    featuredItemRefs.current.forEach((el, idx) => {
      if (!el) return;
      const cardCenter = el.offsetLeft + el.clientWidth / 2;
      const dist = Math.abs(cardCenter - centerX);
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = idx;
      }
    });
    setFeaturedActiveIdx(bestIdx);
  }, []);

  const onFeaturedScroll = useCallback(() => {
    if (tickingRef.current) return;
    tickingRef.current = true;
    requestAnimationFrame(() => {
      calcFeaturedActive();
      tickingRef.current = false;
    });
  }, [calcFeaturedActive]);

  useEffect(() => {
    const c = featuredContainerRef.current;
    if (!c) return;
    calcFeaturedActive();
    c.addEventListener("scroll", onFeaturedScroll, { passive: true });
    window.addEventListener("resize", calcFeaturedActive);
    return () => {
      c.removeEventListener("scroll", onFeaturedScroll);
      window.removeEventListener("resize", calcFeaturedActive);
    };
  }, [calcFeaturedActive, onFeaturedScroll]);

  // 현재 위치 요청 (버튼 없이 자동 1회)
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setLocError("이 브라우저는 위치 서비스를 지원하지 않습니다.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => setLocError(err.message || "위치 정보를 가져오지 못했습니다."),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  const featured = useMemo(() => PLACES.filter((p) => p.featured), []);
  const filtered = useMemo(() => {
    const base = activeCategory === "전체" ? PLACES : PLACES.filter((p) => p.category === activeCategory);
    return [...base].sort((a, b) => a.distanceKm - b.distanceKm);
  }, [activeCategory]);

  const headerLabel = "공간 찾기";
  const BOTTOM_NAV_PX = 64;
  const bottomPaddingCalc = `calc(${mapHeight}px + ${BOTTOM_NAV_PX}px + 24px + env(safe-area-inset-bottom))`;

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

          {/* 우측: 문양/아이콘 제거 → 균형 맞춤용 빈 박스 */}
          <div className="w-8" />
        </header>

        <main className="p-4 pb-6" style={{ paddingBottom: bottomPaddingCalc }}>
          {locError ? <p className="mb-3 text-xs text-red-500">{locError}</p> : null}

          {/* 추천 - 스냅 & 중앙 활성화 */}
          <section className="mb-6">
            <h2 className="text-base font-bold text-[var(--text-primary)] mb-3">추천 장소</h2>

            <div
              ref={featuredContainerRef}
              className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth gap-4 pb-2 px-1 no-scrollbar"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              {featured.map((p, idx) => {
                const isActive = idx === featuredActiveIdx;
                return (
                  <div
                    key={p.id}
                    ref={(el) => { if (featuredItemRefs.current) featuredItemRefs.current[idx] = el; }}
                    className={`snap-center flex-shrink-0 w-[75%] sm:w-[60%] max-w-[360px] transition-all duration-300 ${
                      isActive ? "opacity-100 scale-100" : "opacity-50 scale-[0.98]"
                    }`}
                  >
                    <Link
                      href={{ pathname: "/bookingdate", query: { place: p.id } }}
                      className="block text-left bg-white rounded-2xl p-3 shadow-[0_4px_12px_rgba(0,0,0,0.08)] border-2 border-transparent hover:border-[var(--primary-color)] hover:shadow-[0_6px_14px_rgba(197,127,57,0.25)] transition"
                    >
                      <div className={`w-full h-32 rounded-xl overflow-hidden bg-[var(--accent-color)] ${isActive ? "" : "blur-[1px]"}`}>
                        {p.img ? <img src={p.img} alt={p.name} className="w-full h-full object-cover" /> : null}
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-[var(--text-secondary)]">{p.category}</p>
                        <h3 className="text-base font-bold text-[var(--text-primary)]">{p.name}</h3>
                        <p className="text-xs text-[var(--text-secondary)] mt-1">{p.address}</p>
                        <p className="text-xs text-[var(--text-secondary)] mt-1">약 {p.distanceKm.toFixed(1)}km</p>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 카테고리 */}
          <section className="mb-3">
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {CATEGORIES.map((c) => {
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

      {/* 하단 고정 지도 (카카오 고정) */}
      <BottomSheetPortal>
        <DraggableMapSheet
          center={center}
          bottomOffsetPx={64}
          minHeight={200}
          maxHeight={520}
          initialHeightPx={260}
          onHeightChange={setMapHeight}
        />
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