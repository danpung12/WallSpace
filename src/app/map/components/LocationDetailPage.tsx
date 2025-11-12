'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Location, Space } from '../../../data/locations';
import BookingModalPC from './BookingModalPC'; // Import the new modal
import { getLocationReviews, type LocationReview } from '@/lib/api/location-reviews';
import Toast from '../../components/Toast';

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
  const [locationReviews, setLocationReviews] = useState<LocationReview[]>([]);
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
  const totalImages = place.images?.length || 0;

  // 즐겨찾기 상태 확인
  useEffect(() => {
    const checkFavorite = async () => {
      try {
        const response = await fetch(`/api/favorites?locationId=${place.id}`);
        if (response.ok) {
          const data = await response.json();
          setIsFavorite(data.isFavorite);
        }
      } catch (error) {
        console.error('Failed to check favorite status:', error);
      }
    };
    
    if (place.id) {
      checkFavorite();
    }
  }, [place.id]);

  // 장소 리뷰 로드
  useEffect(() => {
    const fetchReviews = async () => {
      if (place.id) {
        const reviews = await getLocationReviews(place.id.toString());
        setLocationReviews(reviews);
      }
    };
    fetchReviews();
  }, [place.id]);

  // 즐겨찾기 토글
  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLoadingFavorite) return;
    
    // 로그인 체크
    try {
      const supabaseModule = await import('@/lib/supabase/client');
      const supabase = supabaseModule.createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        alert('로그인이 필요한 기능입니다.');
        return;
      }
    } catch (error) {
      console.error('로그인 체크 실패:', error);
      alert('로그인이 필요한 기능입니다.');
      return;
    }
    
    setIsLoadingFavorite(true);

    try {
      if (isFavorite) {
        // 즐겨찾기 삭제
        const response = await fetch(`/api/favorites?locationId=${place.id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          setIsFavorite(false);
          setToastMessage('즐겨찾기에서 제거되었습니다');
          setToastType('success');
          setShowToast(true);
          console.log('✅ 즐겨찾기 제거 성공');
        } else {
          const errorData = await response.json();
          console.error('❌ 즐겨찾기 제거 실패:', errorData);
          throw new Error('Failed to remove favorite');
        }
      } else {
        // 즐겨찾기 추가
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ locationId: place.id }),
        });
        
        if (response.ok) {
          setIsFavorite(true);
          setToastMessage('저장되었습니다');
          setToastType('success');
          setShowToast(true);
          console.log('✅ 즐겨찾기 추가 성공');
        } else {
          const errorData = await response.json();
          console.error('❌ 즐겨찾기 추가 실패:', errorData);
          throw new Error('Failed to add favorite');
        }
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      setToastMessage('즐겨찾기 처리에 실패했습니다');
      setToastType('error');
      setShowToast(true);
    } finally {
      setIsLoadingFavorite(false);
    }
  };

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
      <Toast 
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        type={toastType}
      />
      <div className="fixed inset-0 z-50 animate-slide-in bg-white lg:flex lg:items-center lg:justify-center lg:bg-black/30 lg:backdrop-blur-sm">
      {/* PC background close button */}
      <button
        onClick={onClose}
        className="absolute inset-0 hidden h-full w-full cursor-default lg:block"
        aria-label="Close"
      />

      <div className="relative h-full w-full overflow-y-auto bg-white custom-scrollbar-thin lg:h-fit lg:min-h-[600px] lg:max-h-[90vh] lg:w-[1000px] lg:min-w-[900px] lg:max-w-[1200px] lg:rounded-2xl lg:shadow-2xl lg:overflow-hidden lg:my-8 lg:mb-20 lg:flex lg:flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between bg-white/80 p-4 backdrop-blur-sm lg:static lg:hidden">
          <div className="flex items-center">
            <button
              onClick={onClose}
              className="rounded-full p-2 hover:bg-gray-100"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h1 className="ml-4 text-lg font-bold">{place.name}</h1>
          </div>
          <button
            onClick={handleToggleFavorite}
            disabled={isLoadingFavorite}
            className={`rounded-full p-2 hover:bg-gray-100 transition-all duration-200 ${
              isLoadingFavorite ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <span 
              className="material-symbols-outlined" 
              style={{ 
                fontSize: '24px',
                fontVariationSettings: isFavorite ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
                color: isFavorite ? '#EAB308' : '#9ca3af'
              }}
            >
              bookmark
            </span>
          </button>
        </header>

        {/* Close and Favorite buttons for PC */}
        <div className="fixed top-6 right-6 z-30 hidden lg:flex lg:gap-2">
          <button
            onClick={handleToggleFavorite}
            disabled={isLoadingFavorite}
            className={`rounded-full bg-white p-2 text-gray-700 transition-all duration-200 hover:bg-gray-50 ${
              isLoadingFavorite ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <span 
              className="material-symbols-outlined" 
              style={{ 
                fontSize: '24px',
                fontVariationSettings: isFavorite ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
                color: isFavorite ? '#EAB308' : '#9ca3af'
              }}
            >
              bookmark
            </span>
          </button>
          <button
            onClick={onClose}
            className="rounded-full bg-gray-100 p-2 text-gray-700 transition-colors hover:bg-gray-200 hover:text-gray-900"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="lg:relative lg:flex lg:flex-1 lg:min-h-0">
          {/* --- Image Carousel Section (PC Left) --- */}
          <div className="lg:absolute lg:left-0 lg:top-0 lg:bottom-0 lg:flex lg:w-1/2 lg:flex-col lg:h-full">
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
            <div className="hidden flex-1 overflow-y-auto custom-scrollbar-thin lg:block lg:min-h-[300px]">
              <div className="p-8 min-h-full flex flex-col">
                <div className="mb-2 flex flex-wrap items-baseline gap-3">
                  <h2 className="text-3xl font-bold text-theme-brown-darkest">
                    {place.name}
                  </h2>
                  <span className="text-xl font-medium text-theme-brown-dark">{typeof place.category === 'string' ? place.category : place.category?.name || '기타'}</span>
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
          <div className="w-full overflow-y-auto custom-scrollbar-thin lg:w-1/2 lg:ml-[50%] lg:relative lg:flex lg:flex-col lg:h-full lg:overflow-hidden">
            <div className="p-5 lg:p-8 lg:flex-1 lg:flex lg:flex-col lg:min-h-0 lg:overflow-y-auto lg:pb-40">
              {/* Mobile Info Section */}
              <div className="mb-8 lg:hidden">
                <div className="mb-2 flex flex-wrap items-baseline gap-3">
                  <h2 className="text-3xl font-bold text-theme-brown-darkest">
                    {place.name}
                  </h2>
                  <span className="text-xl font-medium text-theme-brown-dark">{typeof place.category === 'string' ? place.category : place.category?.name || '기타'}</span>
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
              <div className="border-t border-theme-brown-light pt-6 lg:border-t-0 lg:flex-1 lg:flex lg:flex-col lg:min-h-0">
                <div className="mb-8 lg:flex-1 lg:overflow-y-auto lg:min-h-0">
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
                <div className="lg:flex-shrink-0">
                  <h3 className="mb-6 text-xl font-bold text-theme-brown-darkest">
                    🎨 아티스트 후기
                  </h3>
                  <div className="space-y-5">
                    {locationReviews.length > 0 ? (
                      locationReviews.map((review) => {
                        const maxLength = 100;
                        const isExpanded = expandedReviews.has(review.id);
                        const needsTruncate = (review.comment?.length || 0) > maxLength;
                        const displayComment = needsTruncate && !isExpanded 
                          ? review.comment?.substring(0, maxLength) + '...'
                          : review.comment;

                        const toggleExpand = () => {
                          setExpandedReviews(prev => {
                            const next = new Set(prev);
                            if (next.has(review.id)) {
                              next.delete(review.id);
                            } else {
                              next.add(review.id);
                            }
                            return next;
                          });
                        };

                        return (
                          <div key={review.id} className="flex items-start gap-3">
                            <Image
                              src={review.artist?.avatar_url || 'https://i.pravatar.cc/150?img=1'}
                              alt={review.artist?.nickname || review.artist?.name || '사용자'}
                              className="h-12 w-12 rounded-full object-cover flex-shrink-0"
                              width={48}
                              height={48}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-theme-brown-darkest text-sm">
                                {review.artist?.nickname || review.artist?.name || '익명'}
                              </p>
                              <p className="mt-0.5 text-theme-brown-dark text-sm leading-relaxed">
                                &ldquo;{displayComment}&rdquo;
                                {needsTruncate && (
                                  <button
                                    onClick={toggleExpand}
                                    className="ml-1 text-[var(--primary-color)] hover:underline text-xs font-medium"
                                  >
                                    {isExpanded ? '접기' : '더보기'}
                                  </button>
                                )}
                              </p>
                              <p className="mt-1 text-xs text-gray-500">
                                {new Date(review.created_at).toLocaleDateString('ko-KR')}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-theme-brown-dark text-sm">
                        아직 등록된 후기가 없습니다.
                      </p>
                    )}
                  </div>
                </div>
              </div>

            </div>
            {/* PC Booking Button - 화면 하단에 고정 */}
            <div className="hidden lg:block lg:flex-shrink-0 lg:px-8 lg:pt-6 lg:pb-12 lg:bg-white lg:border-t lg:border-gray-200">
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
