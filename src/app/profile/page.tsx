// src/app/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const USER_DEFAULT = {
  nickname: "Selena",
  name: "홍길동",
  email: "selena@example.com",
  phone: "010-1234-5678",
};

export default function ProfilePage() {
  const user = USER_DEFAULT;
  const [showChangePw, setShowChangePw] = useState(false);
  const [showNotiModal, setShowNotiModal] = useState(false);

  return (
    <div className="relative flex min-h-[100dvh] flex-col bg-[#FDFBF8] text-[#3D2C1D] font-pretendard">
      {/* 모달/시트 유틸 + 애니메이션 + 네비 높이 변수 */}
      <style jsx global>{`
        :root { --bottom-nav-h: 64px; }
        .modal-safe-bottom { padding-bottom: calc(var(--bottom-nav-h) + env(safe-area-inset-bottom)); }
        .modal-footer-safe { margin-bottom: calc(var(--bottom-nav-h) + env(safe-area-inset-bottom)); }
        .bottom-sheet-safe { bottom: calc(var(--bottom-nav-h) + env(safe-area-inset-bottom)) !important; }
        @keyframes sheetUp { from { transform: translateY(16px); opacity: .96; } to { transform: translateY(0); opacity: 1; } }
        .sheet-animate { animation: sheetUp 260ms cubic-bezier(0.2, 0.7, 0.2, 1); }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#FDFBF8]/80 backdrop-blur-sm">
        <div className="flex items-center justify-between p-4">
          <button className="text-[#3D2C1D] active:scale-95 transition-transform" type="button">
            <svg fill="currentColor" height="24" width="24" viewBox="0 0 256 256">
              <path d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z" />
            </svg>
          </button>
          <h1 className="text-xl font-bold">내 정보</h1>
          <div className="w-6" />
        </div>
      </header>

      <main className="flex-1 p-4 space-y-6 pb-0">
        {/* Avatar */}
        <section className="text-center">
          <div className="relative inline-block">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDvM8BeQVRtX-JPgzmA6JCZ0Sx8m-Ver8hiSd4I9V_JbwzHPoychRH2Ok3qqU_bmgZPSQAn_047aMc8nCL1qI5qDcnERJC5Hqq2YwObo_LB9UrvnU4GTgYEp5aGCssWwnVl91-JOk2Nx9SY2vvbx16_bIBhG1DjRKgVPd3pt3GOOA1vAWxA8oGWfQy_pK3stg40qzQ4UZ1g0ywp9k6U8BQBA4cLy-blz0639c4a5y7sWmirFsfQByuYFDQAvMn-duibl6-hECUU606Z"
              alt="User profile"
              className="object-cover w-24 h-24 rounded-full shadow-sm"
            />
            <button
              className="absolute bottom-0 right-0 bg-[#D2B48C] rounded-full p-1.5 shadow-md active:scale-95 transition-transform"
              type="button"
              tabIndex={-1}
            >
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 256 256">
                <path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,164.12V208a16,16,0,0,0,16,16H92.12A15.86,15.86,0,0,0,104.24,219.31L227.31,96a16,16,0,0,0,0-22.63ZM92.12,208H48V164.12L152,60.12l43.89,43.89Z" />
              </svg>
            </button>
          </div>
          <h2 className="mt-4 text-2xl font-bold">{user.nickname}</h2>
          <p className="text-md text-[#8C7853]">{user.name}</p>
        </section>

        {/* 사용자 정보 */}
        <section className="py-4 mx-3 space-y-3 bg-white shadow-sm rounded-xl px-7">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[#3D2C1D]">사용자 정보</h3>
            <Link href="/edit" className="text-[#D2B48C] font-semibold text-sm hover:opacity-80 active:opacity-90">
              Edit
            </Link>
          </div>

          {/* 닉네임 */}
          <Row icon={
            <svg className="w-6 h-6" fill="none" stroke="#D2B48C" viewBox="0 0 24 24">
              <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
            </svg>
          } label="필명" value={user.nickname} />

          {/* 이름 */}
          <Row icon={
            <svg className="w-6 h-6 text-[#D2B48C]" fill="currentColor" viewBox="0 0 256 256">
              <path d="M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z" />
            </svg>
          } label="이름" value={user.name} />

          {/* 이메일 */}
          <Row icon={
            <svg className="w-6 h-6 text-[#D2B48C]" fill="currentColor" viewBox="0 0 256 256">
              <path d="M224,48H32a8,8,0,0,0-8,8V192a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A8,8,0,0,0,224,48Zm-8,144H40V74.19l83.53,52.2a8,8,0,0,0,9,0L216,74.19V192Z" />
            </svg>
          } label="이메일 주소" value={user.email} />

          {/* 전화번호 */}
          <Row icon={
            <svg className="w-6 h-6" fill="none" stroke="#D2B48C" viewBox="0 0 24 24">
              <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
            </svg>
          } label="전화번호" value={user.phone} />
        </section>

        {/* 계정 관리 */}
        <section className="px-8 py-6 mx-3 mt-6 bg-white shadow-sm rounded-xl">
          <h3 className="mb-4 text-lg font-semibold">계정 관리</h3>
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setShowChangePw(true)}
              className="group flex items-center p-3 rounded-lg hover:bg-[#F5F3EC] transition-colors w-full"
            >
              <div className="p-2 bg-[#D2B48C]/20 rounded-full transition-transform group-active:scale-95">
                <svg className="w-6 h-6 text-[#D2B48C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}/>
                </svg>
              </div>
              <span className="ml-4 font-medium text-[#3D2C1D] text-sm">비밀번호 변경</span>
              <svg className="ml-auto w-5 h-5 text-[#8C7853]" fill="currentColor" viewBox="0 0 256 256">
                <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => setShowNotiModal(true)}
              className="group flex items-center p-3 rounded-lg hover:bg-[#F5F3EC] transition-colors w-full"
            >
              <div className="p-2 bg-[#D2B48C]/20 rounded-full transition-transform group-active:scale-95">
                <svg className="w-6 h-6 text-[#D2B48C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}/>
                </svg>
              </div>
              <span className="ml-4 font-medium text-[#3D2C1D] text-sm">사용자 알림 설정</span>
              <svg className="ml-auto w-5 h-5 text-[#8C7853]" fill="currentColor" viewBox="0 0 256 256">
                <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z" />
              </svg>
            </button>

            <a className="group flex items-center p-3 rounded-lg hover:bg-[#F5F3EC] transition-colors" href="#">
              <div className="p-2 bg-[#D2B48C]/20 rounded-full transition-transform group-active:scale-95">
                <svg className="w-6 h-6 text-[#D2B48C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}/>
                </svg>
              </div>
              <span className="ml-4 font-medium text-[#3D2B1D] text-sm">결제 설정</span>
              <svg className="ml-auto w-5 h-5 text-[#8C7853]" fill="currentColor" viewBox="0 0 256 256">
                <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z" />
              </svg>
            </a>
          </div>
        </section>

        {/* 고정 네비에 가리지 않도록 여백 확보 */}
        <div aria-hidden className="h-[calc(64px+env(safe-area-inset-bottom))]" />
      </main>

      {/* 인라인 모달들 */}
      <ChangePasswordSheet
        open={showChangePw}
        onClose={() => setShowChangePw(false)}
        onSubmit={() => setShowChangePw(false)}
      />
      <NotificationSettingsSheet
        open={showNotiModal}
        onClose={() => setShowNotiModal(false)}
        onSave={() => setShowNotiModal(false)}
      />
    </div>
  );
}

/* ---------- 재사용 행 UI (가벼운 컴포넌트) ---------- */
function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center p-2 rounded-lg transition-transform hover:translate-x-0.5 will-change-transform">
      <div className="p-2 rounded-full">{icon}</div>
      <div className="flex-1 ml-3">
        <p className="block text-sm font-medium text-[#8C7853] mb-1">{label}</p>
        <p className="text-sm font-medium text-[#3D2C1D]">{value}</p>
      </div>
    </div>
  );
}

/* ---------- 인라인 바텀시트들 ---------- */
function ChangePasswordSheet({
  open, onClose, onSubmit,
}: { open: boolean; onClose: () => void; onSubmit: () => void }) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000]">
      <button aria-label="닫기" className="absolute inset-0 bg-black/40" onClick={onClose} />
      <section className="fixed inset-x-0 bottom-0 bottom-sheet-safe z-[1001]" role="dialog" aria-modal="true">
        <div className="mx-auto w-[min(100vw,520px)]">
          <div className="sheet-animate rounded-t-2xl bg-white shadow-[0_-12px_28px_rgba(0,0,0,0.12)] border border-[#EAEAEA] overflow-hidden">
            <header className="flex items-center justify-between p-4">
              <h2 className="text-base font-bold text-[#3D2C1D]">비밀번호 변경</h2>
              <button onClick={onClose} aria-label="닫기" className="p-1 rounded hover:bg-black/5">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </header>

            <div className="modal-safe-bottom px-4 pb-4 space-y-4">
              <Field label="현재 비밀번호" type="password" />
              <Field label="새 비밀번호" type="password" />
              <Field label="새 비밀번호 확인" type="password" />
              <div className="modal-footer-safe pt-3">
                <button
                  onClick={onSubmit}
                  className="w-full bg-[#D2B48C] text-white font-semibold py-3 rounded-xl active:scale-[0.99] transition"
                >
                  변경하기
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function NotificationSettingsSheet({
  open, onClose, onSave,
}: { open: boolean; onClose: () => void; onSave: () => void }) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000]">
      <button aria-label="닫기" className="absolute inset-0 bg-black/40" onClick={onClose} />
      <section className="fixed inset-x-0 bottom-0 bottom-sheet-safe z-[1001]" role="dialog" aria-modal="true">
        <div className="mx-auto w-[min(100vw,520px)]">
          <div className="sheet-animate rounded-t-2xl bg-white shadow-[0_-12px_28px_rgba(0,0,0,0.12)] border border-[#EAEAEA] overflow-hidden">
            <header className="flex items-center justify-between p-4">
              <h2 className="text-base font-bold text-[#3D2C1D]">알림 설정</h2>
              <button onClick={onClose} aria-label="닫기" className="p-1 rounded hover:bg-black/5">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </header>

            <div className="modal-safe-bottom px-4 pb-4 space-y-4">
              <Toggle label="신규 메시지 알림" defaultChecked />
              <Toggle label="예약 관련 알림" />
              <Toggle label="프로모션/소식 받기" />
              <div className="modal-footer-safe pt-3">
                <button
                  onClick={onSave}
                  className="w-full bg-[#D2B48C] text-white font-semibold py-3 rounded-xl active:scale-[0.99] transition"
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ---------- 인라인 폼 파츠 ---------- */
function Field({ label, type = "text" }: { label: string; type?: "text" | "password" }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#3D2C1D] mb-1">{label}</label>
      <input
        type={type}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-[#D2B48C] focus:ring-2 focus:ring-[#D2B48C]/30"
      />
    </div>
  );
}
function Toggle({ label, defaultChecked = false }: { label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center justify-between p-3 bg-[#F8F6F1] rounded-lg">
      <span className="text-sm text-[#3D2C1D]">{label}</span>
      <input type="checkbox" className="accent-[#D2B48C]" defaultChecked={defaultChecked} />
    </label>
  );
}
