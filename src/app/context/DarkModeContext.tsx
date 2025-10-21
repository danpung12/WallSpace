"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type DarkModeContextType = {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (enabled: boolean) => void;
};

const DarkModeContext = createContext<DarkModeContextType | undefined>(undefined);

export function DarkModeProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkModeState] = useState(false);

  // 다크모드 클래스 업데이트
  const updateDarkModeClass = (isDark: boolean) => {
    if (typeof window === 'undefined') return;
    
    console.log("🎨 updateDarkModeClass 호출:", isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
      console.log("➕ dark 클래스 추가됨");
    } else {
      document.documentElement.classList.remove("dark");
      console.log("➖ dark 클래스 제거됨");
    }
    console.log("📋 현재 HTML 클래스:", document.documentElement.className);
  };

  // 초기 로드 시 localStorage에서 다크모드 설정 가져오기
  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    if (saved !== null) {
      const isDark = saved === "true";
      setIsDarkModeState(isDark);
      updateDarkModeClass(isDark);
    }
  }, []);

  // 다크모드 토글
  const toggleDarkMode = () => {
    setIsDarkModeState((prev) => {
      const newValue = !prev;
      localStorage.setItem("darkMode", String(newValue));
      updateDarkModeClass(newValue);
      return newValue;
    });
  };

  // 다크모드 설정
  const setDarkMode = (enabled: boolean) => {
    console.log("🌙 setDarkMode 호출됨:", enabled);
    setIsDarkModeState(enabled);
    localStorage.setItem("darkMode", String(enabled));
    updateDarkModeClass(enabled);
    console.log("✅ 다크모드 클래스 업데이트 완료");
  };

  return (
    <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode, setDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
}

export function useDarkMode() {
  const context = useContext(DarkModeContext);
  if (context === undefined) {
    throw new Error("useDarkMode must be used within a DarkModeProvider");
  }
  return context;
}

