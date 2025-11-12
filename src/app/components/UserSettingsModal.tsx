"use client";
import { useEffect, useRef, useState } from "react";

// 타입 선언
export type UserSettings = {
  darkMode: boolean;
  notifications: {
    comments: boolean;
    exhibitions: boolean;
    exhibition_distance: number; // 전시 알림 거리 (km)
  };
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
  const [settings, setSettings] = useState<UserSettings>({
    ...initialSettings,
    notifications: {
      ...initialSettings.notifications,
      exhibition_distance: initialSettings.notifications.exhibition_distance ?? 5
    }
  });
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    if (open) {
      setSettings({
        ...initialSettings,
        notifications: {
          ...initialSettings.notifications,
          exhibition_distance: initialSettings.notifications.exhibition_distance ?? 5
        }
      });
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

  // 다크모드 토글 핸들러
  function handleToggleDarkMode() {
    setSettings((prev) => ({ ...prev, darkMode: !prev.darkMode }));
  }

  // 알림 설정 토글 핸들러
  function handleToggleNotification(key: 'comments' | 'exhibitions') {
    setSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key],
      },
    }));
  }

  // 전시 알림 거리 변경 핸들러
  function handleDistanceChange(distance: number) {
    setSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        exhibition_distance: distance,
      },
    }));
  }

  function handleSave() {
    onSave?.(settings);
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
          w-full max-w-md bg-white dark:bg-gray-800 shadow-lg
          transition-all duration-300 ease-in-out
          ${isDesktop ? 'rounded-2xl max-h-[90vh]' : 'rounded-t-3xl max-h-[85vh]'}
          ${open 
            ? (isDesktop ? 'scale-100 opacity-100' : 'translate-y-0') 
            : (isDesktop ? 'scale-95 opacity-0' : 'translate-y-full')
          }
          overflow-hidden flex flex-col
        `}
        style={{
          fontFamily: "'Pretendard', sans-serif",
        }}
      >
        {!isDesktop && (
          <div className="flex items-center justify-center w-full h-8 pt-3 flex-shrink-0">
            <div className="h-1.5 w-10 rounded-full bg-[#EAE5DE] dark:bg-gray-600 cursor-pointer" onClick={onClose}></div>
          </div>
        )}
        <div className="p-6 pt-4 overflow-y-auto flex-1">
          <h1 className="text-2xl font-bold mb-6 text-[#3E352F] dark:text-gray-100">사용자 설정</h1>
          
          {/* 알림 설정 섹션 */}
          <div className="mb-6">
            <h2 className="text-sm font-bold text-[#6B5E54] dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
              알림 설정
            </h2>
            <div className="space-y-4">
              <SettingItem
                label="댓글 알림"
                desc="내 작품에 새로운 댓글이 달리면"
                checked={settings.notifications.comments}
                onChange={() => handleToggleNotification("comments")}
              />
              <SettingItem
                label="전시 알림"
                desc="근처의 새 전시에 대한 알림을 받습니다."
                checked={settings.notifications.exhibitions}
                onChange={() => handleToggleNotification("exhibitions")}
              />
              {settings.notifications.exhibitions && (
                <DistanceSlider
                  distance={settings.notifications.exhibition_distance}
                  onChange={handleDistanceChange}
                />
              )}
            </div>
          </div>

          {/* 테마 설정 섹션 */}
          <div>
            <h2 className="text-sm font-bold text-[#6B5E54] dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
              </svg>
              테마 설정
            </h2>
            <div className="space-y-4">
              <SettingItem
                label="다크 모드"
                desc="화면을 어두운 테마로 표시합니다."
                checked={settings.darkMode}
                onChange={handleToggleDarkMode}
              />
            </div>
          </div>
        </div>
        <div className="p-6 pt-4 border-t border-[#EAE5DE] dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
          <div className="flex gap-3">
            <button
              type="button"
              className="bg-[#F5F1EC] dark:bg-gray-700 text-[#3E352F] dark:text-gray-100 rounded-full px-6 py-3 font-bold text-sm w-full hover:bg-[#EAE5DE] dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-[#A89587] dark:focus:ring-gray-600 focus:ring-opacity-50 transition-colors"
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
        {!isDesktop && <div className="h-8 bg-white dark:bg-gray-800 flex-shrink-0"></div>}
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
    <div className="flex items-center justify-between py-3 border-b border-[#EAE5DE] dark:border-gray-700 last:border-b-0">
      <div className="flex-grow pr-4">
        <p className="text-base font-medium text-[#3E352F] dark:text-gray-100">{label}</p>
        <p className="text-sm font-normal text-[#6B5E54] dark:text-gray-400">{desc}</p>
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

// 거리 슬라이더 컴포넌트
type DistanceSliderProps = {
  distance: number;
  onChange: (distance: number) => void;
};

function DistanceSlider({ distance, onChange }: DistanceSliderProps) {
  const validDistance = distance ?? 5;
  
  return (
    <div className="px-4 py-3 bg-[#F5F1EC] dark:bg-gray-700/50 rounded-xl">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-[#6B5E54] dark:text-gray-400">
          근처 거리 설정
        </p>
        <p className="text-sm font-bold text-[#3E352F] dark:text-gray-100">
          {validDistance} km
        </p>
      </div>
      <input
        type="range"
        min="1"
        max="50"
        value={validDistance}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-[#EAE5DE] dark:bg-gray-600 rounded-lg appearance-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-4
          [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-[#D2B48C]
          [&::-webkit-slider-thumb]:cursor-pointer
          [&::-webkit-slider-thumb]:shadow-md
          [&::-webkit-slider-thumb]:hover:bg-[#A89587]
          [&::-webkit-slider-thumb]:transition-colors
          [&::-moz-range-thumb]:w-4
          [&::-moz-range-thumb]:h-4
          [&::-moz-range-thumb]:rounded-full
          [&::-moz-range-thumb]:bg-[#D2B48C]
          [&::-moz-range-thumb]:border-0
          [&::-moz-range-thumb]:cursor-pointer
          [&::-moz-range-thumb]:shadow-md
          [&::-moz-range-thumb]:hover:bg-[#A89587]
          [&::-moz-range-thumb]:transition-colors"
        style={{
          background: `linear-gradient(to right, #D2B48C 0%, #D2B48C ${(validDistance - 1) / 49 * 100}%, #EAE5DE ${(validDistance - 1) / 49 * 100}%, #EAE5DE 100%)`
        }}
      />
      <div className="flex justify-between mt-1">
        <span className="text-xs text-[#6B5E54] dark:text-gray-400">1 km</span>
        <span className="text-xs text-[#6B5E54] dark:text-gray-400">50 km</span>
      </div>
    </div>
  );
}

export default UserSettingsModal;

