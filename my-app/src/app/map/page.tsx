'use client';

import React, { useRef, useState, useMemo, useEffect } from 'react';
import Script from 'next/script';
// ✨ 데이터 파일에서 위도/경도가 포함된 locations를 가져옵니다.
import { locations } from '../../data/locations'; 

// --- 타입 선언 (기존 + 추가) ---
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
type KakaoPlace = {
  id: string;
  place_name: string;
  address_name: string;
  road_address_name: string;
  x: string; // 경도 (longitude)
  y: string; // 위도 (latitude)
};


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
            OK: 'OK';
            ZERO_RESULT: 'ZERO_RESULT';
            ERROR: 'ERROR';
          };
          Places: new () => {
            keywordSearch: (
              keyword: string,
              callback: (data: KakaoPlace[], status: 'OK' | 'ZERO_RESULT' | 'ERROR') => void
            ) => void;
          };
          CustomOverlay: new (options: {
            map?: KakaoMap | null;
            position: KakaoLatLng;
            content: string;
            yAnchor?: number;
          }) => {
            setMap: (map: KakaoMap | null) => void;
          };
        };
      };
    };
  }
}

// --- 데이터 (기존과 동일) ---
interface Artwork {
  id: number;
  title: string;
  artist: string;
  dimensions: string;
  price: number;
  imageUrl: string;
}
const artworks: Artwork[] = [
    { id: 1, title: 'Vibrance', artist: 'Alexia Ray', dimensions: '120cm x 80cm', price: 15, imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxvrJdLTluq6KnrnvL6a6yRXop1VdnL_iOQMQIPUCd5bxyU_BSp86oGpu4R7zkqu_C5QCB0JN_6FS42bFZnBwteEvONC0kZ_wFgCY0N5grPXL7k2dC8L0t8pQO1ab6EIzSRfh4J8jv_gZZmdNomOuVW27zIwz3vdcvas87iuMrjzG2JcPxd7wDKKStGeffdLzNrikHOXY1xASF1GrGmqqxOK3Lc7DE7QeCyH3SOV6JZ0lo4yxVt19usMsxw3r-mTgVG65nx_2QOcD3' },
    { id: 2, title: 'Solitude', artist: 'Clara Monet', dimensions: '50cm x 70cm', price: 10, imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB3WMZ4mU8TvOqSDyAY4OKw8mCp7BY-naBunk1M9Ke6U-k_2jYKzuqbD1-uUMiHy_6rFWRt88JmfCIvXXayXNlVb7CApOuNh-rZ2OIocAWVKYIGDmoVyPCDvYxXjnwF9bggr2J9GWoWBiX_dRFnTgb1OT7AYRT9OEMhaLyUT_K00NqG6YMyaR0XvuZD8nridKQW9k3BI5rVgdH4RqlU8V1-HQ5unWDwPKklfd2Wiizv4nISA2NZtWYyRxdTjkmqaXXlPCNonNzxmt_' },
    { id: 3, title: 'The Vase', artist: 'Mark Chen', dimensions: '100cm x 100cm', price: 20, imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA4jRII7IaS_eTaex1R71JDs0D-bQBs1cqTQ-AiutCCcCtNpq7CBbBb-kSnUhLrWwB1p0Uw270LofRssoBPWJTK9aoTOd_nWCfgWlPMKFSKc0sTAtQZxarJjB9Ma-739Qw6azmCNrFAMynCGhyJ7J8Mq4tt4WFbOpCTSPU0UF_ODiLjTbs6RyPBo8z2kfRNrbP3XwFEmdbDE5Ht8TigXiUs4va03hE4YMew3LpGvWcYU82cb8NryVI7_TRJ7W5NfJczJpkhkRV5OjMH' },
];

const disabledDays = [28];

// --- 날짜 유틸 함수 (기존과 동일) ---
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

// --- 작품 선택 컴포넌트 (기존과 동일) ---
function ArtworkSelector({ artworks, selectedArtwork, onSelectArtwork, onAddNew, isVisible }: {
  artworks: Artwork[];
  selectedArtwork: Artwork | null;
  onSelectArtwork: (artwork: Artwork) => void;
  onAddNew: () => void;
  isVisible: boolean;
}) {
  return (
    <div className={`absolute top-48 left-0 right-0 px-4 z-10 transition-all duration-300 ease-in-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
      }`}>
      <div className="bg-theme-brown-light/90 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-theme-brown-medium">
        <h2 className="text-lg font-bold text-theme-brown-darkest mb-3">Choose your artwork</h2>
        <div className="flex items-center space-x-3 overflow-x-auto pb-2 no-scrollbar">
          <div className="flex-shrink-0 text-center cursor-pointer" onClick={onAddNew}>
            <div className="w-20 h-20 bg-theme-brown-medium rounded-lg flex items-center justify-center border-2 border-dashed border-theme-brown-dark">
              <span className="material-symbols-outlined text-theme-brown-darkest">add</span>
            </div>
            <p className="text-xs mt-1 text-theme-brown-darkest">Add new</p>
          </div>
          {artworks.map((artwork) => (
            <div
              key={artwork.id}
              className={`flex-shrink-0 text-center cursor-pointer ${selectedArtwork?.id === artwork.id ? 'ring-2 ring-theme-brown-darkest rounded-lg p-0.5' : ''}`}
              onClick={() => onSelectArtwork(artwork)}
            >
              <img alt={artwork.title} className="w-20 h-20 rounded-md object-cover" src={artwork.imageUrl}/>
              <p className="text-xs mt-1 text-theme-brown-darkest">"{artwork.title}"</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- 작품 추가 모달 컴포넌트 (기존과 동일) ---
function AddArtworkModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void; }) {
  if (!isOpen) return null;

  return (
    <div className="date-picker-modal-overlay" onClick={onClose}>
      <div className="date-picker-modal-content" onClick={(e) => e.stopPropagation()}>
        <header className="date-picker-modal-header">
          작품 추가
          <button className="close-btn" onClick={onClose}>
            <svg height="24" width="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </header>
        <main className="date-picker-modal-body" style={{ minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p className="text-theme-brown-dark">작품을 추가하는 폼이 여기에 표시됩니다.</p>
        </main>
        <footer className="date-picker-modal-footer">
          <button className="button_primary" onClick={onClose}>
            저장
          </button>
        </footer>
      </div>
    </div>
  );
}

// --- 장소 검색 모달 컴포넌트 (기존과 동일) ---
function SearchModal({ isOpen, onClose, onPlaceSelect }: {
  isOpen: boolean;
  onClose: () => void;
  onPlaceSelect: (place: KakaoPlace) => void;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<KakaoPlace[]>([]);
  
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.trim() === '') {
      setResults([]);
      return;
    }

    const handler = setTimeout(() => {
      if (window.kakao && window.kakao.maps.services) {
        const ps = new window.kakao.maps.services.Places();
        ps.keywordSearch(query, (data, status) => {
          if (status === window.kakao.maps.services.Status.OK) {
            setResults(data);
          } else {
            setResults([]);
          }
        });
      }
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="date-picker-modal-overlay" onClick={onClose}>
      <div className="date-picker-modal-content" onClick={(e) => e.stopPropagation()}>
        <header className="date-picker-modal-header">
          장소 검색
          <button className="close-btn" onClick={onClose}>
            <svg height="24" width="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </header>
        <main className="date-picker-modal-body">
          <div className="p-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="장소, 주소, 지하철역 등으로 검색"
              className="w-full p-3 border border-theme-brown-medium rounded-lg focus:ring-2 focus:ring-theme-brown-dark focus:outline-none"
              autoFocus
            />
          </div>
          <ul className="mt-2 h-80 overflow-y-auto">
            {results.length > 0 ? (
              results.map((place) => (
                <li
                  key={place.id}
                  onClick={() => onPlaceSelect(place)}
                  className="p-4 border-b border-theme-brown-light hover:bg-theme-brown-light cursor-pointer"
                >
                  <p className="font-bold text-theme-brown-darkest">{place.place_name}</p>
                  <p className="text-sm text-theme-brown-dark">{place.road_address_name || place.address_name}</p>
                </li>
              ))
            ) : (
              query.trim() && <li className="p-4 text-center text-theme-brown-dark">검색 결과가 없습니다.</li>
            )}
          </ul>
        </main>
      </div>
    </div>
  );
}


// --- 메인 컴포넌트 ---
export default function ArtspaceMapViewSingleFile() {
  const filterButtons = ['작품 선택', '카페', '갤러리', '문화회관' ];
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<KakaoMap | null>(null);
  const [locationInfo, setLocationInfo] = useState({ city: '위치 찾는 중...' });

  const [isDatePickerOpen, setDatePickerOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [activeFilter, setActiveFilter] = useState('갤러리');

  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(artworks[0] || null);
  const [isArtworkModalOpen, setArtworkModalOpen] = useState(false);
  const [isArtworkSelectorVisible, setArtworkSelectorVisible] = useState(true);

  const [isSearchModalOpen, setSearchModalOpen] = useState(false);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const cells = useMemo(() => getCalendarCells(viewDate), [viewDate]);
  const hasRange = !!(startDate && endDate);

  // ✨ --- 지도 로딩 로직 최적화 --- ✨

  // 1. 지도 생성만 담당하는 함수
  const loadMap = (lat: number, lng: number): KakaoMap | null => {
    const { kakao } = window;
    if (!mapContainer.current || !kakao) return null;

    const mapOption = { center: new kakao.maps.LatLng(lat, lng), level: 5 };
    const map = new kakao.maps.Map(mapContainer.current, mapOption);
    mapInstance.current = map; // map 인스턴스 저장

    // 현재 위치 주소 정보 가져오기
    const geocoder = new kakao.maps.services.Geocoder();
    geocoder.coord2Address(lng, lat, (result, status) => {
      if (status === kakao.maps.services.Status.OK) {
        const city = result[0].address.region_2depth_name || result[0].address.region_1depth_name;
        setLocationInfo({ city });
      } else {
        setLocationInfo({ city: "주소 정보 없음" });
      }
    });

    return map; // 생성된 map 객체 반환
  };
  
  // 2. 마커와 오버레이만 지도에 표시하는 함수
  const loadMarkers = (map: KakaoMap) => {
    const { kakao } = window;
    if (!kakao) return;

    locations.forEach((place) => {
      // 데이터에 저장된 좌표를 바로 사용 (API 호출 없음)
      const placePosition = new kakao.maps.LatLng(place.lat, place.lng);

      new kakao.maps.Marker({
        map: map,
        position: placePosition,
      });

      const content = `
        <div style="padding:5px; background:white; border:1px solid #ccc; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); font-size:12px; font-weight:bold; text-align:center;">
          ${place.name}<br>
          <span style="color:${place.statusColor};">${place.statusText}</span>
        </div>
      `;

      new kakao.maps.CustomOverlay({
        map: map,
        position: placePosition,
        content: content,
        yAnchor: 2.2
      });
    });
  };

  // 3. 지도 초기화 전체 흐름
  const initializeMap = () => {
    const { kakao } = window;
    if (!kakao) return;
    
    kakao.maps.load(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const map = loadMap(position.coords.latitude, position.coords.longitude);
                    if (map) {
                      loadMarkers(map); // 지도 생성 후 마커 표시
                    }
                },
                (error) => {
                    console.error("Geolocation 에러:", error);
                    setLocationInfo({ city: '위치를 찾을 수 없어요' });
                    const map = loadMap(37.5665, 126.9780); // 기본 위치: 서울시청
                    if (map) {
                      loadMarkers(map);
                    }
                }
            );
        } else {
            console.error("브라우저가 Geolocation을 지원하지 않습니다.");
            setLocationInfo({ city: '위치 사용 불가' });
            const map = loadMap(37.5665, 126.9780); // 기본 위치: 서울시청
            if (map) {
              loadMarkers(map);
            }
        }
    });
  };

  // --- ✨ 로직 최적화 끝 --- ✨


  const handlePlaceSelect = (place: KakaoPlace) => {
    if (!mapInstance.current || !window.kakao) return;

    const { kakao } = window;
    const moveLatLon = new kakao.maps.LatLng(Number(place.y), Number(place.x));
    mapInstance.current.setCenter(moveLatLon);
    setLocationInfo({ city: place.place_name });
    setSearchModalOpen(false);
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

  const handleFilterClick = (label: string) => {
    if (label === '작품 선택') {
      setArtworkSelectorVisible(prev => !prev);
    } else if (label !== '날짜 선택') {
      setActiveFilter(label);
      setArtworkSelectorVisible(false);
    }
  };

  const headerLabel = `${year}년 ${month + 1}월`;

  return (
    <div>
      <Script
        src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&libraries=services&autoload=false`}
        strategy="afterInteractive"
        onLoad={initializeMap}
      />

      <style>{`
        :root {
          --theme-brown-lightest: #F5F3F0; --theme-brown-light: #E9E4DD; --theme-brown-medium: #D4C8B8;
          --theme-brown-dark: #A18F79; --theme-brown-darkest: #4D4337; --white: #ffffff;
          --shadow-color-light: rgba(0,0,0,0.05); --shadow-color-medium: rgba(0,0,0,0.1);
          --shadow-color-strong: rgba(0,0,0,0.25); --unavailable-color: #F3F4F6;
        }
        body { font-family: 'Pretendard', sans-serif; background-color: var(--theme-brown-lightest); color: var(--theme-brown-darkest); overflow: hidden; min-height: max(884px, 100dvh); overscroll-behavior: none; }
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; font-size: 28px; vertical-align: middle; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .page-container { position: relative; height: 100vh; width: 100vw; }
        .background-map { position: absolute; inset: 0; z-index: 0; }
        .top-search-bar { position: absolute; top: 0; left: 0; right: 0; padding: 1rem; background: transparent; z-index: 20; }
        .top-search-bar-inner { max-width: 24rem; margin: 0 auto; background-color: rgba(255, 255, 255, 0.95); backdrop-filter: blur(4px); border-radius: 1rem; border: 1px solid var(--theme-brown-light); box-shadow: 0 4px 6px -1px var(--shadow-color-medium), 0 2px 4px -2px var(--shadow-color-medium); }
        .search-input-card { flex-grow: 1; margin: 0 1.25rem; padding: 0.5rem 1rem; background-color: var(--white); border-radius: 9999px; display: flex; flex-direction: column; justify-content: center; align-items: center; box-shadow: 0 4px 8px -2px var(--shadow-color-medium), 0 2px 4px -2px var(--shadow-color-light); transition: all 0.3s ease; cursor: pointer; }
        .search-input-card:hover { transform: translateY(-2px); box-shadow: 0 8px 16px -4px var(--shadow-color-medium), 0 4px 8px -3px var(--shadow-color-light); }
        .search-input-card .main-text { font-weight: bold; font-size: 1.125rem; color: var(--theme-brown-darkest); }
        .search-input-card .sub-text { font-size: 0.875rem; color: var(--theme-brown-dark); }
        .filter-buttons { padding: 0.5rem; display: flex; justify-content: space-around; gap: 0.25rem; overflow-x: auto; }
        .filter-button { padding: 0.375rem 0.75rem; font-size: 0.875rem; white-space: nowrap; border-radius: 9999px; border: 1px solid var(--theme-brown-medium); background-color: rgba(255,255,255,0.9); color: var(--theme-brown-darkest); box-shadow: 0 1px 2px 0 var(--shadow-color-light); transition: background-color 0.2s, color 0.2s, border-color 0.2s; cursor: pointer; }
        .filter-button:hover { background-color: var(--theme-brown-light); }
        .filter-button.active { background-color: var(--theme-brown-darkest); color: var(--white); border-color: var(--theme-brown-darkest); }
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
              <span 
                className="material-symbols-outlined cursor-pointer" 
                style={{ color: 'var(--theme-brown-dark)', fontSize: '32px' }}
                onClick={() => setSearchModalOpen(true)}
              >
                search
              </span>
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
                  className={`filter-button ${
                    (label === '작품 선택' && isArtworkSelectorVisible) || activeFilter === label ? 'active' : ''
                  }`}
                  style={label === '날짜 선택' ? { visibility: 'hidden' } : {}}
                  onClick={() => handleFilterClick(label)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <ArtworkSelector
          artworks={artworks}
          selectedArtwork={selectedArtwork}
          onSelectArtwork={setSelectedArtwork}
          onAddNew={() => setArtworkModalOpen(true)}
          isVisible={isArtworkSelectorVisible} 
        />

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

        <AddArtworkModal isOpen={isArtworkModalOpen} onClose={() => setArtworkModalOpen(false)} />
        
        <SearchModal 
          isOpen={isSearchModalOpen}
          onClose={() => setSearchModalOpen(false)}
          onPlaceSelect={handlePlaceSelect}
        />
      </div>
    </div>
  );
}