// src/app/profile/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Header from "../components/Header"; // 1. Header 컴포넌트 임포트
import ChangePasswordModal from "../components/ChangePasswordModal";
import NotificationSettingsModal from "../components/NotificationSettingsModal";
import AvatarUploadModal from "../components/AvatarUploadModal"; // ✅ 추가
import { UserProfile } from "@/data/profile";
import EditProfileModal from "../components/EditProfileModal";

export default function ProfilePage() {
  const [showChangePw, setShowChangePw] = useState(false);
  const [showNotiModal, setShowNotiModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false); // ✅ 추가
  const [showEditModal, setShowEditModal] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 프로필 데이터 가져오기
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/profile");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: UserProfile = await response.json();
        setUserProfile(data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch profile");
        console.error("Error fetching profile:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // 프로필 데이터 업데이트 (PUT 요청)
  const updateProfile = async (updatedData: Partial<UserProfile>): Promise<boolean> => {
    if (!userProfile) return false;
    // Optimistic UI update for avatar
    if (updatedData.avatarUrl) {
        setUserProfile(prev => prev ? { ...prev, ...updatedData } : null);
    } else {
        setIsLoading(true);
    }
    setError(null);
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...userProfile, ...updatedData }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: UserProfile = await response.json();
      setUserProfile(data); // Re-sync with server state
      return true;
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
      console.error("Error updating profile:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ 아바타 저장 핸들러 함수 추가
  const handleAvatarSave = async (file: File) => {
    console.log("새 프로필 사진 저장:", file.name);
    // 실제 앱에서는 여기서 파일을 서버/스토리지에 업로드하고 URL을 받아옵니다.
    // 예: const newAvatarUrl = await uploadFileToServer(file);
    
    // 여기서는 임시로 클라이언트에서 생성한 URL로 낙관적 업데이트를 수행합니다.
    const tempUrl = URL.createObjectURL(file);
    updateProfile({ avatarUrl: tempUrl });
    
    // 실제 API 호출 후 URL.revokeObjectURL(tempUrl) 호출 필요
    setShowAvatarModal(false);
  };


  if (isLoading && !userProfile) { // userProfile이 있으면 로딩 중에도 렌더링
    return (
      <div className="flex min-h-[100dvh] w-full h-full items-center justify-center font-pretendard" style={{ backgroundColor: 'var(--background-color)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--accent-color)' }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center font-pretendard text-red-500" style={{ backgroundColor: 'var(--background-color)' }}>
        <p>오류: {error}</p>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center font-pretendard" style={{ backgroundColor: 'var(--background-color)' }}>
        <p>프로필 데이터를 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-[100dvh] flex-col font-pretendard" style={{ backgroundColor: 'var(--background-color)', color: 'var(--text-color)' }}>
      <Header /> {/* 2. PC용 Header 컴포넌트 추가 */}

      {/* 기존 모바일 Header (PC에서는 숨김 처리) */}
      <header className="sticky top-0 z-20 backdrop-blur-sm lg:hidden" style={{ backgroundColor: 'rgba(245, 241, 236, 0.8)'}}>
        <div className="flex items-center justify-between p-4">
          <button className="active:scale-95 transition-transform" type="button" style={{ color: 'var(--text-color)' }}>
            <svg fill="currentColor" height="24" width="24" viewBox="0 0 256 256">
              <path d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z" />
            </svg>
          </button>
          <h1 className="text-xl font-bold">내 정보</h1>
          <div className="w-6" />
        </div>
      </header>
      
      {/* 기존 PC Header는 완전히 삭제합니다. */}

      <main className="flex-1 w-full max-w-7xl mx-auto p-4 lg:p-8 space-y-6">
        {/* Avatar */}
        <section className="text-center lg:text-left lg:flex lg:items-center lg:space-x-8 lg:bg-white lg:p-8 lg:rounded-2xl lg:shadow-sm">
          <div className="relative inline-block">
            <img
              src={userProfile.avatarUrl} // ✅ 동적 데이터로 변경
              alt="User profile picture"
              className="object-cover w-24 h-24 rounded-full shadow-sm lg:w-32 lg:h-32"
            />
            <button
              onClick={() => setShowAvatarModal(true)} // ✅ 추가
              className="absolute bottom-0 right-0 rounded-full p-1.5 shadow-md active:scale-95 transition-transform lg:p-2"
              type="button"
              tabIndex={-1}
              style={{ backgroundColor: 'var(--accent-color)' }}
            >
              <svg className="w-4 h-4 text-white lg:w-5 lg:h-5" fill="currentColor" viewBox="0 0 256 256">
                <path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,164.12V208a16,16,0,0,0,16,16H92.12A15.86,15.86,0,0,0,104.24,219.31L227.31,96a16,16,0,0,0,0-22.63ZM92.12,208H48V164.12L152,60.12l43.89,43.89Z" />
              </svg>
            </button>
          </div>
          <div className="mt-4 lg:mt-0">
            <h2 className="text-2xl font-bold lg:text-3xl">{userProfile.nickname}</h2>
            <p className="text-md lg:text-lg" style={{ color: 'var(--subtle-text-color)' }}>{userProfile.name}</p>
          </div>
        </section>

        <div className="lg:grid lg:grid-cols-5 lg:gap-8">
            <div className="lg:col-span-2 space-y-6">
                {/* 사용자 정보 */}
                <section className="py-4 mx-3 space-y-3 bg-white shadow-sm rounded-xl px-7 lg:mx-0 lg:p-6">
                  <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-color)' }}>사용자 정보</h3>
            <button
              onClick={() => setShowEditModal(true)}
              className="font-semibold text-sm transition-colors hover:opacity-80 active:opacity-90"
              style={{ color: 'var(--accent-color)' }}
            >
              Edit
            </button>
          </div>

          {/* 닉네임 */}
          <div className="flex items-center p-2 rounded-lg transition-transform hover:translate-x-0.5 will-change-transform">
            <div className="p-2 rounded-full">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" style={{ stroke: 'var(--accent-color)' }}>
                <path
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <div className="flex-1 ml-3">
              <p className="block text-sm font-medium mb-1" style={{ color: 'var(--subtle-text-color)' }}>필명</p>
              <p className="text-sm font-medium" style={{ color: 'var(--text-color)' }}>{userProfile.nickname}</p>
            </div>
          </div>

          {/* 이름 */}
          <div className="flex items-center p-2 rounded-lg transition-transform hover:translate-x-0.5 will-change-transform">
            <div className="p-2 rounded-full">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 256 256" style={{ color: 'var(--accent-color)' }}>
                <path d="M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z" />
              </svg>
            </div>
            <div className="flex-1 ml-3">
              <p className="block text-sm font-medium mb-1" style={{ color: 'var(--subtle-text-color)' }}>이름</p>
              <p className="text-sm font-medium" style={{ color: 'var(--text-color)' }}>{userProfile.name}</p>
            </div>
          </div>

          {/* 이메일 */}
          <div className="flex items-center p-2 rounded-lg transition-transform hover:translate-x-0.5 will-change-transform">
            <div className="p-2 rounded-full">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 256 256" style={{ color: 'var(--accent-color)' }}>
                <path d="M224,48H32a8,8,0,0,0-8,8V192a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A8,8,0,0,0,224,48Zm-8,144H40V74.19l83.53,52.2a8,8,0,0,0,9,0L216,74.19V192Z" />
              </svg>
            </div>
            <div className="flex-1 ml-3">
              <p className="block text-sm font-medium mb-1" style={{ color: 'var(--subtle-text-color)' }}>이메일 주소</p>
              <p className="text-sm font-medium" style={{ color: 'var(--text-color)' }}>{userProfile.email}</p>
            </div>
          </div>

          {/* 전화번호 */}
          <div className="flex items-center p-2 rounded-lg transition-transform hover:translate-x-0.5 will-change-transform">
            <div className="p-2 rounded-full">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" style={{ stroke: 'var(--accent-color)' }}>
                <path
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <div className="flex-1 ml-3">
              <p className="block text-sm font-medium mb-1" style={{ color: 'var(--subtle-text-color)' }}>전화번호</p>
              <p className="text-sm font-medium" style={{ color: 'var(--text-color)' }}>{userProfile.phone}</p>
            </div>
          </div>
        </section>
            </div>
            
            <div className="lg:col-span-3">
                {/* 계정 관리 */}
                <section className="px-8 py-6 mx-3 mt-6 bg-white shadow-sm rounded-xl lg:mx-0 lg:mt-0 lg:p-6">
                  <h3 className="mb-4 text-lg font-semibold">계정 관리</h3>
                  <div className="space-y-3">
                    {/* 비밀번호 변경 */}
            <button
              type="button"
              onClick={() => setShowChangePw(true)}
              className="group flex items-center p-3 rounded-lg hover:bg-[#F5F3EC] transition-colors w-full"
            >
              <div className="p-2 bg-[#D2B48C]/20 rounded-full transition-transform group-active:scale-95">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--accent-color)' }}>
                  <path
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </div>
              <span className="ml-4 font-medium text-sm" style={{ color: 'var(--text-color)' }}>비밀번호 변경</span>
              <svg className="ml-auto w-5 h-5" fill="currentColor" viewBox="0 0 256 256" style={{ color: 'var(--subtle-text-color)' }}>
                <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z" />
              </svg>
            </button>

            {/* 사용자 알림 설정 */}
            <button
              type="button"
              onClick={() => setShowNotiModal(true)}
              className="group flex items-center p-3 rounded-lg hover:bg-[#F5F3EC] transition-colors w-full"
            >
              <div className="p-2 bg-[#D2B48C]/20 rounded-full transition-transform group-active:scale-95">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--accent-color)' }}>
                  <path
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </div>
              <span className="ml-4 font-medium text-sm" style={{ color: 'var(--text-color)' }}>사용자 알림 설정</span>
              <svg className="ml-auto w-5 h-5" fill="currentColor" viewBox="0 0 256 256" style={{ color: 'var(--subtle-text-color)' }}>
                <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z" />
              </svg>
            </button>

            {/* 결제 설정 */}
            <a className="group flex items-center p-3 rounded-lg hover:bg-[#F5F3EC] transition-colors" href="#">
              <div className="p-2 bg-[#D2B48C]/20 rounded-full transition-transform group-active:scale-95">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--accent-color)' }}>
                  <path
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </div>
              <span className="ml-4 font-medium text-sm" style={{ color: 'var(--text-color)' }}>결제 설정</span>
              <svg className="ml-auto w-5 h-5" fill="currentColor" viewBox="0 0 256 256" style={{ color: 'var(--subtle-text-color)' }}>
                <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z" />
              </svg>
            </a>
                  </div>
                </section>
            </div>
        </div>

        {/* 고정 네비에 가리지 않도록 정확히 그 높이만큼만 여백 확보 */}
        <div aria-hidden className="h-[calc(64px+env(safe-area-inset-bottom))] lg:hidden" />
      </main>

      {/* 고정 하단 네비 */}
      

      {/* 모달들 */}
      <ChangePasswordModal
        open={showChangePw}
        onClose={() => setShowChangePw(false)}
        onSubmit={(newPassword) => {
          console.log("비밀번호 변경 요청:", newPassword);
          setShowChangePw(false);
        }}
      />
      <NotificationSettingsModal
        open={showNotiModal}
        onClose={() => setShowNotiModal(false)}
        initialSettings={userProfile.notificationSettings}
        onSave={(settings) => {
          console.log("알림 설정 저장 요청:", settings);
          updateProfile({ notificationSettings: settings });
          setShowNotiModal(false);
        }}
      />
      {/* ✅ 아바타 업로드 모달 추가 */}
      <AvatarUploadModal
        open={showAvatarModal}
        currentAvatarUrl={userProfile.avatarUrl}
        onClose={() => setShowAvatarModal(false)}
        onSave={handleAvatarSave}
      />

      <EditProfileModal
        open={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setError(null);
        }}
        userProfile={userProfile}
        onSave={async (updatedProfile) => {
          const success = await updateProfile(updatedProfile);
          if (success) {
            setShowEditModal(false);
          }
        }}
        error={error}
        setError={setError}
      />
    </div>
  );
}
