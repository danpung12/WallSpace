'use client';

import Link from 'next/link';
import React from 'react';
import Image from 'next/image'; // ✨ 수정: Image 컴포넌트 import

// --- 데이터 타입 정의 (실제로는 공유된 타입 파일을 import 해야 합니다) ---
interface Space {
    name: string;
    imageUrl: string;
    isReserved: boolean;
}
interface Artwork {
    id: number;
    title: string;
    artist: string;
    imageUrl: string;
}
interface Location {
    name: string;
    images: string[];
}
interface BookingDetails {
    location: Location;
    space: Space;
    artwork: Artwork;
    startDate: Date;
    endDate: Date;
    costDetails: {
        spaceUsage: number;
        serviceFee: number;
        total: number;
    };
}

// --- 날짜 포맷팅 유틸 함수 ---
const fmtKoreanDate = (d: Date) => `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
const daysDiffInclusive = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / 86400000) + 1;

// --- 모의 데이터 ---
const mockBookingDetails: BookingDetails = {
    location: {
        name: '아트스페이스 광교',
        images: ['https://picsum.photos/id/10/800/600'],
    },
    space: {
        name: '제 1 전시실',
        imageUrl: 'https://picsum.photos/id/101/400/300',
        isReserved: false,
    },
    artwork: {
        id: 1,
        title: 'Vibrance',
        artist: 'Alexia Ray',
        imageUrl: 'https://picsum.photos/id/1018/200/200',
    },
    startDate: new Date('2025-10-20'),
    endDate: new Date('2025-10-25'),
    costDetails: {
        spaceUsage: 250000,
        serviceFee: 12500,
        total: 262500,
    },
};

// --- 예약 확인 페이지 컴포넌트 ---
export default function BookingConfirmationPage() {
    const bookingDetails = mockBookingDetails;
    const durationDays = daysDiffInclusive(bookingDetails.startDate, bookingDetails.endDate);

    return (
        <div className="bg-[var(--background-color)] min-h-screen text-[var(--text-primary)]">
            {/* ✨ 1. 레퍼런스 디자인의 CSS 변수와 스타일을 적용합니다. */}
            <style jsx global>{`
              :root {
                --primary-color: #c57f39;
                --background-color: #FDFBF8;
                --text-primary: #333333;
                --text-secondary: #666666;
                /* 풋터 높이 변수 추가 */
                --booking-footer-h: 88px; 
              }
              body {
                font-family: "Pretendard", sans-serif;
              }
              .button_primary {
                background: var(--primary-color); color: #fff;
                border-radius: 0.75rem; padding: 0.75rem 1.25rem;
                font-size: 1rem; font-weight: bold;
                transition: background 0.2s;
              }
              .button_primary:hover { background: #ac651b; }
            `}</style>

            <div className="max-w-md mx-auto bg-[var(--background-color)]">
                <header className="flex items-center p-4 justify-between bg-[var(--background-color)]">
                    <Link href="/map" passHref>
                        <button className="p-1" aria-label="뒤로 가기">
                            <svg fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24">
                                <path d="m15 18-6-6 6-6"></path>
                            </svg>
                        </button>
                    </Link>
                    <h1 className="text-lg font-bold flex-1 text-center">예약 확인</h1>
                    <div className="w-8" />
                </header>

                <main className="p-4" style={{ paddingBottom: "calc(var(--booking-footer-h) + 1rem)" }}>
                    {/* ✨ 2. 예약 내역 전체를 하나의 카드로 묶어 표현 */}
                    <section className="mb-6">
                        <h2 className="text-lg font-bold mb-3">예약 내역</h2>
                        <div className="bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] p-4 space-y-4">
                            {/* 작품 정보 */}
                            <div className="flex items-center gap-4">
                                {/* ✨ 수정: img를 Image 컴포넌트로 변경 */}
                                <Image src={bookingDetails.artwork.imageUrl} alt={bookingDetails.artwork.title} className="w-16 h-16 rounded-lg object-cover" width={64} height={64} />
                                <div className="flex-1">
                                    {/* ✨ 수정: 큰따옴표를 특수문자로 변경 */}
                                    <p className="font-bold">&ldquo;{bookingDetails.artwork.title}&rdquo;</p>
                                    <p className="text-sm text-[var(--text-secondary)]">{bookingDetails.artwork.artist}</p>
                                </div>
                            </div>
                            <hr />
                            {/* 공간 및 날짜 정보 */}
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between items-center">
                                    <p className="text-[var(--text-secondary)]">장소</p>
                                    <p className="font-medium">{bookingDetails.location.name}</p>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-[var(--text-secondary)]">예약 공간</p>
                                    <p className="font-medium">{bookingDetails.space.name}</p>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-[var(--text-secondary)]">예약 날짜</p>
                                    <p className="font-medium text-right">
                                        {fmtKoreanDate(bookingDetails.startDate)} - {fmtKoreanDate(bookingDetails.endDate)} ({durationDays}일)
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ✨ 3. 결제 금액 섹션도 별도 카드로 분리 */}
                    <section>
                         <h2 className="text-lg font-bold mb-3">결제 금액</h2>
                         <div className="bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] p-4 space-y-3 text-sm">
                             <div className="flex justify-between text-[var(--text-secondary)]">
                                 <p>공간 이용료 ({durationDays}일)</p>
                                 <p>{bookingDetails.costDetails.spaceUsage.toLocaleString()}원</p>
                             </div>
                             <div className="flex justify-between text-[var(--text-secondary)]">
                                 <p>서비스 수수료</p>
                                 <p>{bookingDetails.costDetails.serviceFee.toLocaleString()}원</p>
                             </div>
                             <div className="flex justify-between items-center mt-3 pt-3 border-t font-bold">
                                 <p className="text-base">총 결제 금액</p>
                                 <p className="text-lg text-[var(--primary-color)]">{bookingDetails.costDetails.total.toLocaleString()}원</p>
                             </div>
                         </div>
                    </section>
                </main>

                {/* ✨ 4. 하단 고정 버튼 스타일 수정 */}
                <footer
                    className="fixed bottom-0 left-0 right-0 w-full max-w-md mx-auto bg-white p-4 border-t border-gray-100"
                    style={{ height: 'var(--booking-footer-h)' }}
                >
                    <Link href="/booking" passHref>
                        <button className="w-full h-full button_primary">
                            {bookingDetails.costDetails.total.toLocaleString()}원 결제하기
                        </button>
                    </Link>
                </footer>
            </div>
        </div>
    );
}