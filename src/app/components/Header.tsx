'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUserMode } from '../context/UserModeContext';
import { useEffect, useState } from 'react';
import { UserProfile } from '@/data/profile';
import LogoutConfirmationModal from './LogoutConfirmationModal';

function NavLinks() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const linkCls = (href: string) =>
    `text-sm font-medium transition-colors ${
      isActive(href)
        ? 'text-[#3D2C1D] font-bold'
        : 'text-gray-500 hover:text-gray-700'
    }`;

  const navItems = [
    { href: '/home', label: '홈' },
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
  const isHomePage = pathname === '/home';

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

  const handleConfirmLogout = () => {
    // 로그아웃 로직 (실제로는 Supabase 로그아웃을 구현해야 함)
    setShowConfirm(false);
    router.push('/');
  };

  const handleCloseModal = () => {
    setShowConfirm(false);
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
              <Link href="/home" className="text-2xl font-bold text-[#3D2C1D]">
                WallSpace
              </Link>
            </div>
            <div className="hidden lg:flex items-center space-x-6">
              <NavLinks />
              <div className="flex items-center text-xs font-semibold p-1 rounded-lg bg-[#EAE5DE] ml-6">
                <button
                  type="button"
                  onClick={() => setUserMode('artist')}
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
                  onClick={() => setUserMode('manager')}
                  className={`px-3 py-1 rounded-md transition-all duration-300 ${
                    userMode === 'manager'
                      ? 'bg-white shadow-sm text-[#3D2C1D]'
                      : 'text-[#8C7853]'
                  }`}
                >
                  사장님
                </button>
              </div>
              {userProfile && (
                <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-gray-300">
                  <Link
                    href="/profile"
                    className="text-sm font-medium text-[#3D2C1D] hover:text-[#5D4C3D] transition-colors">
                    {userProfile.nickname}
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
