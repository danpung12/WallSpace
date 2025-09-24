"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type BookingStatus = "Confirmed" | "Cancelled";

type Artwork = {
  title: string;
  artist: string;
  size: string;
  imageUrl: string;
};

type SpaceInfo = {
  name: string;
  venue: string;
  dimensions: string;
  imageUrl: string;
};

type Period = { start: string; end: string };
type Pricing = { dailyRate: number; serviceFee: number };

type Booking = {
  id: string;
  status: BookingStatus;
  artwork: Artwork;
  space: SpaceInfo;
  period: Period;
  pricing: Pricing;
};

export default function BookingDetailPage() {
  const router = useRouter();

  const [booking, setBooking] = useState<Booking>({
    id: "12345",
    status: "Confirmed",
    artwork: {
      title: `"작품 A"`,
      artist: "Sellena",
      size: `24" x 36"`,
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCMwyo-fhoVBFnNyQkDOjm5VOm91Rgqj_NjOU2wf_cp8YpBkynVHyrlfUWvKqnvvRt3EtFU7KNDcSoj_Zf0BWlaa5Hv3mzMvMONZC2PgsyR10i_Pr1cIxPddbfpqkiAYh7Fft7nQ8OcExf9p7KEB9Llnmllha_Usljq0piZKkWYcw_rfq-ZW6LcoaaWIDDi8T9EPUqidl5Q3zzWq55SuFBo6Njn41HkYXgq_BOvVBOa1h7j-M6DVimiMM9xi74QhDPyZhBYb0WksLNP",
    },
    space: {
      name: "섹션 A",
      venue: "Cafe Canvas",
      dimensions: `48" x 72"`,
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuB1hI9oEpCk1Pbvkp_kEABsMwq3UiQpEXgkQAjoKq3zsxh-1zCYNITVvuXmpNpLF9VoSrWCoNDyoRdxjyqMpDNrTBUpb1pjkgZe5LWlm7gnI0w_y_Q1ei5WNLT30zg7ppiyZf-7lqwmBeZH_SBYUF2jG9N9RewMBMkuchWyUez73Nu8RP_KzNk9qWCHKfu8BIpEzj-f2AZxHz8T-Bo5p7miSGc16CS856SoAquozkXt_T7iQLzYApp90MHErVPMIiIin7npi3pLCGH9",
    },
    period: { start: "2025-07-20", end: "2025-07-27" },
    pricing: { dailyRate: 10, serviceFee: 5 },
  });

  const durationDays = useMemo(() => {
    const start = new Date(booking.period.start);
    const end = new Date(booking.period.end);
    return Math.max(0, Math.round((+end - +start) / (1000 * 60 * 60 * 24)));
  }, [booking.period.start, booking.period.end]);

  const totalCost = useMemo(
    () => booking.pricing.dailyRate * durationDays + booking.pricing.serviceFee,
    [booking.pricing.dailyRate, booking.pricing.serviceFee, durationDays]
  );

  // 금액 표시: USD → KRW(×1000) 후 콤마 포맷
  const fmtKRW = (usd: number) =>
    new Intl.NumberFormat("ko-KR").format(Math.round(usd * 1000));

  const fmtDate = (iso: string) =>
    new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const onBack = () => router.back();
  const onViewReceipt = () => window.print();
  const onCancel = () => {
    if (booking.status === "Cancelled") return;
    if (confirm("정말 예약을 취소하시겠어요?")) {
      setBooking((b) => ({ ...b, status: "Cancelled" }));
      alert("예약이 취소되었습니다.");
    }
  };

  return (
    <>
      {/* 전역 테마 변수 */}
      <style jsx global>{`
        :root {
          --primary-color: #d2b48c;
          --secondary-color: #f5f5f5;
          --background-color: #fdfbf8;
          --text-primary: #3d2c1d;
          --text-secondary: #8c7853;
          --accent-color: #f0ead6;
        }
        body {
          background-color: var(--background-color);
          color: var(--text-primary);
          min-height: max(884px, 100dvh);
        }
      `}</style>

      <header className="fixed top-0 left-0 right-0 z-20 bg-[var(--background-color)]/80 backdrop-blur-sm">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={onBack}
            className="text-[var(--text-primary)]"
            aria-label="Back"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 256 256"
              fill="currentColor"
              aria-hidden
            >
              <path d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">
            예약 상세정보
          </h1>
          <div className="w-7" />
        </div>
      </header>

      <main className="flex-1 p-4 space-y-6 pt-16">
        {/* Booking overview */}
        <section className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-[var(--text-secondary)]">
                예약 ID: #{booking.id}
              </p>
            </div>
            <span
              className={
                "text-xs font-semibold py-1 px-3 rounded-full " +
                (booking.status === "Confirmed"
                  ? "text-green-600 bg-green-100"
                  : "text-red-600 bg-red-100")
              }
            >
              {booking.status}
            </span>
          </div>
        </section>

        {/* Artwork */}
        <section className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">
            작품 정보
          </h3>
          <div className="flex items-start gap-4">
            <div
              className="w-24 h-24 bg-center bg-no-repeat bg-cover rounded-lg flex-shrink-0"
              style={{ backgroundImage: `url("${booking.artwork.imageUrl}")` }}
            />
            <div className="flex-1 space-y-1">
              <p className="text-base font-semibold text-[var(--text-primary)]">
                {booking.artwork.title}
              </p>
              <p className="text-sm text-[var(--text-secondary)]">
                by {booking.artwork.artist}
              </p>
              <p className="text-sm text-[var(--text-secondary)]">
                사이즈: {booking.artwork.size}
              </p>
            </div>
          </div>
        </section>

        {/* Space */}
        <section className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">
            예약 장소
          </h3>
          <div className="flex items-start gap-4">
            <div
              className="w-24 h-24 bg-center bg-no-repeat bg-cover rounded-lg flex-shrink-0"
              style={{ backgroundImage: `url("${booking.space.imageUrl}")` }}
            />
            <div className="flex-1 space-y-1">
              <p className="text-base font-semibold text-[var(--text-primary)]">
                {booking.space.name}
              </p>
              <p className="text-sm text-[var(--text-secondary)]">
                {booking.space.venue}
              </p>
              <p className="text-sm text-[var(--text-secondary)]">
                공간 크기: {booking.space.dimensions}
              </p>
            </div>
          </div>
        </section>

        {/* Period */}
        <section className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">
            예약 기간
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-[var(--text-secondary)]">
                시작일
              </p>
              <p className="text-base font-semibold text-[var(--text-primary)]">
                {fmtDate(booking.period.start)}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-[var(--text-secondary)]">
                종료일
              </p>
              <p className="text-base font-semibold text-[var(--text-primary)]">
                {fmtDate(booking.period.end)}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-[var(--text-secondary)]">
                기간
              </p>
              <p className="text-base font-semibold text-[var(--text-primary)]">
                {durationDays} Days
              </p>
            </div>
          </div>
        </section>

        {/* Cost */}
        <section className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">
            비용 요약
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[var(--text-secondary)]">
                일일 요금 (24&quot;x36&quot;)
              </p>
              <p className="text-sm text-[var(--text-primary)]">
                ₩{fmtKRW(booking.pricing.dailyRate)} x {durationDays} 일
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-[var(--text-secondary)]">수수료</p>
              <p className="text-sm text-[var(--text-primary)]">
                ₩{fmtKRW(booking.pricing.serviceFee)}
              </p>
            </div>
            <div className="border-t border-dashed border-gray-200 my-3" />
            <div className="flex items-center justify-between">
              <p className="text-base font-bold text-[var(--text-primary)]">
                총 비용
              </p>
              <p className="text-xl font-bold text-[var(--primary-color)]">
                ₩{fmtKRW(totalCost)}
              </p>
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="pt-4 space-y-3">
          <button
            className="bg-[var(--primary-color)] text-white py-3 px-6 rounded-lg hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:ring-opacity-50 transition-colors w-full text-center"
            onClick={onViewReceipt}
          >
            영수증 보기
          </button>
          <button
            className="bg-transparent border border-[var(--text-secondary)] text-[var(--text-secondary)] py-3 px-6 rounded-lg hover:bg-[var(--accent-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:ring-opacity-50 transition-colors w-full text-center disabled:opacity-50"
            onClick={onCancel}
            disabled={booking.status === "Cancelled"}
          >
            예약 취소
          </button>
        </div>
      </main>
    </>
  );
}
