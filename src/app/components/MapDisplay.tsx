'use client';

import React, { useEffect, useRef } from 'react';
import Script from 'next/script';
import { useMap } from '../../context/MapContext';

export default function MapDisplay() {
  const { initializeMap, mapInstance } = useMap();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Kakao Map SDK 스크립트가 로드되고, 지도 컨테이너 div가 렌더링되었을 때 지도를 초기화합니다.
    if (window.kakao && window.kakao.maps && mapContainerRef.current) {
      if (!mapInstance.current) { // 지도가 아직 초기화되지 않았다면
        initializeMap(mapContainerRef.current);
      }
    }
  }, [initializeMap, mapInstance]);

  // 이 컴포넌트가 다른 페이지로 이동했다가 다시 돌아왔을 때,
  // 이미 생성된 지도 인스턴스를 이 컨테이너에 다시 붙여주는 로직입니다.
  useEffect(() => {
    const map = mapInstance.current;
    if (map && mapContainerRef.current) {
        // 컨테이너에 이미 지도가 렌더링된 경우(자식 노드가 있는 경우) 추가 작업을 하지 않습니다.
        if (mapContainerRef.current.children.length > 0) {
            return;
        }

        const container = mapContainerRef.current;
        container.appendChild(map.getNode());
        map.relayout();
    }
  }, [mapInstance]);

  return (
    <>
      <Script
        src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&libraries=services&autoload=false`}
        strategy="afterInteractive"
        onLoad={() => {
          if (mapContainerRef.current) {
            window.kakao.maps.load(() => {
              if (!mapInstance.current) {
                initializeMap(mapContainerRef.current);
              }
            });
          }
        }}
      />
      <div
        id="map"
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 0,
        }}
      />
    </>
  );
}
