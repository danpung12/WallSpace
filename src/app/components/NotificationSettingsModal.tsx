"use client";
import { useEffect, useRef, useState } from "react";

// 타입 선언
type NotificationToggles = {
  booking: boolean;
  space: boolean;
  promo: boolean;
  news: boolean;
};

type NotificationSettingsModalProps = {
  open: boolean;
  onClose: () => void;
  onSave?: (data: NotificationToggles) => void; // onSave 타입 수정
};

function NotificationSettingsModal({
  open,
  onClose,
  onSave,
}: NotificationSettingsModalProps) {
  // 상태 예시 (실제로는 props로 받거나 fetch/저장 처리)
  const [toggles, setToggles] = useState<NotificationToggles>({
    booking: true,
    space: false,
    promo: true,
    news: false,
  });

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

  // 스위치 토글 핸들러
  function handleToggle(key: keyof NotificationToggles) {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleSave() {
    // 저장 처리 (필요하면 부모로 올리기)
    onSave?.(toggles);
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
          w-full max-w-md bg-white rounded-t-3xl shadow-lg
          transition-transform duration-300 ease-in-out
          ${open ? "translate-y-0" : "translate-y-full"}
        `}
        style={{
          fontFamily: "'Pretendard', sans-serif",
          color: "#181411",
        }}
      >
        <div className="flex items-center justify-center w-full h-8 pt-3">
          <div className="h-1.5 w-10 rounded-full bg-gray-300 cursor-pointer" onClick={onClose}></div>
        </div>
        <div className="p-6 pt-4">
          <h1 className="text-2xl font-bold mb-6 text-[#181411]">사용자 알림 설정</h1>
          <div className="space-y-4">
            <SettingItem
              label="예약 알림"
              desc="예정된 예약에 대해 알림을 받습니다."
              checked={toggles.booking}
              onChange={() => handleToggle("booking")}
            />
            <SettingItem
              label="새벽 시간 알림"
              desc="오후 10시 ~ 오전 6시까지의 예약 알림을 받습니다."
              checked={toggles.space}
              onChange={() => handleToggle("space")}
            />

          </div>
          <div className="flex gap-3 mt-8">
            <button
              type="button"
              className="bg-[#f2f2f2] text-[#181411] rounded-full px-6 py-3 font-bold text-sm w-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50 transition-colors"
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
        <div className="h-8 bg-white"></div>
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
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
      <div className="flex-grow pr-4">
        <p className="text-base font-medium text-[#181411]">{label}</p>
        <p className="text-sm font-normal text-[#887563]">{desc}</p>
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

export default NotificationSettingsModal;
