// src/types/kakao.d.ts

// ✅ Kakao Map SDK에서 사용하는 타입들을 정의합니다.
type KakaoLatLng = {
  getLat: () => number;
  getLng: () => number;
};

type KakaoMap = {
  setCenter: (latlng: KakaoLatLng) => void;
};

type KakaoMarker = {
  setMap: (map: KakaoMap | null) => void;
};

type KakaoCustomOverlay = {
    setMap: (map: KakaoMap | null) => void;
}

type KakaoGeocoderResult = {
  address: {
    region_1depth_name: string;
    region_2depth_name: string;
  };
}[];

type KakaoPlace = { 
  id: string; 
  place_name: string; 
  address_name: string; 
  road_address_name: string; 
  x: string; 
  y: string; 
};

type KakaoGeocoderStatus = 'OK' | 'ZERO_RESULT' | 'ERROR';


// ✅ 위에서 정의한 타입들을 사용하여 전역 window.kakao 객체를 선언합니다.
declare global {
  interface Window {
    kakao: {
      maps: {
        load(callback: () => void): void;
        Map: new (
          container: HTMLElement,
          options: { center: KakaoLatLng; level: number }
        ) => KakaoMap;
        LatLng: new (lat: number, lng: number) => KakaoLatLng;
        Marker: new (options: { map?: KakaoMap | null, position: KakaoLatLng }) => KakaoMarker;
        CustomOverlay: new (options: { map?: KakaoMap | null; position: KakaoLatLng; content: HTMLElement | string; yAnchor?: number; }) => KakaoCustomOverlay;
        services: {
          Geocoder: new () => {
            coord2Address: (
              lng: number,
              lat: number,
              callback: (result: KakaoGeocoderResult, status: KakaoGeocoderStatus) => void
            ) => void;
          };
          Places: new () => {
            keywordSearch: (
              keyword: string,
              callback: (data: KakaoPlace[], status: KakaoGeocoderStatus) => void
            ) => void;
          };
          Status: {
            OK: 'OK';
            ZERO_RESULT: 'ZERO_RESULT';
            ERROR: 'ERROR';
          };
        };
        event: {
          addListener: (target: any, eventType: string, handler: (...args: any[]) => void) => void;
          removeListener: (target: any, eventType: string, handler: (...args: any[]) => void) => void;
        };
      };
    };
  }
}

// TypeScript가 이 파일을 모듈이 아닌 전역 스크립트로 인식하도록 빈 export를 추가합니다.
export {};