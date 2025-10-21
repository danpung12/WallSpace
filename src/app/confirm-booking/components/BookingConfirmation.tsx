'use client';

import Link from 'next/link';
import React from 'react';
import Image from 'next/image';
import type { Location, Space } from '@/data/locations';

// --- Mock Data (Artwork, as it's not in the flow yet) ---
const mockArtwork = {
  id: 1,
  title: 'Vibrance',
  artist: 'Alexia Ray',
  imageUrl: 'https://picsum.photos/id/1018/200/200',
};

// --- 날짜 포맷팅 유틸 함수 ---
const fmtKoreanDate = (d: Date) =>
  `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
const daysDiffInclusive = (a: Date, b: Date) =>
  Math.round((b.getTime() - a.getTime()) / 86400000) + 1;

interface BookingDetails {
  location: Location;
  space: Space;
  startDate: Date;
  endDate: Date;
}

interface BookingConfirmationProps {
  bookingDetails: BookingDetails;
  onBack: () => void;
  isModal?: boolean;
  onConfirm?: () => void; // Add this prop
}

export default function BookingConfirmation({
  bookingDetails,
  onBack,
  isModal = false,
  onConfirm, // Destructure the new prop
}: BookingConfirmationProps) {
  if (!bookingDetails) {
    return <div>Loading...</div>;
  }

  const { location, space, startDate, endDate } = bookingDetails;
  const artwork = mockArtwork; // Using mock artwork for now

  // Simple cost calculation
  const durationDays = daysDiffInclusive(startDate, endDate);
  const spaceUsage = (space.price || 50000) * durationDays;
  const serviceFee = spaceUsage * 0.05;
  const total = spaceUsage + serviceFee;

  const costDetails = {
    spaceUsage,
    serviceFee,
    total,
  };

  return (
      <div
        className={`font-pretendard text-[var(--text-primary)] ${
          !isModal ? 'min-h-screen bg-[var(--background-color)]' : ''
        }`}
      >
          <div className={!isModal ? "max-w-md mx-auto bg-[var(--background-color)]" : ""}>
              {!isModal && (
                   <header className="flex items-center p-4 justify-between bg-[var(--background-color)]">
                   <button onClick={onBack} className="p-1" aria-label="뒤로 가기">
                       <svg fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24">
                           <path d="m15 18-6-6 6-6"></path>
                       </svg>
                   </button>
                   <h1 className="text-lg font-bold flex-1 text-center">예약 확인</h1>
                   <div className="w-8" />
               </header>
              )}
       

          <main className={!isModal ? "p-4" : ""} style={!isModal ? { paddingBottom: "calc(var(--booking-footer-h) + 1rem)" } : {}}>
              <section className="mb-6">
                  <h2 className="text-lg font-bold mb-3">예약 내역</h2>
                  <div className="bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] p-4 space-y-4">
                      {/* Artwork Info */}
                      <div className="flex items-center gap-4">
                          <Image src={artwork.imageUrl} alt={artwork.title} className="w-16 h-16 rounded-lg object-cover" width={64} height={64} />
                          <div className="flex-1">
                              <p className="font-bold">&ldquo;{artwork.title}&rdquo;</p>
                              <p className="text-sm text-[var(--text-secondary)]">{artwork.artist}</p>
                          </div>
                      </div>
                      <hr />
                      {/* Space & Date Info */}
                      <div className="space-y-3 text-sm">
                          <div className="flex justify-between items-center">
                              <p className="text-[var(--text-secondary)]">장소</p>
                              <p className="font-medium">{location.name}</p>
                          </div>
                          <div className="flex justify-between items-center">
                              <p className="text-[var(--text-secondary)]">예약 공간</p>
                              <p className="font-medium">{space.name}</p>
                          </div>
                          <div className="flex justify-between items-center">
                              <p className="text-[var(--text-secondary)]">예약 날짜</p>
                              <p className="font-medium text-right">
                                  {fmtKoreanDate(startDate)} - {fmtKoreanDate(endDate)} ({durationDays}일)
                              </p>
                          </div>
                      </div>
                  </div>
              </section>

              <section>
                      <h2 className="text-lg font-bold mb-3">결제 금액</h2>
                      <div className="bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] p-4 space-y-3 text-sm">
                          <div className="flex justify-between text-[var(--text-secondary)]">
                              <p>공간 이용료 ({durationDays}일)</p>
                              <p>{costDetails.spaceUsage.toLocaleString()}원</p>
                          </div>
                          <div className="flex justify-between text-[var(--text-secondary)]">
                              <p>서비스 수수료</p>
                              <p>{costDetails.serviceFee.toLocaleString()}원</p>
                          </div>
                          <div className="flex justify-between items-center mt-3 pt-3 border-t font-bold">
                              <p className="text-base">총 결제 금액</p>
                              <p className="text-lg text-[var(--primary-color)]">{costDetails.total.toLocaleString()}원</p>
                          </div>
                      </div>
              </section>
          </main>
          
          <div className={isModal ? 'mt-auto pt-4' : ''}>
              {!isModal ? (
                   <footer
                   className="fixed bottom-0 left-0 right-0 w-full max-w-md mx-auto bg-white p-4 border-t border-gray-100"
                   style={{ height: 'var(--booking-footer-h)' }}
                  >
                       <Link href="/booking" className="w-full h-full">
                          <button className="w-full h-full button_primary">
                              {costDetails.total.toLocaleString()}원 결제하기
                          </button>
                      </Link>
                  </footer>
              ) : (
                  <div className="p-4 bg-white">
                      <button
                          onClick={onConfirm} // Use onConfirm for the modal button
                          className="w-full h-[48px] button_primary"
                      >
                         {costDetails.total.toLocaleString()}원 결제하기
                      </button>
                  </div>
              )}
          </div>
        </div>
          <style jsx global>{`
            :root {
              --primary-color: #c57f39;
              --background-color: #fdfbf8;
              --text-primary: #333333;
              --text-secondary: #666666;
              --booking-footer-h: 88px;
            }
            .button_primary {
              background: var(--primary-color);
              color: #fff;
              border-radius: 0.75rem;
              padding: 0.75rem 1.25rem;
              font-size: 1rem;
              font-weight: bold;
              transition: background 0.2s;
            }
            .button_primary:hover {
              background: #ac651b;
            }
            .button_primary:disabled {
              background-color: var(--primary-color);
              opacity: 0.5;
              cursor: not-allowed;
            }
            ${!isModal
              ? `
                body {
                  font-family: "Pretendard", sans-serif;
                }
              `
              : ''}
          `}</style>
      </div>
  );
}
