'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import BottomNav from './BottomNav';
import { useBottomNav } from '@/app/context/BottomNavContext';

const DEFAULT_NAV_H = '64px';
const HIDE_ON = new Set<string>([
  '/login',
  '/onboarding',
  '/find-password',
  '/reset-password',
  '/select-type',
  '/select-type/guest',
  '/select-type/artist',
  '/confirm-booking',
  '/dashboard/add',
  '/dashboard/add-store',
]);

export default function BottomNavGate() {
  const pathname = usePathname();
  const { isNavVisible } = useBottomNav(); 

  const normalized =
    pathname && pathname !== '/' && pathname.endsWith('/')
      ? pathname.slice(0, -1)
      : pathname || '/';
  const showNavByPath = !HIDE_ON.has(normalized);

  const showNav = showNavByPath && isNavVisible;
  useEffect(() => {
    const el = document.documentElement;
    el.style.setProperty('--bottom-nav-h', showNav ? DEFAULT_NAV_H : '0px');
    
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