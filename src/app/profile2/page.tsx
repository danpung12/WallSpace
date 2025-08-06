"use client";

import { useState, useRef } from "react";
import Head from "next/head";

export default function EditProfile() {
  // 기본 폼 값
  const defaultForm = {
    nickname: "Jess",
    name: "Selena",
    email: "jessica@example.com",
    phone: "+1 (555) 123-4567",
  };

  const [form, setForm] = useState(defaultForm);
  const [isEditing, setIsEditing] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);

  // 입력 값 변경 핸들러
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setForm({ ...form, [e.target.name]: e.target.value });
};
  // 편집 시작
  const handleEdit = () => setIsEditing(true);

  // 편집 취소
  const handleCancel = () => {
    setForm(defaultForm);
    setIsEditing(false);
  };

  // 저장
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  // 저장 로직 (API 등)
  setIsEditing(false);
};
  return (
    <>
      <Head>
        <title>User Profile</title>

      </Head>
      <div
        className="relative flex flex-col min-h-screen overflow-x-hidden"
        id="app-container"
        style={{
          fontFamily: "'Pretendard', sans-serif",
          backgroundColor: "#FDFBF8",
          color: "#3D2C1D",
          minHeight: "max(884px, 100dvh)",
        }}
      >
        {/* Header */}
        <header className="sticky top-0 z-10 bg-[#FDFBF8CC] backdrop-blur-sm">
          <div className="flex items-center justify-between p-4">
            <button className="text-[#3D2C1D]">
              <svg fill="currentColor" height="24" width="24" viewBox="0 0 256 256">
                <path d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-[#3D2C1D]">Profile</h1>
            <div className="w-6" />
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 px-4 py-4 space-y-6">
          {/* 프로필 이미지 */}
          <section className="text-center">
            <div className="relative inline-block">
              <img
                alt="User profile picture"
                className="object-cover w-24 h-24 rounded-full"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDvM8BeQVRtX-JPgzmA6JCZ0Sx8m-Ver8hiSd4I9V_JbwzHPoychRH2Ok3qqU_bmgZPSQAn_047aMc8nCL1qI5qDcnERJC5Hqq2YwObo_LB9UrvnU4GTgYEp5aGCssWwnVl91-JOk2Nx9SY2vvbx16_bIBhG1DjRKgVPd3pt3GOOA1vAWxA8oGWfQy_pK3stg40qzQ4UZ1g0ywp9k6U8BQBA4cLy-blz0639c4a5y7sWmirFsfQByuYFDQAvMn-duibl6-hECUU606Z"
              />
              <button
                className="absolute bottom-0 right-0 bg-[#D2B48C] rounded-full p-1.5 shadow-md"
                type="button"
              >
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,164.12V208a16,16,0,0,0,16,16H92.12A15.86,15.86,0,0,0,104.24,219.31L227.31,96a16,16,0,0,0,0-22.63ZM92.12,208H48V164.12L152,60.12l43.89,43.89ZM161.37,94.63l-43.89-43.89L136,32.12,180,76.11Zm30.26-30.25-11.31-11.32,11.31-11.31,11.32,11.31Z" />
                </svg>
              </button>
            </div>
            <h2 className="mt-4 text-2xl font-bold">Jessica Miller</h2>
            <p className="text-md text-[#8C7853]">Artist &amp; Designer</p>
          </section>

          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="max-w-md mx-auto space-y-4"
          >
            {/* Personal Info */}
            <section className="py-4 mx-3 space-y-3 bg-white shadow-sm rounded-xl px-7">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#3D2C1D]">사용자 정보</h3>
                {!isEditing && (
                  <div id="edit-button-container">
                    <button
                      className="text-[#D2B48C] font-semibold text-sm"
                      type="button"
                      onClick={handleEdit}
                    >
                      Edit
                    </button>
                  </div>
                )}
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
                    {!isEditing ? (
                      <p className="text-sm font-medium text-[#3D2C1D]">{form.nickname}</p>
                    ) : (
                      <input
                        className="w-full border border-[#F0EAD6] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#D2B48C] focus:border-transparent transition-colors text-sm font-medium"
                        name="nickname"
                        type="text"
                        value={form.nickname}
                        onChange={handleChange}
                      />
                    )}
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
                    {!isEditing ? (
                      <p className="text-sm font-medium text-[#3D2C1D]">{form.name}</p>
                    ) : (
                      <input
                        className="w-full border border-[#F0EAD6] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#D2B48C] focus:border-transparent transition-colors text-sm font-medium"
                        name="name"
                        type="text"
                        value={form.name}
                        onChange={handleChange}
                      />
                    )}
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
                    {!isEditing ? (
                      <p className="text-sm font-medium text-[#3D2C1D]">{form.email}</p>
                    ) : (
                      <input
                        className="w-full border border-[#F0EAD6] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#D2B48C] focus:border-transparent transition-colors text-sm font-medium"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                      />
                    )}
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
                    {!isEditing ? (
                      <p className="text-sm font-medium text-[#3D2C1D]">{form.phone}</p>
                    ) : (
                      <input
                        className="w-full border border-[#F0EAD6] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#D2B48C] focus:border-transparent transition-colors text-sm font-medium"
                        name="phone"
                        type="tel"
                        value={form.phone}
                        onChange={handleChange}
                      />
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* 계정 설정 영역 */}
            <section className="px-4 py-4 bg-white shadow-sm rounded-xl">
              <h3 className="text-lg font-semibold text-[#3D2C1D] mb-4">Account</h3>
              <div className="space-y-3">
                {/* Change Password */}
                <a className="flex items-center p-2 bg-[#F0EAD6]/50 rounded-lg hover:bg-[#F0EAD6] transition-colors" href="#">
                  <div className="p-2 bg-[#D2B48C]/20 rounded-full">
                    <svg className="w-6 h-6 text-[#D2B48C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                  </div>
                  <span className="ml-3 font-medium text-[#3D2C1D] text-sm">Change Password</span>
                  <svg className="ml-auto w-5 h-5 text-[#8C7853]" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z" />
                  </svg>
                </a>
                {/* Email Preferences */}
                <a className="flex items-center p-2 bg-[#F0EAD6]/50 rounded-lg hover:bg-[#F0EAD6] transition-colors" href="#">
                  <div className="p-2 bg-[#D2B48C]/20 rounded-full">
                    <svg className="w-6 h-6 text-[#D2B48C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                  </div>
                  <span className="ml-3 font-medium text-[#3D2C1D] text-sm">Email Preferences</span>
                  <svg className="ml-auto w-5 h-5 text-[#8C7853]" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z" />
                  </svg>
                </a>
                {/* Notification Settings */}
                <a className="flex items-center p-2  rounded-lg hover:bg-[#F0EAD6] transition-colors" href="#">
                  <div className="p-2 bg-[#D2B48C]/20 rounded-full">
                    <svg className="w-6 h-6 text-[#D2B48C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                  </div>
                  <span className="ml-3 font-medium text-[#3D2C1D] text-sm whitespace-nowrap">
                    Notification Settings
                  </span>
                  <svg className="ml-auto w-5 h-5 text-[#8C7853]" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z" />
                  </svg>
                </a>
                {/* Payment Methods */}
                <a className="flex items-center p-2 bg-[#F0EAD6]/50 rounded-lg hover:bg-[#F0EAD6] transition-colors" href="#">
                  <div className="p-2 bg-[#D2B48C]/20 rounded-full">
                    <svg className="w-6 h-6 text-[#D2B48C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                  </div>
                  <span className="ml-3 font-medium text-[#3D2C1D] text-sm">Payment Methods</span>
                  <svg className="ml-auto w-5 h-5 text-[#8C7853]" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z" />
                  </svg>
                </a>
              </div>
            </section>

            {/* 저장/취소 버튼 */}
            {isEditing && (
              <div className="px-2 pt-2 space-y-3" id="save-cancel-buttons">
                <button
                  className="bg-[#D2B48C] text-white py-3 px-6 rounded-lg font-semibold hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-[#D2B48C] focus:ring-opacity-50 transition-colors w-full"
                  type="submit"
                >
                  Save Changes
                </button>
                <button
                  className="bg-transparent text-[#8C7853] py-3 px-6 rounded-lg font-semibold hover:bg-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-[#D2B48C] focus:ring-opacity-50 transition-colors w-full text-center"
                  type="button"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              </div>
            )}
          </form>
        </main>

        {/* Footer */}
        <footer className="sticky bottom-0 border-t border-gray-100 bg-white/90 backdrop-blur-sm">
          <nav className="flex items-center justify-around h-16">
            <a className="flex flex-col items-center justify-center gap-1 text-[#8C7853]" href="#">
              <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24">
                <path d="M218.83,103.77l-80-75.48a1.14,1.14,0,0,1-.11-.11,16,16,0,0,0-21.53,0l-.11.11L37.17,103.77A16,16,0,0,0,32,115.55V208a16,16,0,0,0,16,16H96a16,16,0,0,0,16-16V160h32v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V115.55A16,16,0,0,0,218.83,103.77ZM208,208H160V160a16,16,0,0,0-16-16H112a16,16,0,0,0-16,16v48H48V115.55l.11-.1L128,40l79.9,75.43.11.1Z" />
              </svg>
              <p className="text-xs font-medium">Home</p>
            </a>
            <a className="flex flex-col items-center justify-center gap-1 text-[#8C7853]" href="#">
              <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24">
                <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" />
              </svg>
              <p className="text-xs font-medium">Search</p>
            </a>
            <a className="flex flex-col items-center justify-center gap-1 text-[#8C7853]" href="#">
              <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24">
                <path d="M216,56v60a4,4,0,0,1-4,4H136V44a4,4,0,0,1,4-4h60A16,16,0,0,1,216,56ZM116,40H56A16,16,0,0,0,40,56v60a4,4,0,0,0,4,4h76V44A4,4,0,0,0,116,40Zm96,96H136v76a4,4,0,0,0,4,4h60a16,16,0,0,0,16-16V140A4,4,0,0,0,212,136ZM40,140v60a16,16,0,0,0,16,16h60a4,4,0,0,0,4-4V136H44A4,4,0,0,0,40,140Z" />
              </svg>
              <p className="text-xs font-medium">Dashboard</p>
            </a>
            <a className="flex flex-col items-center justify-center gap-1 text-[#D2B48C]" href="#">
              <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24">
                <path d="M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z" />
              </svg>
              <p className="text-xs font-bold">Profile</p>
            </a>
          </nav>
        </footer>
      </div>
    </>
  );
}
