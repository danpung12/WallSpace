"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";

const disabledDays = [28];

const artworkSizes = [
  { label: "소형", desc: "30x30cm 이하" },
  { label: "중형", desc: "60x60cm 이하" },
  { label: "대형", desc: "90x90cm 이하" },
];

const spaces = [
  {
    id: "cozy",
    name: "코지 코너",
    max: "최대 크기: 60cm × 60cm",
    price: "$35.00",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCVU-WhaH5DBFZvEqwCSclwunI47GIlNRSL6C_D9LRAEuSsWxIMVhSms2k3sIoCM-V3HKSX-UiX-HyIWLukaOOhux7e1OIbeeJV7pD8wGIbmXMI8bIQcIgQDsPLb6LDFP291yxx0n0XXo1PYQxE-SVrrtJFST-AM2Dy9BKkHVOLL94r8XeGHE4tJAI2PJ86KTBstJuw8FHPPNlN9HODTgj_XHef_yoSfZ-IULb-L3KeSSSCd9zBwXpe_DtRRAIimHuvKpzu_nFVj7gP",
  },
  {
    id: "main",
    name: "메인 스트리트 뷰",
    max: "최대 크기: 90cm × 90cm",
    price: "$50.00",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuC3UAMpn2EjgWjy6YSSFgLdNyUQ3NiLaNQmPCpw9ntXAQqwe696UhxmRUo8IgcgZ3ZgGuXAtILoPZuZLwFVnSeiL5V9vlI6KgyZ70JyB9W4fgtc37JkQEfLlbYWBSS4Wl1MjCBoQ0TmfBTncl6jH7XL1rbGSkqpWUlQ4ryOnQsJX6w2Qux9iDig-ryw2b1Q83r2BcW8jrDiKRqBW1Md834yKREsuodPz7cWdsaK6U7qSN2FYJ9ZC_0VG3KAZCnEHqS745ECAEF1iNsa",
  },
  { id: "brick", name: "브릭 월", max: "최대 크기: 120cm × 90cm", price: "$65.00", img: null },
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
    const next = new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1);
    cells.push({ date: next, inMonth: next.getMonth() === m });
  }
  return cells;
}

export default function DateBookingPage() {
  const [viewDate, setViewDate] = useState(() => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), 1);
  });
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedSize, setSelectedSize] = useState(1);
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const cells = useMemo(() => getCalendarCells(viewDate), [viewDate]);

  const hasRange = !!(startDate && endDate);
  const hasSpace = !!selectedSpaceId;
  const canShowPricing = hasRange && hasSpace;
  const durationDays = hasRange ? daysDiffInclusive(startDate!, endDate!) : 0;

  const gotoMonth = (offset: number) =>
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));

  const isDisabled = (cell: Date) =>
    cell.getMonth() === month && cell.getFullYear() === year && disabledDays.includes(cell.getDate());

  function onClickDay(cell: Date) {
    if (isDisabled(cell)) return;
    if (startDate && endDate) {
      setStartDate(cell);
      setEndDate(null);
      return;
    }
    if (!startDate) {
      setStartDate(cell);
      setEndDate(null);
      return;
    }
    const s = toYMD(startDate);
    const c = toYMD(cell);
    if (isSameDay(s, c)) {
      setEndDate(c);
      return;
    }
    if (c < s) {
      setStartDate(c);
      setEndDate(s);
    } else {
      setEndDate(c);
    }
  }

  function getDayClass(cell: Date, inMonth: boolean) {
    if (isDisabled(cell)) return "date-picker-day date-picker-day-disabled";
    const selectedSingle =
      startDate && endDate && isSameDay(startDate, endDate) && startDate && isSameDay(cell, startDate);
    const isStart = startDate && isSameDay(cell, startDate);
    const isEnd = endDate && isSameDay(cell, endDate);
    const inRange =
      startDate && endDate && toYMD(cell) > toYMD(startDate) && toYMD(cell) < toYMD(endDate);

    if (selectedSingle) return "date-picker-day date-picker-day-selected";
    if (isStart) return "date-picker-day date-picker-day-selected date-range-start";
    if (isEnd) return "date-picker-day date-picker-day-selected date-range-end";
    if (inRange) return "date-picker-day date-picker-day-in-range shadow-none";
    if (!inMonth) return "date-picker-day bg-white date-picker-day-muted";
    return "date-picker-day bg-white";
  }

  const headerLabel = `${year}년 ${month + 1}월`;
  const selectedSpace = spaces.find((s) => s.id === selectedSpaceId);

  return (
    <div className="relative flex min-h-[100dvh] flex-col bg-[#FDFBF8] text-[#3D2C1D] font-pretendard">
      <div className="w-full max-w-md mx-auto bg-[var(--background-color)]">
        <header className="flex items-center p-4 pb-2 justify-between bg-[#FDFBF8] border-[#EAEAEA]">
          <Link href="/profile" passHref>
            <button className="text-[var(--text-primary)] cursor-pointer" aria-label="뒤로 가기">
              <svg fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24">
                <path d="m15 18-6-6 6-6"></path>
              </svg>
            </button>
          </Link>
          <h1 className="text-lg font-bold text-[var(--text-primary)] flex-1 text-center">날짜 선택</h1>
          <div className="w-8" />
        </header>

        <main
          className="p-4"
          // ✅ 아래 네비(고정) + 이 페이지의 예약 풋터(고정) + 안전영역 고려한 여백
          style={{
            paddingBottom:
              "calc(var(--booking-footer-h) + var(--bottom-nav-h) + env(safe-area-inset-bottom) + 24px)",
          }}
        >
          {/* Date Picker */}
          <div className="bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] p-4">
            <div className="flex items-center justify-between mb-4">
              <button className="p-2 rounded-full hover:bg-gray-100" aria-label="이전 달" onClick={() => gotoMonth(-1)}>
                <svg fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20">
                  <path d="m15 18-6-6 6-6"></path>
                </svg>
              </button>
              <h2 className="text-base font-bold text-[var(--text-primary)]">{headerLabel}</h2>
              <button className="p-2 rounded-full hover:bg-gray-100" aria-label="다음 달" onClick={() => gotoMonth(1)}>
                <svg fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20">
                  <path d="m9 18 6-6-6-6"></path>
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-7 gap-y-1 text-center text-sm text-[var(--text-secondary)] mb-2">
              <div>일</div><div>월</div><div>화</div><div>수</div><div>목</div><div>금</div><div>토</div>
            </div>

            <div className="grid grid-cols-7 gap-x-0 gap-y-2 grid-container-for-dates">
              {cells.map(({ date: cell, inMonth }) => (
                <div
                  key={cell.toISOString()}
                  className={getDayClass(cell, inMonth)}
                  onClick={() => onClickDay(cell)}
                  role="button"
                  tabIndex={0}
                  aria-pressed={
                    (startDate && isSameDay(cell, startDate)) ||
                    (endDate && isSameDay(cell, endDate)) ? true : undefined
                  }
                >
                  {cell.getDate()}
                </div>
              ))}
            </div>

            {/* 범례 */}
            <div className="flex justify-center items-center space-x-6 mt-4 pt-4 border-t border-[#EAEAEA]">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-[var(--primary-color)] shadow-sm" />
                <span className="text-xs text-[var(--text-secondary)]">선택 날짜</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-white border border-gray-300 rounded-full shadow-sm" />
                <span className="text-xs text-[var(--text-secondary)]">예약 가능</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-[var(--unavailable-color)]" />
                <span className="text-xs text-[var(--text-secondary)]">예약 마감</span>
              </div>
            </div>
          </div>

          {/* 이용 가능한 공간 */}
          <div
            className={`transition-all duration-500 ease-out overflow-hidden ${
              hasRange ? "max-h-[1200px] opacity-100 translate-y-0 mt-6 pt-6 border-t border-[#EAEAEA]" : "max-h-0 opacity-0 -translate-y-2 pointer-events-none"
            }`}
            aria-hidden={!hasRange}
          >
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">이용 가능한 공간</h3>
            <div className="space-y-4" role="radiogroup" aria-label="이용 가능한 공간 선택">
              {spaces.map((s) => {
                const selected = selectedSpaceId === s.id;
                return (
                  <div
                    key={s.id}
                    className={`bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] overflow-hidden flex items-center p-3 space-card ${selected ? "space-card-selected" : ""}`}
                    onClick={() => setSelectedSpaceId((prev) => (prev === s.id ? null : s.id))}
                    role="radio"
                    aria-checked={selected}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === " " || e.key === "Enter") {
                        e.preventDefault();
                        setSelectedSpaceId((prev) => (prev === s.id ? null : s.id));
                      }
                    }}
                  >
                    {s.img ? (
                      <img src={s.img} alt={s.name} className="w-24 h-24 object-cover rounded-xl" />
                    ) : (
                      <div className="w-24 h-24 rounded-xl bg-[var(--accent-color)] flex items-center justify-center">
                        <svg className="w-8 h-8 text-[var(--primary-color)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l-1.586-1.586a2 2 0 00-2.828 0L6 16m6-6l2 2" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                        </svg>
                      </div>
                    )}
                    <div className="pl-4 flex-1">
                      <h4 className="font-bold text-base text-[var(--text-primary)]">{s.name}</h4>
                      <p className="text-sm text-[var(--text-secondary)] mt-1">{s.max}</p>
                      <div className="mt-2">
                        <span className="text-base font-bold text-[var(--primary-color)]">{s.price}</span>
                        <span className="text-sm text-[var(--text-secondary)]"> / 일</span>
                      </div>
                    </div>
                    <div aria-hidden className={`ml-2 shrink-0 transition-opacity ${selected ? "opacity-100" : "opacity-0"}`}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
              canShowPricing ? "max-h-[1000px] opacity-100 translate-y-0 mt-6 pt-6 border-t border-[#EAEAEA]" : "max-h-0 opacity-0 -translate-y-2 pointer-events-none"
            }`}
            aria-hidden={!canShowPricing}
          >
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">예약 비용</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <p className="text-[var(--text-secondary)]">선택 공간</p>
                <p className="text-[var(--text-primary)] font-medium">{selectedSpace?.name ?? "-"}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-[var(--text-secondary)]">작품 크기</p>
                <p className="text-[var(--text-primary)] font-medium">{artworkSizes[selectedSize].label}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-[var(--text-secondary)]">예약 날짜</p>
                <p className="text-[var(--text-primary)] font-medium">
                  {hasRange ? `${fmtKoreanDate(startDate!)} - ${fmtKoreanDate(endDate!)}` : "날짜를 선택하세요"}
                </p>
              </div>
              <div className="flex justify-between">
                <p className="text-[var(--text-secondary)]">기간</p>
                <p className="text-[var(--text-primary)] font-medium">{hasRange ? `${durationDays}일` : "-"}</p>
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

        {/* ✅ 예약하기 풋터: 고정 네비 위로 올림 */}
        <footer
          className="w-full max-w-md mx-auto bg-white p-4 border-t border-[#EAEAEA] fixed"
          style={{
            bottom: "calc(var(--bottom-nav-h) + env(safe-area-inset-bottom))",
            left: 0,
            right: 0,
            margin: "0 auto",
          }}
        >
          <Link href="/booking" passHref>
            <button className="w-full cursor-pointer button_primary" style={{ height: "48px" }}>
              예약하기
            </button>
          </Link>
        </footer>
      </div>

      {/* 글로벌 스타일 */}
      <style jsx global>{`
        :root {
          --primary-color: #c57f39;
          --background-color: #FDFBF8;
          --text-primary: #333333;
          --text-secondary: #666666;
          --accent-color: #e0d8c9;
          --card-background: #FFFFFF;
          --unavailable-color: #F3F4F6;
          /* ✅ 고정 네비/풋터 높이 */
          --bottom-nav-h: 64px;
          --booking-footer-h: 72px; /* 여유 포함 높이(컨테이너 패딩 포함) */
        }
        body {
          font-family: "Pretendard", sans-serif;
          background-color: var(--background-color);
          color: var(--text-primary);
        }
        .date-picker-day {
          display: flex; align-items: center; justify-content: center;
          aspect-ratio: 1/1; border-radius: 9999px;
          transition: background 0.2s, color 0.2s, opacity 0.2s;
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
        .date-picker-day-muted { color: #9aa0a6; opacity: 0.55; }
        .date-range-start { border-top-right-radius: 0; border-bottom-right-radius: 0; }
        .date-range-end   { border-top-left-radius: 0; border-bottom-left-radius: 0; }

        .button_primary {
          background: var(--primary-color); color: #fff;
          border-radius: 0.75rem; padding: 0.75rem 1.25rem;
          font-size: 1rem; font-weight: bold; letter-spacing: 0.01em;
          transition: background 0.2s;
        }
        .button_primary:hover { background: #ac651b; }

        .space-card { border: 2px solid transparent; transition: border-color .2s, box-shadow .2s, transform .2s; }
        .space-card-selected { border-color: var(--primary-color); box-shadow: 0 6px 14px rgba(197,127,57,0.25); transform: translateY(-2px); }
      `}</style>
    </div>
  );
}
