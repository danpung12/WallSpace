'use client';

import React, { useRef, useState, useMemo, useEffect } from 'react';
import Script from 'next/script';
import Image from 'next/image'; // ✨ FIX: Import Next.js Image component
import { locations, Location, Space } from '../../data/locations'; // ✨ FIX: Removed unused 'Review' import
import { useBottomNav } from '../context/BottomNavContext';
import Link from 'next/link';

// --- (타입 선언, 데이터, 유틸 함수 등은 이전과 동일) ---
type KakaoLatLng = { getLat: () => number; getLng: () => number; };
type KakaoMap = { setCenter: (latlng: KakaoLatLng) => void; };
// ✨ FIX: 타입 정의 활성화
type KakaoGeocoderResult = { address: { region_1depth_name: string; region_2depth_name: string; }; }[];
type KakaoGeocoderStatus = 'OK' | 'ZERO_RESULT' | 'ERROR';
type KakaoPlace = { id: string; place_name: string; address_name: string; road_address_name: string; x: string; y: string; };
interface Artwork { id: number; title: string; artist: string; dimensions: string; price: number; imageUrl: string; }
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


// --- 자식 컴포넌트들 ---
function ArtworkSelector({ artworks, selectedArtwork, onSelectArtwork, onAddNew, isVisible }: { artworks: Artwork[], selectedArtwork: Artwork | null, onSelectArtwork: (artwork: Artwork) => void, onAddNew: () => void, isVisible: boolean }) {
    return (
        <div className={`absolute top-48 left-0 right-0 px-4 z-10 transition-all duration-300 ease-in-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
            <div className="bg-theme-brown-light/90 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-theme-brown-medium">
                <h2 className="text-lg font-bold text-theme-brown-darkest mb-3">Choose your artwork</h2>
                <div className="flex items-center space-x-3 overflow-x-auto pb-2 no-scrollbar">
                    <div className="flex-shrink-0 text-center cursor-pointer" onClick={onAddNew}>
                        <div className="w-20 h-20 bg-theme-brown-medium rounded-lg flex items-center justify-center border-2 border-dashed border-theme-brown-dark"><span className="material-symbols-outlined text-theme-brown-darkest">add</span></div>
                        <p className="text-xs mt-1 text-theme-brown-darkest">Add new</p>
                    </div>
                    {artworks.map((artwork) => (
                        <div key={artwork.id} className={`flex-shrink-0 text-center cursor-pointer ${selectedArtwork?.id === artwork.id ? 'ring-2 ring-theme-brown-darkest rounded-lg p-0.5' : ''}`} onClick={() => onSelectArtwork(artwork)}>
                            {/* ✨ FIX: Replaced <img> with <Image /> for optimization */}
                            <Image alt={artwork.title} className="w-20 h-20 rounded-md object-cover" src={artwork.imageUrl} width={80} height={80}/>
                            {/* ✨ FIX: Escaped quote entities */}
                            <p className="text-xs mt-1 text-theme-brown-darkest">&ldquo;{artwork.title}&rdquo;</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function AddArtworkModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    if (!isOpen) return null;
    return (
        <div className="date-picker-modal-overlay" onClick={onClose}>
            <div className="date-picker-modal-content" onClick={(e) => e.stopPropagation()}>
                <header className="date-picker-modal-header">작품 추가<button className="close-btn" onClick={onClose}><svg height="24" width="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 6L6 18M6 6l12 12"/></svg></button></header>
                <main className="date-picker-modal-body" style={{ minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p className="text-theme-brown-dark">작품을 추가하는 폼이 여기에 표시됩니다.</p></main>
                <footer className="date-picker-modal-footer">
                    <button className="w-full h-12 rounded-lg bg-[var(--theme-brown-darkest)] text-white font-bold text-base transition-colors duration-200 hover:bg-[#3a3229]" onClick={onClose}>저장</button>
                </footer>
            </div>
        </div>
    );
}

function SearchModal({ isOpen, onClose, onPlaceSelect }: { isOpen: boolean, onClose: () => void, onPlaceSelect: (place: KakaoPlace) => void }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<KakaoPlace[]>([]);
    useEffect(() => { if (!isOpen) { setQuery(''); setResults([]); } }, [isOpen]);
    useEffect(() => {
        if (query.trim() === '') { setResults([]); return; }
        const handler = setTimeout(() => {
            // ✨ FIX: Changed `&&` expression to an `if` statement
            if (window.kakao?.maps.services) {
                // ✨ FIX: 'any' 타입을 정의된 타입으로 변경
                new window.kakao.maps.services.Places().keywordSearch(query, (data: KakaoPlace[], status: KakaoGeocoderStatus) => {
                    if (status === window.kakao.maps.services.Status.OK) setResults(data); else setResults([]);
                });
            }
        }, 300);
        return () => clearTimeout(handler);
    }, [query]);
    if (!isOpen) return null;
    return (
        <div className="date-picker-modal-overlay" onClick={onClose}>
            <div className="date-picker-modal-content" onClick={(e) => e.stopPropagation()}>
                <header className="date-picker-modal-header">장소 검색<button className="close-btn" onClick={onClose}><svg height="24" width="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 6L6 18M6 6l12 12"/></svg></button></header>
                <main className="date-picker-modal-body">
                    <div className="p-2"><input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="장소, 주소, 지하철역 등으로 검색" className="w-full p-3 border border-theme-brown-medium rounded-lg focus:ring-2 focus:ring-theme-brown-dark focus:outline-none" autoFocus/></div>
                    <ul className="mt-2 h-80 overflow-y-auto">
                        {results.length > 0 ? (results.map((place) => (
                            <li key={place.id} onClick={() => onPlaceSelect(place)} className="p-4 border-b border-theme-brown-light hover:bg-theme-brown-light cursor-pointer">
                                <p className="font-bold text-theme-brown-darkest">{place.place_name}</p>
                                <p className="text-sm text-theme-brown-dark">{place.road_address_name || place.address_name}</p>
                            </li>
                        ))) : (query.trim() && <li className="p-4 text-center text-theme-brown-dark">검색 결과가 없습니다.</li>)}
                    </ul>
                </main>
            </div>
        </div>
    );
}

function PlaceDetailPanel({ place, onClose, onShowDetail }: { place: Location, onClose: () => void, onShowDetail: () => void }) {
    if (!place) return null;
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)] p-4 transition-transform duration-300 ease-in-out z-40 cursor-pointer" style={{ transform: 'translateY(0)' }} onClick={onShowDetail}>
            <div className="relative max-w-lg mx-auto">
                <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="absolute top-0 right-0 bg-gray-200/80 rounded-full p-1.5 z-10 flex items-center justify-center"><span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span></button>
                {/* ✨ FIX: Replaced <img> with <Image /> for optimization */}
                <Image src={place.images?.[0] ?? 'https://via.placeholder.com/800x400.png?text=No+Image'} alt={place.name} className="w-full h-48 object-cover rounded-xl mb-4" width={800} height={400} />
                <h2 className="text-2xl font-bold text-theme-brown-darkest mb-2">{place.name}</h2>
                <p className="text-theme-brown-dark mb-4 text-sm leading-relaxed">{place.description}</p>
                <div className="border-t border-theme-brown-light pt-3">
                    <h3 className="font-bold text-theme-brown-darkest mb-3">예약 가능 공간</h3>
                    <div className="flex flex-wrap gap-2">
                        {place.spaces?.filter(space => !space.isReserved).map(space => (
                            <span key={space.name} className="bg-theme-brown-light text-theme-brown-darkest text-sm font-medium px-3 py-1 rounded-full">
                                {space.name}
                            </span>
                        ))}
                    </div>
                </div>
                <button className="w-full h-12 mt-6 rounded-lg bg-[var(--theme-brown-darkest)] text-white font-bold text-base transition-colors duration-200 hover:bg-[#3a3229]">이 공간 예약하기</button>
            </div>
        </div>
    );
}

function LocationDetailPage({ place, onClose }: { place: Location, onClose: () => void }) {
    const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const totalImages = place.images?.length || 0;
    
    const sortedSpaces = [...(place.spaces || [])].sort((a, b) => (a.isReserved ? 1 : 0) - (b.isReserved ? 1 : 0));

    const handlePrevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((prevIndex) => (prevIndex === 0 ? totalImages - 1 : prevIndex - 1));
    };
    const handleNextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((prevIndex) => (prevIndex === totalImages - 1 ? 0 : prevIndex + 1));
    };

    const statusInfo = {
        available: { text: '예약 가능', style: 'bg-blue-100 text-blue-800' },
        reservedByUser: { text: '예약중', style: 'bg-green-100 text-green-800' },
        unavailable: { text: '예약 불가', style: 'bg-red-100 text-red-800' },
    };
    const currentStatus = statusInfo[place.reservationStatus];
    
    let buttonText = '예약하기';
    let isButtonDisabled = false;

    if (place.reservationStatus === 'reservedByUser') {
        buttonText = '나의 예약';
    } else if (place.reservationStatus === 'unavailable') {
        buttonText = '예약 불가';
        isButtonDisabled = true;
    } else if (!selectedSpace) {
        buttonText = '예약할 공간을 선택하세요';
        isButtonDisabled = true;
    }
    
    const baseButtonClasses = "w-full h-12 rounded-lg text-white font-bold text-base transition-colors duration-200 flex items-center justify-center";
    const stateButtonClasses = isButtonDisabled
      ? 'bg-[var(--theme-brown-darkest)] opacity-40 cursor-not-allowed'
      : 'bg-[var(--theme-brown-darkest)] hover:bg-[#3a3229]';

    return (
        <div className="fixed inset-0 bg-white z-50 animate-slide-in">
            <header className="absolute top-0 left-0 right-0 flex items-center p-4 bg-white/80 backdrop-blur-sm z-10">
                <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><span className="material-symbols-outlined">arrow_back</span></button>
                <h1 className="text-lg font-bold ml-4 mr-auto">{place.name}</h1>
                <button className="p-2 rounded-full hover:bg-gray-200" aria-label="문의하기"><span className="material-symbols-outlined text-gray-700">call</span></button>
            </header>
            <main className="h-full overflow-y-auto pb-24">
                <div className="relative w-full h-80 overflow-hidden bg-gray-200">
                    {place.images?.map((imageUrl, index) => (
                        // ✨ FIX: Replaced <img> with <Image /> using fill layout
                        <Image key={index} src={imageUrl} alt={`${place.name} image ${index + 1}`}
                            fill
                            style={{ objectFit: 'cover' }}
                            className={`transition-opacity duration-500 ease-in-out ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}
                        />
                    ))}
                    {totalImages > 1 && (
                        <>
                            <button onClick={handlePrevImage} className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white w-8 h-8 flex items-center justify-center rounded-full z-5 transition-colors duration-200"><span className="material-symbols-outlined text-xl">chevron_left</span></button>
                            <button onClick={handleNextImage} className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white w-8 h-8 flex items-center justify-center rounded-full z-5 transition-colors duration-200"><span className="material-symbols-outlined text-xl">chevron_right</span></button>
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-5">
                                {place.images.map((_, index) => (
                                    <span key={index} className={`block w-2 h-2 rounded-full ${index === currentImageIndex ? 'bg-white' : 'bg-gray-400/70'}`}></span>
                                ))}
                            </div>
                        </>
                    )}
                </div>
                <div className="p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-3xl font-bold text-theme-brown-darkest">{place.name}</h2>
                        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${currentStatus.style}`}>{currentStatus.text}</span>
                    </div>
                    <div className="flex items-center gap-2 text-lg text-gray-600 mb-4">
                        <span className="material-symbols-outlined text-base">groups</span>
                        <span className="font-medium">{place.reservedSlots} / {place.totalSlots} 팀 예약 중</span>
                    </div>
                    <p className="text-theme-brown-dark leading-relaxed mb-8">{place.description}</p>
                    <div className="border-t border-theme-brown-light pt-6">
                        <div className="mb-8">
                            <h3 className="text-xl font-bold text-theme-brown-darkest mb-4">🚪 예약 공간</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {sortedSpaces.map(space => (
                                    <div
                                        key={space.name}
                                        className={`relative pt-1 ${!space.isReserved ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                                        onClick={() => !space.isReserved && setSelectedSpace(space)}
                                    >
                                        <div
                                            className={`
                                                p-2 w-full bg-white rounded-lg transition-all duration-200 border-2
                                                ${selectedSpace?.name === space.name
                                                    ? 'border-theme-brown-dark shadow-lg -translate-y-1'
                                                    : 'border-transparent'
                                                }
                                            `}
                                        >
                                            <div className={`relative overflow-hidden rounded-md ${space.isReserved ? 'filter blur-sm opacity-60' : ''}`}>
                                                {/* ✨ FIX: Replaced <img> with <Image /> */}
                                                <Image src={space.imageUrl} alt={space.name} className="w-full h-24 object-cover" width={200} height={96} />
                                            </div>
                                            <div className="pt-2">
                                                <p className="text-sm font-medium text-center text-theme-brown-darkest">{space.name}</p>
                                            </div>
                                        </div>
                                        {space.isReserved && (
                                            <div className="absolute inset-0 pt-1 flex items-center justify-center">
                                                <span className="bg-black/60 text-white text-xs font-bold py-1 px-3 rounded-full">예약 마감</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-theme-brown-darkest mb-4">🎨 아티스트 후기</h3>
                            <div className="space-y-6">
                                {place.reviews?.length > 0 ? (
                                    place.reviews.map((review, index) => (
                                        <div key={index} className="flex items-start gap-4">
                                            {/* ✨ FIX: Replaced <img> with <Image /> */}
                                            <Image src={review.artistImageUrl} alt={review.artistName} className="w-12 h-12 rounded-full object-cover" width={48} height={48} />
                                            <div>
                                                <p className="font-bold text-theme-brown-darkest">{review.artistName}</p>
                                                {/* ✨ FIX: Escaped quote entities */}
                                                <p className="text-theme-brown-dark mt-1">&ldquo;{review.comment}&rdquo;</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-theme-brown-dark">아직 등록된 후기가 없습니다.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <footer className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
               <Link href="/confirm-booking" passHref legacyBehavior>
                   <a className={isButtonDisabled ? 'pointer-events-none' : ''}>
                       <button className={`${baseButtonClasses} ${stateButtonClasses}`} disabled={isButtonDisabled}>
                           {buttonText}
                       </button>
                   </a>
               </Link>
            </footer>
            <style jsx>{`
                @keyframes slide-in-from-right { from { transform: translateX(100%); } to { transform: translateX(0); } }
                .animate-slide-in { animation: slide-in-from-right 0.3s ease-out; }
            `}</style>
        </div>
    );
}

// ✨ --- [신규] 로딩 스크린 컴포넌트 --- ✨
function LoadingScreen() {
    return (
        <div className="fixed inset-0 bg-theme-brown-lightest z-[9999] flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme-brown-dark"></div>
            <p className="mt-4 text-theme-brown-darkest font-semibold">지도를 불러오는 중...</p>
        </div>
    );
}


// --- 메인 페이지 컴포넌트 ---
export default function MapPage() {
    const { setNavVisible } = useBottomNav();
    const [isDetailPageVisible, setDetailPageVisible] = useState(false);
    const [isMapLoading, setMapLoading] = useState(true); // ✨ 1. 지도 로딩 상태 추가
    
    const filterButtons = ['작품 선택', '카페', '갤러리', '문화회관'];
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
        // ✨ FIX: 'any' 타입을 정의된 타입으로 변경
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
        window.kakao?.maps.load(() => {
            const onMapReady = (map: KakaoMap | null) => {
                if (map) {
                    loadMarkers(map);
                    setMapLoading(false); // ✨ 2. 마커 로딩 후 로딩 상태 변경
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
            {isMapLoading && <LoadingScreen />} {/* ✨ 3. 로딩 상태일 때 로딩 화면 렌더링 */}
            
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

            <div className={`page-container transition-opacity duration-500 ${isMapLoading ? 'opacity-0' : 'opacity-100'}`}>
                <div ref={mapContainer} className="background-map"></div>
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
                                <button className="w-full h-12 rounded-lg bg-[var(--theme-brown-darkest)] text-white font-bold text-base transition-colors duration-200 hover:bg-[#3a3229]">선택 완료</button>
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