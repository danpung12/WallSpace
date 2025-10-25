'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { Location, Space } from '@/data/locations';
import DateBooking from '@/app/bookingdate/components/DateBooking';
import BookingConfirmation from '@/app/confirm-booking/components/BookingConfirmation';
import BookingSuccess from '@/app/booking/components/BookingSuccess'; // Import BookingSuccess
import { useRouter } from 'next/navigation';
import { useMap } from '@/context/MapContext';
import { useReservations } from '@/context/ReservationContext';


interface BookingModalPCProps {
  place: Location;
  space: Space;
  onClose: () => void;
}

type BookingStep = 'date' | 'confirm' | 'success'; // Add 'success' step

interface BookingDetails {
    space: Space;
    startDate: Date;
    endDate: Date;
}

export default function BookingModalPC({
  place,
  space,
  onClose,
}: BookingModalPCProps) {
  const [step, setStep] = useState<BookingStep>('date');
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [reservationId, setReservationId] = useState<string | null>(null);
  const router = useRouter();
  const { refreshLocations } = useMap();
  const { refreshReservations } = useReservations();


  const handleDateBookingComplete = (details: BookingDetails) => {
    setBookingDetails(details);
    setStep('confirm');
  };

  const handleConfirmBack = () => {
    setStep('date');
  };

  const handleBookingConfirmed = async (id: string) => {
    setReservationId(id);
    setStep('success');
    // 예약 완료 후 locations 데이터와 reservations 데이터 새로고침
    await Promise.all([
      refreshLocations(),
      refreshReservations()
    ]);
  };

  const handleViewBooking = () => {
    if (reservationId) {
      router.push(`/bookingdetail?id=${encodeURIComponent(reservationId)}`);
    } else {
      router.push('/dashboard');
    }
    onClose(); // Close the modal
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <button
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default"
        aria-label="Close"
      />

      <div className="relative flex h-[92vh] max-h-[820px] w-full max-w-5xl rounded-2xl bg-white shadow-2xl">
        {/* Left Panel (Location Info) */}
        <div className="relative hidden h-full w-1/2 flex-col overflow-y-auto rounded-l-2xl bg-[#FDFBF8] lg:flex">
           <div className="sticky top-0 z-10">
                <Image
                    src={place.images[0]}
                    alt={place.name}
                    width={800}
                    height={600}
                    className="h-64 w-full object-cover"
                />
           </div>
          <div className="p-8">
            <h2 className="mb-2 text-3xl font-bold text-theme-brown-darkest">
              {place.name}
            </h2>
            <p className="mb-4 text-xl font-medium text-theme-brown-dark">
              {typeof place.category === 'string' ? place.category : place.category?.name || '기타'}
            </p>
            <p className="leading-relaxed text-theme-brown-dark">
              {place.description}
            </p>
            <div className="mt-6 space-y-3 border-t border-theme-brown-light pt-6">
              <div className="flex items-start gap-3 text-theme-brown-darkest">
                <span className="material-symbols-outlined mt-px text-xl">
                  location_on
                </span>
                <span className="font-medium">{place.address}</span>
              </div>
              <div className="flex items-start gap-3 text-theme-brown-darkest">
                <span className="material-symbols-outlined mt-px text-xl">
                  storefront
                </span>
                <span className="font-medium">
                  {space.name}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel (Booking Steps) */}
        <div className="flex h-full w-full flex-col overflow-hidden rounded-r-2xl lg:w-1/2">
             <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-bold">
                    {step === 'date' ? '날짜 선택' : step === 'confirm' ? '예약 확인' : '예약 완료'}
                </h3>
                <button
                    onClick={onClose}
                    className="rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>
             </div>
             <div className="flex-1 overflow-y-auto p-6 custom-scrollbar-thin">
                {step === 'date' && (
                    <DateBooking
                    location={place}
                    initialSpace={space}
                    onBookingComplete={handleDateBookingComplete}
                    isModal={true}
                    />
                )}
                {step === 'confirm' && bookingDetails && (
                    <BookingConfirmation
                    bookingDetails={{location: place, ...bookingDetails}}
                    onBack={handleConfirmBack}
                    isModal={true}
                    onConfirm={handleBookingConfirmed} // Pass the handler
                    />
                )}
                {step === 'success' && (
                    <BookingSuccess
                        isModal={true}
                        onClose={onClose}
                        onViewBooking={handleViewBooking}
                        reservationId={reservationId || undefined}
                    />
                )}
             </div>
        </div>
      </div>
    </div>
  );
}
