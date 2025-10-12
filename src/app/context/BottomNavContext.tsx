'use client';
import React, { createContext, useState, useContext, ReactNode } from 'react';

type BottomNavContextType = {
  isNavVisible: boolean;
  setIsNavVisible: (isVisible: boolean) => void;
};

const BottomNavContext = createContext<BottomNavContextType | undefined>(undefined);

export const BottomNavProvider = ({ children }: { children: ReactNode }) => {
  const [isNavVisible, setIsNavVisible] = useState(true);

  return (
    <BottomNavContext.Provider value={{ isNavVisible, setIsNavVisible }}>
      {children}
    </BottomNavContext.Provider>
  );
};

export const useBottomNav = () => {
  const context = useContext(BottomNavContext);
  if (context === undefined) {
    throw new Error('useBottomNav must be used within a BottomNavProvider');
  }
  return context;
};