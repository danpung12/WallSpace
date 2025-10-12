// components/BottomNav.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useBottomNav } from '@/app/context/BottomNavContext';

function NavLinks() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/');

  const linkCls = (href: string) =>
    `flex flex-col items-center justify-center gap-1 ${
      isActive(href) ? 'text-[#D2B48C] font-bold' : 'text-[#8C7853]'
    }`;

  const textCls = (href: string) =>
    `text-xs ${isActive(href) ? 'font-bold' : 'font-medium'}`;

  const navItems = [
    { href: '/home', label: '홈', icon: <svg fill="currentColor" height="24" width="24" viewBox="0 0 256 256"><path d="M218.83,103.77l-80-75.48a1.14,1.14,0,0,1-.11-.11,16,16,0,0,0-21.53,0l-.11.11L37.17,103.77A16,16,0,0,0,32,115.55V208a16,16,0,0,0,16,16H96a16,16,0,0,0,16-16V160h32v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V115.55A16,16,0,0,0,218.83,103.77ZM208,208H160V160a16,16,0,0,0-16-16H112a16,16,0,0,0-16,16v48H48V115.55l.11-.1L128,40l79.9,75.43.11.1Z"></path></svg> },
    { href: '/map', label: '예약', icon: <svg fill="currentColor" height="24" width="24" viewBox="0 0 256 256"><path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path></svg> },
    { href: '/dashboard', label: '대시보드', icon: <svg fill="currentColor" height="24" width="24" viewBox="0 0 256 256"><path d="M216,56v60a4,4,0,0,1-4,4H136V44a4,4,0,0,1,4-4h60A16,16,0,0,1,216,56ZM116,40H56A16,16,0,0,0,40,56v60a4,4,0,0,0,4,4h76V44A4,4,0,0,0,116,40Zm96,96H136v76a4,4,0,0,0,4,4h60a16,16,0,0,0,16-16V140A4,4,0,0,0,212,136ZM40,140v60a16,16,0,0,0,16,16h60a4,4,0,0,0,4-4V136H44A4,4,0,0,0,40,140Z"></path></svg> },
    { href: '/profile', label: '내 정보', icon: <svg fill="currentColor" height="24" width="24" viewBox="0 0 256 256"><path d="M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z" /></svg> },
  ];

  return (
    <>
      {navItems.map(item => (
        <Link key={item.href} className={linkCls(item.href)} href={item.href}>
          {item.icon}
          <p className={textCls(item.href)}>{item.label}</p>
        </Link>
      ))}
    </>
  );
}

function BottomNav() {
  const { isNavVisible } = useBottomNav();

  if (!isNavVisible) {
    return null;
  }

  return (
    <footer
      className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-gray-100 z-50 lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} // iOS 안전영역
    >
      <nav className="flex justify-around items-center h-16">
        <NavLinks />
      </nav>
    </footer>
  );
}

export default BottomNav;
