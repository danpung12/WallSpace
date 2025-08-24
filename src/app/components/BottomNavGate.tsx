// src/app/components/BottomNavGate.tsx
'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import BottomNav from './BottomNav';

const DEFAULT_NAV_H = '64px';

export default function BottomNavGate() {
  const pathname = usePathname();
  const showNav = pathname !== '/';

  // 루트(/)에선 아래 여백 변수 0으로, 그 외는 기본값
  useEffect(() => {
    const el = document.documentElement;
    el.style.setProperty('--bottom-nav-h', showNav ? DEFAULT_NAV_H : '0px');
    return () => {
      // 언마운트 시 기본값 복원 (필요 시)
      el.style.setProperty('--bottom-nav-h', DEFAULT_NAV_H);
    };
  }, [showNav]);

  if (!showNav) return null;
  return <BottomNav />;
}
