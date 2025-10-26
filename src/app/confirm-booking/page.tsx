'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import BookingConfirmation from './components/BookingConfirmation';
import type { Location, Space } from '@/data/locations';

function BookingConfirmationPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);

  const placeId = searchParams.get('placeId');
  const spaceName = searchParams.get('spaceName');
  const startDateStr = searchParams.get('startDate');
  const endDateStr = searchParams.get('endDate');

  // API에서 장소 데이터 가져오기
  useEffect(() => {
    const fetchLocation = async () => {
      if (!placeId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/locations');
        if (response.ok) {
          const locations: Location[] = await response.json();
          const foundLocation = locations.find((loc) => loc.id === placeId || loc.id.toString() === placeId);
          setLocation(foundLocation || null);
        }
      } catch (error) {
        console.error('Failed to fetch location:', error);
        setLocation(null);
      } finally {
        setLoading(false);
      }
    };

    fetchLocation();
  }, [placeId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D2B48C]"></div>
      </div>
    );
  }

  if (!placeId || !spaceName || !startDateStr || !endDateStr) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-4">잘못된 접근입니다.</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-[#D2B48C] text-white rounded-lg hover:bg-[#C19A6B] transition-colors"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-4">장소를 찾을 수 없습니다.</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-[#D2B48C] text-white rounded-lg hover:bg-[#C19A6B] transition-colors"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  const space = location.spaces.find((s) => s.name === spaceName);
  if (!space) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-4">공간을 찾을 수 없습니다.</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-[#D2B48C] text-white rounded-lg hover:bg-[#C19A6B] transition-colors"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }
  
  const bookingDetails = {
    location,
    space,
    startDate: new Date(startDateStr),
    endDate: new Date(endDateStr),
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <BookingConfirmation
      bookingDetails={bookingDetails}
      onBack={handleBack}
      isModal={false}
    />
  );
}

export default function BookingConfirmationPage() {
  return (
    <Suspense fallback={<div>예약 정보를 불러오는 중...</div>}>
      <BookingConfirmationPageContent />
    </Suspense>
  );
}