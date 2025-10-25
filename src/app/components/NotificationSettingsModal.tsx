"use client";
import { useEffect, useRef, useState } from "react";

// 타입 선언
export type NotificationSettings = {
  comments: boolean;
  exhibitions: boolean;
  messages: boolean;
};

type NotificationSettingsModalProps = {
  open: boolean;
  onClose: () => void;
  onSave?: (data: NotificationSettings) => void;
  initialSettings: NotificationSettings;
};

function NotificationSettingsModal({
  open,
  onClose,
  onSave,
  initialSettings,
}: NotificationSettingsModalProps) {
  const [toggles, setToggles] = useState<NotificationSettings>(initialSettings);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    if (open) {
      setToggles(initialSettings);
    }
  }, [open, initialSettings]);

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 768);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

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
  function handleToggle(key: keyof NotificationSettings) {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleSave() {
    onSave?.(toggles);
    onClose();
  }

  return (
    <div
      ref={overlayRef}
      className={`fixed inset-0 z-[999] bg-black/50 flex ${isDesktop ? 'items-center' : 'items-end'} justify-center transition-opacity duration-200 ${
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      style={{ transitionProperty: "opacity" }}
      onMouseDown={handleOverlayClick}
    >
      <div
        className={`
          w-full max-w-md bg-white shadow-lg
          transition-all duration-300 ease-in-out
          ${isDesktop ? 'rounded-2xl' : 'rounded-t-3xl'}
          ${open 
            ? (isDesktop ? 'scale-100 opacity-100' : 'translate-y-0') 
            : (isDesktop ? 'scale-95 opacity-0' : 'translate-y-full')
          }
        `}
        style={{
          fontFamily: "'Pretendard', sans-serif",
          color: "#181411",
        }}
      >
        {!isDesktop && (
          <div className="flex items-center justify-center w-full h-8 pt-3">
            <div className="h-1.5 w-10 rounded-full bg-[#EAE5DE] cursor-pointer" onClick={onClose}></div>
          </div>
        )}
        <div className="p-6 pt-4">
          <h1 className="text-2xl font-bold mb-6 text-[#3E352F]">사용자 알림 설정</h1>
          <div className="space-y-4">
            <SettingItem
              label="댓글 알림"
              desc="내 작업에 새로운 댓글이 달리면 알림을 받습니다."
              checked={toggles.comments}
              onChange={() => handleToggle("comments")}
            />
            <SettingItem
              label="전시 알림"
              desc="새로운 전시에 대한 알림을 받습니다."
              checked={toggles.exhibitions}
              onChange={() => handleToggle("exhibitions")}
            />
            <SettingItem
              label="메시지 알림"
              desc="다른 사용자로부터 메시지를 받으면 알림을 받습니다."
              checked={toggles.messages}
              onChange={() => handleToggle("messages")}
            />

          </div>
          <div className="flex gap-3 mt-8">
            <button
              type="button"
              className="bg-[#F5F1EC] text-[#3E352F] rounded-full px-6 py-3 font-bold text-sm w-full hover:bg-[#EAE5DE] focus:outline-none focus:ring-2 focus:ring-[#A89587] focus:ring-opacity-50 transition-colors"
              onClick={onClose}
            >
              취소
            </button>
            <button
              type="button"
              className="bg-[#D2B48C] text-white rounded-full px-6 py-3 font-bold text-sm w-full hover:bg-[#A89587] focus:outline-none focus:ring-2 focus:ring-[#D2B48C] focus:ring-opacity-50 transition-colors"
              onClick={handleSave}
            >
              저장
            </button>
          </div>
        </div>
        {!isDesktop && <div className="h-8 bg-white"></div>}
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
    <div className="flex items-center justify-between py-3 border-b border-[#EAE5DE] last:border-b-0">
      <div className="flex-grow pr-4">
        <p className="text-base font-medium text-[#3E352F]">{label}</p>
        <p className="text-sm font-normal text-[#6B5E54]">{desc}</p>
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
          w-11 h-6 bg-[#EAE5DE] rounded-full peer
          peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#A89587]
          peer-checked:bg-[#D2B48C]
          after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-[#EAE5DE] after:border after:rounded-full after:h-5 after:w-5 after:transition-all
          peer-checked:after:translate-x-full peer-checked:after:border-white
          relative
        `}></div>
      </label>
    </div>
  );
}

export default NotificationSettingsModal;
