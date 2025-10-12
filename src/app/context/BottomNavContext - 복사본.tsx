'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface BottomNavContextType {
  isNavVisible: boolean;
  setNavVisible: (visible: boolean) => void;
}

const BottomNavContext = createContext<BottomNavContextType | undefined>(undefined);

export function BottomNavProvider({ children }: { children: ReactNode }) {
  const [isNavVisible, _setNavVisible] = useState(true);

  // ✨ 상태 변경이 일어날 때마다 로그를 찍는 함수를 새로 만듭니다.
  const setNavVisible = (visible: boolean) => {
    console.log(`[Context Provider] isNavVisible 상태 변경 요청: ${visible}`);
    _setNavVisible(visible);
  };

  return (
    <BottomNavContext.Provider value={{ isNavVisible, setNavVisible }}>
      {children}
    </BottomNavContext.Provider>
  );
}

export function useBottomNav() {
  const context = useContext(BottomNavContext);
  if (context === undefined) {
    throw new Error('useBottomNav must be used within a BottomNavProvider');
  }
  return context;
}