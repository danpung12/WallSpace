'use client';

import React, { createContext, useContext, useRef, useState, useCallback } from 'react';
// locations 데이터의 경로가 올바른지 확인해주세요. (예: ../data/locations)
import { locations, Location as LocationType } from '@/data/locations'; 

// --- 타입 정의 ---
// 1. 컨텍스트가 공유할 값들의 타입을 정의합니다.
interface MapContextType {
    mapInstance: React.MutableRefObject<any | null>;
    isMapLoading: boolean;
    initializeMap: (container: HTMLElement, lat: number, lng: number) => void; // container 인자 추가
    loadMarkers: (map: any, onMarkerClick?: (place: LocationType) => void) => void; // onMarkerClick 인자 추가
    locationInfo: { city: string }; // 위치 정보 추가
    setLocationInfo: React.Dispatch<React.SetStateAction<{ city: string }>>; // 위치 정보 세터 추가
    getMapInstance: () => any | null; // 지도 인스턴스를 반환하는 함수 추가
    error: string | null; // 지도 초기화 및 로딩 중 발생한 오류 메시지
    onMarkerClick?: (place: LocationType) => void; // 마커 클릭 시 호출될 콜백 추가
}

// 2. createContext를 호출할 때, 정의한 타입을 제네릭(<>)으로 전달합니다.
const MapContext = createContext<MapContextType | null>(null);

export function MapProvider({ children, onMarkerClick }: { children: React.ReactNode, onMarkerClick?: (place: LocationType) => void }) {
    const mapInstance = useRef<any | null>(null); // 명시적 타입 지정
    const mapContainerRef = useRef<HTMLDivElement | null>(null); // 지도 컨테이너 ref (MapDisplay에서 소유하므로 실제 사용은 MapDisplay에서)
    const [isMapLoading, setMapLoading] = useState(true);
    const [locationInfo, setLocationInfo] = useState({ city: '위치 찾는 중...' }); // locationInfo 상태 추가
    const [error, setError] = useState<string | null>(null); // 오류 상태 추가
    const isMapInitialized = useRef(false); // MapDisplay에서 지도가 최초로 마운트될 때 initializeMap 호출을 제어
 
    // loadMarkers 함수를 initializeMap보다 먼저 정의합니다.
    const loadMarkers = useCallback((map: any, markerClickHandler?: (place: LocationType) => void) => {
        const { kakao } = window;
        if (!kakao || !map) return;
 
        locations.forEach((place) => {
            const placePosition = new kakao.maps.LatLng(place.lat, place.lng);

            // 마커 생성
            const marker = new kakao.maps.Marker({
                map: map,
                position: placePosition
            });

            // 마커 클릭 이벤트 리스너 추가
            if (markerClickHandler) {
                kakao.maps.event.addListener(marker, 'click', () => {
                    markerClickHandler(place);
                });
            }

            // 커스텀 오버레이 생성 (마커 위에 표시될 정보창)
            const contentNode = document.createElement('div');
            contentNode.className = 'custom-overlay-style';
            contentNode.innerHTML = `<div class="font-bold">${place.name}</div><div style="color:${place.statusColor};" class="text-xs mt-0.5">${place.statusText}</div>`;

            // 커스텀 오버레이에도 클릭 이벤트 리스너 추가 (옵션)
            // contentNode.addEventListener('click', () => {
            //     onMarkerClick?.(place);
            // });

            new kakao.maps.CustomOverlay({ 
                map: map, 
                position: placePosition, 
                content: contentNode, 
                yAnchor: 2.2 
            });
        });
    }, []); // markerClickHandler는 인자로 받으므로 의존성 배열에서 제거합니다.

    const initializeMap = useCallback((container: HTMLElement, lat: number, lng: number) => {
        console.log("MapContext: initializeMap called.", { isMapInitialized: isMapInitialized.current, windowKakao: !!window.kakao, containerExists: !!container });
        if (isMapInitialized.current || !window.kakao || !container) {
            console.log("MapContext: Skipping initialization - already initialized, Kakao API not loaded, or container not ready.");
            return;
        }
        isMapInitialized.current = true; // 최초 초기화 플래그 설정
        setMapLoading(true);
        setError(null); // 새로운 초기화 시도 시 이전 오류 초기화
 
        console.log("MapContext: Calling window.kakao.maps.load()...");
        window.kakao.maps.load(() => { // onMarkerClick을 initializeMap에 전달
            console.log("MapContext: window.kakao.maps.load() callback fired.");
            const geocoder = new window.kakao.maps.services.Geocoder();

            const updateLocationInfoFromMapCenter = (currentMap: any) => {
                const center = currentMap.getCenter();
                geocoder.coord2Address(center.getLng(), center.getLat(), (result: any, status: any) => {
                    console.log("MapContext: coord2Address result:", { status, result });
                    if (status === window.kakao.maps.services.Status.OK) {
                        setLocationInfo({ city: result[0].address.region_2depth_name || result[0].address.region_1depth_name });
                    } else { setLocationInfo({ city: "주소 정보 없음" }); }
                });
            };

            // 지도 생성 및 설정 로직을 함수로 분리
            const createAndSetupMap = (mapLat: number, mapLng: number) => {
                try {
                    console.log("MapContext: Attempting to create new Kakao Map instance with container:", container);
                    const map = new window.kakao.maps.Map(container, {
                        center: new window.kakao.maps.LatLng(mapLat, mapLng),
                        level: 5,
                    });
                    mapInstance.current = map;
                    console.log("MapContext: Map instance created:", mapInstance.current);

                    loadMarkers(map, onMarkerClick);
                    console.log("MapContext: Markers loaded.");

                    updateLocationInfoFromMapCenter(map); // 초기 로드 시 현재 중심 위치 반영
                    console.log("MapContext: Initial location info updated.");

                    window.kakao.maps.event.addListener(map, 'center_changed', () => {
                        console.log("MapContext: Map center_changed event fired.");
                        updateLocationInfoFromMapCenter(map);
                    });
                    console.log("MapContext: center_changed listener added.");

                    setMapLoading(false);
                    console.log("MapContext: Map loading set to false.");
                } catch (mapError: any) {
                    setError(`지도 생성 오류: ${mapError.message || mapError}`);
                    console.error("MapContext: Error creating map:", mapError);
                    setMapLoading(false);
                }
            };

            navigator.geolocation?.getCurrentPosition(
                (position) => {
                    console.log("MapContext: Geolocation success.", { coords: position.coords });
                    createAndSetupMap(position.coords.latitude, position.coords.longitude);
                },
                (geoError) => {
                    console.warn("MapContext: Geolocation failed, falling back to default.", geoError);
                    setError(`위치 정보 동의 필요: ${geoError.message || geoError}`); // Optional: show geolocation error
                    createAndSetupMap(lat, lng); // Fallback to initialLat, initialLng
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 } // Add timeout for geolocation
            );
        });
    }, [setLocationInfo, loadMarkers, onMarkerClick]); // setLocationInfo와 loadMarkers를 의존성 배열에 추가합니다.

    const getMapInstance = useCallback(() => mapInstance.current, []); // 지도 인스턴스를 반환하는 함수

    const value = {
        mapInstance,
        isMapLoading,
        initializeMap,
        loadMarkers, // loadMarkers 함수도 컨텍스트에 추가
        locationInfo,
        setLocationInfo,
        getMapInstance, // getMapInstance 함수를 컨텍스트에 추가
        error, // 오류 상태 추가
        onMarkerClick, // onMarkerClick도 context value에 포함
    };

    return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
}

export function useMap(): MapContextType {
    const context = useContext(MapContext);
    if (!context) {
        throw new Error('useMap must be used within a MapProvider');
    }
    return context;
}
