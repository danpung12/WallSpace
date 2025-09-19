'use client';

// ✅ 사용하지 않는 'Image'와 'Link' 임포트 제거
import React, { useRef, useState, useMemo } from 'react';
import Script from 'next/script';

// --- ✅ any 에러 해결을 위한 상세 타입 선언 ---
type KakaoLatLng = {
  getLat: () => number;
  getLng: () => number;
};
type KakaoMap = {
  setCenter: (latlng: KakaoLatLng) => void;
};
type KakaoMarker = {
  setMap: (map: KakaoMap | null) => void;
};
type KakaoGeocoderResult = {
  address: {
    region_1depth_name: string;
    region_2depth_name: string;
  };
}[];
type KakaoGeocoderStatus = 'OK' | 'ZERO_RESULT' | 'ERROR';

declare global {
  interface Window {
    kakao: {
      maps: {
        load(callback: () => void): void;
        Map: new (
          container: HTMLElement,
          options: { center: KakaoLatLng; level: number }
        ) => KakaoMap;
        LatLng: new (lat: number, lng: number) => KakaoLatLng;
        Marker: new (options: { map?: KakaoMap | null, position: KakaoLatLng }) => KakaoMarker;
        services: {
          Geocoder: new () => {
            coord2Address: (
              lng: number,
              lat: number,
              callback: (result: KakaoGeocoderResult, status: KakaoGeocoderStatus) => void
            ) => void;
          };
          Status: {
            OK: string;
          };
        };
      };
    };
  }
}

// --- 데이터 ---
// ✅ 사용하지 않는 'artworks' 변수 제거 (주석 처리)
/*
interface Artwork {
  id: number;
  title: string;
  artist: string;
  dimensions: string;
  price: number;
  imageUrl: string;
}
const artworks: Artwork[] = [
    { id: 1, title: 'Chromatic Dreams', artist: 'Alexia Ray', dimensions: '120cm x 80cm', price: 15, imageUrl: '/images/artwork1.jpg' },
    { id: 2, title: 'Spring\'s Whisper', artist: 'Clara Monet', dimensions: '50cm x 70cm', price: 10, imageUrl: '/images/artwork2.jpg' },
    { id: 3, title: 'Urban Geometry', artist: 'Mark Chen', dimensions: '100cm x 100cm', price: 20, imageUrl: '/images/artwork3.jpg' },
    { id: 4, title: 'Misty Mountains', artist: 'Elena Petrova', dimensions: '150cm x 60cm', price: 18, imageUrl: '/images/artwork4.jpg' },
];
*/
const disabledDays = [28];

// --- 날짜 유틸 함수 ---
const toYMD = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const isSameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const fmtKoreanDate = (d: Date) => `${d.getMonth() + 1}월 ${d.getDate()}일`;
const getCalendarCells = (viewDate: Date) => {
    const y = viewDate.getFullYear(); const m = viewDate.getMonth();
    const firstWeekday = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const prevMonthDays = new Date(y, m, 0).getDate();
    const numWeeks = Math.ceil((firstWeekday + daysInMonth) / 7);
    const totalCells = numWeeks * 7;
    const cells: { date: Date; inMonth: boolean }[] = [];
    for (let i = firstWeekday - 1; i >= 0; i--) { cells.push({ date: new Date(y, m - 1, prevMonthDays - i), inMonth: false }); }
    for (let d = 1; d <= daysInMonth; d++) { cells.push({ date: new Date(y, m, d), inMonth: true }); }
    while (cells.length < totalCells) { const last = cells[cells.length - 1].date; const next = new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1); cells.push({ date: next, inMonth: next.getMonth() === m }); }
    return cells;
};

// --- 메인 컴포넌트 ---
export default function ArtspaceMapViewSingleFile() {
  const filterButtons = ['카페', '갤러리', '문화회관', '날짜 선택' ];
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<KakaoMap | null>(null);
  const [locationInfo, setLocationInfo] = useState({ city: '위치 찾는 중...' });
  
  const [isDatePickerOpen, setDatePickerOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [activeFilter, setActiveFilter] = useState('갤러리');

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const cells = useMemo(() => getCalendarCells(viewDate), [viewDate]);
  const hasRange = !!(startDate && endDate);

  const initializeMap = () => {
    const { kakao } = window;
    if (!kakao) return;

    kakao.maps.load(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => loadMapAndAddress(position.coords.latitude, position.coords.longitude),
                (error) => {
                    console.error("Geolocation 에러:", error);
                    setLocationInfo({ city: '위치를 찾을 수 없어요' });
                    loadMapAndAddress(37.2410, 127.1772);
                }
            );
        } else {
            console.error("브라우저가 Geolocation을 지원하지 않습니다.");
            setLocationInfo({ city: '위치 사용 불가' });
            loadMapAndAddress(37.2410, 127.1772);
        }
    });
  };

  const loadMapAndAddress = (lat: number, lng: number) => {
    const { kakao } = window;
    if (!mapContainer.current || !kakao) return;
    const mapOption = { center: new kakao.maps.LatLng(lat, lng), level: 5 };
    mapInstance.current = new kakao.maps.Map(mapContainer.current, mapOption);
    const geocoder = new kakao.maps.services.Geocoder();
    geocoder.coord2Address(lng, lat, (result, status) => {
      if (status === kakao.maps.services.Status.OK) {
        const city = result[0].address.region_2depth_name || result[0].address.region_1depth_name;
        setLocationInfo({ city });
      } else {
        setLocationInfo({ city: "주소 정보 없음" });
      }
    });
  };

  const gotoMonth = (offset: number) => setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  const isDisabled = (cell: Date) => cell.getMonth() === month && cell.getFullYear() === year && disabledDays.includes(cell.getDate());

  function onClickDay(cell: Date) {
    if (isDisabled(cell)) return;
    const c = toYMD(cell);

    if (!startDate || (startDate && endDate && !isSameDay(startDate, endDate))) {
      setStartDate(c);
      setEndDate(c);
      return;
    }

    if (startDate && endDate && isSameDay(startDate, endDate)) {
      if (isSameDay(c, startDate)) {
        setStartDate(null);
        setEndDate(null);
      } 
      else if (c < startDate) {
        setEndDate(startDate);
        setStartDate(c);
      } 
      else {
        setEndDate(c);
      }
    }
  }

  function getDayClass(cell: Date, inMonth: boolean) {
    if (isDisabled(cell)) return "date-picker-day date-picker-day-disabled";
    
    const isSelectedSingle = startDate && endDate && isSameDay(startDate, endDate) && isSameDay(cell, startDate);
    const isStart = startDate && isSameDay(cell, startDate) && !isSelectedSingle;
    const isEnd = endDate && isSameDay(cell, endDate) && !isSelectedSingle;
    const inRange = startDate && endDate && !isSameDay(startDate, endDate) && toYMD(cell) > toYMD(startDate) && toYMD(cell) < toYMD(endDate);

    if (isSelectedSingle) return "date-picker-day date-picker-day-selected";
    if (isStart) return "date-picker-day date-picker-day-selected date-range-start";
    if (isEnd) return "date-picker-day date-picker-day-selected date-range-end";
    if (inRange) return "date-picker-day date-picker-day-in-range";
    if (!inMonth) return "date-picker-day bg-white date-picker-day-muted";
    return "date-picker-day bg-white";
  }

  const headerLabel = `${year}년 ${month + 1}월`;

  return (
    <div>
      <Script
        src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&libraries=services&autoload=false`}
        strategy="afterInteractive"
        onLoad={initializeMap}
      />

      <style>{`
        /* --- CSS 스타일 --- */
        :root {
          --theme-brown-lightest: #F5F3F0;
          --theme-brown-light: #E9E4DD;
          --theme-brown-medium: #D4C8B8;
          --theme-brown-dark: #A18F79;
          --theme-brown-darkest: #4D4337;
          --white: #ffffff;
          --shadow-color-light: rgba(0,0,0,0.05);
          --shadow-color-medium: rgba(0,0,0,0.1);
          --shadow-color-strong: rgba(0,0,0,0.25);
          --unavailable-color: #F3F4F6;
        }
        body {
          font-family: 'Pretendard', sans-serif;
          background-color: var(--theme-brown-lightest);
          color: var(--theme-brown-darkest);
          overflow: hidden;
          min-height: max(884px, 100dvh);
          overscroll-behavior: none;
        }
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; font-size: 28px; vertical-align: middle; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .page-container { position: relative; height: 100vh; width: 100vw; }
        .background-map { position: absolute; inset: 0; z-index: 0; }
        .top-search-bar { position: absolute; top: 0; left: 0; right: 0; padding: 1rem; background: transparent; z-index: 20; }
        .top-search-bar-inner { max-width: 24rem; margin: 0 auto; background-color: rgba(255, 255, 255, 0.95); backdrop-filter: blur(4px); border-radius: 1rem; border: 1px solid var(--theme-brown-light); box-shadow: 0 4px 6px -1px var(--shadow-color-medium), 0 2px 4px -2px var(--shadow-color-medium); }
        .search-input-card { flex-grow: 1; margin-left: 1.25rem; margin-right: 1.25rem; padding: 0.5rem 1rem; background-color: var(--white); border-radius: 9999px; display: flex; flex-direction: column; justify-content: center; align-items: center; box-shadow: 0 4px 8px -2px var(--shadow-color-medium), 0 2px 4px -2px var(--shadow-color-light); transition: all 0.3s ease; cursor: pointer; }
        .search-input-card:hover { transform: translateY(-2px); box-shadow: 0 8px 16px -4px var(--shadow-color-medium), 0 4px 8px -3px var(--shadow-color-light); }
        .search-input-card .main-text { font-weight: bold; font-size: 1.125rem; color: var(--theme-brown-darkest); }
        .search-input-card .sub-text { font-size: 0.875rem; color: var(--theme-brown-dark); }
        .filter-buttons { padding: 0.5rem; display: flex; justify-content: space-around; gap: 0.25rem; overflow-x: auto; }
        .filter-button { padding: 0.375rem 0.75rem; font-size: 0.875rem; white-space: nowrap; border-radius: 9999px; border: 1px solid var(--theme-brown-medium); background-color: rgba(255,255,255,0.9); color: var(--theme-brown-darkest); box-shadow: 0 1px 2px 0 var(--shadow-color-light); transition: background-color 0.2s, color 0.2s, border-color 0.2s; cursor: pointer; }
        .filter-button:hover { background-color: var(--theme-brown-light); }
        .filter-button.active { background-color: var(--theme-brown-darkest); color: var(--white); border-color: var(--theme-brown-darkest); }
        .map-controls { position: absolute; top: 50%; right: 1rem; transform: translateY(calc(-50% - 6rem)); display: flex; flex-direction: column; gap: 0.75rem; z-index: 10; }
        .map-control-button { padding: 0.5rem; background-color: rgba(255,255,255,0.9); backdrop-filter: blur(4px); border-radius: 0.5rem; box-shadow: 0 4px 6px -1px var(--shadow-color-medium); border: 1px solid var(--theme-brown-medium); color: var(--theme-brown-darkest); cursor: pointer; transition: background-color 0.2s; }
        .map-control-button:hover { background-color: var(--theme-brown-light); }
        .zoom-controls { display: flex; flex-direction: column; }
        .nearby-spaces-container { position: absolute; bottom: 0; left: 0; right: 0; }
        .nearby-spaces-inner { background-color: var(--theme-brown-lightest); padding: 0.5rem; border-top-left-radius: 1.5rem; border-top-right-radius: 1.5rem; box-shadow: 0 -4px 12px rgba(0,0,0,0.1); }
        .pull-handle { width: 2.5rem; height: 0.375rem; background-color: var(--theme-brown-medium); border-radius: 9999px; margin: 0 auto; }
        .text-content { padding: 1rem; text-align: center; }
        .text-content h3 { font-weight: 700; font-size: 1.125rem; color: var(--theme-brown-darkest); }
        .text-content p { font-size: 0.875rem; color: var(--theme-brown-dark); }
        
        .date-picker-modal-overlay { position: fixed; inset: 0; background-color: rgba(0, 0, 0, 0.6); z-index: 50; display: flex; align-items: center; justify-content: center; }
        .date-picker-modal-content { background-color: var(--theme-brown-lightest); width: 100%; max-width: 28rem; max-height: 90vh; display: flex; flex-direction: column; border-radius: 1.5rem; box-shadow: 0 10px 30px rgba(0,0,0,0.2); margin: 1rem; animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .date-picker-modal-header { padding: 1rem; text-align: center; font-weight: bold; font-size: 1.25rem; border-bottom: 1px solid var(--theme-brown-light); position: relative; }
        .date-picker-modal-header .close-btn { position: absolute; top: 50%; right: 1rem; transform: translateY(-50%); cursor: pointer; padding: 0.5rem; }
        .date-picker-modal-body { overflow-y: auto; padding: 1rem; }
        .date-picker-modal-footer { padding: 1rem; border-top: 1px solid var(--theme-brown-light); }

        .date-picker-day { display: flex; align-items: center; justify-content: center; aspect-ratio: 1/1; border-radius: 9999px; transition: all 0.2s; cursor: pointer; }
        .date-picker-day-selected { background: var(--theme-brown-darkest); color: var(--white); }
        .date-picker-day-disabled { background: var(--unavailable-color); color: #bdbdbd; cursor: not-allowed; text-decoration: line-through; }
        .date-picker-day-in-range { background: var(--theme-brown-light); color: var(--theme-brown-darkest); border-radius: 0; }
        .date-picker-day-muted { color: var(--theme-brown-medium); }
        .date-range-start { border-top-right-radius: 0; border-bottom-right-radius: 0; }
        .date-range-end { border-top-left-radius: 0; border-bottom-left-radius: 0; }
        .button_primary { background: var(--theme-brown-darkest); color: #fff; border-radius: 0.75rem; padding: 0.75rem 1.25rem; font-size: 1rem; font-weight: bold; transition: background 0.2s; width: 100%; height: 48px; cursor: pointer; border: none; }
        .button_primary:hover { background: #3a3229; }
      `}</style>
      
      <div className="page-container">
        <div ref={mapContainer} className="background-map"></div>
        <div className="top-search-bar">
          <div className="top-search-bar-inner">
            <div style={{ display: 'flex', alignItems: 'center', padding: '0.75rem 1rem' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--theme-brown-dark)', fontSize: '32px' }}>search</span>
              <div className="search-input-card" onClick={() => setDatePickerOpen(true)}>
                <p className="main-text">{locationInfo.city}</p>
                <p className="sub-text">
                  {hasRange
                    ? (isSameDay(startDate!, endDate!)
                      ? fmtKoreanDate(startDate!)
                      : `${fmtKoreanDate(startDate!)} - ${fmtKoreanDate(endDate!)}`)
                    : '날짜를 선택하세요'}
                </p>
              </div>
              <div style={{ width: '1px', height: '2rem', backgroundColor: 'var(--theme-brown-light)', margin: '0 0.75rem 0 0' }}></div>
              <span className="material-symbols-outlined" style={{ fontSize: '32px', color: 'var(--theme-brown-darkest)' }}>tune</span>
            </div>
            <hr style={{ borderTop: '1px solid var(--theme-brown-light)' }} />
            <div className="filter-buttons no-scrollbar">
              {filterButtons.map((label) => (
                <button 
                  key={label}
                  className={`filter-button ${activeFilter === label ? 'active' : ''}`}
                  style={label === '날짜 선택' ? { visibility: 'hidden' } : {}}
                  onClick={() => setActiveFilter(label)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="map-controls">{/* ... */}</div>
        <div className="nearby-spaces-container">{/* ... */}</div>

        {isDatePickerOpen && (
          <div className="date-picker-modal-overlay" onClick={() => setDatePickerOpen(false)}>
            <div className="date-picker-modal-content" onClick={(e) => e.stopPropagation()}>
              <header className="date-picker-modal-header">
                날짜 선택
                <button className="close-btn" onClick={() => setDatePickerOpen(false)}>
                    <svg height="24" width="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </header>

              <main className="date-picker-modal-body">
                <div className="bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] p-4">
                  <div className="flex items-center justify-between mb-4">
                    <button className="p-2 rounded-full hover:bg-gray-100" onClick={() => gotoMonth(-1)}>
                        <svg fill="none" height="20" stroke="currentColor" viewBox="0 0 24 24" width="20"><path d="m15 18-6-6 6-6"></path></svg>
                    </button>
                    <h2 className="text-base font-bold">{headerLabel}</h2>
                    <button className="p-2 rounded-full hover:bg-gray-100" onClick={() => gotoMonth(1)}>
                        <svg fill="none" height="20" stroke="currentColor" viewBox="0 0 24 24" width="20"><path d="m9 18 6-6-6-6"></path></svg>
                    </button>
                  </div>
                  <div className="grid grid-cols-7 gap-y-1 text-center text-sm text-[var(--theme-brown-dark)] mb-2">
                    <div>일</div><div>월</div><div>화</div><div>수</div><div>목</div><div>금</div><div>토</div>
                  </div>
                  <div className="grid grid-cols-7 gap-x-0 gap-y-2">
                    {cells.map(({ date: cell, inMonth }) => (
                      <div key={cell.toISOString()} className={getDayClass(cell, inMonth)} onClick={() => onClickDay(cell)}>
                        {cell.getDate()}
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-center items-center space-x-6 mt-4 pt-4 border-t border-[var(--theme-brown-light)]">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded-full bg-[var(--theme-brown-darkest)]" />
                      <span className="text-xs text-[var(--theme-brown-dark)]">선택 날짜</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-white border border-gray-300 rounded-full" />
                      <span className="text-xs text-[var(--theme-brown-dark)]">예약 가능</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded-full bg-[var(--unavailable-color)]" />
                      <span className="text-xs text-[var(--theme-brown-dark)]">예약 마감</span>
                    </div>
                  </div>
                </div>
              </main>

              <footer className="date-picker-modal-footer">
                <button className="button_primary" onClick={() => setDatePickerOpen(false)}>
                  선택 완료
                </button>
              </footer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}