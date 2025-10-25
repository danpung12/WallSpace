'use client';

import Image from 'next/image';
import { Location } from '../../../data/locations';

export default function PlaceDetailPanel({
  place,
  onClose,
  onShowDetail,
}: {
  place: Location;
  onClose: () => void;
  onShowDetail: () => void;
}) {
  if (!place) return null;
  return (
    <div
      className="fixed bottom-0 left-0 right-0 lg:left-6 lg:bottom-6 lg:right-auto bg-white rounded-t-2xl lg:rounded-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)] lg:shadow-2xl p-4 transition-transform duration-300 ease-in-out z-40 cursor-pointer lg:w-[480px] lg:min-w-[420px]"
      style={{ transform: 'translateY(0)' }}
      onClick={onShowDetail}
    >
      <div className="relative max-w-lg mx-auto lg:mx-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-0 right-0 bg-gray-200/80 rounded-full p-1.5 z-10 flex items-center justify-center"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
            close
          </span>
        </button>
        <Image
          src={place.images?.[0] ?? 'https://via.placeholder.com/800x400.png?text=No+Image'}
          alt={place.name}
          className="w-full h-48 object-cover rounded-xl mb-4"
          width={800}
          height={400}
        />
        <div className="flex items-baseline gap-2 mb-1">
          <h2 className="text-2xl font-bold text-theme-brown-darkest">
            {place.name}
          </h2>
          <span className="font-medium text-theme-brown-dark">{typeof place.category === 'string' ? place.category : place.category?.name || '기타'}</span>
        </div>

        <div className="flex items-center gap-3 text-sm text-theme-brown-dark mb-3 flex-wrap">
          {place.options?.parking && (
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>local_parking</span>
              <span className="font-medium">주차</span>
            </div>
          )}
          {place.options?.pets && (
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>pets</span>
              <span className="font-medium">반려동물</span>
            </div>
          )}
          {place.options?.twentyFourHours && (
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>schedule</span>
              <span className="font-medium">24시간</span>
            </div>
          )}
        </div>

        <div className="flex items-start gap-1.5 text-sm text-theme-brown-dark mb-3">
          <span className="material-symbols-outlined mt-px" style={{ fontSize: '18px' }}>location_on</span>
          <span className="truncate">{place.address}</span>
        </div>
        
        <p className="text-theme-brown-dark mb-4 text-sm leading-relaxed truncate">
          {place.description}
        </p>
        <div className="border-t border-theme-brown-light pt-3 hidden lg:block">
          <h3 className="font-bold text-theme-brown-darkest mb-3">
            예약 가능 공간
          </h3>
          <div className="flex flex-wrap gap-2">
            {place.spaces
              ?.filter((space) => !space.isReserved)
              .map((space) => (
                <span
                  key={space.name}
                  className="bg-theme-brown-light text-theme-brown-darkest text-sm font-medium px-3 py-1 rounded-full"
                >
                  {space.name}
                </span>
              ))}
          </div>
        </div>
        <button className="w-full h-12 mt-4 rounded-lg bg-[var(--theme-brown-darkest)] text-white font-bold text-base transition-colors duration-200 hover:bg-[#3a3229]">
          이 공간 예약하기
        </button>
      </div>
    </div>
  );
}
