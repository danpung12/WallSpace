"use client";

import { useState } from "react";
import BottomNav from "../components/BottomNav";
import ChangePasswordModal from "../components/ChangePasswordModal";
import NotificationSettingsModal from "../components/NotificationSettingsModal"; // 새로 import
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
  const [showNotiModal, setShowNotiModal] = useState(false); // 추가

  return (
    <div
      className="relative flex min-h-screen flex-col bg-[#FDFBF8] text-[#3D2C1D] font-pretendard"
      style={{ minHeight: "max(884px, 100dvh)" }}
    >
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#FDFBF8]/80 backdrop-blur-sm">
        <div className="flex items-center justify-between p-4">
          <button className="text-[#3D2C1D]">
            {/* Back Icon */}
            <svg fill="currentColor" height="24" width="24" viewBox="0 0 256 256">
              <path d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z"/>
            </svg>
          </button>
          <h1 className="text-xl font-bold">내 정보</h1>
          <div className="w-6"></div>
        </div>
      </header>

      <main className="flex-1 p-4 space-y-6">
        {/* Profile Avatar */}
        <section className="text-center">
          <div className="relative inline-block">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDvM8BeQVRtX-JPgzmA6JCZ0Sx8m-Ver8hiSd4I9V_JbwzHPoychRH2Ok3qqU_bmgZPSQAn_047aMc8nCL1qI5qDcnERJC5Hqq2YwObo_LB9UrvnU4GTgYEp5aGCssWwnVl91-JOk2Nx9SY2vvbx16_bIBhG1DjRKgVPd3pt3GOOA1vAWxA8oGWfQy_pK3stg40qzQ4UZ1g0ywp9k6U8BQBA4cLy-blz0639c4a5y7sWmirFsfQByuYFDQAvMn-duibl6-hECUU606Z"
              alt="User profile picture"
              className="object-cover w-24 h-24 rounded-full"
            />
            <button
              className="absolute bottom-0 right-0 bg-[#D2B48C] rounded-full p-1.5 shadow-md"
              tabIndex={-1}
              type="button"
            >
              {/* Edit Pen Icon */}
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 256 256">
                <path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,164.12V208a16,16,0,0,0,16,16H92.12A15.86,15.86,0,0,0,104.24,219.31L227.31,96a16,16,0,0,0,0-22.63ZM92.12,208H48V164.12L152,60.12l43.89,43.89ZM161.37,94.63l-43.89-43.89L136,32.12,180,76.11Zm30.26-30.25-11.31-11.32,11.31-11.31,11.32,11.31Z"/>
              </svg>
            </button>
          </div>
          <h2 className="mt-4 text-2xl font-bold">{user.nickname}</h2>
          <p className="text-md text-[#8C7853]">{user.name}</p>
        </section>

        {/* Profile Info */}
        <section className="py-4 mx-3 space-y-3 bg-white shadow-sm rounded-xl px-7">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[#3D2C1D]">사용자 정보</h3>
            {/* Edit 버튼 클릭 시 /edit로 이동 */}
            <Link
              href="/edit"
              className="text-[#D2B48C] font-semibold text-sm"
            >
              Edit
            </Link>
          </div>
          <div className="space-y-3">
            {/* Nickname */}
            <div className="flex items-center p-2 rounded-lg">
              <div className="p-2 rounded-full">
                <svg className="w-6 h-6" fill="none" stroke="#D2B48C" viewBox="0 0 24 24">
                  <path 
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <div className="flex-1 ml-3">
                <p className="block text-sm font-medium text-[#8C7853] mb-1">필명</p>
                <p className="text-sm font-medium text-[#3D2C1D]">{user.nickname}</p>
              </div>
            </div>
            {/* Full Name */}
            <div className="flex items-center p-2 rounded-lg">
              <div className="p-2 rounded-full">
                <svg className="w-6 h-6 text-[#D2B48C]" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z" />
                </svg>
              </div>
              <div className="flex-1 ml-3">
                <p className="block text-sm font-medium text-[#8C7853] mb-1">이름</p>
                <p className="text-sm font-medium text-[#3D2C1D]">{user.name}</p>
              </div>
            </div>
            {/* Email */}
            <div className="flex items-center p-2 rounded-lg">
              <div className="p-2 rounded-full">
                <svg className="w-6 h-6 text-[#D2B48C]" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M224,48H32a8,8,0,0,0-8,8V192a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A8,8,0,0,0,224,48Zm-8,144H40V74.19l83.53,52.2a8,8,0,0,0,9,0L216,74.19V192Z" />
                </svg>
              </div>
              <div className="flex-1 ml-3">
                <p className="block text-sm font-medium text-[#8C7853] mb-1">이메일 주소</p>
                <p className="text-sm font-medium text-[#3D2C1D]">{user.email}</p>
              </div>
            </div>
            {/* Phone */}
            <div className="flex items-center p-2 rounded-lg">
              <div className="p-2 rounded-full">
                <svg className="w-6 h-6" fill="none" stroke="#D2B48C" viewBox="0 0 24 24">
                  <path 
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <div className="flex-1 ml-3">
                <p className="block text-sm font-medium text-[#8C7853] mb-1">전화번호</p>
                <p className="text-sm font-medium text-[#3D2C1D]">{user.phone}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Account Management */}
        <section className="px-8 py-6 mx-3 mt-6 bg-white shadow-sm rounded-xl">
          <h3 className="mb-4 text-lg font-semibold">계정 관리</h3>
          <div className="space-y-3 ">
            {/* Change Password */}
            <button
              type="button"
              onClick={() => setShowChangePw(true)}
              className="flex items-center p-3 bg-[#FAF8F2] rounded-lg hover:bg-[#F5F3EC] transition-colors w-full"
            >
              <div className="p-2 bg-[#D2B48C]/20 rounded-full">
                {/* Lock Icon */}
                <svg className="w-6 h-6 text-[#D2B48C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}/>
                </svg>
              </div>
              <span className="ml-4 font-medium text-[#3D2C1D]">비밀번호 변경</span>
              <svg className="ml-auto w-5 h-5 text-[#8C7853]" fill="currentColor" viewBox="0 0 256 256">
                <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"/>
              </svg>
            </button>
            {/* Notification Settings */}
            <button
              type="button"
              onClick={() => setShowNotiModal(true)}
              className="flex items-center p-3 bg-[#FAF8F2] rounded-lg hover:bg-[#F5F3EC] transition-colors w-full"
            >
              <div className="p-2 bg-[#D2B48C]/20 rounded-full">
                {/* Bell Icon */}
                <svg className="w-6 h-6 text-[#D2B48C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}/>
                </svg>
              </div>
              <span className="ml-4 font-medium text-[#3D2C1D]">사용자 알림 설정</span>
              <svg className="ml-auto w-5 h-5 text-[#8C7853]" fill="currentColor" viewBox="0 0 256 256">
                <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"/>
              </svg>
            </button>
            {/* Payment Methods */}
            <a className="flex items-center p-3 bg-[#FAF8F2] rounded-lg hover:bg-[#F5F3EC] transition-colors" href="#">
              <div className="p-2 bg-[#D2B48C]/20 rounded-full">
                {/* Card Icon */}
                <svg className="w-6 h-6 text-[#D2B48C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}/>
                </svg>
              </div>
              <span className="ml-4 font-medium text-[#3D2B1D]">결제 설정</span>
              <svg className="ml-auto w-5 h-5 text-[#8C7853]" fill="currentColor" viewBox="0 0 256 256">
                <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"/>
              </svg>
            </a>
          </div>
        </section>
      </main>
      {/* Footer Navigation */}
      <BottomNav />

      {/* 비밀번호 변경 모달 */}
      <ChangePasswordModal
        open={showChangePw}
        onClose={() => setShowChangePw(false)}
        onSubmit={() => {
          // 실제 비밀번호 변경 로직 처리 후 모달 닫기
          setShowChangePw(false);
        }}
      />

      {/* 알림 설정 모달 */}
<NotificationSettingsModal
  open={showNotiModal}
  onClose={() => setShowNotiModal(false)}
  onSave={(_: any) => {
    setShowNotiModal(false);
  }}
/>
      {/* Pretendard font 적용 */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Pretendard:wght@400;500;600;700&display=swap');
        html {
          font-family: 'Pretendard', sans-serif;
        }
      `}</style>
    </div>
  );
}
