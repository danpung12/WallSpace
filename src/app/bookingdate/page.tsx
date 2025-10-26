'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import DateBooking from './components/DateBooking';
import type { Location, Space } from '@/data/locations';
import { useBottomNav } from '../context/BottomNavContext';

function DateBookingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const placeId = searchParams.get('placeId');
  const spaceName = searchParams.get('spaceName');
  const { setIsNavVisible } = useBottomNav();
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsNavVisible(false);
    return () => {
      setIsNavVisible(true);
    };
  }, [setIsNavVisible]);

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

  const initialSpace = location.spaces.find((s) => s.name === spaceName);

  const handleBookingComplete = (details: {
    space: any;
    startDate: Date;
    endDate: Date;
  }) => {
    const params = new URLSearchParams({
        placeId: location.id.toString(),
        spaceName: details.space.name,
        startDate: details.startDate.toISOString(),
        endDate: details.endDate.toISOString(),
    });
    router.push(`/confirm-booking?${params.toString()}`);
  };

  return (
    <DateBooking
      location={location}
      initialSpace={initialSpace}
      onBookingComplete={handleBookingComplete}
      isModal={false}
    />
  );
}

export default function DateBookingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DateBookingContent />
    </Suspense>
  );
}
