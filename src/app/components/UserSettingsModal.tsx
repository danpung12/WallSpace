"use client";
import { useEffect, useRef, useState } from "react";

// 타입 선언
export type UserSettings = {
  darkMode: boolean;
};

type UserSettingsModalProps = {
  open: boolean;
  onClose: () => void;
  onSave?: (data: UserSettings) => void;
  initialSettings: UserSettings;
};

function UserSettingsModal({
  open,
  onClose,
  onSave,
  initialSettings,
}: UserSettingsModalProps) {
  const [settings, setSettings] = useState<UserSettings>(initialSettings);

  useEffect(() => {
    if (open) {
      setSettings(initialSettings);
    }
  }, [open, initialSettings]);

  // ESC로 닫기
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // 바깥 클릭 닫기
  const overlayRef = useRef<HTMLDivElement | null>(null);
  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if (e.target === overlayRef.current) onClose();
  }

  // 다크모드 토글 핸들러
  function handleToggleDarkMode() {
    setSettings((prev) => ({ ...prev, darkMode: !prev.darkMode }));
  }

  function handleSave() {
    onSave?.(settings);
    onClose();
  }

  return (
    <div
      ref={overlayRef}
      className={`fixed inset-0 z-[999] bg-black/50 flex items-end justify-center transition-opacity duration-200 ${
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      style={{ transitionProperty: "opacity" }}
      onMouseDown={handleOverlayClick}
    >
      <div
        className={`
          w-full max-w-md bg-white dark:bg-gray-800 rounded-t-3xl shadow-lg
          transition-transform duration-300 ease-in-out
          ${open ? "translate-y-0" : "translate-y-full"}
        `}
        style={{
          fontFamily: "'Pretendard', sans-serif",
        }}
      >
        <div className="flex items-center justify-center w-full h-8 pt-3">
          <div className="h-1.5 w-10 rounded-full bg-gray-300 dark:bg-gray-600 cursor-pointer" onClick={onClose}></div>
        </div>
        <div className="p-6 pt-4">
          <h1 className="text-2xl font-bold mb-6 text-[#181411] dark:text-gray-100">사용자 설정</h1>
          <div className="space-y-4">
            <SettingItem
              label="다크 모드"
              desc="화면을 어두운 테마로 표시합니다."
              checked={settings.darkMode}
              onChange={handleToggleDarkMode}
            />
          </div>
          <div className="flex gap-3 mt-8">
            <button
              type="button"
              className="bg-[#f2f2f2] dark:bg-gray-700 text-[#181411] dark:text-gray-100 rounded-full px-6 py-3 font-bold text-sm w-full hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:ring-opacity-50 transition-colors"
              onClick={onClose}
            >
              취소
            </button>
            <button
              type="button"
              className="bg-[#e68019] text-white rounded-full px-6 py-3 font-bold text-sm w-full hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#e68019] focus:ring-opacity-50 transition-opacity"
              onClick={handleSave}
            >
              저장
            </button>
          </div>
        </div>
        <div className="h-8 bg-white dark:bg-gray-800"></div>
      </div>
    </div>
  );
}

// 스위치 항목 컴포넌트 타입 정의
type SettingItemProps = {
  label: string;
  desc: string;
  checked: boolean;
  onChange: () => void;
};

// 스위치 항목 컴포넌트
function SettingItem({ label, desc, checked, onChange }: SettingItemProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
      <div className="flex-grow pr-4">
        <p className="text-base font-medium text-[#181411] dark:text-gray-100">{label}</p>
        <p className="text-sm font-normal text-[#887563] dark:text-gray-400">{desc}</p>
      </div>
      {/* 토글 스위치 */}
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          onChange={onChange}
        />
        <div className={`
          w-11 h-6 bg-gray-200 rounded-full peer
          peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#e68019]
          peer-checked:bg-[#e68019]
          after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all
          peer-checked:after:translate-x-full peer-checked:after:border-white
          relative
        `}></div>
      </label>
    </div>
  );
}

export default UserSettingsModal;

