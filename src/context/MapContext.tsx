'use client';

import React, { createContext, useContext, useRef, useState, useCallback, useMemo, ReactNode, useEffect } from 'react';
import { KakaoPlace, KakaoMap, KakaoLatLng, KakaoGeocoderResult, KakaoGeocoderStatus } from '@/types/kakao';
import { LocationDetail, Space, Artwork } from '@/types/database';
import { getLocations, getSpaces } from '@/lib/api/locations';
import { getUserArtworks } from '@/lib/api/artworks';
import { useApi, mutate } from '@/lib/swr';

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
    moveToCurrentLocation: () => void;
    
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
    const currentLocationMarkerRef = useRef<any>(null); // Ref to store current location marker
    const userLocationRef = useRef<{ lat: number; lng: number } | null>(null); // Store user location
    const [isMapLoading, setMapLoading] = useState(true);
    const [locationInfo, setLocationInfo] = useState({ city: '위치 찾는 중...' });
    const [selectedPlace, setSelectedPlace] = useState<LocationDetail | null>(null);
    const isMapInitialized = useRef(false);
    
    // Supabase 데이터 상태
    const [locations, setLocations] = useState<LocationDetail[]>([]);
    const [artworks, setArtworks] = useState<Artwork[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
    
    // 예약 가능 여부를 추적하는 Map (location_id -> boolean)
    const [locationAvailability, setLocationAvailability] = useState<Map<string, boolean>>(new Map());

    // SWR로 locations 데이터 가져오기 (캐시 우선, 백그라운드 업데이트)
    const { data: locationsData, error: locationsError, isLoading: locationsLoading } = useApi<LocationDetail[]>('/api/locations', {
        revalidateOnFocus: false, // 포커스 시 자동 재검증 비활성화
        revalidateIfStale: true, // 오래된 데이터가 있으면 백그라운드에서 재검증
        dedupingInterval: 5000, // 5초 내 중복 요청 방지
        keepPreviousData: true, // 데이터 변경 시 이전 데이터 유지 (깜빡임 방지)
        onError: (err) => {
            console.error('❌ Error loading locations:', err);
            setError('데이터를 불러오는 중 오류가 발생했습니다.');
        },
    });

    // 사용자 작품 가져오기 (로그인하지 않은 경우 빈 배열)
    const { data: artworksData } = useApi<Artwork[]>('/api/artworks', {
        revalidateOnFocus: false,
        revalidateIfStale: true,
        dedupingInterval: 5000,
        keepPreviousData: true,
    });

    // 데이터 설정
    useEffect(() => {
        if (locationsData) {
            console.log('✅ Locations loaded:', locationsData.length);
            setLocations(locationsData);
        }
        if (locationsError) {
            setError('데이터를 불러오는 중 오류가 발생했습니다.');
        }
        setLoading(locationsLoading);
    }, [locationsData, locationsError, locationsLoading]);

    useEffect(() => {
        if (artworksData) {
            setArtworks(artworksData);
            // 첫 번째 작품을 기본 선택으로 설정
            if (artworksData.length > 0 && !selectedArtwork) {
                setSelectedArtwork(artworksData[0]);
            }
        }
    }, [artworksData, selectedArtwork]);

    // Derived State
    const filterButtons = ['작품 선택', '카페', '갤러리', '문화회관'];
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const cells = useMemo(() => getCalendarCells(viewDate), [viewDate]);
    const hasRange = useMemo(() => !!(startDate && endDate), [startDate, endDate]);
    const headerLabel = useMemo(() => `${year}년 ${month + 1}월`, [year, month]);

    // 날짜가 선택되었을 때 각 location의 예약 가능 여부 체크
    useEffect(() => {
        const checkAvailability = async () => {
            if (!startDate || !endDate || locations.length === 0) {
                setLocationAvailability(new Map());
                return;
            }

            const availabilityMap = new Map<string, boolean>();
            const startStr = startDate.toISOString().split('T')[0];
            const endStr = endDate.toISOString().split('T')[0];

            for (const location of locations) {
                try {
                    // location 객체에 이미 spaces 정보가 포함되어 있음
                    const spaces = (location as any).spaces || [];
                    
                    // spaces가 없으면 예약 가능으로 표시
                    if (spaces.length === 0) {
                        availabilityMap.set(location.id, true);
                        continue;
                    }
                    
                    // 각 space의 예약 가능 여부 체크
                    let hasAvailableSpace = false;
                    
                    for (const space of spaces) {
                        const bookingsResponse = await fetch(`/api/reservations?space_id=${space.id}`);
                        if (!bookingsResponse.ok) continue;
                        
                        const bookings = await bookingsResponse.json();
                        
                        // 선택한 날짜 범위와 겹치는 예약이 있는지 체크
                        const hasConflict = bookings.some((booking: any) => {
                            if (booking.status === 'cancelled') return false;
                            
                            const bookingStart = booking.start_date.split('T')[0];
                            const bookingEnd = booking.end_date.split('T')[0];
                            
                            // 날짜 범위가 겹치는지 체크
                            return !(endStr < bookingStart || startStr > bookingEnd);
                        });
                        
                        if (!hasConflict) {
                            hasAvailableSpace = true;
                            break; // 하나라도 예약 가능하면 OK
                        }
                    }
                    
                    availabilityMap.set(location.id, hasAvailableSpace);
                } catch (error) {
                    console.error(`Error checking availability for location ${location.id}:`, error);
                    availabilityMap.set(location.id, true); // 에러 시 기본적으로 예약 가능으로 표시
                }
            }
            
            setLocationAvailability(availabilityMap);
        };

        checkAvailability();
    }, [startDate, endDate, locations]);

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
        const hasDateRange = !!(startDate && endDate);

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
            
            // 날짜가 선택되었고 예약 불가인 경우
            const isAvailable = hasDateRange ? (locationAvailability.get(place.id) !== false) : true;
            const statusText = hasDateRange && !isAvailable ? '예약 불가' : (place.statusText || '예약 가능');
            const statusColor = hasDateRange && !isAvailable ? '#EF4444' : (place.statusColor || '#3B82F6');
            
            contentNode.innerHTML = `<div class="font-bold">${place.name}</div><div style="color:${statusColor};" class="text-xs mt-0.5">${statusText}</div>`;
            contentNode.onclick = handleClick;
            
            const overlay = new kakao.maps.CustomOverlay({ map, position: placePosition, content: contentNode, yAnchor: 2.2 });
            
            // Store marker and its associated data
            markersRef.current.push({ marker, overlay, place, isAvailable });
        });
    }, [locations, startDate, endDate, locationAvailability]);

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


    // 현재 위치 마커 생성 함수
    const createCurrentLocationMarker = useCallback((map: KakaoMap, lat: number, lng: number) => {
        const { kakao } = window;
        if (!kakao) return;

        // 기존 마커가 있다면 제거
        if (currentLocationMarkerRef.current) {
            currentLocationMarkerRef.current.setMap(null);
        }

        const position = new kakao.maps.LatLng(lat, lng);

        // 현재 위치 마커용 HTML 생성 (네이버 지도 스타일 - 더 크게)
        const content = document.createElement('div');
        content.style.cssText = `
            position: relative;
            width: 30px;
            height: 30px;
        `;
        
        // 외부 펄스 효과
        const pulse = document.createElement('div');
        pulse.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 60px;
            height: 60px;
            background: rgba(59, 130, 246, 0.3);
            border-radius: 50%;
            animation: pulse 2s ease-out infinite;
        `;
        
        // 내부 파란색 점
        const dot = document.createElement('div');
        dot.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 24px;
            height: 24px;
            background: #3B82F6;
            border: 4px solid white;
            border-radius: 50%;
            box-shadow: 0 3px 12px rgba(0, 0, 0, 0.4);
        `;
        
        content.appendChild(pulse);
        content.appendChild(dot);

        // CSS 애니메이션 추가
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0% {
                    transform: translate(-50%, -50%) scale(0.5);
                    opacity: 0.8;
                }
                100% {
                    transform: translate(-50%, -50%) scale(1.5);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);

        const customOverlay = new kakao.maps.CustomOverlay({
            map: map,
            position: position,
            content: content,
            zIndex: 100
        });

        currentLocationMarkerRef.current = customOverlay;
    }, []);

    const initializeMap = useCallback((container: HTMLElement) => {
        if (isMapInitialized.current || !window.kakao) return;
        isMapInitialized.current = true;
        
        window.kakao.maps.load(() => {
            const createAndSetupMap = (lat: number, lng: number, isUserLocation: boolean = false) => {
                const map = new window.kakao.maps.Map(container, { center: new window.kakao.maps.LatLng(lat, lng), level: 5 });
                mapInstance.current = map;
                loadMarkers(map);
                
                // 사용자 위치가 있는 경우 현재 위치 마커 표시 및 저장
                if (isUserLocation) {
                    userLocationRef.current = { lat, lng };
                    createCurrentLocationMarker(map, lat, lng);
                }
                
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
            navigator.geolocation.getCurrentPosition(
                p => createAndSetupMap(p.coords.latitude, p.coords.longitude, true), 
                () => createAndSetupMap(37.5665, 126.9780, false)
            );
        });
    }, [loadMarkers, createCurrentLocationMarker]);
    
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

    // 현재 위치로 이동하는 함수
    const moveToCurrentLocation = useCallback(() => {
        const map = mapInstance.current;
        if (!map || !window.kakao) return;
        
        if (userLocationRef.current) {
            // 저장된 사용자 위치로 이동
            const { lat, lng } = userLocationRef.current;
            const moveLatLon = new window.kakao.maps.LatLng(lat, lng);
            map.panTo(moveLatLon);
        } else {
            // 사용자 위치가 없으면 현재 위치를 다시 가져옴
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    userLocationRef.current = { lat: latitude, lng: longitude };
                    createCurrentLocationMarker(map, latitude, longitude);
                    const moveLatLon = new window.kakao.maps.LatLng(latitude, longitude);
                    map.panTo(moveLatLon);
                },
                (error) => {
                    console.error('Error getting current location:', error);
                    alert('현재 위치를 가져올 수 없습니다. 위치 권한을 확인해주세요.');
                }
            );
        }
    }, [createCurrentLocationMarker]);

    const value = {
        mapInstance, isMapLoading, locationInfo, selectedPlace, setSelectedPlace, initializeMap, moveToCurrentLocation,
        isDetailPageVisible, setDetailPageVisible, isDatePickerOpen, setDatePickerOpen, viewDate, startDate, endDate,
        activeFilter, selectedArtwork, setSelectedArtwork, isArtworkModalOpen, setArtworkModalOpen, isArtworkSelectorVisible,
        isSearchModalOpen, setSearchModalOpen, isOptionsMenuOpen, setOptionsMenuOpen, parkingFilter, setParkingFilter,
        open24HoursFilter, setOpen24HoursFilter, petsAllowedFilter, setPetsAllowedFilter,
        cells, hasRange, filterButtons, headerLabel,
        handlePlaceSelect, gotoMonth, isDisabled, onClickDay, getDayClass, handleFilterClick,
        // Supabase 데이터
        locations, artworks, loading, error,
        refreshLocations: async () => {
            // SWR 캐시 무효화 및 재검증
            await mutate('/api/locations');
            await mutate('/api/artworks');
        },
    };

    return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
}

export function useMap(): MapContextType {
    const context = useContext(MapContext);
    if (!context) throw new Error('useMap must be used within a MapProvider');
    return context;
}
