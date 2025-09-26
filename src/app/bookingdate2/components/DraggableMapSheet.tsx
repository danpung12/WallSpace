"use client";

import React, { useRef, useEffect, useState } from "react";

type LatLng = { lat: number; lng: number };

type DraggableMapSheetProps = {
  center: LatLng;
  bottomOffsetPx?: number;
  minHeight?: number;
  maxHeight?: number;
  initialHeightPx: number;
  onHeightChange?: (height: number) => void;
};

function loadScriptOnce(src: string, id: string) {
  return new Promise<void>((resolve, reject) => {
    if (document.getElementById(id)) return resolve();
    const s = document.createElement("script");
    s.id = id;
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Fail to load: ${src}`));
    document.head.appendChild(s);
  });
}

const DraggableMapSheet: React.FC<DraggableMapSheetProps> = ({
  center,
  bottomOffsetPx = 0,
  minHeight = 200,
  maxHeight = 500,
  initialHeightPx,
  onHeightChange,
}) => {
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any | null>(null);
  const [height, setHeight] = useState(initialHeightPx);
  const isDraggingRef = useRef(false);
  const dragStartYRef = useRef(0);
  const initialHeightRef = useRef(initialHeightPx);

  useEffect(() => {
    onHeightChange?.(height);
  }, [height, onHeightChange]);

  useEffect(() => {
    let canceled = false;
    (async () => {
      const appKey = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
      if (!appKey) {
        console.error("Kakao Map API key is not configured.");
        return;
      }

      await loadScriptOnce(
        `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false`,
        "kakao-map-sdk"
      );
      if (canceled) return;
      window.kakao?.maps.load(() => {
        if (!mapContainerRef.current || canceled) return;
        const init = new window.kakao!.maps.LatLng(center.lat, center.lng);
        const map = new window.kakao!.maps.Map(mapContainerRef.current, {
          center: init,
          level: 5,
        });
        new window.kakao!.maps.Marker({ map, position: init });
        mapRef.current = map;
      });
    })();
    return () => {
      canceled = true;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !window.kakao) return;
    const latlng = new window.kakao.maps.LatLng(center.lat, center.lng);
    map.setCenter(latlng);
    new window.kakao.maps.Marker({ map, position: latlng });
  }, [center.lat, center.lng]);

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    isDraggingRef.current = true;
    const y = "touches" in e ? e.touches[0].clientY : e.clientY;
    dragStartYRef.current = y;
    initialHeightRef.current = sheetRef.current?.clientHeight || height;
    document.body.style.userSelect = "none";
    document.body.style.cursor = "grabbing";
  };

  const handleDragMove = (e: MouseEvent | TouchEvent) => {
    if (!isDraggingRef.current) return;
    const y = "touches" in e ? e.touches[0].clientY : e.clientY;
    const deltaY = dragStartYRef.current - y;
    const newHeight = initialHeightRef.current + deltaY;

    if (newHeight >= minHeight && newHeight <= maxHeight) {
      setHeight(newHeight);
    }
  };

  const handleDragEnd = () => {
    isDraggingRef.current = false;
    document.body.style.userSelect = "";
    document.body.style.cursor = "";
  };
  
  useEffect(() => {
    window.addEventListener("mousemove", handleDragMove);
    window.addEventListener("touchmove", handleDragMove);
    window.addEventListener("mouseup", handleDragEnd);
    window.addEventListener("touchend", handleDragEnd);

    return () => {
      window.removeEventListener("mousemove", handleDragMove);
      window.removeEventListener("touchmove", handleDragMove);
      window.removeEventListener("mouseup", handleDragEnd);
      window.removeEventListener("touchend", handleDragEnd);
    };
  }, []);


  return (
    <div
      ref={sheetRef}
      className="fixed left-0 right-0 w-full max-w-md mx-auto bg-white shadow-lg rounded-t-2xl z-50"
      style={{
        height: `${height}px`,
        bottom: `${bottomOffsetPx}px`,
        touchAction: "none",
      }}
    >
      <div
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        className="w-full h-6 flex justify-center items-center cursor-grab touch-none"
      >
        <div className="w-10 h-1 bg-gray-300 rounded-full" />
      </div>
      <div ref={mapContainerRef} className="w-full h-full" style={{height: "calc(100% - 24px)"}} />
    </div>
  );
};

export default DraggableMapSheet;
