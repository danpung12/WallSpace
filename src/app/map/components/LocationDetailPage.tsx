'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Location, Space } from '../../../data/locations';
import BookingModalPC from './BookingModalPC'; // Import the new modal

export default function LocationDetailPage({
  place,
  onClose,
}: {
  place: Location;
  onClose: () => void;
}) {
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPcBookingModalOpen, setIsPcBookingModalOpen] = useState(false);
  const totalImages = place.images?.length || 0;

  const handleOpenPcBookingModal = () => {
    if (selectedSpace) {
      setIsPcBookingModalOpen(true);
    }
  };

  const handleClosePcBookingModal = () => {
    setIsPcBookingModalOpen(false);
    onClose(); // Close the detail page as well
  };

  const sortedSpaces = [...(place.spaces || [])].sort(
    (a, b) => (a.isReserved ? 1 : 0) - (b.isReserved ? 1 : 0),
  );

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? totalImages - 1 : prevIndex - 1,
    );
  };
  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prevIndex) =>
      prevIndex === totalImages - 1 ? 0 : prevIndex + 1,
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
  let bookingUrl = '/confirm-booking'; // Default URL

  if (place.reservationStatus === 'reservedByUser') {
    buttonText = '나의 예약';
    bookingUrl = '/bookingdetail'; // Link to user's booking detail page
  } else if (place.reservationStatus === 'unavailable') {
    buttonText = '예약 불가';
    isButtonDisabled = true;
  } else if (!selectedSpace) {
    buttonText = '예약할 공간을 선택하세요';
    isButtonDisabled = true;
  } else {
    // If a space is selected, generate the URL for the date selection page
    bookingUrl = `/bookingdate?placeId=${place.id}&spaceName=${encodeURIComponent(
      selectedSpace.name,
    )}`;
  }

  const baseButtonClasses =
    'w-full h-12 rounded-lg text-white font-bold text-base transition-colors duration-200 flex items-center justify-center';
  const stateButtonClasses = isButtonDisabled
    ? 'bg-[var(--theme-brown-darkest)] opacity-40 cursor-not-allowed'
    : 'bg-[var(--theme-brown-darkest)] hover:bg-[#3a3229]';

  return (
    <>
    <div className="fixed inset-0 z-50 animate-slide-in bg-white lg:flex lg:items-center lg:justify-center lg:bg-black/30 lg:backdrop-blur-sm">
      {/* PC background close button */}
      <button
        onClick={onClose}
        className="absolute inset-0 hidden h-full w-full cursor-default lg:block"
        aria-label="Close"
      />

      <div className="relative h-full w-full overflow-y-auto bg-white custom-scrollbar-thin lg:h-fit lg:max-w-4xl lg:rounded-2xl lg:shadow-2xl lg:overflow-visible">
        <header className="sticky top-0 z-10 flex items-center bg-white/80 p-4 backdrop-blur-sm lg:static lg:hidden">
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="mr-auto ml-4 text-lg font-bold">{place.name}</h1>
          <button
            className="rounded-full p-2 hover:bg-gray-200"
            aria-label="문의하기"
          >
            <span className="material-symbols-outlined text-gray-700">call</span>
          </button>
        </header>

        {/* Close button for PC */}
        <div className="absolute right-4 top-4 z-20 hidden lg:block">
          <button
            onClick={onClose}
            className="rounded-full bg-gray-100 p-2 text-gray-700 transition-colors hover:bg-gray-200 hover:text-gray-900"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="lg:relative lg:flex">
          {/* --- Image Carousel Section (PC Left) --- */}
          <div className="lg:absolute lg:left-0 lg:top-0 lg:bottom-0 lg:flex lg:w-1/2 lg:flex-col">
            {/* Image Section (Fixed) */}
            <div className="relative h-80 w-full flex-shrink-0 bg-gray-200 lg:h-[300px] lg:rounded-tl-2xl lg:overflow-hidden">
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
                    className="absolute left-3 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white transition-colors duration-200 hover:bg-black/60"
                  >
                    <span className="material-symbols-outlined text-xl">
                      chevron_left
                    </span>
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-3 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white transition-colors duration-200 hover:bg-black/60"
                  >
                    <span className="material-symbols-outlined text-xl">
                      chevron_right
                    </span>
                  </button>
                  <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 space-x-2">
                    {place.images.map((_, index) => (
                      <span
                        key={index}
                        className={`block h-2 w-2 rounded-full ${
                          index === currentImageIndex
                            ? 'bg-white'
                            : 'bg-gray-400/70'
                        }`}
                      ></span>
                    ))}
                  </div>
                </>
              )}
            </div>
            
            {/* Scrollable Info Section */}
            <div className="hidden flex-1 overflow-y-auto custom-scrollbar-thin lg:block">
              <div className="p-8">
                <div className="mb-2 flex flex-wrap items-baseline gap-3">
                  <h2 className="text-3xl font-bold text-theme-brown-darkest">
                    {place.name}
                  </h2>
                  <span className="text-xl font-medium text-theme-brown-dark">{place.category}</span>
                </div>
                <div className="mb-4 flex items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-semibold ${currentStatus.style}`}
                  >
                    {currentStatus.text}
                  </span>
                  <div className="flex items-center gap-2 text-base text-gray-600 lg:text-lg">
                    <span className="material-symbols-outlined text-base">
                      groups
                    </span>
                    <span className="font-medium">
                      {place.reservedSlots} / {place.totalSlots} 팀 예약 중
                    </span>
                  </div>
                </div>
                <p className="leading-relaxed text-theme-brown-dark">
                  {place.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
                  {place.options?.parking && (
                    <div className="flex items-center gap-2 text-theme-brown-darkest">
                      <span className="material-symbols-outlined text-xl">local_parking</span>
                      <span className="font-medium">주차 가능</span>
                    </div>
                  )}
                  {place.options?.pets && (
                    <div className="flex items-center gap-2 text-theme-brown-darkest">
                      <span className="material-symbols-outlined text-xl">pets</span>
                      <span className="font-medium">반려동물 동반 가능</span>
                    </div>
                  )}
                  {place.options?.twentyFourHours && (
                    <div className="flex items-center gap-2 text-theme-brown-darkest">
                      <span className="material-symbols-outlined text-xl">schedule</span>
                      <span className="font-medium">24시간 운영</span>
                    </div>
                  )}
                </div>
                <div className="mt-6 space-y-3 border-t border-theme-brown-light pt-6">
                  <div className="flex items-start gap-3 text-theme-brown-darkest">
                    <span className="material-symbols-outlined mt-px text-xl">location_on</span>
                    <span className="font-medium">{place.address}</span>
                  </div>
                  <div className="flex items-start gap-3 text-theme-brown-darkest">
                    <span className="material-symbols-outlined mt-px text-xl">call</span>
                    <a href={`tel:${place.phone}`} className="font-medium hover:underline">{place.phone}</a>
                  </div>
                  {place.snsUrls?.[0] && (
                    <div className="flex items-start gap-3 text-theme-brown-darkest">
                      <span className="material-symbols-outlined mt-px text-xl">link</span>
                      <a href={place.snsUrls[0]} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline truncate">
                        {place.snsUrls[0]}
                      </a>
                    </div>
                  )}
                </div>
                <div className="mt-6 border-t border-theme-brown-light pt-6">
                  <h3 className="text-lg font-bold text-theme-brown-darkest mb-3">태그</h3>
                  <div className="flex flex-wrap gap-2">
                    {place.tags?.map(tag => (
                      <span key={tag} className="bg-theme-brown-light text-theme-brown-darkest text-sm font-medium px-3 py-1 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
 
           {/* --- Details Section (PC Right, full for mobile) --- */}
          <div className="w-full overflow-y-auto custom-scrollbar-thin lg:w-1/2 lg:ml-[50%] lg:overflow-y-visible">
            <div className="p-5 lg:p-8">
              {/* Mobile Info Section */}
              <div className="mb-8 lg:hidden">
                <div className="mb-2 flex flex-wrap items-baseline gap-3">
                  <h2 className="text-3xl font-bold text-theme-brown-darkest">
                    {place.name}
                  </h2>
                  <span className="text-xl font-medium text-theme-brown-dark">{place.category}</span>
                </div>
                <div className="mb-4 flex items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-semibold ${currentStatus.style}`}
                  >
                    {currentStatus.text}
                  </span>
                  <div className="flex items-center gap-2 text-base text-gray-600 lg:text-lg">
                    <span className="material-symbols-outlined text-base">
                      groups
                    </span>
                    <span className="font-medium">
                      {place.reservedSlots} / {place.totalSlots} 팀 예약 중
                    </span>
                  </div>
                </div>
                <p className="leading-relaxed text-theme-brown-dark">
                  {place.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
                    {place.options?.parking && (
                        <div className="flex items-center gap-2 text-theme-brown-darkest">
                            <span className="material-symbols-outlined text-xl">local_parking</span>
                            <span className="font-medium">주차 가능</span>
                        </div>
                    )}
                    {place.options?.pets && (
                        <div className="flex items-center gap-2 text-theme-brown-darkest">
                            <span className="material-symbols-outlined text-xl">pets</span>
                            <span className="font-medium">반려동물 동반 가능</span>
                        </div>
                    )}
                    {place.options?.twentyFourHours && (
                        <div className="flex items-center gap-2 text-theme-brown-darkest">
                            <span className="material-symbols-outlined text-xl">schedule</span>
                            <span className="font-medium">24시간 운영</span>
                        </div>
                    )}
                </div>
                 <div className="mt-6 space-y-3 border-t border-theme-brown-light pt-6">
                  <div className="flex items-start gap-3 text-theme-brown-darkest">
                    <span className="material-symbols-outlined mt-px text-xl">location_on</span>
                    <span className="font-medium">{place.address}</span>
                  </div>
                  <div className="flex items-start gap-3 text-theme-brown-darkest">
                    <span className="material-symbols-outlined mt-px text-xl">call</span>
                    <a href={`tel:${place.phone}`} className="font-medium hover:underline">{place.phone}</a>
                  </div>
                  {place.snsUrls?.[0] && (
                    <div className="flex items-start gap-3 text-theme-brown-darkest">
                       <span className="material-symbols-outlined mt-px text-xl">link</span>
                      <a href={place.snsUrls[0]} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline truncate">
                        {place.snsUrls[0]}
                      </a>
                    </div>
                  )}
                </div>
                <div className="mt-6 border-t border-theme-brown-light pt-6">
                   <h3 className="text-lg font-bold text-theme-brown-darkest mb-3">태그</h3>
                   <div className="flex flex-wrap gap-2">
                     {place.tags?.map(tag => (
                       <span key={tag} className="bg-theme-brown-light text-theme-brown-darkest text-sm font-medium px-3 py-1 rounded-full">
                         #{tag}
                       </span>
                     ))}
                   </div>
                </div>
              </div>
 
               {/* Spaces & Reviews Section */}
              <div className="border-t border-theme-brown-light pt-6 lg:border-t-0">
                <div className="mb-8">
                  <h3 className="mb-4 text-xl font-bold text-theme-brown-darkest">
                    🚪 예약 공간
                  </h3>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {sortedSpaces.map((space) => (
                      <div
                        key={space.name}
                        className={`relative pt-1 ${
                          !space.isReserved
                            ? 'cursor-pointer'
                            : 'cursor-not-allowed'
                        }`}
                        onClick={() =>
                          !space.isReserved && setSelectedSpace(space)
                        }
                      >
                        <div
                          className={`w-full rounded-lg border-2 bg-white p-2 transition-all duration-200 ${
                            selectedSpace?.name === space.name
                              ? 'border-theme-brown-dark -translate-y-1 shadow-lg'
                              : 'border-transparent'
                          }`}
                        >
                          <div
                            className={`relative overflow-hidden rounded-md ${
                              space.isReserved
                                ? 'filter blur-sm opacity-60'
                                : ''
                            }`}
                          >
                            <Image
                              src={space.imageUrl}
                              alt={space.name}
                              className="h-24 w-full object-cover"
                              width={200}
                              height={96}
                            />
                          </div>
                          <div className="pt-2">
                            <p className="text-center text-sm font-medium text-theme-brown-darkest">
                              {space.name}
                            </p>
                            <p className="text-center text-xs font-semibold text-[var(--accent-color)] mt-1">
                              {space.price.toLocaleString()}원/일
                            </p>
                          </div>
                        </div>
                        {space.isReserved && (
                          <div className="absolute inset-0 flex items-center justify-center pt-1">
                            <span className="rounded-full bg-black/60 px-3 py-1 text-xs font-bold text-white">
                              예약 마감
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="mb-8 text-xl font-bold text-theme-brown-darkest">
                    🎨 아티스트 후기
                  </h3>
                  <div className="space-y-6">
                    {place.reviews?.length > 0 ? (
                      place.reviews.map((review, index) => (
                        <div key={index} className="flex items-start gap-4">
                          <Image
                            src={review.artistImageUrl}
                            alt={review.artistName}
                            className="h-12 w-12 rounded-full object-cover"
                            width={48}
                            height={48}
                          />
                          <div>
                            <p className="font-bold text-theme-brown-darkest">
                              {review.artistName}
                            </p>
                            <p className="mt-1 text-theme-brown-dark">
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

              {/* PC Booking Button */}
              <div className="mt-8 hidden lg:block">
                {/* On PC, this button opens the modal */}
                <button
                    onClick={handleOpenPcBookingModal}
                    className={`${baseButtonClasses} ${stateButtonClasses}`}
                    disabled={isButtonDisabled}
                >
                    {buttonText}
                </button>
              </div>
            </div>
          </div>
        </div>

        <footer className="sticky bottom-0 left-0 right-0 border-t border-gray-200 bg-white p-4 lg:hidden">
          {/* On Mobile, this remains a link */}
          <Link 
            href={bookingUrl} 
            className={isButtonDisabled ? 'pointer-events-none' : ''}>
            <button
              className={`${baseButtonClasses} ${stateButtonClasses}`}
              disabled={isButtonDisabled}
            >
              {buttonText}
            </button>
          </Link>
        </footer>
      </div>

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
        @media (min-width: 1024px) {
          .animate-slide-in {
            animation: none;
          }
        }
      `}</style>
    </div>
    {isPcBookingModalOpen && selectedSpace && (
        <BookingModalPC 
            place={place}
            space={selectedSpace}
            onClose={handleClosePcBookingModal}
        />
    )}
    </>
  );
}
