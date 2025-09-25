'use client';

import React, { createContext, useContext, useRef, useState, useCallback, useMemo, ReactNode } from 'react';
import { locations, Location, Space } from '@/data/locations';
import { KakaoPlace, KakaoMap, KakaoLatLng, KakaoGeocoderResult, KakaoGeocoderStatus } from '@/types/kakao';

// --- 타입 정의 ---
export interface Artwork { id: number; title: string; artist: string; dimensions: string; price: number; imageUrl: string; }
export type { Location as LocationType, Space };

// --- 데이터 및 유틸 함수 ---
export const artworksData: Artwork[] = [
    { id: 1, title: 'Vibrance', artist: 'Alexia Ray', dimensions: '120cm x 80cm', price: 15, imageUrl: 'https://picsum.photos/id/1018/200/200' },
    { id: 2, title: 'Solitude', artist: 'Clara Monet', dimensions: '50cm x 70cm', price: 10, imageUrl: 'https://picsum.photos/id/1015/200/200' },
    { id: 3, title: 'The Vase', artist: 'Mark Chen', dimensions: '100cm x 100cm', price: 20, imageUrl: 'https://picsum.photos/id/1025/200/200' },
];
export const disabledDaysData = [28];
export const toYMD = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const isSameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
export const fmtKoreanDate = (d: Date) => `${d.getMonth() + 1}월 ${d.getDate()}일`;
export const getCalendarCells = (viewDate: Date) => {
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

interface MapContextType {
    mapInstance: React.RefObject<KakaoMap | null>;
    isMapLoading: boolean;
    locationInfo: { city: string };
    selectedPlace: Location | null;
    setSelectedPlace: React.Dispatch<React.SetStateAction<Location | null>>;
    initializeMap: (container: HTMLElement) => void;
    
    isDetailPageVisible: boolean;
    setDetailPageVisible: React.Dispatch<React.SetStateAction<boolean>>;
    isDatePickerOpen: boolean;
    setDatePickerOpen: React.Dispatch<React.SetStateAction<boolean>>;
    viewDate: Date;
    startDate: Date | null;
    endDate: Date | null;
    activeFilter: string;
    selectedArtwork: Artwork | null;
    setSelectedArtwork: React.Dispatch<React.SetStateAction<Artwork | null>>;
    isArtworkModalOpen: boolean;
    setArtworkModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isArtworkSelectorVisible: boolean;
    isSearchModalOpen: boolean;
    setSearchModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isOptionsMenuOpen: boolean;
    setOptionsMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
    parkingFilter: boolean;
    setParkingFilter: React.Dispatch<React.SetStateAction<boolean>>;
    cells: { date: Date; inMonth: boolean }[];
    hasRange: boolean;
    filterButtons: string[];
    headerLabel: string;
    
    handlePlaceSelect: (place: KakaoPlace) => void;
    gotoMonth: (offset: number) => void;
    isDisabled: (cell: Date) => boolean;
    onClickDay: (cell: Date) => void;
    getDayClass: (cell: Date, inMonth: boolean) => string;
    handleFilterClick: (label: string) => void;
}

const MapContext = createContext<MapContextType | null>(null);

export function MapProvider({ children }: { children: ReactNode }) {
    const mapInstance = useRef<KakaoMap | null>(null);
    const [isMapLoading, setMapLoading] = useState(true);
    const [locationInfo, setLocationInfo] = useState({ city: '위치 찾는 중...' });
    const [selectedPlace, setSelectedPlace] = useState<Location | null>(null);
    const isMapInitialized = useRef(false);

    // UI State
    const [isDetailPageVisible, setDetailPageVisible] = useState(false);
    const [isDatePickerOpen, setDatePickerOpen] = useState(false);
    const [viewDate, setViewDate] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [activeFilter, setActiveFilter] = useState('갤러리');
    const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(artworksData[0] || null);
    const [isArtworkModalOpen, setArtworkModalOpen] = useState(false);
    const [isArtworkSelectorVisible, setArtworkSelectorVisible] = useState(false);
    const [isSearchModalOpen, setSearchModalOpen] = useState(false);
    const [isOptionsMenuOpen, setOptionsMenuOpen] = useState(false);
    const [parkingFilter, setParkingFilter] = useState(false);

    // Derived State
    const filterButtons = ['작품 선택', '카페', '갤러리', '문화회관'];
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const cells = useMemo(() => getCalendarCells(viewDate), [viewDate]);
    const hasRange = useMemo(() => !!(startDate && endDate), [startDate, endDate]);
    const headerLabel = useMemo(() => `${year}년 ${month + 1}월`, [year, month]);

    const loadMarkers = useCallback((map: KakaoMap) => {
        const { kakao } = window;
        if (!kakao) return;
        locations.forEach((place) => {
            const placePosition = new kakao.maps.LatLng(place.lat, place.lng);
            const marker = new kakao.maps.Marker({ map, position: placePosition });
            const handleClick = () => {
                setSelectedPlace(place);
                map.setCenter(placePosition);
            };
            kakao.maps.event.addListener(marker, 'click', handleClick);
            const contentNode = document.createElement('div');
            contentNode.className = 'custom-overlay-style';
            contentNode.innerHTML = `<div class="font-bold">${place.name}</div><div style="color:${place.statusColor};" class="text-xs mt-0.5">${place.statusText}</div>`;
            contentNode.onclick = handleClick;
            new kakao.maps.CustomOverlay({ map, position: placePosition, content: contentNode, yAnchor: 2.2 });
        });
    }, []);

    const initializeMap = useCallback((container: HTMLElement) => {
        if (isMapInitialized.current || !window.kakao) return;
        isMapInitialized.current = true;
        
        window.kakao.maps.load(() => {
            const createAndSetupMap = (lat: number, lng: number) => {
                const map = new window.kakao.maps.Map(container, { center: new window.kakao.maps.LatLng(lat, lng), level: 5 });
                mapInstance.current = map;
                loadMarkers(map);
                const geocoder = new window.kakao.maps.services.Geocoder();
                const updateLocationInfo = (center: KakaoLatLng) => {
                    geocoder.coord2Address(center.getLng(), center.getLat(), (result: KakaoGeocoderResult, status: KakaoGeocoderStatus) => {
                        if (status === 'OK' && result[0]) setLocationInfo({ city: result[0].address.region_2depth_name });
                    });
                };
                updateLocationInfo(map.getCenter());
                window.kakao.maps.event.addListener(map, 'center_changed', () => updateLocationInfo(map.getCenter()));
                setMapLoading(false);
            };
            navigator.geolocation.getCurrentPosition(p => createAndSetupMap(p.coords.latitude, p.coords.longitude), () => createAndSetupMap(37.5665, 126.9780));
        });
    }, [loadMarkers]);
    
    const handlePlaceSelect = useCallback((place: KakaoPlace) => {
        const map = mapInstance.current;
        if (!map || !window.kakao) return;
        const coords = new window.kakao.maps.LatLng(Number(place.y), Number(place.x));
        map.setCenter(coords);
        map.setLevel(5);
        setLocationInfo({ city: place.place_name });
        setSearchModalOpen(false);
    }, []);

    const gotoMonth = useCallback((offset: number) => setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1)), []);
    const isDisabled = useCallback((cell: Date) => cell.getMonth() === month && disabledDaysData.includes(cell.getDate()), [month]);
    const onClickDay = useCallback((cell: Date) => {
        if (isDisabled(cell)) return;
        const c = toYMD(cell);
        if (!startDate || hasRange) { 
            setStartDate(c); 
            setEndDate(c); 
        } else { 
            if (c < startDate) {
                setEndDate(startDate);
                setStartDate(c);
            } else {
                setEndDate(c);
            }
        }
    }, [startDate, hasRange, isDisabled]);

    const getDayClass = useCallback((cell: Date, inMonth: boolean) => {
        if (isDisabled(cell)) return "date-picker-day date-picker-day-disabled";
        if (!inMonth) return "date-picker-day date-picker-day-muted";
        const isSelected = startDate && endDate && isSameDay(startDate, endDate) && isSameDay(cell, startDate);
        if (isSelected) return "date-picker-day date-picker-day-selected";
        const isStart = startDate && isSameDay(cell, startDate);
        const isEnd = endDate && isSameDay(cell, endDate);
        if(isStart && isEnd) return "date-picker-day date-picker-day-selected";
        if (isStart) return "date-picker-day date-picker-day-selected date-range-start";
        if (isEnd) return "date-picker-day date-picker-day-selected date-range-end";
        if (startDate && endDate && cell > startDate && cell < endDate) return "date-picker-day date-picker-day-in-range";
        return "date-picker-day";
    }, [startDate, endDate, isDisabled]);

    const handleFilterClick = useCallback((label: string) => {
        if (label === '작품 선택') {
            setArtworkSelectorVisible(p => !p);
        } else {
            setActiveFilter(label);
            setArtworkSelectorVisible(false);
        }
    }, []);

    const value = {
        mapInstance, isMapLoading, locationInfo, selectedPlace, setSelectedPlace, initializeMap,
        isDetailPageVisible, setDetailPageVisible, isDatePickerOpen, setDatePickerOpen, viewDate, startDate, endDate,
        activeFilter, selectedArtwork, setSelectedArtwork, isArtworkModalOpen, setArtworkModalOpen, isArtworkSelectorVisible,
        isSearchModalOpen, setSearchModalOpen, isOptionsMenuOpen, setOptionsMenuOpen, parkingFilter, setParkingFilter,
        cells, hasRange, filterButtons, headerLabel,
        handlePlaceSelect, gotoMonth, isDisabled, onClickDay, getDayClass, handleFilterClick,
    };

    return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
}

export function useMap(): MapContextType {
    const context = useContext(MapContext);
    if (!context) throw new Error('useMap must be used within a MapProvider');
    return context;
}
