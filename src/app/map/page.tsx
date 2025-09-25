'use client';

import React, { useRef, useState, useMemo, useEffect } from 'react';
import Script from 'next/script';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { locations, Location } from '../../data/locations';
import { useBottomNav } from '../context/BottomNavContext';
import ArtworkSelector from './components/ArtworkSelector';
import LoadingScreen from './components/LoadingScreen';
import PlaceDetailPanel from './components/PlaceDetailPanel';

const AddArtworkModal = dynamic(() => import('./components/AddArtworkModal'));
const SearchModal = dynamic(() => import('./components/SearchModal'));
const LocationDetailPage = dynamic(
  () => import('./components/LocationDetailPage')
);

// --- 타입 선언 ---
type KakaoLatLng = { getLat: () => number; getLng: () => number; };
type KakaoMap = { setCenter: (latlng: KakaoLatLng) => void; };
type KakaoGeocoderResult = { address: { region_1depth_name: string; region_2depth_name: string; }; }[];
type KakaoGeocoderStatus = 'OK' | 'ZERO_RESULT' | 'ERROR';
type KakaoPlace = { id: string; place_name: string; address_name: string; road_address_name: string; x: string; y: string; };
interface Artwork { id: number; title: string; artist: string; dimensions: string; price: number; imageUrl: string; }

// --- 데이터 및 유틸 함수 ---
const artworks: Artwork[] = [
    { id: 1, title: 'Vibrance', artist: 'Alexia Ray', dimensions: '120cm x 80cm', price: 15, imageUrl: 'https://picsum.photos/id/1018/200/200' },
    { id: 2, title: 'Solitude', artist: 'Clara Monet', dimensions: '50cm x 70cm', price: 10, imageUrl: 'https://picsum.photos/id/1015/200/200' },
    { id: 3, title: 'The Vase', artist: 'Mark Chen', dimensions: '100cm x 100cm', price: 20, imageUrl: 'https://picsum.photos/id/1025/200/200' },
];
const disabledDays = [28];
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


// --- 메인 페이지 컴포넌트 ---
export default function MapPage() {
    const { setNavVisible } = useBottomNav();
    const [isDetailPageVisible, setDetailPageVisible] = useState(false);
    const [isMapLoading, setMapLoading] = useState(true);
    
    const filterButtons = ['작품 선택', '카페', '갤러리', '문화회관'];
    const mapContainer = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<KakaoMap | null>(null);
    const isMapInitialized = useRef(false);

    const [locationInfo, setLocationInfo] = useState({ city: '위치 찾는 중...' });
    const [isDatePickerOpen, setDatePickerOpen] = useState(false);
    const [viewDate, setViewDate] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [activeFilter, setActiveFilter] = useState('갤러리');
    const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(artworks[0] || null);
    const [isArtworkModalOpen, setArtworkModalOpen] = useState(false);
    const [isArtworkSelectorVisible, setArtworkSelectorVisible] = useState(false);
    const [isSearchModalOpen, setSearchModalOpen] = useState(false);
    const [selectedPlace, setSelectedPlace] = useState<Location | null>(null);
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const cells = useMemo(() => getCalendarCells(viewDate), [viewDate]);
    const hasRange = !!(startDate && endDate);

    useEffect(() => {
        if (isDetailPageVisible) {
            setNavVisible(false);
        } else {
            setNavVisible(true);
        }
        return () => {
            setNavVisible(true);
        };
    }, [isDetailPageVisible, setNavVisible]);
    
    const loadMap = (lat: number, lng: number): KakaoMap | null => {
        const { kakao } = window;
        if (!mapContainer.current || !kakao) return null;
        const mapOption = { center: new kakao.maps.LatLng(lat, lng), level: 5 };
        const map = new kakao.maps.Map(mapContainer.current, mapOption);
        mapInstance.current = map;
        new kakao.maps.services.Geocoder().coord2Address(lng, lat, (result: KakaoGeocoderResult, status: KakaoGeocoderStatus) => {
            if (status === kakao.maps.services.Status.OK) {
                setLocationInfo({ city: result[0].address.region_2depth_name || result[0].address.region_1depth_name });
            } else { setLocationInfo({ city: "주소 정보 없음" }); }
        });
        return map;
    };

    const loadMarkers = (map: KakaoMap) => {
        const { kakao } = window;
        if (!kakao) return;
        locations.forEach((place) => {
            const placePosition = new kakao.maps.LatLng(place.lat, place.lng);
            new kakao.maps.Marker({ map, position: placePosition });
            const contentNode = document.createElement('div');
            contentNode.className = 'custom-overlay-style';
            contentNode.innerHTML = `<div class="font-bold">${place.name}</div><div style="color:${place.statusColor};" class="text-xs mt-0.5">${place.statusText}</div>`;
            contentNode.onclick = () => setSelectedPlace(place);
            new kakao.maps.CustomOverlay({ map, position: placePosition, content: contentNode, yAnchor: 2.2 });
        });
    };

    const initializeMap = () => {
        if (isMapInitialized.current || !window.kakao) {
            return;
        }
        isMapInitialized.current = true;

        window.kakao.maps.load(() => {
            const onMapReady = (map: KakaoMap | null) => {
                if (map) {
                    loadMarkers(map);
                    setMapLoading(false);
                }
            };

            navigator.geolocation?.getCurrentPosition(
                (position) => {
                    const map = loadMap(position.coords.latitude, position.coords.longitude);
                    onMapReady(map);
                },
                () => {
                    const map = loadMap(37.5665, 126.9780);
                    onMapReady(map);
                }, { enableHighAccuracy: true }
            );
        });
    };

    const handlePlaceSelect = (place: KakaoPlace) => {
        if (!mapInstance.current || !window.kakao) return;
        const moveLatLon = new window.kakao.maps.LatLng(Number(place.y), Number(place.x));
        mapInstance.current.setCenter(moveLatLon);
        setLocationInfo({ city: place.place_name });
        setSearchModalOpen(false);
    };

    const gotoMonth = (offset: number) => setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    const isDisabled = (cell: Date) => cell.getMonth() === month && cell.getFullYear() === year && disabledDays.includes(cell.getDate());
    const onClickDay = (cell: Date) => {
        if (isDisabled(cell)) return;
        const c = toYMD(cell);
        if (!startDate || (startDate && endDate && !isSameDay(startDate, endDate))) { setStartDate(c); setEndDate(c); return; }
        if (startDate && endDate && isSameDay(startDate, endDate)) {
            if (isSameDay(c, startDate)) { setStartDate(null); setEndDate(null); }
            else if (c < startDate) { setEndDate(startDate); setStartDate(c); }
            else { setEndDate(c); }
        }
    };
    const getDayClass = (cell: Date, inMonth: boolean) => {
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
    };
    const handleFilterClick = (label: string) => {
        if (label === '작품 선택') { setArtworkSelectorVisible(prev => !prev); }
        else { setActiveFilter(label); setArtworkSelectorVisible(false); }
    };

    const headerLabel = `${year}년 ${month + 1}월`;

    return (
        <div>
            <Script src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&libraries=services&autoload=false`} strategy="afterInteractive" onLoad={initializeMap} />
            
            <style>{`
              :root { --theme-brown-lightest:#F5F3F0; --theme-brown-light:#E9E4DD; --theme-brown-medium:#D4C8B8; --theme-brown-dark:#A18F79; --theme-brown-darkest:#4D4337; --white:#ffffff; }
              body { font-family: 'Pretendard', sans-serif; background-color: var(--theme-brown-lightest); color: var(--theme-brown-darkest); overflow: hidden; min-height: 100vh; overscroll-behavior: none; }
              .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; font-size: 28px; vertical-align: middle; }
              .no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
              .page-container { position: relative; height: 100vh; width: 100vw; }
              .background-map { position: absolute; inset: 0; z-index: 0; }
              .top-search-bar { position: absolute; top: 0; left: 0; right: 0; padding: 1rem; z-index: 20; }
              .top-search-bar-inner { max-width: 24rem; margin: 0 auto; background-color: rgba(255,255,255,0.95); backdrop-filter: blur(4px); border-radius: 1rem; border: 1px solid var(--theme-brown-light); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
              .search-input-card { flex-grow: 1; margin: 0 1.25rem; padding: 0.5rem 1rem; background-color: var(--white); border-radius: 9999px; display: flex; flex-direction: column; justify-content: center; align-items: center; box-shadow: 0 4px 8px rgba(0,0,0,0.08); transition: all 0.3s ease; cursor: pointer; }
              .search-input-card:hover { transform: translateY(-2px); box-shadow: 0 6px 12px rgba(0,0,0,0.1); }
              .search-input-card .main-text { font-weight: bold; font-size: 1.125rem; } .search-input-card .sub-text { font-size: 0.875rem; color: var(--theme-brown-dark); }
              .filter-buttons { padding: 0.5rem; display: flex; justify-content: space-around; gap: 0.25rem; overflow-x: auto; }
              .filter-button { padding: 0.375rem 0.75rem; font-size: 0.875rem; white-space: nowrap; border-radius: 9999px; border: 1px solid var(--theme-brown-medium); background-color: rgba(255,255,255,0.9); color: var(--theme-brown-darkest); box-shadow: 0 1px 2px rgba(0,0,0,0.05); transition: all 0.2s; cursor: pointer; }
              .filter-button:hover { background-color: var(--theme-brown-light); }
              .filter-button.active { background-color: var(--theme-brown-darkest); color: var(--white); border-color: var(--theme-brown-darkest); }
              .date-picker-modal-overlay { position: fixed; inset: 0; background-color: rgba(0,0,0,0.6); z-index: 50; display: flex; align-items: center; justify-content: center; }
              .date-picker-modal-content { background-color: var(--theme-brown-lightest); width: 100%; max-width: 28rem; max-height: 90vh; display: flex; flex-direction: column; border-radius: 1.5rem; box-shadow: 0 10px 30px rgba(0,0,0,0.2); margin: 1rem; animation: fadeIn 0.3s ease-out; }
              @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
              .date-picker-modal-header { padding: 1rem; text-align: center; font-weight: bold; font-size: 1.25rem; border-bottom: 1px solid var(--theme-brown-light); position: relative; }
              .date-picker-modal-header .close-btn { position: absolute; top: 50%; right: 1rem; transform: translateY(-50%); cursor: pointer; padding: 0.5rem; }
              .date-picker-modal-body { overflow-y: auto; padding: 1rem; }
              .date-picker-modal-footer { padding: 1rem; border-top: 1px solid var(--theme-brown-light); }
              .date-picker-day { display: flex; align-items: center; justify-content: center; aspect-ratio: 1/1; border-radius: 9999px; transition: all 0.2s; cursor: pointer; }
              .date-picker-day-selected { background: var(--theme-brown-darkest); color: var(--white); }
              .date-picker-day-disabled { background: #F3F4F6; color: #bdbdbd; cursor: not-allowed; text-decoration: line-through; }
              .date-picker-day-in-range { background: var(--theme-brown-light); color: var(--theme-brown-darkest); border-radius: 0; }
              .date-picker-day-muted { color: var(--theme-brown-medium); }
              .date-range-start { border-top-right-radius: 0; border-bottom-right-radius: 0; }
              .date-range-end { border-top-left-radius: 0; border-bottom-left-radius: 0; }
              .custom-overlay-style { padding: 8px 12px; background: white; border: 1px solid #ccc; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center; cursor: pointer; font-size: 13px; }
            `}</style>

            <div className={`page-container`}>
                <div ref={mapContainer} className="background-map">
                    {isMapLoading && <LoadingScreen />}
                </div>
                <div className="top-search-bar">
                    <div className="top-search-bar-inner">
                        <div style={{ display: 'flex', alignItems: 'center', padding: '0.75rem 1rem' }}>
                            <span className="material-symbols-outlined cursor-pointer" style={{ color: 'var(--theme-brown-dark)', fontSize: '32px' }} onClick={() => setSearchModalOpen(true)}>search</span>
                            <div className="search-input-card" onClick={() => setDatePickerOpen(true)}>
                                <p className="main-text">{locationInfo.city}</p>
                                <p className="sub-text">{hasRange ? (isSameDay(startDate!, endDate!) ? fmtKoreanDate(startDate!) : `${fmtKoreanDate(startDate!)} - ${fmtKoreanDate(endDate!)}`) : '날짜를 선택하세요'}</p>
                            </div>
                            <div style={{ width: '1px', height: '2rem', backgroundColor: 'var(--theme-brown-light)', margin: '0 0.75rem 0 0' }}></div>
                            <span className="material-symbols-outlined" style={{ fontSize: '32px', color: 'var(--theme-brown-darkest)' }}>tune</span>
                        </div>
                        <hr style={{ borderTop: '1px solid var(--theme-brown-light)' }} />
                        <div className="filter-buttons no-scrollbar">{filterButtons.map((label) => (<button key={label} className={`filter-button ${(label === '작품 선택' && isArtworkSelectorVisible) || activeFilter === label ? 'active' : ''}`} onClick={() => handleFilterClick(label)}>{label}</button>))}</div>
                    </div>
                </div>
                <ArtworkSelector artworks={artworks} selectedArtwork={selectedArtwork} onSelectArtwork={setSelectedArtwork} onAddNew={() => setArtworkModalOpen(true)} isVisible={isArtworkSelectorVisible} />
                {isDatePickerOpen && (
                    <div className="date-picker-modal-overlay" onClick={() => setDatePickerOpen(false)}>
                        <div className="date-picker-modal-content" onClick={(e) => e.stopPropagation()}>
                            <header className="date-picker-modal-header">날짜 선택<button className="close-btn" onClick={() => setDatePickerOpen(false)}><svg height="24" width="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 6L6 18M6 6l12 12"/></svg></button></header>
                            <main className="date-picker-modal-body">
                                <div className="bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <button className="p-2 rounded-full hover:bg-gray-100" onClick={() => gotoMonth(-1)}><svg fill="none" height="20" stroke="currentColor" viewBox="0 0 24 24" width="20"><path d="m15 18-6-6 6-6"></path></svg></button>
                                        <h2 className="text-base font-bold">{headerLabel}</h2>
                                        <button className="p-2 rounded-full hover:bg-gray-100" onClick={() => gotoMonth(1)}><svg fill="none" height="20" stroke="currentColor" viewBox="0 0 24 24" width="20"><path d="m9 18 6-6-6-6"></path></svg></button>
                                    </div>
                                    <div className="grid grid-cols-7 gap-y-1 text-center text-sm text-[var(--theme-brown-dark)] mb-2"><div>일</div><div>월</div><div>화</div><div>수</div><div>목</div><div>금</div><div>토</div></div>
                                    <div className="grid grid-cols-7 gap-x-0 gap-y-2">{cells.map(({ date: cell, inMonth }) => (<div key={cell.toISOString()} className={getDayClass(cell, inMonth)} onClick={() => onClickDay(cell)}>{cell.getDate()}</div>))}</div>
                                </div>
                            </main>
                            <footer className="date-picker-modal-footer">
                                <button onClick={() => setDatePickerOpen(false)} className="w-full h-12 rounded-lg bg-[var(--theme-brown-darkest)] text-white font-bold text-base transition-colors duration-200 hover:bg-[#3a3229]">선택 완료</button>
                            </footer>
                        </div>
                    </div>
                )}
                <AddArtworkModal isOpen={isArtworkModalOpen} onClose={() => setArtworkModalOpen(false)} />
                <SearchModal isOpen={isSearchModalOpen} onClose={() => setSearchModalOpen(false)} onPlaceSelect={handlePlaceSelect} />
                <div className={`transition-opacity duration-300 ease-in-out ${selectedPlace && !isDetailPageVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    {selectedPlace && <PlaceDetailPanel place={selectedPlace} onClose={() => setSelectedPlace(null)} onShowDetail={() => setDetailPageVisible(true)} />}
                </div>
                {isDetailPageVisible && selectedPlace && (<LocationDetailPage place={selectedPlace} onClose={() => setDetailPageVisible(false)} />)}
            </div>
        </div>
    );
}