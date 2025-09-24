import { useEffect, useRef } from "react";

export default function ChangePasswordModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit?: () => void;
}){
  const overlayRef = useRef(null);

  // ESC나 배경 클릭시 닫기
  useEffect(() => {
    if (!open) return;
 function handleKey(e: KeyboardEvent) {
  if (e.key === "Escape") onClose();
}
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  // 바깥 클릭시 닫기
function handleOverlayClick(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
  if (e.target === overlayRef.current) onClose();
}
  return (
    <div
      ref={overlayRef}
      className={`fixed inset-0 bg-black/50 flex items-end justify-center z-50 transition-opacity duration-200 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      style={{ transitionProperty: "opacity" }}
      onMouseDown={handleOverlayClick}
    >
      <div
        className={`
          bg-white rounded-t-3xl w-full max-w-md
          transform transition-transform duration-300 ease-in-out
          ${open ? "translate-y-0" : "translate-y-full"}
        `}
        style={{
          boxShadow: "0 -8px 40px 0 rgba(0,0,0,0.07)",
        }}
      >
        <div className="p-4">
          <div className="flex justify-center mb-2">
            <div className="w-10 h-1.5 bg-[#dcd6d1] rounded-full"></div>
          </div>
          <h2 className="mb-6 text-2xl font-bold text-center" style={{ color: "#4a3f3a" }}>
            비밀번호 변경
          </h2>
          <form
            className="px-4 space-y-5"
            onSubmit={e => {
              e.preventDefault();
              onSubmit?.();
            }}
          >
            <div>
              <label className="text-sm font-medium text-[#4a3f3a] mb-2 block" htmlFor="current-password">
                현재 비밀번호
              </label>
              <input
                className="w-full h-14 px-4 py-3 bg-[#f5f3f1] rounded-xl border border-transparent focus:outline-none focus:ring-2 focus:ring-[#a58a78] text-[#4a3f3a] placeholder-[#9e8a7e] text-sm
"
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
                className="w-full h-14 px-4 py-3 bg-[#f5f3f1] rounded-xl border border-transparent focus:outline-none focus:ring-2 focus:ring-[#a58a78] text-[#4a3f3a] placeholder-[#9e8a7e] text-sm
"
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
      </div>
    </div>
  );
}
