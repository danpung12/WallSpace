// src/app/transition-provider.tsx
'use client';

import { AnimatePresence, motion, cubicBezier, type Transition } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { PropsWithChildren, useEffect, useState } from 'react';

const easeFn = cubicBezier(0.2, 0.7, 0.2, 1);
const pageTransition: Transition = { duration: 0.38, ease: easeFn };

export default function TransitionProvider({ children }: PropsWithChildren) {
  const pathname = usePathname();

  // ✅ 훅 호출을 1개로 고정 (mounted/allowExit를 하나의 state로 관리)
  const [flags, setFlags] = useState<{ mounted: boolean; allowExit: boolean }>({
    mounted: false,
    allowExit: false,
  });

  // 초기 마운트 이후에만 exit 허용 (초기 깜빡임 방지)
  useEffect(() => {
    setFlags({ mounted: true, allowExit: true });
  }, []);

  // 첫 진입엔 애니메이션 없음(initial=false),
  // 나갈 때만(exit) 페이드/슬라이드 적용 (allowExit 켜진 뒤부터)
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={false} // 초기 진입 애니메이션 없음
        animate={{ opacity: 1, y: 0, scale: 1, filter: 'saturate(1)' }}
        exit={
          flags.allowExit
            ? { opacity: 0, y: -10, scale: 0.995, filter: 'saturate(0.92)' }
            : undefined // 첫 마운트 종료 시에는 exit 비활성
        }
        transition={pageTransition}
        style={{ minHeight: '100svh', willChange: 'transform, opacity, filter' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
