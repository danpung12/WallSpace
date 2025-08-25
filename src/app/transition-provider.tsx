// src/app/transition-provider.tsx
'use client';

import { AnimatePresence, motion, cubicBezier, type Transition } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { PropsWithChildren, useRef, useEffect } from 'react';

const easeFn = cubicBezier(0.2, 0.7, 0.2, 1);
const pageTransition: Transition = { duration: 0.25, ease: easeFn };

// ✅ 오직 페이드인만. (exit 없음 → 이전 페이지는 즉시 제거)
const variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
};

export default function TransitionProvider({ children }: PropsWithChildren) {
  const pathname = usePathname();

  // 첫 렌더는 애니메이션 없이
  const first = useRef(true);
  useEffect(() => { first.current = false; }, []);

  return (
    // 겹칠 때 투명 배경 문제가 안 나도록 배경을 깔아줌
    <div style={{ position: 'relative', minHeight: '100svh', background: 'var(--background-color, #FDFBF8)' }}>
      <AnimatePresence mode="sync" initial={false}>
        <motion.div
          key={pathname}
          initial={first.current ? false : 'initial'}
          animate="animate"
          // exit를 지정하지 않음 → 이전 페이지 즉시 언마운트, 새 페이드인만 1회
          variants={variants}
          transition={pageTransition}
          style={{
            position: 'absolute',
            inset: 0,
            willChange: 'opacity', // transform·filter 제거 → 튐 현상 방지
            background: 'var(--background-color, #FDFBF8)',
          }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
