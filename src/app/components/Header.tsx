'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUserMode } from '../context/UserModeContext';
import { useEffect, useState } from 'react';
import { UserProfile } from '@/data/profile';
import LogoutConfirmationModal from './LogoutConfirmationModal';
import { createClient } from '@/lib/supabase/client';

function NavLinks() {
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
}

function Header() {
  const { userMode, setUserMode } = useUserMode();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === '/' || pathname === '/guest/home';
  const isGuestMode = pathname.startsWith('/guest');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/profile');
        if (response.ok) {
          const data: UserProfile = await response.json();
          setUserProfile(data);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    setShowConfirm(true);
  };

  const handleConfirmLogout = async () => {
    // Supabase 로그아웃
    const supabase = createClient();
    await supabase.auth.signOut();
    
    setShowConfirm(false);
    router.push('/login');
  };

  const handleCloseModal = () => {
    setShowConfirm(false);
  };

  // user_type을 데이터베이스에 업데이트하는 함수
  const handleUserModeChange = async (mode: 'artist' | 'manager') => {
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
  };

  return (
    <>
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
                <div className="flex items-center text-xs font-semibold p-1 rounded-lg bg-[#EAE5DE] ml-6">
                  <button
                    type="button"
                    onClick={() => handleUserModeChange('artist')}
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
                    onClick={() => handleUserModeChange('manager')}
                    className={`px-3 py-1 rounded-md transition-all duration-300 ${
                      userMode === 'manager'
                        ? 'bg-white shadow-sm text-[#3D2C1D]'
                        : 'text-[#8C7853]'
                    }`}
                  >
                    사장님
                  </button>
                </div>
              )}
              {userProfile && (
                <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-gray-300">
                  <Link
                    href="/profile"
                    className="text-sm font-medium text-[#3D2C1D] hover:text-[#5D4C3D] transition-colors">
                    {userProfile.nickname || userProfile.name || userProfile.full_name || '사용자'} 님
                  </Link>
                  <button
                    onClick={handleLogout}
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
      <LogoutConfirmationModal
        isOpen={showConfirm}
        onClose={handleCloseModal}
        onConfirm={handleConfirmLogout}
        title="로그아웃"
        message="정말 로그아웃 하시겠습니까?"
      />
    </>
  );
}

export default Header;
