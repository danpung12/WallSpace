"use client";

import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import ChangePasswordModal from "../../components/ChangePasswordModal";
import NotificationSettingsModal from "../../components/NotificationSettingsModal";
import UserSettingsModal from "../../components/UserSettingsModal";
import AvatarUploadModal from "../../components/AvatarUploadModal";
import LogoutConfirmationModal from "../../components/LogoutConfirmationModal";
import AlertModal from "../../components/AlertModal";
import { UserProfile } from "@/data/profile";
import { useDarkMode } from "../../context/DarkModeContext";
import { useRouter } from "next/navigation";
import { logoutUser } from "@/lib/api/auth";
import { useApi, mutate } from "@/lib/swr"; // SWR 추가

export default function GuestProfilePage() {
  const router = useRouter();
  const { isDarkMode, setDarkMode } = useDarkMode();
  const [showChangePw, setShowChangePw] = useState(false);
  const [showNotiModal, setShowNotiModal] = useState(false);
  const [showUserSettingsModal, setShowUserSettingsModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSocialLogin, setIsSocialLogin] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);

  // SWR로 프로필 데이터 가져오기
  const { data: profileData, error: profileError, isLoading: profileLoading } = useApi<UserProfile>('/api/profile');

  // 프로필 데이터 설정
  useEffect(() => {
    if (profileData) {
      setUserProfile(profileData);
      if (profileData.userSettings?.darkMode !== undefined) {
        setDarkMode(profileData.userSettings.darkMode);
      }
    }
    if (profileError) {
      setError(profileError.message || "Failed to fetch profile");
    }
    setIsLoading(profileLoading);
  }, [profileData, profileError, profileLoading, setDarkMode]);

  // SNS 로그인 여부 확인
  useEffect(() => {
    const checkSocialLogin = async () => {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const provider = user.app_metadata?.provider || 'email';
        setIsSocialLogin(provider !== 'email');
      }
    };
    if (profileData) {
      checkSocialLogin();
    }
  }, [profileData]);

  const updateProfile = async (updatedData: Partial<UserProfile>): Promise<boolean> => {
    if (!userProfile) return false;
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
      // 프로필 업데이트 후 캐시 무효화
      mutate('/api/profile');
      const data: UserProfile = await response.json();
      setUserProfile(data);
      return true;
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
      console.error("Error updating profile:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarSave = async (file: File) => {
    const base64Url = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const success = await updateProfile({ avatarUrl: base64Url });
    if (success) {
      setShowAvatarModal(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await logoutUser();
      if (error) {
        alert('로그아웃에 실패했습니다. 다시 시도해주세요.');
        return;
      }
      setShowLogoutModal(false);
      router.push('/');
    } catch (err) {
      alert('로그아웃 중 오류가 발생했습니다.');
    }
  };

  if (isLoading && !userProfile) {
    return (
      <div className="flex min-h-[100dvh] w-full h-full items-center justify-center font-pretendard bg-[#F5F1EC] dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D2B48C]"></div>
      </div>
    );
  }

  if (error || !userProfile) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center font-pretendard bg-[#F5F1EC] dark:bg-gray-900">
        <p className="text-red-500">프로필을 불러올 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-[100dvh] flex-col font-pretendard bg-[#F5F1EC] dark:bg-gray-900 text-[#2C2C2C] dark:text-gray-100">
      <Header />

      {/* 모바일 Header */}
      <header className="sticky top-0 z-20 backdrop-blur-sm lg:hidden bg-[rgba(245,241,236,0.8)] dark:bg-[rgba(31,41,55,0.8)]">
        <div className="flex items-center justify-between p-5">
          <button className="active:scale-95 transition-transform text-[#2C2C2C] dark:text-gray-100" type="button">
            <svg fill="currentColor" height="28" width="28" viewBox="0 0 256 256">
              <path d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-[#2C2C2C] dark:text-gray-100">내 정보</h1>
          <div className="w-7" />
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto p-4 lg:p-10 space-y-8">
        {/* Avatar */}
        <section className="text-center lg:text-left lg:flex lg:items-center lg:space-x-10 lg:bg-white dark:lg:bg-gray-800 lg:p-10 lg:rounded-3xl lg:shadow-md lg:border lg:border-gray-100 dark:lg:border-gray-700">
          <div className="relative inline-block group">
            <img
              src={userProfile.avatarUrl || '/default-profile.svg'}
              alt="User profile picture"
              className="object-cover w-28 h-28 rounded-full shadow-lg lg:w-40 lg:h-40 ring-4 ring-white dark:ring-gray-700"
              onError={(e) => {
                e.currentTarget.src = '/default-profile.svg';
              }}
            />
            <button
              onClick={() => setShowAvatarModal(true)}
              className="absolute bottom-1 right-1 rounded-full p-2 shadow-lg active:scale-95 transition-all duration-300 lg:p-3"
              type="button"
              style={{ background: 'linear-gradient(135deg, #D2B48C 0%, #B8996B 100%)' }}
            >
              <svg className="w-5 h-5 text-white lg:w-6 lg:h-6" fill="currentColor" viewBox="0 0 256 256">
                <path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,164.12V208a16,16,0,0,0,16,16H92.12A15.86,15.86,0,0,0,104.24,219.31L227.31,96a16,16,0,0,0,0-22.63ZM92.12,208H48V164.12L152,60.12l43.89,43.89Z" />
              </svg>
            </button>
          </div>
          <div className="mt-5 lg:mt-0">
            <h2 className="text-3xl font-bold lg:text-4xl text-[#2C2C2C] dark:text-gray-100">{userProfile.name}</h2>
            <p className="text-lg lg:text-xl mt-2 text-[#887563] dark:text-gray-400">{userProfile.email}</p>
          </div>
        </section>

        <div className="lg:grid lg:grid-cols-5 lg:gap-10">
          <div className="lg:col-span-2 space-y-8">
            {/* 사용자 정보 - 편집 버튼 없음, 전화번호와 닉네임 제외 */}
            <section className="py-5 px-5 mx-5 space-y-3 bg-white dark:bg-gray-800 shadow-md rounded-3xl lg:mx-0 lg:p-8 lg:space-y-4 border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg lg:text-xl font-bold text-[#2C2C2C] dark:text-gray-100 mb-2 lg:mb-3">사용자 정보</h3>

              {/* 이름 */}
              <div className="group flex items-center p-3 lg:p-4 rounded-xl transition-all duration-200 hover:bg-gradient-to-r hover:from-[#F5F3EC] hover:to-[#FAF8F5] dark:hover:from-gray-700 dark:hover:to-gray-700">
                <div className="p-2.5 lg:p-3 rounded-xl bg-gradient-to-br from-[#D2B48C]/20 to-[#D2B48C]/10">
                  <svg className="w-6 lg:w-7 h-6 lg:h-7 text-[#D2B48C]" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z" />
                  </svg>
                </div>
                <div className="flex-1 ml-3 lg:ml-4">
                  <p className="block text-[11px] font-bold mb-1 uppercase tracking-widest text-[#887563] dark:text-gray-400">이름</p>
                  <p className="text-sm lg:text-base font-bold text-[#2C2C2C] dark:text-gray-100">{userProfile.name}</p>
                </div>
              </div>

              {/* 이메일만 표시 */}
              <div className="group flex items-center p-3 lg:p-4 rounded-xl transition-all duration-200 hover:bg-gradient-to-r hover:from-[#F5F3EC] hover:to-[#FAF8F5] dark:hover:from-gray-700 dark:hover:to-gray-700">
                <div className="p-2.5 lg:p-3 rounded-xl bg-gradient-to-br from-[#D2B48C]/20 to-[#D2B48C]/10">
                  <svg className="w-6 lg:w-7 h-6 lg:h-7 text-[#D2B48C]" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M224,48H32a8,8,0,0,0-8,8V192a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A8,8,0,0,0,224,48Zm-8,144H40V74.19l83.53,52.2a8,8,0,0,0,9,0L216,74.19V192Z" />
                  </svg>
                </div>
                <div className="flex-1 ml-3 lg:ml-4 min-w-0">
                  <p className="block text-[11px] font-bold mb-1 uppercase tracking-widest text-[#887563] dark:text-gray-400">이메일</p>
                  <p className="text-sm lg:text-base font-bold truncate text-[#2C2C2C] dark:text-gray-100">{userProfile.email}</p>
                </div>
              </div>
            </section>
          </div>
          
          <div className="lg:col-span-3">
            {/* 계정 관리 */}
            <section className="px-5 py-5 mx-5 mt-8 bg-white dark:bg-gray-800 shadow-md rounded-3xl lg:mx-0 lg:mt-0 lg:p-8 border border-gray-100 dark:border-gray-700">
              <h3 className="mb-4 lg:mb-6 text-lg lg:text-xl font-bold text-[#2C2C2C] dark:text-gray-100">계정 관리</h3>
              <div className="space-y-2 lg:space-y-3">
                {/* 비밀번호 변경 */}
                <button
                  type="button"
                  onClick={() => {
                    if (isSocialLogin) {
                      setShowAlertModal(true);
                      return;
                    }
                    setShowChangePw(true);
                  }}
                  className="group flex items-center p-4 lg:p-5 rounded-xl hover:bg-gradient-to-r hover:from-[#F5F3EC] hover:to-[#FAF8F5] dark:hover:from-gray-700 dark:hover:to-gray-700 transition-all duration-200 w-full"
                >
                  <div className="p-2.5 lg:p-3 bg-gradient-to-br from-[#D2B48C]/20 to-[#D2B48C]/10 rounded-xl">
                    <svg className="w-6 lg:w-7 h-6 lg:h-7 stroke-[#D2B48C]" fill="none" viewBox="0 0 24 24">
                      <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                    </svg>
                  </div>
                  <span className="ml-4 lg:ml-5 font-bold text-sm lg:text-base text-[#2C2C2C] dark:text-gray-100">비밀번호 변경</span>
                  <svg className="ml-auto w-5 lg:w-6 h-5 lg:h-6 text-[#887563] dark:text-gray-400" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z" />
                  </svg>
                </button>

                {/* 사용자 알림 설정 */}
                <button
                  type="button"
                  onClick={() => setShowNotiModal(true)}
                  className="group flex items-center p-4 lg:p-5 rounded-xl hover:bg-gradient-to-r hover:from-[#F5F3EC] hover:to-[#FAF8F5] dark:hover:from-gray-700 dark:hover:to-gray-700 transition-all duration-200 w-full"
                >
                  <div className="p-2.5 lg:p-3 bg-gradient-to-br from-[#D2B48C]/20 to-[#D2B48C]/10 rounded-xl">
                    <svg className="w-6 lg:w-7 h-6 lg:h-7 stroke-[#D2B48C]" fill="none" viewBox="0 0 24 24">
                      <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                    </svg>
                  </div>
                  <span className="ml-4 lg:ml-5 font-bold text-sm lg:text-base text-[#2C2C2C] dark:text-gray-100">사용자 알림 설정</span>
                  <svg className="ml-auto w-5 lg:w-6 h-5 lg:h-6 text-[#887563] dark:text-gray-400" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z" />
                  </svg>
                </button>

                {/* 사용자 설정 */}
                <button
                  type="button"
                  onClick={() => setShowUserSettingsModal(true)}
                  className="group flex items-center p-4 lg:p-5 rounded-xl hover:bg-gradient-to-r hover:from-[#F5F3EC] hover:to-[#FAF8F5] dark:hover:from-gray-700 dark:hover:to-gray-700 transition-all duration-200 w-full"
                >
                  <div className="p-2.5 lg:p-3 bg-gradient-to-br from-[#D2B48C]/20 to-[#D2B48C]/10 rounded-xl">
                    <svg className="w-6 lg:w-7 h-6 lg:h-7 stroke-[#D2B48C]" fill="none" viewBox="0 0 24 24">
                      <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                      <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                    </svg>
                  </div>
                  <span className="ml-4 lg:ml-5 font-bold text-sm lg:text-base text-[#2C2C2C] dark:text-gray-100">사용자 설정</span>
                  <svg className="ml-auto w-5 lg:w-6 h-5 lg:h-6 text-[#887563] dark:text-gray-400" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z" />
                  </svg>
                </button>

                {/* 로그아웃 */}
                <button
                  type="button"
                  onClick={() => setShowLogoutModal(true)}
                  className="group flex items-center p-4 lg:p-5 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-red-50/50 dark:hover:from-red-900/20 dark:hover:to-red-900/10 transition-all duration-200 w-full"
                >
                  <div className="p-2.5 lg:p-3 bg-gradient-to-br from-red-100 to-red-50 dark:from-red-900/30 dark:to-red-900/20 rounded-xl">
                    <svg className="w-6 lg:w-7 h-6 lg:h-7 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M112,216a8,8,0,0,1-8,8H48a16,16,0,0,1-16-16V48A16,16,0,0,1,48,32h56a8,8,0,0,1,0,16H48V208h56A8,8,0,0,1,112,216Zm109.66-93.66-40-40a8,8,0,0,0-11.32,11.32L196.69,120H104a8,8,0,0,0,0,16h92.69l-26.35,26.34a8,8,0,0,0,11.32,11.32l40-40A8,8,0,0,0,221.66,122.34Z" />
                    </svg>
                  </div>
                  <span className="ml-4 lg:ml-5 font-bold text-sm lg:text-base text-red-600 dark:text-red-400">로그아웃</span>
                </button>
              </div>
            </section>
          </div>
        </div>

        <div aria-hidden className="h-[calc(64px+env(safe-area-inset-bottom))] lg:hidden" />
      </main>

      {/* 모달들 */}
      <ChangePasswordModal open={showChangePw} onClose={() => setShowChangePw(false)} onSubmit={(newPassword) => { setShowChangePw(false); }} />
      <NotificationSettingsModal open={showNotiModal} onClose={() => setShowNotiModal(false)} initialSettings={userProfile.notificationSettings} onSave={(settings) => { updateProfile({ notificationSettings: settings }); setShowNotiModal(false); }} />
      <UserSettingsModal 
        open={showUserSettingsModal} 
        onClose={() => setShowUserSettingsModal(false)} 
        initialSettings={{ 
          darkMode: isDarkMode,
          notifications: {
            comments: userProfile?.notificationSettings?.comments ?? true,
            exhibitions: userProfile?.notificationSettings?.exhibitions ?? true,
            exhibition_distance: userProfile?.notificationSettings?.exhibition_distance ?? 5
          }
        }} 
        onSave={(settings) => { 
          setDarkMode(settings.darkMode); 
          updateProfile({ 
            userSettings: { darkMode: settings.darkMode },
            notificationSettings: {
              comments: settings.notifications.comments,
              exhibitions: settings.notifications.exhibitions,
              exhibition_distance: settings.notifications.exhibition_distance
            }
          }); 
          setShowUserSettingsModal(false); 
        }} 
      />
      <AvatarUploadModal open={showAvatarModal} currentAvatarUrl={userProfile.avatarUrl || '/default-profile.svg'} onClose={() => setShowAvatarModal(false)} onSave={handleAvatarSave} />
      <LogoutConfirmationModal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} onConfirm={handleLogout} title="로그아웃" message="정말 로그아웃 하시겠습니까?" />
      <AlertModal isOpen={showAlertModal} onClose={() => setShowAlertModal(false)} message="SNS 로그인 계정입니다." />
    </div>
  );
}





