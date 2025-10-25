import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";

export default function ChangePasswordModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit?: (newPassword: string) => void;
}){
  const modalRef = useRef(null);
  const y = useMotionValue(0);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 768);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  const handleDragEnd = (event: any, info: any) => {
    const minDragDistance = 50;
    const minDragVelocity = 300;

    if (info.offset.y > minDragDistance || info.velocity.y > minDragVelocity) {
      onClose();
    }
  };
  
  const handleDrag = (event: any, info: any) => {
    if (info.offset.y < 0) {
      y.set(0);
    } else {
      y.set(info.offset.y);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed inset-0 bg-black/50 flex ${isDesktop ? 'items-center' : 'items-end'} justify-center z-[999]`}
          onClick={onClose}
        >
          <motion.div
            ref={modalRef}
            drag={isDesktop ? false : "y"}
            dragConstraints={{ top: 0, bottom: 0 }}
            onDragEnd={!isDesktop ? handleDragEnd : undefined}
            onDrag={!isDesktop ? handleDrag : undefined}
            initial={isDesktop ? { scale: 0.9, opacity: 0 } : { y: "100%" }}
            animate={isDesktop ? { scale: 1, opacity: 1 } : { y: "0%" }}
            exit={isDesktop ? { scale: 0.9, opacity: 0 } : { y: "100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 40 }}
            onClick={(e) => e.stopPropagation()}
            className={`bg-white w-full max-w-md ${isDesktop ? 'rounded-2xl' : 'rounded-t-3xl'}`}
            style={{
              y: !isDesktop ? y : undefined,
              boxShadow: "0 8px 40px 0 rgba(0,0,0,0.15)",
            }}
          >
            <div className="p-4">
              {!isDesktop && (
                <div className="flex justify-center mb-2">
                  <div className="w-10 h-1.5 bg-[#EAE5DE] rounded-full cursor-grab active:cursor-grabbing"></div>
                </div>
              )}
              <h2 className="mb-6 text-2xl font-bold text-[#3E352F] px-4">
                비밀번호 변경
              </h2>
              <form
                className="px-4 space-y-5"
                onSubmit={e => {
                  e.preventDefault();
                  const newPassword = (document.getElementById("new-password") as HTMLInputElement).value;
                  onSubmit?.(newPassword);
                }}
              >
                <div>
                  <label className="text-sm font-medium text-[#3D2C1D] mb-2 block" htmlFor="current-password">
                    현재 비밀번호
                  </label>
                  <input
                    className="w-full h-14 px-4 py-3 bg-[#F5F1EC] rounded-xl border border-[#EAE5DE] focus:outline-none focus:ring-2 focus:ring-[#A89587] text-[#3D2C1D] placeholder-[#6B5E54] text-sm"
                    id="current-password"
                    placeholder="현재 비밀번호를 입력하세요"
                    type="password"
                    autoComplete="current-password"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#3D2C1D] mb-2 block" htmlFor="new-password">
                    새 비밀번호
                  </label>
                  <input
                    className="w-full h-14 px-4 py-3 bg-[#F5F1EC] rounded-xl border border-[#EAE5DE] focus:outline-none focus:ring-2 focus:ring-[#A89587] text-[#3D2C1D] placeholder-[#6B5E54] text-sm"
                    id="new-password"
                    placeholder="새 비밀번호를 입력하세요"
                    type="password"
                    autoComplete="new-password"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#3D2C1D] mb-2 block" htmlFor="confirm-new-password">
                    새 비밀번호 확인
                  </label>
                  <input
                    className="w-full h-14 px-4 py-3 bg-[#F5F1EC] rounded-xl border border-[#EAE5DE] focus:outline-none focus:ring-2 focus:ring-[#A89587] text-[#3D2C1D] placeholder-[#6B5E54]"
                    id="confirm-new-password"
                    placeholder="새 비밀번호를 다시 입력하세요"
                    type="password"
                    autoComplete="new-password"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 pb-2 mt-8">
                  <button
                    className="h-12 rounded-full bg-[#F5F1EC] text-[#3E352F] font-bold hover:bg-[#EAE5DE] transition-colors"
                    type="button"
                    onClick={onClose}
                  >
                    취소
                  </button>
                  <button
                    className="h-12 rounded-full bg-[#D2B48C] text-white font-bold hover:bg-[#A89587] transition-colors"
                    type="submit"
                  >
                    변경
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
