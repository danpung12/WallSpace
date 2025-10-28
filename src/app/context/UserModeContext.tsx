'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type UserMode = 'artist' | 'manager';

interface UserModeContextType {
  userMode: UserMode;
  setUserMode: (mode: UserMode) => void;
}

const UserModeContext = createContext<UserModeContextType | undefined>(undefined);

export function UserModeProvider({ children }: { children: ReactNode }) {
  const [userMode, setUserMode] = useState<UserMode>('artist');
  const [isInitialized, setIsInitialized] = useState(false);

  // 초기 로드 시 데이터베이스에서 user_type 불러오기
  useEffect(() => {
    const loadUserType = async () => {
      try {
        const response = await fetch('/api/profile');
        if (response.ok) {
          const data = await response.json();
          if (data.user_type === 'manager' || data.user_type === 'artist') {
            setUserMode(data.user_type);
          }
        }
      } catch (error) {
        console.error('Failed to load user type:', error);
      } finally {
        setIsInitialized(true);
      }
    };
    
    loadUserType();
  }, []);

  return (
    <UserModeContext.Provider value={{ userMode, setUserMode }}>
      {children}
    </UserModeContext.Provider>
  );
}

export function useUserMode() {
  const context = useContext(UserModeContext);
  if (context === undefined) {
    throw new Error('useUserMode must be used within a UserModeProvider');
  }
  return context;
}


