'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Location, Space } from '../../../data/locations';

export default function LocationDetailPage({
  place,
  onClose,
}: {
  place: Location;
  onClose: () => void;
}) {
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const totalImages = place.images?.length || 0;

  const sortedSpaces = [...(place.spaces || [])].sort(
    (a, b) => (a.isReserved ? 1 : 0) - (b.isReserved ? 1 : 0)
  );

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? totalImages - 1 : prevIndex - 1
    );
  };
  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prevIndex) =>
      prevIndex === totalImages - 1 ? 0 : prevIndex + 1
    );
  };

  const statusInfo = {
    available: { text: '예약 가능', style: 'bg-blue-100 text-blue-800' },
    reservedByUser: { text: '예약중', style: 'bg-green-100 text-green-800' },
    unavailable: { text: '예약 불가', style: 'bg-red-100 text-red-800' },
  };
  const currentStatus = statusInfo[place.reservationStatus];

  let buttonText = '예약하기';
  let isButtonDisabled = false;

  if (place.reservationStatus === 'reservedByUser') {
    buttonText = '나의 예약';
  } else if (place.reservationStatus === 'unavailable') {
    buttonText = '예약 불가';
    isButtonDisabled = true;
  } else if (!selectedSpace) {
    buttonText = '예약할 공간을 선택하세요';
    isButtonDisabled = true;
  }

  const baseButtonClasses =
    'w-full h-12 rounded-lg text-white font-bold text-base transition-colors duration-200 flex items-center justify-center';
  const stateButtonClasses = isButtonDisabled
    ? 'bg-[var(--theme-brown-darkest)] opacity-40 cursor-not-allowed'
    : 'bg-[var(--theme-brown-darkest)] hover:bg-[#3a3229]';

  return (
    <div className="fixed inset-0 bg-white z-50 animate-slide-in">
      <header className="absolute top-0 left-0 right-0 flex items-center p-4 bg-white/80 backdrop-blur-sm z-10">
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold ml-4 mr-auto">{place.name}</h1>
        <button
          className="p-2 rounded-full hover:bg-gray-200"
          aria-label="문의하기"
        >
          <span className="material-symbols-outlined text-gray-700">call</span>
        </button>
      </header>
      <main className="h-full overflow-y-auto pb-24">
        <div className="relative w-full h-80 overflow-hidden bg-gray-200">
          {place.images?.map((imageUrl, index) => (
            <Image
              key={index}
              src={imageUrl}
              alt={`${place.name} image ${index + 1}`}
              fill
              style={{ objectFit: 'cover' }}
              className={`transition-opacity duration-500 ease-in-out ${
                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))}
          {totalImages > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white w-8 h-8 flex items-center justify-center rounded-full z-5 transition-colors duration-200"
              >
                <span className="material-symbols-outlined text-xl">
                  chevron_left
                </span>
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white w-8 h-8 flex items-center justify-center rounded-full z-5 transition-colors duration-200"
              >
                <span className="material-symbols-outlined text-xl">
                  chevron_right
                </span>
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-5">
                {place.images.map((_, index) => (
                  <span
                    key={index}
                    className={`block w-2 h-2 rounded-full ${
                      index === currentImageIndex ? 'bg-white' : 'bg-gray-400/70'
                    }`}
                  ></span>
                ))}
              </div>
            </>
          )}
        </div>
        <div className="p-5">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-3xl font-bold text-theme-brown-darkest">
              {place.name}
            </h2>
            <span
              className={`px-3 py-1 text-sm font-semibold rounded-full ${currentStatus.style}`}
            >
              {currentStatus.text}
            </span>
          </div>
          <div className="flex items-center gap-2 text-lg text-gray-600 mb-4">
            <span className="material-symbols-outlined text-base">groups</span>
            <span className="font-medium">
              {place.reservedSlots} / {place.totalSlots} 팀 예약 중
            </span>
          </div>
          <p className="text-theme-brown-dark leading-relaxed mb-8">
            {place.description}
          </p>
          <div className="border-t border-theme-brown-light pt-6">
            <div className="mb-8">
              <h3 className="text-xl font-bold text-theme-brown-darkest mb-4">
                🚪 예약 공간
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {sortedSpaces.map((space) => (
                  <div
                    key={space.name}
                    className={`relative pt-1 ${
                      !space.isReserved ? 'cursor-pointer' : 'cursor-not-allowed'
                    }`}
                    onClick={() => !space.isReserved && setSelectedSpace(space)}
                  >
                    <div
                      className={`
                                                p-2 w-full bg-white rounded-lg transition-all duration-200 border-2
                                                ${
                                                  selectedSpace?.name ===
                                                  space.name
                                                    ? 'border-theme-brown-dark shadow-lg -translate-y-1'
                                                    : 'border-transparent'
                                                }
                                            `}
                    >
                      <div
                        className={`relative overflow-hidden rounded-md ${
                          space.isReserved ? 'filter blur-sm opacity-60' : ''
                        }`}
                      >
                        <Image
                          src={space.imageUrl}
                          alt={space.name}
                          className="w-full h-24 object-cover"
                          width={200}
                          height={96}
                        />
                      </div>
                      <div className="pt-2">
                        <p className="text-sm font-medium text-center text-theme-brown-darkest">
                          {space.name}
                        </p>
                      </div>
                    </div>
                    {space.isReserved && (
                      <div className="absolute inset-0 pt-1 flex items-center justify-center">
                        <span className="bg-black/60 text-white text-xs font-bold py-1 px-3 rounded-full">
                          예약 마감
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-theme-brown-darkest mb-4">
                🎨 아티스트 후기
              </h3>
              <div className="space-y-6">
                {place.reviews?.length > 0 ? (
                  place.reviews.map((review, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <Image
                        src={review.artistImageUrl}
                        alt={review.artistName}
                        className="w-12 h-12 rounded-full object-cover"
                        width={48}
                        height={48}
                      />
                      <div>
                        <p className="font-bold text-theme-brown-darkest">
                          {review.artistName}
                        </p>
                        <p className="text-theme-brown-dark mt-1">
                          &ldquo;{review.comment}&rdquo;
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-theme-brown-dark">
                    아직 등록된 후기가 없습니다.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <footer className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
        <Link href="/confirm-booking" passHref legacyBehavior>
          <a className={isButtonDisabled ? 'pointer-events-none' : ''}>
            <button
              className={`${baseButtonClasses} ${stateButtonClasses}`}
              disabled={isButtonDisabled}
            >
              {buttonText}
            </button>
          </a>
        </Link>
      </footer>
      <style jsx>{`
        @keyframes slide-in-from-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in-from-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
