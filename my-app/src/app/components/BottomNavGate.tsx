// src/app/components/BottomNavGate.tsx
'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import BottomNav from './BottomNav';

const DEFAULT_NAV_H = '64px';
const HIDE_ON = new Set<string>(['/', '/select-type', '/select-type/guest', '/select-type/artist']);

export default function BottomNavGate() {
  const pathname = usePathname();

  // optional: /foo/ -> /foo 로 정규화 (루트 / 는 유지)
  const normalized =
    pathname && pathname !== '/' && pathname.endsWith('/')
      ? pathname.slice(0, -1)
      : pathname || '/';

  const showNav = !HIDE_ON.has(normalized);

  useEffect(() => {
    const el = document.documentElement;
    el.style.setProperty('--bottom-nav-h', showNav ? DEFAULT_NAV_H : '0px');
    return () => {
      el.style.setProperty('--bottom-nav-h', DEFAULT_NAV_H);
    };
  }, [showNav]);

  if (!showNav) return null;
  return <BottomNav />;
}
