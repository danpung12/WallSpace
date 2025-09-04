'use client';

import { AnimatePresence, motion, cubicBezier, type Transition } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { PropsWithChildren, useRef, useEffect } from 'react';

const easeFn = cubicBezier(0.2, 0.7, 0.2, 1);
const pageTransition: Transition = { duration: 0.25, ease: easeFn };

export default function TransitionProvider({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const first = useRef(true);
  useEffect(() => { first.current = false; }, []);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={first.current ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={pageTransition}
        style={{ minHeight: '100svh' }}  // ✅ 배경X, absolute X
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}