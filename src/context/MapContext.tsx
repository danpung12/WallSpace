'use client';

import React, { createContext, useContext, useRef, useState, useCallback } from 'react';
// locations 데이터의 경로가 올바른지 확인해주세요. (예: ../data/locations)
import { locations } from '@/data/locations'; 

// --- 타입 정의 ---
// 1. 컨텍스트가 공유할 값들의 타입을 정의합니다.
interface MapContextType {
    mapInstance: React.MutableRefObject<any | null>;
    isMapLoading: boolean;
    initializeMap: (container: HTMLElement, lat: number, lng: number) => void;
}

// 2. createContext를 호출할 때, 정의한 타입을 제네릭(<>)으로 전달합니다.
const MapContext = createContext<MapContextType | null>(null);

export function MapProvider({ children }: { children: React.ReactNode }) {
    const mapInstance = useRef(null);
    const [isMapLoading, setMapLoading] = useState(true);
    const isMapInitialized = useRef(false);

    const initializeMap = useCallback((container: HTMLElement, lat: number, lng: number) => {
        if (isMapInitialized.current || !window.kakao) {
            return;
        }
        isMapInitialized.current = true;

        window.kakao.maps.load(() => {
            const mapOption = {
                center: new window.kakao.maps.LatLng(lat, lng),
                level: 5,
            };
            const map = new window.kakao.maps.Map(container, mapOption);
            mapInstance.current = map;
            
            loadMarkers(map);

            setMapLoading(false);
        });
    }, []);

    const loadMarkers = (map: any) => {
        const { kakao } = window;
        if (!kakao || !map) return;

        locations.forEach((place) => {
            const placePosition = new kakao.maps.LatLng(place.lat, place.lng);
            
            const contentNode = document.createElement('div');
            contentNode.className = 'custom-overlay-style';
            contentNode.innerHTML = `<div class="font-bold">${place.name}</div><div style="color:${place.statusColor};" class="text-xs mt-0.5">${place.statusText}</div>`;
            
            // 페이지 상태와 관련된 클릭 이벤트는 MapPage 컴포넌트에서 직접 관리하는 것이 더 좋습니다.
            // 필요하다면 컨텍스트에 클릭된 장소를 저장하는 상태와 함수를 추가할 수 있습니다.
            
            new kakao.maps.CustomOverlay({ 
                map: map, 
                position: placePosition, 
                content: contentNode, 
                yAnchor: 2.2 
            });
        });
    };

    const value = {
        mapInstance,
        isMapLoading,
        initializeMap,
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
