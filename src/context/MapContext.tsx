'use client';

import React, { createContext, useContext, useRef, useState, useCallback, useMemo, ReactNode, useEffect } from 'react';
import { KakaoPlace, KakaoMap, KakaoLatLng, KakaoGeocoderResult, KakaoGeocoderStatus } from '@/types/kakao';
import { LocationDetail, Space, Artwork } from '@/types/database';
import { getLocations, getSpaces } from '@/lib/api/locations';
import { getUserArtworks } from '@/lib/api/artworks';

// --- 타입 정의 ---
export type { LocationDetail as LocationType, Space, Artwork };

// --- 데이터 및 유틸 함수 ---
// artworksData는 이제 Supabase에서 가져옴
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
    selectedPlace: LocationDetail | null;
    setSelectedPlace: React.Dispatch<React.SetStateAction<LocationDetail | null>>;
    initializeMap: (container: HTMLElement) => void;
    
    // Supabase 데이터
    locations: LocationDetail[];
    artworks: Artwork[];
    loading: boolean;
    error: string | null;
    
    isDetailPageVisible: boolean;
    setDetailPageVisible: React.Dispatch<React.SetStateAction<boolean>>;
    isDatePickerOpen: boolean;
    setDatePickerOpen: React.Dispatch<React.SetStateAction<boolean>>;
    viewDate: Date;
    startDate: Date | null;
    endDate: Date | null;
    activeFilter: string | null;
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
    open24HoursFilter: boolean;
    setOpen24HoursFilter: React.Dispatch<React.SetStateAction<boolean>>;
    petsAllowedFilter: boolean;
    setPetsAllowedFilter: React.Dispatch<React.SetStateAction<boolean>>;
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
    refreshLocations: () => Promise<void>;
}

const MapContext = createContext<MapContextType | null>(null);

export function MapProvider({ children }: { children: ReactNode }) {
    const mapInstance = useRef<KakaoMap | null>(null);
    const markersRef = useRef<any[]>([]); // Ref to store markers
    const [isMapLoading, setMapLoading] = useState(true);
    const [locationInfo, setLocationInfo] = useState({ city: '위치 찾는 중...' });
    const [selectedPlace, setSelectedPlace] = useState<LocationDetail | null>(null);
    const isMapInitialized = useRef(false);
    
    // Supabase 데이터 상태
    const [locations, setLocations] = useState<LocationDetail[]>([]);
    const [artworks, setArtworks] = useState<Artwork[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const MAX_RETRY_COUNT = 3;

    // UI State
    const [isDetailPageVisible, setDetailPageVisible] = useState(false);
    const [isDatePickerOpen, setDatePickerOpen] = useState(false);
    const [viewDate, setViewDate] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [activeFilter, setActiveFilter] = useState<string | null>(null);
    const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
    const [isArtworkModalOpen, setArtworkModalOpen] = useState(false);
    const [isArtworkSelectorVisible, setArtworkSelectorVisible] = useState(false);
    const [isSearchModalOpen, setSearchModalOpen] = useState(false);
    const [isOptionsMenuOpen, setOptionsMenuOpen] = useState(false);
    const [parkingFilter, setParkingFilter] = useState(false);
    const [open24HoursFilter, setOpen24HoursFilter] = useState(false);
    const [petsAllowedFilter, setPetsAllowedFilter] = useState(false);

    // Supabase 데이터 로드 함수
    const loadData = useCallback(async (isRetry = false) => {
        try {
            if (isRetry) {
                console.log(`🔄 Retrying to load locations (attempt ${retryCount + 1}/${MAX_RETRY_COUNT})...`);
            } else {
                console.log('📍 Loading locations...');
            }
            setLoading(true);
            setError(null);
            
            // API routes를 통해 데이터 가져오기
            const locationsResponse = await fetch('/api/locations');
            
            if (!locationsResponse.ok) {
                throw new Error('Failed to fetch locations');
            }
            
            const locationsData = await locationsResponse.json();
            
            // 사용자 작품 가져오기 (로그인하지 않은 경우 빈 배열)
            let artworksData: Artwork[] = [];
            try {
                artworksData = await getUserArtworks();
                console.log('✅ User artworks loaded:', artworksData.length);
            } catch (artworkError) {
                console.log('ℹ️ No user artworks (user may not be logged in)');
            }
            
            console.log('✅ Locations loaded:', locationsData.length);
            setLocations(locationsData);
            setArtworks(artworksData);
            setRetryCount(0); // 성공하면 재시도 카운트 리셋
            
            // 첫 번째 작품을 기본 선택으로 설정
            if (artworksData.length > 0) {
                setSelectedArtwork(artworksData[0]);
            }
        } catch (err) {
            console.error('❌ Error loading data:', err);
            setError('데이터를 불러오는 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    }, [retryCount]);
    
    // 초기 로드
    useEffect(() => {
        loadData();
    }, [loadData]);

    // 자동 재시도 로직: locations가 비어있고 로딩이 완료된 경우
    useEffect(() => {
        if (!loading && locations.length === 0 && retryCount < MAX_RETRY_COUNT) {
            console.warn('⚠️ No locations found after loading. Will retry in 2 seconds...');
            const timer = setTimeout(() => {
                setRetryCount(prev => prev + 1);
                loadData(true);
            }, 2000); // 2초 후 재시도

            return () => clearTimeout(timer);
        } else if (!loading && locations.length === 0 && retryCount >= MAX_RETRY_COUNT) {
            console.error('❌ Max retry attempts reached. Failed to load locations.');
        } else if (!loading && locations.length > 0) {
            console.log(`✅ Successfully loaded ${locations.length} locations`);
        }
    }, [loading, locations.length, retryCount, loadData]);

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
        
        // Clear existing markers from ref
        markersRef.current.forEach(({ marker, overlay }) => {
            marker.setMap(null);
            overlay.setMap(null);
        });
        markersRef.current = [];

        if (locations.length === 0) {
            console.log('No locations to display on map');
            return;
        }

        console.log('Loading markers for locations:', locations.length);

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
            contentNode.innerHTML = `<div class="font-bold">${place.name}</div><div style="color:${place.statusColor || '#3B82F6'};" class="text-xs mt-0.5">${place.statusText || '예약 가능'}</div>`;
            contentNode.onclick = handleClick;
            
            const overlay = new kakao.maps.CustomOverlay({ map, position: placePosition, content: contentNode, yAnchor: 2.2 });
            
            // Store marker and its associated data
            markersRef.current.push({ marker, overlay, place });
        });
    }, [locations]);

    // Effect to reload markers when locations change
    useEffect(() => {
        const map = mapInstance.current;
        if (map && locations.length > 0 && !loading) {
            console.log('Reloading markers because locations changed');
            loadMarkers(map);
        }
    }, [locations, loading, loadMarkers]);

    // Effect to filter markers based on activeFilter or parkingFilter
    useEffect(() => {
        markersRef.current.forEach(({ marker, overlay, place }) => {
            const categoryName = typeof place.category === 'string' ? place.category : place.category?.name;
            const isCategoryMatch = !activeFilter || categoryName === activeFilter;
            const isParkingMatch = !parkingFilter || place.options?.parking;
            const isOpen24HoursMatch = !open24HoursFilter || place.options?.twentyFourHours;
            const arePetsAllowedMatch = !petsAllowedFilter || place.options?.pets;
            const isVisible =
              isCategoryMatch &&
              isParkingMatch &&
              isOpen24HoursMatch &&
              arePetsAllowedMatch;
            
            marker.setVisible(isVisible);
            overlay.setVisible(isVisible);
        });
    }, [activeFilter, parkingFilter, open24HoursFilter, petsAllowedFilter]);


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
    const isDisabled = useCallback((cell: Date) => {
        // 오늘 날짜 (시간 제외)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // cell 날짜 (시간 제외)
        const cellDate = new Date(cell);
        cellDate.setHours(0, 0, 0, 0);
        
        // 오늘 이전 날짜는 비활성화
        return cellDate < today;
    }, []);
    const onClickDay = useCallback((cell: Date) => {
        if (isDisabled(cell)) return;
        const c = toYMD(cell);
        if (!startDate || (startDate && endDate && !isSameDay(startDate, endDate))) { 
            // 시작일이 없거나, 이미 범위가 선택된 경우 -> 새로 시작
            setStartDate(c); 
            setEndDate(c); 
        } else { 
            // 시작일만 있는 경우 -> 종료일 설정
            if (c < startDate) {
                setEndDate(startDate);
                setStartDate(c);
            } else {
                setEndDate(c);
            }
        }
    }, [startDate, endDate, isDisabled]);

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
            // If the clicked filter is already active, deactivate it. Otherwise, activate it.
            setActiveFilter(prevFilter => (prevFilter === label ? null : label));
            setArtworkSelectorVisible(false);
        }
    }, []);

    const value = {
        mapInstance, isMapLoading, locationInfo, selectedPlace, setSelectedPlace, initializeMap,
        isDetailPageVisible, setDetailPageVisible, isDatePickerOpen, setDatePickerOpen, viewDate, startDate, endDate,
        activeFilter, selectedArtwork, setSelectedArtwork, isArtworkModalOpen, setArtworkModalOpen, isArtworkSelectorVisible,
        isSearchModalOpen, setSearchModalOpen, isOptionsMenuOpen, setOptionsMenuOpen, parkingFilter, setParkingFilter,
        open24HoursFilter, setOpen24HoursFilter, petsAllowedFilter, setPetsAllowedFilter,
        cells, hasRange, filterButtons, headerLabel,
        handlePlaceSelect, gotoMonth, isDisabled, onClickDay, getDayClass, handleFilterClick,
        // Supabase 데이터
        locations, artworks, loading, error,
        refreshLocations: loadData,
    };

    return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
}

export function useMap(): MapContextType {
    const context = useContext(MapContext);
    if (!context) throw new Error('useMap must be used within a MapProvider');
    return context;
}
