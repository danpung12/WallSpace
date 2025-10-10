
// src/types/kakao.d.ts

// ✅ any 대신 사용할 구체적인 타입들을 먼저 정의합니다.
type KakaoLatLng = {
  getLat: () => number;
  getLng: () => number;
};

type KakaoMap = {
  setCenter: (latlng: KakaoLatLng) => void;
  // 필요하다면 여기에 Map 객체의 다른 메서드들을 추가할 수 있습니다.
};

type KakaoMarker = {
  setMap: (map: KakaoMap | null) => void;
};

type KakaoGeocoderResult = {
  address: {
    region_1depth_name: string;
    region_2depth_name: string;
  };
}[];

type KakaoGeocoderStatus = 'OK' | 'ZERO_RESULT' | 'ERROR';


// ✅ 위에서 정의한 타입들을 사용하여 전역 타입을 선언합니다.
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
        services: {
          Geocoder: new () => {
            coord2Address: (
              lng: number,
              lat: number,
              callback: (result: KakaoGeocoderResult, status: KakaoGeocoderStatus) => void
            ) => void;
          };
          Status: {
            OK: string;
          };
        };
      };
    };
  }
}
