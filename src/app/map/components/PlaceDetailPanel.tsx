'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Location } from '../../../data/locations';
import Toast from '../../components/Toast';

export default function PlaceDetailPanel({
  place,
  onClose,
  onShowDetail,
}: {
  place: Location;
  onClose: () => void;
  onShowDetail: () => void;
}) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

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

  // 즐겨찾기 토글
  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLoading) return;
    
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
    
    setIsLoading(true);

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
      setIsLoading(false);
    }
  };

  if (!place) return null;
  return (
    <>
      <Toast 
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        type={toastType}
      />
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
          className="absolute top-0 right-0 z-10 bg-gray-200/80 rounded-full p-1.5 flex items-center justify-center"
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
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-baseline gap-2 flex-1 min-w-0">
            <h2 className="text-[26px] font-bold text-theme-brown-darkest truncate">
              {place.name}
            </h2>
            <span className="font-medium text-theme-brown-dark flex-shrink-0">{typeof place.category === 'string' ? place.category : place.category?.name || '기타'}</span>
          </div>
          <button
            type="button"
            onClick={handleToggleFavorite}
            onMouseDown={(e) => e.stopPropagation()}
            disabled={isLoading}
            className={`flex-shrink-0 flex items-center justify-center transition-all duration-200 hover:scale-110 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <span 
              className="material-symbols-outlined" 
              style={{ 
                fontSize: '32px',
                fontVariationSettings: isFavorite ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
                color: isFavorite ? '#EAB308' : '#9ca3af'
              }}
            >
              bookmark
            </span>
          </button>
        </div>

        <div className="flex items-center gap-3 text-sm text-theme-brown-dark mb-2 flex-wrap">
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
    </>
  );
}
