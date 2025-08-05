"use client";

import React, { useState } from "react";
import Link from "next/link";

// 달력 데이터 세팅 (실제 서비스에서는 동적으로!)
const daysInMonth = 31;
const startDayOfWeek = 2; // 1일이 월요일(col-start-2)
const disabledDays = [28];
const selectedStart = 5;
const selectedEnd = 12;

const artworkSizes = [
  { label: "소형", desc: "30x30cm 이하" },
  { label: "중형", desc: "60x60cm 이하" },
  { label: "대형", desc: "90x90cm 이하" },
];

export default function DateBookingPage() {
  const [selectedSize, setSelectedSize] = useState(1);

  // 1~31일 배열
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // 날짜별 클래스
  function getDayClass({ day }: { day: number }) {
    if (disabledDays.includes(day)) return "date-picker-day date-picker-day-disabled";
    if (day === selectedStart) return "date-picker-day date-picker-day-selected date-range-start";
    if (day === selectedEnd) return "date-picker-day date-picker-day-selected date-range-end";
    if (day > selectedStart && day < selectedEnd) return "date-picker-day date-picker-day-in-range shadow-none";
    return "date-picker-day bg-white";
  }

  return (
    <div className="relative flex size-full min-h-screen flex-col justify-between overflow-x-hidden bg-[var(--background-color)]">
      <div className="w-full max-w-md mx-auto bg-[var(--background-color)]">
        <header className=" flex items-center p-4 pb-2 justify-between bg-[#FDFBF8]  border-[#EAEAEA]">
          <button className="text-[var(--text-primary)]">
            <svg fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24">
              <path d="m15 18-6-6 6-6"></path>
            </svg>
          </button>
          <h1 className="text-lg font-bold text-[var(--text-primary)] flex-1 text-center">날짜 선택</h1>
          <div className="w-8"></div>
        </header>
        <main className="p-4 pb-28">
          {/* Date Picker */}
          <div className="bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] p-4">
            <div className="flex items-center justify-between mb-4">
              <button className="p-2 rounded-full hover:bg-gray-100">
                <svg fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20">
                  <path d="m15 18-6-6 6-6"></path>
                </svg>
              </button>
              <h2 className="text-base font-bold text-[var(--text-primary)]">2025년 8월</h2>
              <button className="p-2 rounded-full hover:bg-gray-100">
                <svg fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20">
                  <path d="m9 18 6-6-6-6"></path>
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-7 gap-y-1 text-center text-sm text-[var(--text-secondary)] mb-2">
              <div>일</div>
              <div>월</div>
              <div>화</div>
              <div>수</div>
              <div>목</div>
              <div>금</div>
              <div>토</div>
            </div>
            <div className="grid grid-cols-7 gap-x-0 gap-y-2 grid-container-for-dates">
              {days.map((day, i) => (
                <div
                  key={day}
                  className={
                    getDayClass({day}) +
                    (i === 0 ? ` col-start-${startDayOfWeek}` : "")
                  }
                >
                  {day}
                </div>
              ))}
            </div>
            {/* 하단 라벨 */}
            <div className="flex justify-center items-center space-x-6 mt-4 pt-4 border-t border-[#EAEAEA]">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-[var(--primary-color)] shadow-sm"></div>
                <span className="text-xs text-[var(--text-secondary)]">선택 날짜</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-white border border-gray-300 rounded-full shadow-sm"></div>
                <span className="text-xs text-[var(--text-secondary)]">예약 가능</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-[var(--unavailable-color)]"></div>
                <span className="text-xs text-[var(--text-secondary)]">예약 마감</span>
              </div>
            </div>
          </div>
          {/* Artwork Size 선택 */}
          <div className="mt-6">
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-3">작품 크기 선택</h3>
            <div className="flex justify-between space-x-2 bg-white p-1.5 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
              {artworkSizes.map((size, idx) => (
                <div
                  key={size.label}
                  className={`artwork-size-option ${selectedSize === idx ? "artwork-size-option-selected" : ""}`}
                  onClick={() => setSelectedSize(idx)}
                  role="button"
                  tabIndex={0}
                >
                  <p className="text-sm font-medium">{size.label}</p>
                  <p className={`text-xs ${selectedSize === idx ? "" : "text-[var(--text-secondary)]"}`}>{size.desc}</p>
                </div>
              ))}
            </div>
          </div>
          {/* Booking Summary */}
          <div className="mt-6 pt-6 border-t border-[#EAEAEA]">
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">예약 비용</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <p className="text-[var(--text-secondary)]">작품 크기</p>
                <p className="text-[var(--text-primary)] font-medium">{artworkSizes[selectedSize].label}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-[var(--text-secondary)]">예약 날짜</p>
                <p className="text-[var(--text-primary)] font-medium">2025년 8월 5일 - 8월 12일 </p>
              </div>
              <div className="flex justify-between">
                <p className="text-[var(--text-secondary)]">기간</p>
                <p className="text-[var(--text-primary)] font-medium">8일</p>
              </div>
              <div className="flex justify-between">
                <p className="text-[var(--text-secondary)]">기간에 따른 비용</p>
                <p className="text-[var(--text-primary)] font-medium">₩30,000</p>
              </div>
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-[#EAEAEA]">
                <p className="text-base text-[var(--text-primary)] font-bold">총 비용</p>
                <p className="text-lg text-[var(--primary-color)] font-bold">₩100,000</p>
              </div>
            </div>
          </div>
        </main>
          <footer className="w-full max-w-md mx-auto bg-white p-4 border-t border-[#EAEAEA] fixed bottom-0">
            <Link href="/booking" passHref>
              <button className="w-full button_primary">예약하기</button>
            </Link>
          </footer>
      </div>
      {/* Pretendard 폰트 및 변수 예시. 실제로는 전역 styles/globals.css 등에서 관리 권장 */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Pretendard:wght@400;500;700&display=swap');
        :root {
            --primary-color: #c57f39;
            --background-color: #FDFBF8;
            --text-primary: #333333;
            --text-secondary: #666666;
            --accent-color: #e0d8c9;
            --card-background: #FFFFFF;
            --unavailable-color: #F3F4F6;
        }
        body {
            font-family: "Pretendard", sans-serif;
            background-color: var(--background-color);
            color: var(--text-primary);
        }
        .date-picker-day {
            display: flex; align-items: center; justify-content: center;
            aspect-ratio: 1/1; border-radius: 9999px;
            transition: background 0.2s, color 0.2s;
            cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
        .date-picker-day-selected {
            background: var(--primary-color); color: #fff;
            box-shadow: 0 2px 4px rgba(197,127,57,0.4);
        }
        .date-picker-day-disabled {
            background: var(--unavailable-color); color: #bdbdbd; cursor: not-allowed; box-shadow: none;
        }
        .date-picker-day-in-range {
            background: var(--accent-color); color: var(--text-primary); border-radius: 0;
        }
        .date-range-start { border-top-right-radius: 0; border-bottom-right-radius: 0; }
        .date-range-end { border-top-left-radius: 0; border-bottom-left-radius: 0; }
        .button_primary {
            background: var(--primary-color); color: #fff;
            border-radius: 0.75rem; padding: 0.75rem 1.25rem;
            font-size: 1rem; font-weight: bold; letter-spacing: 0.01em;
            transition: background 0.2s;
        }
        .button_primary:hover { background: #ac651b; }
        .artwork-size-option {
            flex: 1 1 0%; text-align: center; padding: 0.75rem 0.5rem;
            border-radius: 0.75rem; cursor: pointer;
            transition: all 0.2s; border: 2px solid transparent;
        }
        .artwork-size-option-selected {
            background: var(--accent-color); border-color: var(--primary-color);
            color: var(--primary-color); font-weight: bold; box-shadow: 0 2px 4px rgba(197,127,57,0.2);
        }
      `}</style>
    </div>
  );
}
