// src/app/transition-provider.tsx
'use client';

import { AnimatePresence, motion, cubicBezier, type Transition } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { PropsWithChildren, useEffect, useRef, useState } from 'react';

const easeFn = cubicBezier(0.2, 0.7, 0.2, 1);
const pageTransition: Transition = { duration: 0.38, ease: easeFn };

export default function TransitionProvider({ children }: PropsWithChildren) {
  const pathname = usePathname();

  // ✅ 초기 한 틱 동안 exit 비활성화 → StrictMode의 테스트 언마운트에도 깜빡임 없음
  const [allowExit, setAllowExit] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    timerRef.current = window.setTimeout(() => setAllowExit(true), 0);
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={false} // 초기 진입 애니메이션 없음
        animate={{ opacity: 1, y: 0, scale: 1, filter: 'saturate(1)' }}
        exit={allowExit ? { opacity: 0, y: -10, scale: 0.995, filter: 'saturate(0.92)' } : undefined}
        transition={pageTransition}
        style={{ minHeight: '100svh', willChange: 'transform, opacity, filter' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
