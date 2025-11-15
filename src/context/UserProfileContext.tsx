'use client';

import React, { createContext, useContext, ReactNode, useCallback, useEffect, useState } from 'react';
import { UserProfile } from '@/data/profile';
import { useApi, mutate } from '@/lib/swr';
import { createClient } from '@/lib/supabase/client';

interface UserProfileContextType {
  userProfile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  updateProfile: (profile: UserProfile) => void;
  unlinkIdentity: (provider: string) => Promise<{ success: boolean; error?: string }>;
}

const UserProfileContext = createContext<UserProfileContextType | null>(null);

export const UserProfileProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  // 인증 상태 확인
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    
    checkAuth();
    
    // 인증 상태 변경 감지
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // 로그인한 경우에만 프로필 데이터 가져오기
  const { data: userProfile, isLoading: loading, mutate: mutateProfile } = useApi<UserProfile>(
    isAuthenticated ? '/api/profile' : null, // 로그인하지 않은 경우 null로 설정하여 API 호출 방지
    {
      revalidateOnFocus: false, // 포커스 시 자동 재검증 비활성화
      revalidateIfStale: true, // 오래된 데이터가 있으면 백그라운드에서 재검증
      dedupingInterval: 5000, // 5초 내 중복 요청 방지
      keepPreviousData: true, // 데이터 변경 시 이전 데이터 유지 (깜빡임 방지)
    }
  );

  const refreshProfile = useCallback(async () => {
    // SWR 캐시 무효화 및 재검증
    await mutateProfile();
  }, [mutateProfile]);

  const updateProfile = useCallback((profile: UserProfile) => {
    // SWR 캐시를 즉시 업데이트 (낙관적 업데이트)
    mutateProfile(profile, { revalidate: false });
  }, [mutateProfile]);

  const unlinkIdentity = useCallback(async (provider: string) => {
    try {
      const response = await fetch('/api/auth/unlink', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ provider }),
      });

      const result = await response.json();

      if (!response.ok) {
        return { success: false, error: result.error || 'Failed to unlink identity.' };
      }

      // Unlink successful, refresh the profile to get the updated identities
      await refreshProfile();
      return { success: true };

    } catch (error) {
      console.error('Error unlinking identity:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      return { success: false, error: errorMessage };
    }
  }, [refreshProfile]);

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

