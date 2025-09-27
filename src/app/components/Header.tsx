'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUserMode } from '../context/UserModeContext';

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
        <Link key={item.href} className={linkCls(item.href)} href={item.href}>
          {item.label}
        </Link>
      ))}
    </div>
  );
}

function Header() {
  const { userMode, setUserMode } = useUserMode();

  return (
    <header className="hidden lg:block border-b border-gray-200 bg-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
