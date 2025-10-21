'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { locations } from '@/data/locations';
import BookingConfirmation from './components/BookingConfirmation';
import type { Location, Space } from '@/data/locations';

function BookingConfirmationPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const placeId = searchParams.get('placeId');
  const spaceName = searchParams.get('spaceName');
  const startDateStr = searchParams.get('startDate');
  const endDateStr = searchParams.get('endDate');

  if (!placeId || !spaceName || !startDateStr || !endDateStr) {
    return <div>잘못된 접근입니다.</div>;
  }

  const location = locations.find((l) => l.id.toString() === placeId);
  if (!location) {
    return <div>장소를 찾을 수 없습니다.</div>;
  }

  const space = location.spaces.find((s) => s.name === spaceName);
  if (!space) {
    return <div>공간을 찾을 수 없습니다.</div>;
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