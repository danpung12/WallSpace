'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { locations } from '@/data/locations';
import DateBooking from './components/DateBooking';
import type { Location, Space } from '@/data/locations';
import { useBottomNav } from '../context/BottomNavContext';

function DateBookingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const placeId = searchParams.get('placeId');
  const spaceName = searchParams.get('spaceName');
  const { setIsNavVisible } = useBottomNav();

  useEffect(() => {
    setIsNavVisible(false);
    return () => {
      setIsNavVisible(true);
    };
  }, [setIsNavVisible]);

  const location = locations.find((loc) => loc.id.toString() === placeId);
  const initialSpace = location?.spaces.find((s) => s.name === spaceName);

  if (!location) {
    return <div>장소를 찾을 수 없습니다.</div>;
  }

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
