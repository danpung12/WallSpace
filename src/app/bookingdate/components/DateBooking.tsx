'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { locations } from '@/data/locations'; // Import locations data
import type { Location, Space } from '@/data/locations';

const disabledDays = [28];

const artworkSizes = [
  { label: '소형', desc: '30x30cm 이하' },
  { label: '중형', desc: '60x60cm 이하' },
  { label: '대형', desc: '90x90cm 이하' },
];

// ---- 날짜 유틸
const toYMD = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();
const daysDiffInclusive = (a: Date, b: Date) =>
  Math.round((toYMD(b).getTime() - toYMD(a).getTime()) / 86400000) + 1;
const fmtKoreanDate = (d: Date) =>
  `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;

// 6주 그리드 셀 생성
function getCalendarCells(viewDate: Date) {
  const y = viewDate.getFullYear();
  const m = viewDate.getMonth();
  const firstWeekday = new Date(y, m, 1).getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const prevMonthDays = new Date(y, m, 0).getDate();
  const numWeeks = Math.ceil((firstWeekday + daysInMonth) / 7);
  const totalCells = numWeeks * 7;

  const cells: { date: Date; inMonth: boolean }[] = [];
  for (let i = firstWeekday - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    cells.push({ date: new Date(y, m - 1, day), inMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(y, m, d), inMonth: true });
  }
  while (cells.length < totalCells) {
    const last = cells[cells.length - 1].date;
    const next = new Date(
      last.getFullYear(),
      last.getMonth(),
      last.getDate() + 1,
    );
    cells.push({ date: next, inMonth: next.getMonth() === m });
  }
  return cells;
}

interface DateBookingProps {
  location: Location;
  initialSpace?: Space;
  onBookingComplete: (details: {
    space: Space;
    startDate: Date;
    endDate: Date;
  }) => void;
  isModal?: boolean;
}

export default function DateBooking({
  location,
  initialSpace,
  onBookingComplete,
  isModal = false,
}: DateBookingProps) {
  const [spaces, setSpaces] = useState<Space[]>([]);

  const [viewDate, setViewDate] = useState(() => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), 1);
  });
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedSize, setSelectedSize] = useState(1);
  const [selectedSpaceName, setSelectedSpaceName] = useState<string | null>(
    initialSpace?.name || null,
  );

  useEffect(() => {
    if (location) {
      setSpaces(location.spaces || []);
      if (initialSpace) {
        setSelectedSpaceName(initialSpace.name);
      }
    }
  }, [location, initialSpace]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const cells = useMemo(() => getCalendarCells(viewDate), [viewDate]);

  const hasRange = !!(startDate && endDate);
  const hasSpace = !!selectedSpaceName;
  const canBook = hasRange && hasSpace;
  const durationDays = hasRange
    ? daysDiffInclusive(startDate!, endDate!)
    : 0;

  const gotoMonth = (offset: number) =>
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));

  const isDisabled = (cell: Date) =>
    cell.getMonth() === month &&
    cell.getFullYear() === year &&
    disabledDays.includes(cell.getDate());

  function onClickDay(cell: Date) {
    if (isDisabled(cell)) return;

    // If a full range is already selected, start a new selection
    if (startDate && endDate) {
      setStartDate(cell);
      setEndDate(null);
      return;
    }

    // If no date is selected yet
    if (!startDate) {
      setStartDate(cell);
      setEndDate(null);
      return;
    }

    // If a start date is selected, determine the end date
    const s = toYMD(startDate);
    const c = toYMD(cell);

    if (c < s) {
        // If the selected date is before the current start date,
        // set the selected date as the new start and the current start as the end.
        setStartDate(cell);
        setEndDate(startDate);
    } else {
        // Otherwise, set the selected date as the end date.
        setEndDate(cell);
    }
  }

  function getDayClass(cell: Date, inMonth: boolean) {
    if (isDisabled(cell)) return 'date-picker-day date-picker-day-disabled';
    const selectedSingle =
      startDate &&
      endDate &&
      isSameDay(startDate, endDate) &&
      startDate &&
      isSameDay(cell, startDate);
    const isStart = startDate && isSameDay(cell, startDate);
    const isEnd = endDate && isSameDay(cell, endDate);
    const inRange =
      startDate &&
      endDate &&
      toYMD(cell) > toYMD(startDate) &&
      toYMD(cell) < toYMD(endDate);

    if (selectedSingle) return 'date-picker-day date-picker-day-selected';
    if (isStart)
      return 'date-picker-day date-picker-day-selected date-range-start';
    if (isEnd) return 'date-picker-day date-picker-day-selected date-range-end';
    if (inRange)
      return 'date-picker-day date-picker-day-in-range shadow-none';
    if (!inMonth) return 'date-picker-day bg-white date-picker-day-muted';
    return 'date-picker-day bg-white';
  }

  const headerLabel = `${year}년 ${month + 1}월`;
  const selectedSpace = spaces.find((s) => s.name === selectedSpaceName);

  const handleBooking = () => {
    if (canBook && selectedSpace && startDate && endDate) {
        onBookingComplete({
            space: selectedSpace,
            startDate,
            endDate,
        });
    }
  };

  if (!location) {
    return <div>Loading location...</div>;
  }

  return (
    <div
      className={`font-pretendard text-[#3D2C1D] ${
        !isModal ? 'relative min-h-[100dvh] bg-[#FDFBF8]' : ''
      }`}
    >
      <div
        className={
          !isModal ? 'mx-auto w-full max-w-md bg-[var(--background-color)]' : ''
        }
      >
        {!isModal && (
          <header className="flex items-center justify-between border-[#EAEAEA] bg-[#FDFBF8] p-4 pb-2">
            <Link href={'/map'} passHref >
              <button
                className="cursor-pointer text-[var(--text-primary)]"
                aria-label="뒤로 가기"
              >
                <svg
                  fill="none"
                  height="24"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="24"
                >
                  <path d="m15 18-6-6 6-6"></path>
                </svg>
              </button>
            </Link>
            <h1 className="flex-1 text-center text-lg font-bold text-[var(--text-primary)]">
              날짜 선택
            </h1>
            <div className="w-8" />
          </header>
        )}

        <main
          className={!isModal ? 'p-4' : ''}
          style={
            !isModal
              ? {
                  paddingBottom:
                    'calc(var(--booking-footer-h) + var(--bottom-nav-h) + env(safe-area-inset-bottom) + 24px)',
                }
              : {}
          }
        >
          {/* Date Picker */}
          <div
            className={
              !isModal
                ? 'rounded-2xl bg-white p-4 shadow-[0_4px_12px_rgba(0,0,0,0.08)]'
                : ''
            }
          >
            <div className="mb-4 flex items-center justify-between">
              <button
                className="rounded-full p-2 hover:bg-gray-100"
                aria-label="이전 달"
                onClick={() => gotoMonth(-1)}
              >
                <svg
                  fill="none"
                  height="20"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="20"
                >
                  <path d="m15 18-6-6 6-6"></path>
                </svg>
              </button>
              <h2 className="text-base font-bold text-[var(--text-primary)]">
                {headerLabel}
              </h2>
              <button
                className="rounded-full p-2 hover:bg-gray-100"
                aria-label="다음 달"
                onClick={() => gotoMonth(1)}
              >
                <svg
                  fill="none"
                  height="20"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="20"
                >
                  <path d="m9 18 6-6-6-6"></path>
                </svg>
              </button>
            </div>

            <div className="mb-2 grid grid-cols-7 gap-y-1 text-center text-sm text-[var(--text-secondary)]">
              <div>일</div>
              <div>월</div>
              <div>화</div>
              <div>수</div>
              <div>목</div>
              <div>금</div>
              <div>토</div>
            </div>

            <div className="grid-container-for-dates grid grid-cols-7 gap-x-0 gap-y-2">
              {cells.map(({ date: cell, inMonth }) => (
                <div
                  key={cell.toISOString()}
                  className={getDayClass(cell, inMonth)}
                  onClick={() => onClickDay(cell)}
                  role="button"
                  tabIndex={0}
                  aria-pressed={
                    (startDate && isSameDay(cell, startDate)) ||
                    (endDate && isSameDay(cell, endDate))
                      ? true
                      : undefined
                  }
                >
                  {cell.getDate()}
                </div>
              ))}
            </div>

            {/* 범례 */}
            <div className="mt-4 flex items-center justify-center space-x-6 border-t border-[#EAEAEA] pt-4">
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 rounded-full bg-[var(--primary-color)] shadow-sm" />
                <span className="text-xs text-[var(--text-secondary)]">
                  선택 날짜
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 rounded-full border border-gray-300 bg-white shadow-sm" />
                <span className="text-xs text-[var(--text-secondary)]">
                  예약 가능
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 rounded-full bg-[var(--unavailable-color)]" />
                <span className="text-xs text-[var(--text-secondary)]">
                  예약 마감
                </span>
              </div>
            </div>
          </div>

          {/* 이용 가능한 공간 */}
          <div
            className={`transition-all duration-500 ease-out overflow-hidden ${
              hasRange || initialSpace
                ? 'max-h-[1200px] translate-y-0 opacity-100 mt-6 pt-6 border-t border-[#EAEAEA]'
                : 'max-h-0 -translate-y-2 opacity-0 pointer-events-none'
            }`}
            aria-hidden={!hasRange && !initialSpace}
          >
            <h3 className="mb-4 text-lg font-bold text-[var(--text-primary)]">
              이용 가능한 공간
            </h3>
            <div
              className="space-y-4"
              role="radiogroup"
              aria-label="이용 가능한 공간 선택"
            >
              {spaces.map((s) => {
                const selected = selectedSpaceName === s.name;
                return (
                  <div
                    key={s.name}
                    className={`flex items-center overflow-hidden rounded-2xl bg-white p-3 shadow-[0_4px_12px_rgba(0,0,0,0.08)] space-card ${
                      selected ? 'space-card-selected' : ''
                    }`}
                    onClick={() =>
                      setSelectedSpaceName((prev) => (prev === s.name ? null : s.name))
                    }
                    role="radio"
                    aria-checked={selected}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        setSelectedSpaceName((prev) =>
                          prev === s.name ? null : s.name,
                        );
                      }
                    }}
                  >
                    {s.imageUrl ? (
                      <img
                        src={s.imageUrl}
                        alt={s.name}
                        className="h-24 w-24 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-[var(--accent-color)]">
                        <svg
                          className="h-8 w-8 text-[var(--primary-color)]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l-1.586-1.586a2 2 0 00-2.828 0L6 16m6-6l2 2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                          />
                        </svg>
                      </div>
                    )}
                    <div className="flex-1 pl-4">
                      <h4 className="text-base font-bold text-[var(--text-primary)]">
                        {s.name}
                      </h4>
                      <p className="mt-1 text-sm text-[var(--text-secondary)]">{`최대 크기: ${s.width}cm x ${s.height}cm`}</p>
                      <div className="mt-2">
                        <span className="text-base font-bold text-[var(--primary-color)]">
                          {s.price ? `₩${s.price.toLocaleString()}` : '₩0'}
                        </span>
                        <span className="text-sm text-[var(--text-secondary)]">
                          {' '}
                          / 일
                        </span>
                      </div>
                    </div>
                    <div
                      aria-hidden
                      className={`ml-2 shrink-0 transition-opacity ${
                        selected ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 예약 요약 */}
          <div
            className={`transition-all duration-500 ease-out overflow-hidden ${
              canBook
                ? 'max-h-[1000px] translate-y-0 opacity-100 mt-6 pt-6 border-t border-[#EAEAEA]'
                : 'max-h-0 -translate-y-2 opacity-0 pointer-events-none'
            }`}
            aria-hidden={!canBook}
          >
            <h3 className="mb-4 text-lg font-bold text-[var(--text-primary)]">
              예약 비용
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <p className="text-[var(--text-secondary)]">선택 공간</p>
                <p className="font-medium text-[var(--text-primary)]">
                  {selectedSpace?.name ?? '-'}
                </p>
              </div>
              <div className="flex justify-between">
                <p className="text-[var(--text-secondary)]">작품 크기</p>
                <p className="font-medium text-[var(--text-primary)]">
                  {artworkSizes[selectedSize].label}
                </p>
              </div>
              <div className="flex justify-between">
                <p className="text-[var(--text-secondary)]">예약 날짜</p>
                <p className="font-medium text-[var(--text-primary)]">
                  {hasRange
                    ? `${fmtKoreanDate(startDate!)} - ${fmtKoreanDate(endDate!)}`
                    : '날짜를 선택하세요'}
                </p>
              </div>
              <div className="flex justify-between">
                <p className="text-[var(--text-secondary)]">기간</p>
                <p className="font-medium text-[var(--text-primary)]">
                  {hasRange ? `${durationDays}일` : '-'}
                </p>
              </div>
              <div className="flex justify-between">
                <p className="text-[var(--text-secondary)]">기간에 따른 비용</p>
                <p className="font-medium text-[var(--text-primary)]">
                  {selectedSpace && hasRange
                    ? `₩${((selectedSpace.price || 0) * durationDays).toLocaleString()}`
                    : '₩0'}
                </p>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-[#EAEAEA] pt-4">
                <p className="text-base font-bold text-[var(--text-primary)]">
                  총 비용
                </p>
                <p className="text-lg font-bold text-[var(--primary-color)]">
                  {selectedSpace && hasRange
                    ? `₩${((selectedSpace.price || 0) * durationDays).toLocaleString()}`
                    : '₩0'}
                </p>
              </div>
            </div>
          </div>
        </main>
        
        <div className={isModal ? 'mt-auto pt-4' : ''}>
            {!isModal ? (
                 <footer
                 className="fixed bottom-0 left-0 right-0 z-10 mx-auto w-full max-w-md border-t border-[#EAEAEA] bg-white p-4"
                 style={{
                   bottom:
                     'calc(var(--bottom-nav-h) + env(safe-area-inset-bottom))',
                 }}
               >
                <button
                    onClick={handleBooking}
                    className="button_primary h-[48px] w-full cursor-pointer"
                    disabled={!canBook}
                >
                    예약하기
                </button>
               </footer>
            ) : (
                <div className="p-4 bg-white">
                     <button
                        onClick={handleBooking}
                        className="button_primary h-[48px] w-full cursor-pointer"
                        disabled={!canBook}
                    >
                        날짜 선택 완료
                    </button>
                </div>
            )}
        </div>
      </div>
      {!isModal && (
        <style jsx global>{`
          :root {
            --primary-color: #c57f39;
            --background-color: #fdfbf8;
            --text-primary: #333333;
            --text-secondary: #666666;
            --accent-color: #e0d8c9;
            --card-background: #ffffff;
            --unavailable-color: #f3f4f6;
            /* ✅ 고정 네비/풋터 높이 */
            --bottom-nav-h: 64px;
            --booking-footer-h: 72px; /* 여유 포함 높이(컨테이너 패딩 포함) */
          }
          body {
            font-family: 'Pretendard', sans-serif;
            background-color: var(--background-color);
            color: var(--text-primary);
          }
          .date-picker-day {
            display: flex;
            align-items: center;
            justify-content: center;
            aspect-ratio: 1/1;
            border-radius: 9999px;
            transition: background 0.2s, color 0.2s, opacity 0.2s;
            cursor: pointer;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
          }
          .date-picker-day-selected {
            background: var(--primary-color);
            color: #fff;
            box-shadow: 0 2px 4px rgba(197, 127, 57, 0.4);
          }
          .date-picker-day-disabled {
            background: var(--unavailable-color);
            color: #bdbdbd;
            cursor: not-allowed;
            box-shadow: none;
          }
          .date-picker-day-in-range {
            background: var(--accent-color);
            color: var(--text-primary);
            border-radius: 0;
          }
          .date-picker-day-muted {
            color: #9aa0a6;
            opacity: 0.55;
          }
          .date-range-start {
            border-top-right-radius: 0;
            border-bottom-right-radius: 0;
          }
          .date-range-end {
            border-top-left-radius: 0;
            border-bottom-left-radius: 0;
          }

          .button_primary {
            background: var(--primary-color);
            color: #fff;
            border-radius: 0.75rem;
            padding: 0.75rem 1.25rem;
            font-size: 1rem;
            font-weight: bold;
            letter-spacing: 0.01em;
            transition: background 0.2s;
          }
          .button_primary:hover {
            background: #ac651b;
          }

          .space-card {
            border: 2px solid transparent;
            transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
          }
          .space-card-selected {
            border-color: var(--primary-color);
            box-shadow: 0 6px 14px rgba(197, 127, 57, 0.25);
            transform: translateY(-2px);
          }
        `}</style>
      )}
    </div>
  );
}
