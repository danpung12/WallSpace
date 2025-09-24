'use client';

import { AnimatePresence, motion, cubicBezier, type Transition } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { PropsWithChildren, useEffect } from 'react';

const easeFn = cubicBezier(0.2, 0.7, 0.2, 1);
const pageTransition: Transition = { duration: 0.25, ease: easeFn };

export default function TransitionProvider({ children }: PropsWithChildren) {
  const pathname = usePathname();

  useEffect(() => {
    document.body.classList.remove('js-loading');
  }, []);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={pageTransition}
        style={{
          minHeight: '100svh',
          // ✅ layout.tsx의 body 배경색과 동일한 변수로 수정
          backgroundColor: 'var(--brand-cream)'
        }}
        data-is-present
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}