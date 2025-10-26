'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import BottomNav from './BottomNav';
import { useBottomNav } from '@/app/context/BottomNavContext';

const DEFAULT_NAV_H = '64px';
const HIDE_ON = new Set<string>([
  '/select-type',
  '/select-type/guest',
  '/select-type/artist',
  '/confirm-booking',
]);

export default function BottomNavGate() {
  const pathname = usePathname();
  // ✨ 이제 isNavVisible만 사용하고, setNavVisible은 사용하지 않습니다.
  const { isNavVisible } = useBottomNav(); 

  const normalized =
    pathname && pathname !== '/' && pathname.endsWith('/')
      ? pathname.slice(0, -1)
      : pathname || '/';
  const showNavByPath = !HIDE_ON.has(normalized);

  // ✨ 페이지 이동 시 상태를 리셋하던 useEffect를 과감히 삭제합니다.
  // useEffect(() => {
  //   setNavVisible(true);
  // }, [pathname, setNavVisible]);

  // 최종 결정 로직은 동일합니다.
  const showNav = showNavByPath && isNavVisible;
  
  // CSS 변수를 설정하는 useEffect는 그대로 둡니다.
  useEffect(() => {
    const el = document.documentElement;
    el.style.setProperty('--bottom-nav-h', showNav ? DEFAULT_NAV_H : '0px');
    
    // cleanup 로직은 유지하여 안정성을 높입니다.
    return () => {
      const el = document.documentElement;
      const normalizedOnExit =
        pathname && pathname !== '/' && pathname.endsWith('/')
          ? pathname.slice(0, -1)
          : pathname || '/';
      const showNavOnExit = !HIDE_ON.has(normalizedOnExit);
      el.style.setProperty('--bottom-nav-h', showNavOnExit ? DEFAULT_NAV_H : '0px');
    };
  }, [showNav, pathname]);

  if (!showNav) return null;
  return <BottomNav />;
}