// src/types/kakao.d.ts

declare global {
  interface Window {
    kakao: {
      maps: {
        load(callback: () => void): void;
        Map: new (container: HTMLElement, options: any) => any;
        LatLng: new (lat: number, lng: number) => any;
        Marker: new (options: any) => any;
        services: {
          Geocoder: new () => {
            coord2Address(lng: number, lat: number, callback: (result: any, status: any) => void): void;
          };
          Status: {
            OK: string;
          };
        };
      };
    };
  }
}

// 이 파일에는 export {}; 를 추가하지 마세요. 전역 선언 파일입니다.