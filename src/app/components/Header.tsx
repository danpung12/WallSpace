'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUserMode } from '../context/UserModeContext';
import { useState, memo, useCallback, useMemo, useEffect } from 'react';
import { UserProfile } from '@/data/profile';
import LogoutConfirmationModal from './LogoutConfirmationModal';
import NotificationListModal from './NotificationListModal';
import { createClient } from '@/lib/supabase/client';
import { useUserProfile } from '@/context/UserProfileContext';

const NavLinks = memo(function NavLinks() {
  const pathname = usePathname();
  const isGuestMode = pathname.startsWith('/guest');
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const linkCls = (href: string) =>
    `text-sm font-medium transition-colors ${
      isActive(href)
        ? 'text-[#3D2C1D] font-bold'
        : 'text-gray-500 hover:text-gray-700'
    }`;

  const navItems = isGuestMode
    ? [
        { href: '/guest/home', label: '홈' },
        { href: '/guest/map', label: '지도' },
        { href: '/guest/profile', label: '내 정보' },
      ]
    : [
        { href: '/', label: '홈' },
        { href: '/map', label: '예약' },
        { href: '/dashboard', label: '대시보드' },
        { href: '/profile', label: '내 정보' },
      ];

  return (
    <div className="flex items-center space-x-6">
      {navItems.map(item => (
        <Link
          key={item.href}
          className={linkCls(item.href)}
          href={item.href}>
          {item.label}
        </Link>
      ))}
    </div>
  );
});

const UserInfo = memo(function UserInfo({ 
  userProfile, 
  onLogout 
}: { 
  userProfile: UserProfile; 
  onLogout: () => void;
}) {
  return (
    <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-gray-300">
      <Link
        href="/profile"
        className="text-sm font-medium text-[#3D2C1D] hover:text-[#5D4C3D] transition-colors">
        {userProfile.nickname || userProfile.name || userProfile.full_name || '사용자'} 님
      </Link>
      <button
        onClick={onLogout}
        className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
      >
        로그아웃
      </button>
    </div>
  );
}, (prevProps, nextProps) => {
  // 닉네임이 같으면 재렌더링 하지 않음 (true 반환)
  // 닉네임이 다르면 재렌더링 함 (false 반환)
  const prevNickname = prevProps.userProfile.nickname || prevProps.userProfile.name || prevProps.userProfile.full_name;
  const nextNickname = nextProps.userProfile.nickname || nextProps.userProfile.name || nextProps.userProfile.full_name;
  return prevNickname === nextNickname; // 같으면 true (재렌더링 안 함), 다르면 false (재렌더링)
});

const UserModeToggle = memo(function UserModeToggle({
  userMode,
  onModeChange
}: {
  userMode: 'artist' | 'manager';
  onModeChange: (mode: 'artist' | 'manager') => void;
}) {
  return (
    <div className="flex items-center text-xs font-semibold p-1 rounded-lg bg-[#EAE5DE] ml-6">
      <button
        type="button"
        onClick={() => onModeChange('artist')}
        className={`px-3 py-1 rounded-md transition-all duration-300 ${
          userMode === 'artist'
            ? 'bg-white shadow-sm text-[#3D2C1D]'
            : 'text-[#8C7853]'
        }`}
      >
        작가
      </button>
      <button
        type="button"
        onClick={() => onModeChange('manager')}
        className={`px-3 py-1 rounded-md transition-all duration-300 ${
          userMode === 'manager'
            ? 'bg-white shadow-sm text-[#3D2C1D]'
            : 'text-[#8C7853]'
        }`}
      >
        사장님
      </button>
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.userMode === nextProps.userMode;
});

const HeaderContent = memo(function HeaderContent({
  isHomePage,
  isGuestMode,
  userMode,
  nickname,
  unreadCount,
  onModeChange,
  onLogout,
  onNotificationClick
}: {
  isHomePage: boolean;
  isGuestMode: boolean;
  userMode: 'artist' | 'manager';
  nickname: string | null;
  unreadCount: number;
  onModeChange: (mode: 'artist' | 'manager') => void;
  onLogout: () => void;
  onNotificationClick: () => void;
}) {
  return (
    <header className="hidden lg:block border-b border-gray-200 bg-white sticky top-0 z-40">
      <div
        className={`${
          isHomePage ? 'max-w-screen-2xl' : 'max-w-7xl'
        } mx-auto px-4 sm:px-6 lg:px-8`}
      >
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link href={isGuestMode ? "/guest/home" : "/"} className="text-2xl font-bold text-[#3D2C1D]">
              WallSpace
            </Link>
          </div>
          <div className="hidden lg:flex items-center space-x-6">
            <NavLinks />
            {!isGuestMode && (
              <UserModeToggle userMode={userMode} onModeChange={onModeChange} />
            )}
            {nickname && (
              <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-gray-300">
                {/* 알림 드롭다운 */}
                <div className="relative">
                  <button
                    onClick={onNotificationClick}
                    className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="알림"
                  >
                    <svg className="w-5 h-5 text-[#3D2C1D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                </div>
                
                <Link
                  href={isGuestMode ? "/guest/profile" : "/profile"}
                  className="text-sm font-medium text-[#3D2C1D] hover:text-[#5D4C3D] transition-colors">
                  {nickname} 님
                </Link>
                <button
                  onClick={onLogout}
                  className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                >
                  로그아웃
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}, (prevProps, nextProps) => {
  // 닉네임 값만 비교
  return (
    prevProps.userMode === nextProps.userMode &&
    prevProps.nickname === nextProps.nickname &&
    prevProps.isHomePage === nextProps.isHomePage &&
    prevProps.isGuestMode === nextProps.isGuestMode &&
    prevProps.unreadCount === nextProps.unreadCount
  );
});

function Header() {
  const { userMode, setUserMode } = useUserMode();
  const router = useRouter();
  const { userProfile } = useUserProfile(); // Context에서 가져옴 (캐싱됨)
  const [showConfirm, setShowConfirm] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const pathname = usePathname();
  const isHomePage = pathname === '/' || pathname === '/guest/home';
  const isGuestMode = pathname.startsWith('/guest');

  // 알림 개수 로드
  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user || isGuestMode) {
          setUnreadCount(0);
          return;
        }

        const response = await fetch('/api/notifications');
        if (response.ok) {
          const data = await response.json();
          const unread = data.filter((n: any) => !n.is_read).length;
          setUnreadCount(unread);
        }
      } catch (error) {
        console.error('Failed to load notification count:', error);
      }
    };

    loadUnreadCount();
    
    // 30초마다 업데이트
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [isGuestMode]);

  const handleLogout = useCallback(() => {
    setShowConfirm(true);
  }, []);

  const handleConfirmLogout = useCallback(async () => {
    // Supabase 로그아웃
    const supabase = createClient();
    await supabase.auth.signOut();
    
    // 캐시된 프로필 정보 삭제
    sessionStorage.removeItem('userProfile');
    
    setShowConfirm(false);
    router.push('/login');
  }, [router]);

  const handleCloseModal = useCallback(() => {
    setShowConfirm(false);
  }, []);

  const handleNotificationClick = useCallback(() => {
    setShowNotificationModal(true);
  }, []);

  const handleCloseNotificationModal = useCallback(() => {
    setShowNotificationModal(false);
    // 모달 닫을 때 알림 개수 다시 로드
    const loadUnreadCount = async () => {
      try {
        const response = await fetch('/api/notifications');
        if (response.ok) {
          const data = await response.json();
          const unread = data.filter((n: any) => !n.is_read).length;
          setUnreadCount(unread);
        }
      } catch (error) {
        console.error('Failed to reload notification count:', error);
      }
    };
    loadUnreadCount();
  }, []);

  // user_type을 데이터베이스에 업데이트하는 함수
  const handleUserModeChange = useCallback(async (mode: 'artist' | 'manager') => {
    try {
      // 로컬 상태 먼저 업데이트 (즉각적인 UI 반응)
      setUserMode(mode);

      // 데이터베이스에 user_type 업데이트
      const response = await fetch('/api/profile/user-type', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_type: mode }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user type');
      }

      const result = await response.json();
      console.log('✅ User type updated:', result);

      // 성공 알림 (선택사항)
      // alert(mode === 'artist' ? '작가 모드로 전환되었습니다' : '사장님 모드로 전환되었습니다');
      
    } catch (error) {
      console.error('Error updating user type:', error);
      // 에러 발생 시 원래 모드로 되돌리기 (선택사항)
      // setUserMode(userMode);
      // alert('모드 전환에 실패했습니다. 다시 시도해주세요.');
    }
  }, [setUserMode]);

  const nickname = useMemo(() => {
    return userProfile?.nickname || userProfile?.name || userProfile?.full_name || null;
  }, [userProfile?.nickname, userProfile?.name, userProfile?.full_name]);

  return (
    <>
      <HeaderContent
        isHomePage={isHomePage}
        isGuestMode={isGuestMode}
        userMode={userMode}
        nickname={nickname}
        unreadCount={unreadCount}
        onModeChange={handleUserModeChange}
        onLogout={handleLogout}
        onNotificationClick={handleNotificationClick}
      />
      <LogoutConfirmationModal
        isOpen={showConfirm}
        onClose={handleCloseModal}
        onConfirm={handleConfirmLogout}
        title="로그아웃"
        message="정말 로그아웃 하시겠습니까?"
      />
      <NotificationListModal
        open={showNotificationModal}
        onClose={handleCloseNotificationModal}
      />
    </>
  );
}

export default Header;
