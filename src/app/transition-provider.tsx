'use client';

import { AnimatePresence, motion, cubicBezier, type Transition } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { PropsWithChildren } from 'react';

const easeFn = cubicBezier(0.2, 0.7, 0.2, 1);
const pageTransition: Transition = { duration: 0.38, ease: easeFn };

export default function TransitionProvider({ children }: PropsWithChildren) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={false}
        animate={{ opacity: 1, y: 0, scale: 1, filter: 'saturate(1)' }}
        exit={{ opacity: 0, y: -10, scale: 0.995, filter: 'saturate(0.92)' }}
        transition={pageTransition}
        style={{ minHeight: '100svh' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
