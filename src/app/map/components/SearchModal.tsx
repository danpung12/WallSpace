'use client';

import { useState, useEffect } from 'react';

// --- 타입 선언 ---
type KakaoGeocoderStatus = 'OK' | 'ZERO_RESULT' | 'ERROR';
type KakaoPlace = {
  id: string;
  place_name: string;
  address_name: string;
  road_address_name: string;
  x: string;
  y: string;
};

declare global {
  interface Window {
    kakao: any;
  }
}

export default function SearchModal({
  isOpen,
  onClose,
  onPlaceSelect,
}: {
  isOpen: boolean;
  onClose: () => void;
  onPlaceSelect: (place: KakaoPlace) => void;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<KakaoPlace[]>([]);
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);
  useEffect(() => {
    if (query.trim() === '') {
      setResults([]);
      return;
    }
    const handler = setTimeout(() => {
      if (window.kakao?.maps.services) {
        new window.kakao.maps.services.Places().keywordSearch(
          query,
          (data: KakaoPlace[], status: KakaoGeocoderStatus) => {
            if (status === window.kakao.maps.services.Status.OK)
              setResults(data);
            else setResults([]);
          }
        );
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [query]);
  if (!isOpen) return null;
  return (
    <div className="date-picker-modal-overlay" onClick={onClose}>
      <div
        className="date-picker-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="date-picker-modal-header">
          장소 검색
          <button className="close-btn" onClick={onClose}>
            <svg
              height="24"
              width="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </header>
        <main className="date-picker-modal-body">
          <div className="p-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="장소, 주소, 지하철역 등으로 검색"
              className="w-full p-3 border border-theme-brown-medium rounded-lg focus:ring-2 focus:ring-theme-brown-dark focus:outline-none"
              autoFocus
            />
          </div>
          <ul className="mt-2 h-80 overflow-y-auto">
            {results.length > 0 ? (
              results.map((place) => (
                <li
                  key={place.id}
                  onClick={() => onPlaceSelect(place)}
                  className="p-4 border-b border-theme-brown-light hover:bg-theme-brown-light cursor-pointer"
                >
                  <p className="font-bold text-theme-brown-darkest">
                    {place.place_name}
                  </p>
                  <p className="text-sm text-theme-brown-dark">
                    {place.road_address_name || place.address_name}
                  </p>
                </li>
              ))
            ) : (
              query.trim() && (
                <li className="p-4 text-center text-theme-brown-dark">
                  검색 결과가 없습니다.
                </li>
              )
            )}
          </ul>
        </main>
      </div>
    </div>
  );
}
