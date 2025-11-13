import { useState, useEffect } from "react";

export default function ChangePasswordModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit?: (newPassword: string) => void;
}) {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 200); // Animation duration
  };

  useEffect(() => {
    if (open) {
      setIsClosing(false);
    }
  }, [open]);

  if (!open && !isClosing) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 bg-black/50 flex items-center justify-center z-[999] ${isClosing ? 'modal-leave' : 'modal-enter'}`}
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-lg m-4 ${isClosing ? 'modal-content-leave' : 'modal-content-enter'}`}
      >
        <div className="p-6">
          <h2 className="mb-6 text-2xl font-bold text-[#3E352F] dark:text-gray-100">
            비밀번호 변경
          </h2>
          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              const newPassword = (document.getElementById("new-password") as HTMLInputElement).value;
              onSubmit?.(newPassword);
            }}
          >
            <div>
              <label className="text-sm font-medium text-[#3D2C1D] dark:text-gray-300 mb-2 block" htmlFor="current-password">
                현재 비밀번호
              </label>
              <input
                className="w-full h-14 px-4 py-3 bg-[#F5F1EC] dark:bg-gray-700 rounded-xl border border-[#EAE5DE] dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#A89587] dark:focus:ring-amber-400 text-[#3D2C1D] dark:text-gray-100 placeholder-[#6B5E54] dark:placeholder-gray-400 text-sm"
                id="current-password"
                placeholder="현재 비밀번호를 입력하세요"
                type="password"
                autoComplete="current-password"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#3D2C1D] dark:text-gray-300 mb-2 block" htmlFor="new-password">
                새 비밀번호
              </label>
              <input
                className="w-full h-14 px-4 py-3 bg-[#F5F1EC] dark:bg-gray-700 rounded-xl border border-[#EAE5DE] dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#A89587] dark:focus:ring-amber-400 text-[#3D2C1D] dark:text-gray-100 placeholder-[#6B5E54] dark:placeholder-gray-400 text-sm"
                id="new-password"
                placeholder="새 비밀번호를 입력하세요"
                type="password"
                autoComplete="new-password"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#3D2C1D] dark:text-gray-300 mb-2 block" htmlFor="confirm-new-password">
                새 비밀번호 확인
              </label>
              <input
                className="w-full h-14 px-4 py-3 bg-[#F5F1EC] dark:bg-gray-700 rounded-xl border border-[#EAE5DE] dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#A89587] dark:focus:ring-amber-400 text-[#3D2C1D] dark:text-gray-100 placeholder-[#6B5E54] dark:placeholder-gray-400"
                id="confirm-new-password"
                placeholder="새 비밀번호를 다시 입력하세요"
                type="password"
                autoComplete="new-password"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <button
                className="h-12 rounded-lg bg-[#F5F1EC] dark:bg-gray-700 text-[#3E352F] dark:text-gray-100 font-bold hover:bg-[#EAE5DE] dark:hover:bg-gray-600 transition-colors"
                type="button"
                onClick={handleClose}
              >
                취소
              </button>
              <button
                className="h-12 rounded-lg bg-[#D2B48C] text-white font-bold hover:bg-[#A89587] transition-colors"
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
