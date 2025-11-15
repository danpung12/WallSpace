// src/app/profile/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "../components/Header"; // 1. Header 컴포넌트 임포트
import ChangePasswordModal from "../components/ChangePasswordModal";
import UserSettingsModal from "../components/UserSettingsModal"; // ✅ 추가
import AvatarUploadModal from "../components/AvatarUploadModal"; // ✅ 추가
import LogoutConfirmationModal from "../components/LogoutConfirmationModal"; // ✅ 로그아웃 모달 추가
import AlertModal from "../components/AlertModal"; // ✅ 알림 모달 추가
import NotificationListModal from "../components/NotificationListModal";
import { UserProfile } from "@/data/profile";
import EditProfileModal from "../components/EditProfileModal";
import InquiryModal from "../components/InquiryModal"; // ✅ 문의하기 모달 추가
import AddLinkModal from '../components/AddLinkModal'; // ✅ 소셜 연동 모달 추가
import SocialIcon from '../components/SocialIcon'; // ✅ 소셜 아이콘 추가
import { useDarkMode } from "../context/DarkModeContext"; // ✅ 다크모드 훅 추가
import { useUserMode } from "../context/UserModeContext"; // ✅ UserMode 훅 추가
import { useRouter } from "next/navigation"; // ✅ 라우터 추가
import { logoutUser } from "@/lib/api/auth"; // ✅ 로그아웃 함수 추가
import { useUserProfile } from "@/context/UserProfileContext"; // ✅ 사용자 프로필 Context 추가
import { useApi, mutate } from "@/lib/swr"; // SWR 추가

export default function ProfilePage() {
  const router = useRouter(); // ✅ 라우터 초기화
  const { isDarkMode, setDarkMode } = useDarkMode(); // ✅ 다크모드 상태 가져오기
  const { userMode } = useUserMode(); // ✅ 현재 사용자 모드 가져오기
  const { updateProfile: updateGlobalProfile } = useUserProfile(); // ✅ 전역 프로필 업데이트 함수
  const [showChangePw, setShowChangePw] = useState(false);
  const [showUserSettingsModal, setShowUserSettingsModal] = useState(false); // ✅ 추가
  const [showAvatarModal, setShowAvatarModal] = useState(false); // ✅ 추가
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false); // ✅ 로그아웃 모달 상태 추가
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSocialLogin, setIsSocialLogin] = useState(false); // SNS 로그인 여부
  const [showAlertModal, setShowAlertModal] = useState(false); // 알림 모달
  const [showNotificationList, setShowNotificationList] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(false);
  const [showInquiryModal, setShowInquiryModal] = useState(false); // ✅ 문의하기 모달 상태 추가
  const [isMobile, setIsMobile] = useState(false); // ✅ 모바일 감지 상태 추가

  const [showAddLinkModal, setShowAddLinkModal] = useState(false);
  const [showUnlinkConfirmModal, setShowUnlinkConfirmModal] = useState(false);
  const [providerToUnlink, setProviderToUnlink] = useState<string | null>(null);

  // ✅ 모바일 감지
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // SWR로 프로필 및 알림 데이터 가져오기
  const { data: profileData, error: profileError, isLoading: profileLoading } = useApi<UserProfile>('/api/profile');
  const { data: notificationsData } = useApi<any[]>('/api/notifications?cleanupRead=true', {
    refreshInterval: 30000, // 30초마다 자동 재검증
  });

  // 프로필 데이터 설정
  useEffect(() => {
    if (profileData) {
      setUserProfile(profileData);
      // 초기 로드 시에만 다크모드 설정 (이후 변경은 UserSettingsModal에서 처리)
      if (profileData?.userSettings?.darkMode !== undefined && !userProfile) {
        setDarkMode(profileData.userSettings.darkMode);
      }
    }
    if (profileError) {
      setError(profileError.message || "Failed to fetch profile");
    }
    setIsLoading(profileLoading);
  }, [profileData, profileError, profileLoading, setDarkMode, userProfile]);

  // 알림 데이터 설정
  useEffect(() => {
    if (notificationsData) {
      setHasNotifications(notificationsData.length > 0);
    }
  }, [notificationsData]);

  // SNS 로그인 여부 확인
  useEffect(() => {
    const checkSocialLogin = async () => {
      const supabaseModule = await import('@/lib/supabase/client');
      const supabase = supabaseModule.createClient();
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

  // 프로필 데이터 업데이트 (PUT 요청)
  const updateProfile = async (updatedData: Partial<UserProfile>): Promise<boolean> => {
    if (!userProfile) return false;
    setError(null);
    // 낙관적 업데이트: 즉시 UI 업데이트
    const optimisticData = { ...userProfile, ...updatedData };
    setUserProfile(optimisticData);
    updateGlobalProfile(optimisticData);
    mutate('/api/profile', optimisticData, { revalidate: false });
    setIsLoading(true);
    
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
      // 프로필 업데이트 후 캐시 무효화 및 재검증
      const data: UserProfile = await response.json();
      mutate('/api/profile', data, { revalidate: true });
      setUserProfile(data);
      updateGlobalProfile(data);
      return true;
    } catch (err: any) {
      // 에러 발생 시 이전 데이터로 롤백
      mutate('/api/profile');
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
    setIsLoading(true);

    try {
      // FormData 생성
      const formData = new FormData();
      formData.append('file', file);

      // 이미지를 Supabase Storage에 업로드
      const response = await fetch('/api/profile/avatar', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload avatar');
      }

      const { avatarUrl } = await response.json();

      // 프로필 캐시 무효화 (서버에서 이미 업데이트됨)
      await mutate('/api/profile');
      
      setShowAvatarModal(false);
    } catch (error) {
      console.error("아바타 업데이트에 실패했습니다:", error);
      setError("프로필 사진 업로드에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ 로그아웃 핸들러 함수 추가
  const handleLogout = async () => {
    console.log("로그아웃 처리");
    
    try {
      // Supabase 로그아웃 실행
      const { error } = await logoutUser();
      
      if (error) {
        console.error('로그아웃 실패:', error);
        alert('로그아웃에 실패했습니다. 다시 시도해주세요.');
        return;
      }
      
      setShowLogoutModal(false);
      router.push('/'); // 홈으로 이동
    } catch (err) {
      console.error('로그아웃 중 오류:', err);
      alert('로그아웃 중 오류가 발생했습니다.');
    }
  };



  const handleLinkWithProvider = async (provider: 'kakao' | 'naver' | 'google') => {
    try {
      const supabaseModule = await import('@/lib/supabase/client');
      const supabase = supabaseModule.createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          // Linking to an existing user
          queryParams: { access_type: 'offline', prompt: 'consent' }
        }
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error(`${provider} 연동 실패:`, error);
      alert(`${provider} 계정 연동에 실패했습니다: ${error.message}`);
    }
  };

  // 연동 해제 핸들러
  const handleUnlinkProvider = async (provider: string) => {
    setProviderToUnlink(provider);
    setShowUnlinkConfirmModal(true);
  };

  // 연동 해제 확인
  const confirmUnlinkProvider = async () => {
    if (!providerToUnlink) return;

    try {
      const response = await fetch('/api/profile/unlink-provider', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ provider: providerToUnlink }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '연동 해제에 실패했습니다.');
      }

      alert(data.message || '연동이 해제되었습니다.');
      
      // 프로필 데이터 새로고침
      mutate('/api/profile');
      
    } catch (error: any) {
      console.error('연동 해제 실패:', error);
      alert(error.message || '연동 해제 중 오류가 발생했습니다.');
    } finally {
      setShowUnlinkConfirmModal(false);
      setProviderToUnlink(null);
    }
  };

  // ✅ 문의하기 클릭 핸들러 (PC는 모달, 모바일은 새 창)
  const handleInquiryClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (isMobile) {
      // 모바일: 새 창으로 열기
      router.push('/inquiry');
    } else {
      // PC: 모달 열기
      setShowInquiryModal(true);
    }
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
    <div className="relative flex min-h-[100dvh] flex-col font-pretendard bg-[#F5F1EC] dark:bg-gray-900 text-[#2C2C2C] dark:text-gray-100">
      <Header /> {/* 2. PC용 Header 컴포넌트 추가 */}

      {/* 기존 모바일 Header (PC에서는 숨김 처리) */}
      <header className="sticky top-0 z-20 backdrop-blur-sm lg:hidden bg-[rgba(245,241,236,0.8)] dark:bg-[rgba(31,41,55,0.8)]">
        <div className="flex items-center justify-between px-4 py-3">
          <button className="active:scale-95 transition-transform text-[#2C2C2C] dark:text-gray-100" type="button">
            <svg fill="currentColor" height="24" width="24" viewBox="0 0 256 256">
              <path d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-[#2C2C2C] dark:text-gray-100">내 정보</h1>
          <div className="w-6" />
        </div>
      </header>
      
      {/* 기존 PC Header는 완전히 삭제합니다. */}

      <main className="flex-1 w-full max-w-7xl mx-auto p-4 lg:p-10 space-y-8">
        {/* Avatar */}
        <section className="text-center lg:text-left lg:flex lg:items-center lg:space-x-10 lg:bg-white dark:lg:bg-gray-800 lg:p-10 lg:rounded-3xl lg:shadow-md lg:border lg:border-gray-100 dark:lg:border-gray-700 lg:hover:shadow-lg lg:transition-all lg:duration-300">
          <div className="relative inline-block group">
            <div className="relative w-20 h-20 lg:w-40 lg:h-40">
              <Image
                src={userProfile.avatarUrl || '/default-profile.svg'}
                alt="User profile picture"
                fill
                priority
                sizes="(max-width: 1024px) 80px, 160px"
                className="object-cover rounded-full shadow-lg ring-4 ring-white dark:ring-gray-700 transition-all duration-300 group-hover:ring-[#D2B48C]/30"
                onError={(e) => {
                  // 이미지 로드 실패 시 기본 이미지로 대체
                  e.currentTarget.src = '/default-profile.svg';
                }}
              />
            </div>
            <button
              onClick={() => setShowAvatarModal(true)} // ✅ 추가
              className="absolute bottom-0 right-0 rounded-full p-1.5 shadow-lg active:scale-95 transition-all duration-300 lg:p-3 hover:shadow-xl hover:scale-110"
              type="button"
              tabIndex={-1}
              style={{ background: 'linear-gradient(135deg, #D2B48C 0%, #B8996B 100%)' }}
            >
              <svg className="w-4 h-4 text-white lg:w-6 lg:h-6" fill="currentColor" viewBox="0 0 256 256">
                <path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,164.12V208a16,16,0,0,0,16,16H92.12A15.86,15.86,0,0,0,104.24,219.31L227.31,96a16,16,0,0,0,0-22.63ZM92.12,208H48V164.12L152,60.12l43.89,43.89Z" />
              </svg>
            </button>
          </div>
          <div className="mt-4 lg:mt-0">
            <h2 className="text-xl font-bold lg:text-4xl text-[#2C2C2C] dark:text-gray-100">
              {userMode === 'manager' ? userProfile.name : (userProfile.nickname || '무명')}
            </h2>
            {userMode !== 'manager' && (
              <p className="text-sm lg:text-xl mt-1 text-[#887563] dark:text-gray-400">{userProfile.name}</p>
            )}
          </div>
        </section>

        <div className="lg:grid lg:grid-cols-5 lg:gap-10">
            <div className="lg:col-span-2 space-y-8">
                {/* 사용자 정보 */}
                <section className="py-5 px-5 mx-5 space-y-3 bg-white dark:bg-gray-800 shadow-md rounded-3xl lg:mx-0 lg:p-8 lg:space-y-4 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center justify-between mb-2 lg:mb-3">
            <h3 className="text-lg lg:text-xl font-bold text-[#2C2C2C] dark:text-gray-100">사용자 정보</h3>
            <button
              onClick={() => setShowEditModal(true)}
              className="font-bold text-sm lg:text-base transition-all duration-200 hover:scale-105 active:scale-95 px-3 lg:px-4 py-1 lg:py-1.5 rounded-lg hover:bg-[#D2B48C]/10"
              style={{ color: 'var(--accent-color)' }}
            >
              Edit
            </button>
          </div>

          {/* 닉네임 - 작가 모드일 때만 표시 */}
          {userMode !== 'manager' && (
            <div className="group flex items-center p-3 lg:p-4 rounded-xl transition-all duration-200 hover:bg-gradient-to-r hover:from-[#F5F3EC] hover:to-[#FAF8F5] dark:hover:from-gray-700 dark:hover:to-gray-700 hover:shadow-sm hover:scale-[1.02]">
              <div className="p-2.5 lg:p-3 rounded-xl bg-gradient-to-br from-[#D2B48C]/20 to-[#D2B48C]/10 group-hover:from-[#D2B48C]/30 group-hover:to-[#D2B48C]/20 transition-all duration-200">
                <svg className="w-6 lg:w-7 h-6 lg:h-7 stroke-[#D2B48C]" fill="none" viewBox="0 0 24 24">
                  <path
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <div className="flex-1 ml-3 lg:ml-4">
                <p className="block text-[11px] font-bold mb-1 uppercase tracking-widest text-[#887563] dark:text-gray-400">필명</p>
                <p className="text-sm lg:text-base font-bold text-[#2C2C2C] dark:text-gray-100">{userProfile.nickname || '무명'}</p>
              </div>
            </div>
          )}

          {/* 이름 */}
          <div className="group flex items-center p-3 lg:p-4 rounded-xl transition-all duration-200 hover:bg-gradient-to-r hover:from-[#F5F3EC] hover:to-[#FAF8F5] dark:hover:from-gray-700 dark:hover:to-gray-700 hover:shadow-sm hover:scale-[1.02]">
            <div className="p-2.5 lg:p-3 rounded-xl bg-gradient-to-br from-[#D2B48C]/20 to-[#D2B48C]/10 group-hover:from-[#D2B48C]/30 group-hover:to-[#D2B48C]/20 transition-all duration-200">
              <svg className="w-6 lg:w-7 h-6 lg:h-7 text-[#D2B48C]" fill="currentColor" viewBox="0 0 256 256">
                <path d="M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z" />
              </svg>
            </div>
            <div className="flex-1 ml-3 lg:ml-4">
              <p className="block text-[11px] font-bold mb-1 uppercase tracking-widest text-[#887563] dark:text-gray-400">이름</p>
              <p className="text-sm lg:text-base font-bold text-[#2C2C2C] dark:text-gray-100">{userProfile.name}</p>
            </div>
          </div>

          {/* 이메일 */}
          <div className="group flex items-center p-3 lg:p-4 rounded-xl transition-all duration-200 hover:bg-gradient-to-r hover:from-[#F5F3EC] hover:to-[#FAF8F5] dark:hover:from-gray-700 dark:hover:to-gray-700 hover:shadow-sm hover:scale-[1.02]">
            <div className="p-2.5 lg:p-3 rounded-xl bg-gradient-to-br from-[#D2B48C]/20 to-[#D2B48C]/10 group-hover:from-[#D2B48C]/30 group-hover:to-[#D2B48C]/20 transition-all duration-200">
              <svg className="w-6 lg:w-7 h-6 lg:h-7 text-[#D2B48C]" fill="currentColor" viewBox="0 0 256 256">
                <path d="M224,48H32a8,8,0,0,0-8,8V192a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A8,8,0,0,0,224,48Zm-8,144H40V74.19l83.53,52.2a8,8,0,0,0,9,0L216,74.19V192Z" />
              </svg>
            </div>
            <div className="flex-1 ml-3 lg:ml-4 min-w-0">
              <p className="block text-[11px] font-bold mb-1 uppercase tracking-widest text-[#887563] dark:text-gray-400">이메일 주소</p>
              <p className="text-sm lg:text-base font-bold truncate text-[#2C2C2C] dark:text-gray-100">{userProfile.email}</p>
            </div>
          </div>

          {/* 전화번호 */}
          <div className="group flex items-center p-3 lg:p-4 rounded-xl transition-all duration-200 hover:bg-gradient-to-r hover:from-[#F5F3EC] hover:to-[#FAF8F5] dark:hover:from-gray-700 dark:hover:to-gray-700 hover:shadow-sm hover:scale-[1.02]">
            <div className="p-2.5 lg:p-3 rounded-xl bg-gradient-to-br from-[#D2B48C]/20 to-[#D2B48C]/10 group-hover:from-[#D2B48C]/30 group-hover:to-[#D2B48C]/20 transition-all duration-200">
              <svg className="w-6 lg:w-7 h-6 lg:h-7 stroke-[#D2B48C]" fill="none" viewBox="0 0 24 24">
                <path
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <div className="flex-1 ml-3 lg:ml-4">
              <p className="block text-[11px] font-bold mb-1 uppercase tracking-widest text-[#887563] dark:text-gray-400">전화번호</p>
              <p className="text-sm lg:text-base font-bold text-[#2C2C2C] dark:text-gray-100">{userProfile.phone || '전화번호 없음'}</p>
            </div>
          </div>
        </section>

                {/* 소셜 연동 섹션 */}
                <section className="py-5 px-5 mx-5 space-y-3 bg-white dark:bg-gray-800 shadow-md rounded-3xl lg:mx-0 lg:p-8 lg:space-y-4 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
                  <h3 className="text-lg lg:text-xl font-bold text-[#2C2C2C] dark:text-gray-100">소셜 연동</h3>
                  <div className="flex justify-around items-center pt-4">
                    {['google', 'naver', 'kakao'].map(provider => {
                      const isLinked = userProfile.identities?.some(id => id.provider === provider);
                      return (
                        <div key={provider} className="flex flex-col items-center gap-2">
                          <button
                            onClick={() => !isLinked && handleLinkWithProvider(provider as 'google' | 'naver' | 'kakao')}
                            disabled={isLinked}
                            className={`transition-all duration-300 rounded-full focus:outline-none focus:ring-4 focus:ring-[#D2B48C]/50 ${isLinked ? 'opacity-100' : 'opacity-40 hover:opacity-75 hover:scale-105'} ${isLinked ? 'cursor-default' : 'cursor-pointer'}`}
                            aria-label={`${provider} ${isLinked ? '계정 연동됨' : '계정 연동하기'}`}
                          >
                            <SocialIcon provider={provider} className="w-12 h-12 lg:w-14 lg:h-14" />
                          </button>
                          {isLinked && (
                            <button
                              onClick={() => handleUnlinkProvider(provider)}
                              className="text-xs lg:text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors duration-200 hover:underline"
                            >
                              해제
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
            </div>
            
            <div className="lg:col-span-3">
                {/* 계정 관리 */}
                <section className="px-5 py-5 mx-5 mt-8 bg-white dark:bg-gray-800 shadow-md rounded-3xl lg:mx-0 lg:mt-0 lg:p-8 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
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
              className="group flex items-center p-4 lg:p-5 rounded-xl hover:bg-gradient-to-r hover:from-[#F5F3EC] hover:to-[#FAF8F5] dark:hover:from-gray-700 dark:hover:to-gray-700 transition-all duration-200 w-full hover:shadow-sm hover:scale-[1.01]"
            >
              <div className="p-2.5 lg:p-3 bg-gradient-to-br from-[#D2B48C]/20 to-[#D2B48C]/10 rounded-xl transition-all duration-200 group-hover:from-[#D2B48C]/30 group-hover:to-[#D2B48C]/20 group-active:scale-95">
                <svg className="w-6 lg:w-7 h-6 lg:h-7 stroke-[#D2B48C]" fill="none" viewBox="0 0 24 24">
                  <path
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </div>
              <span className="ml-4 lg:ml-5 font-bold text-sm lg:text-base text-[#2C2C2C] dark:text-gray-100">비밀번호 변경</span>
              <svg className="ml-auto w-5 lg:w-6 h-5 lg:h-6 transition-transform duration-200 group-hover:translate-x-1 text-[#887563] dark:text-gray-400" fill="currentColor" viewBox="0 0 256 256">
                <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z" />
              </svg>
            </button>

            {/* 사용자 설정 */}
            <button
              type="button"
              onClick={() => setShowUserSettingsModal(true)}
              className="group flex items-center p-4 lg:p-5 rounded-xl hover:bg-gradient-to-r hover:from-[#F5F3EC] hover:to-[#FAF8F5] dark:hover:from-gray-700 dark:hover:to-gray-700 transition-all duration-200 w-full hover:shadow-sm hover:scale-[1.01]"
            >
              <div className="p-2.5 lg:p-3 bg-gradient-to-br from-[#D2B48C]/20 to-[#D2B48C]/10 rounded-xl transition-all duration-200 group-hover:from-[#D2B48C]/30 group-hover:to-[#D2B48C]/20 group-active:scale-95">
                <svg className="w-6 lg:w-7 h-6 lg:h-7 stroke-[#D2B48C]" fill="none" viewBox="0 0 24 24">
                  <path
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                  <path
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </div>
              <span className="ml-4 lg:ml-5 font-bold text-sm lg:text-base text-[#2C2C2C] dark:text-gray-100">사용자 설정</span>
              <svg className="ml-auto w-5 lg:w-6 h-5 lg:h-6 transition-transform duration-200 group-hover:translate-x-1 text-[#887563] dark:text-gray-400" fill="currentColor" viewBox="0 0 256 256">
                <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z" />
              </svg>
            </button>

            {/* 문의하기 */}
            <button
              type="button"
              onClick={handleInquiryClick}
              className="group flex items-center p-4 lg:p-5 rounded-xl hover:bg-gradient-to-r hover:from-[#F5F3EC] hover:to-[#FAF8F5] dark:hover:from-gray-700 dark:hover:to-gray-700 transition-all duration-200 w-full hover:shadow-sm hover:scale-[1.01]"
            >
              <div className="p-2.5 lg:p-3 bg-gradient-to-br from-[#D2B48C]/20 to-[#D2B48C]/10 rounded-xl transition-all duration-200 group-hover:from-[#D2B48C]/30 group-hover:to-[#D2B48C]/20 group-active:scale-95">
                <svg className="w-6 lg:w-7 h-6 lg:h-7 stroke-[#D2B48C]" fill="none" viewBox="0 0 24 24">
                  <path
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </div>
              <span className="ml-4 lg:ml-5 font-bold text-sm lg:text-base text-[#2C2C2C] dark:text-gray-100">문의하기</span>
              <svg className="ml-auto w-5 lg:w-6 h-5 lg:h-6 transition-transform duration-200 group-hover:translate-x-1 text-[#887563] dark:text-gray-400" fill="currentColor" viewBox="0 0 256 256">
                <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z" />
              </svg>
            </button>

            {/* 로그아웃 */}
            <button
              type="button"
              onClick={() => setShowLogoutModal(true)}
              className="group flex items-center p-4 lg:p-5 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-red-50/50 dark:hover:from-red-900/20 dark:hover:to-red-900/10 transition-all duration-200 w-full hover:shadow-sm hover:scale-[1.01]"
            >
              <div className="p-2.5 lg:p-3 bg-gradient-to-br from-red-100 to-red-50 dark:from-red-900/30 dark:to-red-900/20 rounded-xl transition-all duration-200 group-hover:from-red-200 group-hover:to-red-100 dark:group-hover:from-red-900/40 dark:group-hover:to-red-900/30 group-active:scale-95">
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
      {/* ✅ 사용자 설정 모달 (알림 설정 포함) */}
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
        onSave={async (settings) => {
          console.log("사용자 설정 저장 요청:", settings);
          // 먼저 다크모드 Context 업데이트 (즉시 UI 반영)
          setDarkMode(settings.darkMode);
          // 프로필에도 저장 (비동기로 처리되지만 기다리지 않음)
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
      {/* ✅ 아바타 업로드 모달 추가 */}
      <AvatarUploadModal
        open={showAvatarModal}
        currentAvatarUrl={userProfile.avatarUrl || '/default-profile.svg'}
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
        userMode={userMode}
        onSave={async (updatedProfile) => {
          const success = await updateProfile(updatedProfile);
          if (success) {
            setShowEditModal(false);
          }
        }}
        error={error}
        setError={setError}
      />
      {/* ✅ 로그아웃 확인 모달 추가 */}
      <LogoutConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        title="로그아웃"
        message="정말 로그아웃 하시겠습니까?"
      />


      {/* ✅ SNS 계정 알림 모달 추가 */}
      <AlertModal
        isOpen={showAlertModal}
        onClose={() => setShowAlertModal(false)}
        message="SNS 로그인 계정입니다."
      />

      {/* 알림 목록 모달 */}
      <NotificationListModal 
        open={showNotificationList} 
        onClose={() => {
          setShowNotificationList(false);
          // 알림 목록을 닫을 때 다시 확인
          fetch('/api/notifications?cleanupRead=true').then(res => {
            if (res.ok) {
              res.json().then(data => {
                setHasNotifications(data.length > 0);
              });
            }
          });
        }} 
      />

      {/* ✅ 문의하기 모달 (PC 전용) */}
      <InquiryModal 
        open={showInquiryModal} 
        onClose={() => setShowInquiryModal(false)}
        onSubmit={() => {
          console.log('문의가 접수되었습니다.');
          // 문의 성공 후 추가 작업이 필요하면 여기서 처리
        }}
      />

      {/* 소셜 계정 연동 모달 */}
      <AddLinkModal
        open={showAddLinkModal}
        onClose={() => setShowAddLinkModal(false)}
        onLink={handleLinkWithProvider}
      />

      {/* 연동 해제 확인 모달 */}
      <LogoutConfirmationModal
        isOpen={showUnlinkConfirmModal}
        onClose={() => {
          setShowUnlinkConfirmModal(false);
          setProviderToUnlink(null);
        }}
        onConfirm={confirmUnlinkProvider}
        title="계정 연동 해제"
        message={`${providerToUnlink} 계정 연동을 해제하시겠습니까?`}
      />
    </div>
  );
}
