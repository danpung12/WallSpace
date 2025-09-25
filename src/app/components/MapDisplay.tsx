'use client';

import React, { useEffect, useRef } from 'react';
import Script from 'next/script';
import { useMap } from '../../context/MapContext';

// kakao 타입 정의 (전역으로 존재한다고 가정하거나, 필요에 따라 이곳에서 정의)
declare global {
  interface Window {
    kakao: any;
  }
}

interface MapDisplayProps {
  initialLat?: number; // 초기 위도
  initialLng?: number; // 초기 경도
  onMapReady?: (map: any) => void; // 지도 로딩 완료 시 콜백
}

export default function MapDisplay({
  initialLat = 37.5665,
  initialLng = 126.9780,
  onMapReady,
}: MapDisplayProps) {
  const { initializeMap, isMapLoading, getMapInstance, error } = useMap(); // error 상태 가져옴
  const mapContainerRef = useRef<HTMLDivElement | null>(null); // MapDisplay 내부에서 mapContainerRef 직접 관리

  useEffect(() => {
    if (typeof window !== 'undefined' && window.kakao && mapContainerRef.current) {
      const map = getMapInstance();
      if (!map) {
        console.log("MapDisplay: Initializing map for the first time.");
        initializeMap(mapContainerRef.current, initialLat, initialLng); // MapContext의 initializeMap 호출 시 container 인자 전달
      }
    } else {
      console.log("MapDisplay: Waiting for Kakao API or map container.", { kakao: !!window.kakao, container: !!mapContainerRef.current });
    }

    // 지도가 다시 보여질 때 relayout() 호출
    const map = getMapInstance();
    if (map && mapContainerRef.current) {
      console.log("MapDisplay: Map instance exists, attempting relayout.");
      map.relayout();
      // 필요한 경우 setCenter 등을 호출하여 지도의 중심을 재조정할 수 있습니다.
    }
  }, [initialLat, initialLng, initializeMap, getMapInstance, mapContainerRef.current]);

  useEffect(() => {
    if (!isMapLoading && mapContainerRef.current) {
      console.log("Map is loaded and ready. Invoking onMapReady callback.");
      onMapReady?.(getMapInstance()); // getMapInstance()를 통해 인스턴스 전달
    }
  }, [isMapLoading, onMapReady, mapContainerRef.current]);

  return (
    <>
      <Script
        src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&libraries=services&autoload=false`}
        strategy="afterInteractive"
        onLoad={() => {
          console.log("Kakao map script loaded. Attempting initialization...");
          // 스크립트 로드 후, 지도가 초기화되지 않았다면 initializeMap 호출 (MapContext에서 isMapInitialized 검사)
          // MapDisplay의 useEffect에서 처리하므로 여기서 직접 호출은 피합니다.
          // 대신, Kakao API 로드 후 MapDisplay가 다시 렌더링되면서 useEffect가 트리거되도록 합니다.
        }}
      />
      {/* MapContainerRef를 MapContext에서 가져오므로, 여기에서 직접 컨테이너를 렌더링합니다. */}
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 0,
        }}
      >
        {isMapLoading && !error && ( // 로딩 중이고 에러가 없을 때만 스피너 표시
          <div className="w-full h-full bg-theme-brown-lightest flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme-brown-dark"></div>
            {/* <p className="mt-4 text-theme-brown-darkest font-semibold">지도를 불러오는 중...</p> */}
          </div>
        )}
        {!isMapLoading && error && ( // 로딩 완료되었지만 에러가 있을 때 오류 메시지 표시
          <div className="w-full h-full bg-red-100 flex flex-col items-center justify-center text-red-700 p-4 text-center">
            <span className="material-symbols-outlined text-5xl mb-3">error</span>
            <p className="font-semibold text-lg">지도 로딩 오류</p>
            <p className="text-sm">{error}</p>
            <p className="text-xs mt-2">콘솔을 확인하여 상세 오류를 확인해주세요.</p>
          </div>
        )}
      </div>
    </>
  );
}

// NOTE: `LoadingScreen` 컴포넌트는 필요에 따라 MapDisplay 내부에 포함하거나 외부에서 정의할 수 있습니다.
// 현재는 MapDisplay 내부에 로딩 스크린을 직접 포함하는 형태로 구현했습니다.

// 필요한 경우 MapDisplayProps에 다른 카카오 맵 관련 옵션을 추가할 수 있습니다.
// 예를 들어, 마커 클릭 이벤트 핸들러 등을 props로 받아 MapDisplay 내부에서 처리할 수 있습니다.

// 이 컴포넌트가 재사용 가능하도록 디자인되었습니다. 다른 페이지에서도 지도가 필요할 때 이 컴포넌트를 사용하고 MapProvider로 감싸면 됩니다.
