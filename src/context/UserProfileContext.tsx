'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { UserProfile } from '@/data/profile';

interface UserProfileContextType {
  userProfile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  updateProfile: (profile: UserProfile) => void;
}

const UserProfileContext = createContext<UserProfileContextType | null>(null);

export const UserProfileProvider = ({ children }: { children: ReactNode }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/profile');
      if (response.ok) {
        const data: UserProfile = await response.json();
        setUserProfile(data);
        // sessionStorage에 캐싱 (페이지 새로고침 시에도 유지)
        sessionStorage.setItem('userProfile', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 초기 로드
  useEffect(() => {
    // sessionStorage에서 먼저 확인
    const cached = sessionStorage.getItem('userProfile');
    if (cached) {
      try {
        setUserProfile(JSON.parse(cached));
        setLoading(false);
        // 백그라운드에서 최신 데이터 가져오기
        fetchProfile();
      } catch (e) {
        // 캐시된 데이터가 손상되었으면 새로 가져오기
        fetchProfile();
      }
    } else {
      fetchProfile();
    }
  }, [fetchProfile]);

  const refreshProfile = useCallback(async () => {
    await fetchProfile();
  }, [fetchProfile]);

  const updateProfile = useCallback((profile: UserProfile) => {
    setUserProfile(profile);
    sessionStorage.setItem('userProfile', JSON.stringify(profile));
  }, []);

  return (
    <UserProfileContext.Provider value={{ 
      userProfile, 
      loading, 
      refreshProfile,
      updateProfile
    }}>
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = () => {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
};

