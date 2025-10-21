import { useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";

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

  const handleDragEnd = (event: any, info: any) => {
    const minDragDistance = 50; // 최소 드래그 거리
    const minDragVelocity = 300; // 최소 드래그 속도

    if (info.offset.y > minDragDistance || info.velocity.y > minDragVelocity) {
      onClose();
    }
  };
  
  const handleDrag = (event: any, info: any) => {
    // 위로 드래그하는 것을 막습니다.
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
          className="fixed inset-0 bg-black/50 flex items-end justify-center z-[999]"
          onClick={onClose}
        >
          <motion.div
            ref={modalRef}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            onDragEnd={handleDragEnd}
            onDrag={handleDrag}
            initial={{ y: "100%" }}
            animate={{ y: "0%" }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 40 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-t-3xl w-full max-w-md"
            style={{
              y,
              boxShadow: "0 -8px 40px 0 rgba(0,0,0,0.07)",
            }}
          >
            <div className="p-4">
              <div className="flex justify-center mb-2">
                <div className="w-10 h-1.5 bg-[#dcd6d1] rounded-full cursor-grab active:cursor-grabbing"></div>
              </div>
              <h2 className="mb-6 text-2xl font-bold text-center" style={{ color: "#4a3f3a" }}>
                비밀번호 변경
              </h2>
              <form
                className="px-4 space-y-5"
                onSubmit={e => {
                  e.preventDefault();
                  // 실제 비밀번호는 여기서 가져와야 합니다. 여기서는 임시로 빈 문자열 전달
                  const newPassword = (document.getElementById("new-password") as HTMLInputElement).value;
                  onSubmit?.(newPassword);
                }}
              >
                <div>
                  <label className="text-sm font-medium text-[#4a3f3a] mb-2 block" htmlFor="current-password">
                    현재 비밀번호
                  </label>
                  <input
                    className="w-full h-14 px-4 py-3 bg-[#f5f3f1] rounded-xl border border-transparent focus:outline-none focus:ring-2 focus:ring-[#a58a78] text-[#4a3f3a] placeholder-[#9e8a7e] text-sm"
                    id="current-password"
                    placeholder="현재 비밀번호를 입력하세요"
                    type="password"
                    autoComplete="current-password"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#4a3f3a] mb-2 block" htmlFor="new-password">
                    새 비밀번호
                  </label>
                  <input
                    className="w-full h-14 px-4 py-3 bg-[#f5f3f1] rounded-xl border border-transparent focus:outline-none focus:ring-2 focus:ring-[#a58a78] text-[#4a3f3a] placeholder-[#9e8a7e] text-sm"
                    id="new-password"
                    placeholder="새 비밀번호를 입력하세요"
                    type="password"
                    autoComplete="new-password"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#4a3f3a] mb-2 block" htmlFor="confirm-new-password">
                    새 비밀번호 확인
                  </label>
                  <input
                    className="w-full h-14 px-4 py-3 bg-[#f5f3f1] rounded-xl border border-transparent focus:outline-none focus:ring-2 focus:ring-[#a58a78] text-[#4a3f3a] placeholder-[#9e8a7e]"
                    id="confirm-new-password"
                    placeholder=""
                    type="password"
                    autoComplete="new-password"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 pb-2 mt-8">
                  <button
                    className="h-12 rounded-full bg-[#f5f3f1] text-[#4a3f3a] font-bold hover:bg-[#dcd6d1] transition-colors"
                    type="button"
                    onClick={onClose}
                  >
                    취소
                  </button>
                  <button
                    className="h-12 rounded-full bg-[#e68019] text-white font-bold hover:bg-opacity-90 transition-colors"
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
