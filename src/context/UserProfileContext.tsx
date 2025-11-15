'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { UserProfile } from '@/data/profile';

interface UserProfileContextType {
  userProfile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  updateProfile: (profile: UserProfile) => void;
  unlinkIdentity: (provider: string) => Promise<{ success: boolean; error?: string }>;
}

const UserProfileContext = createContext<UserProfileContextType | null>(null);

export const UserProfileProvider = ({ children }: { children: ReactNode }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    const maxRetries = 2;
    
    for (let retryCount = 0; retryCount <= maxRetries; retryCount++) {
      try {
        setLoading(true);
        const response = await fetch('/api/profile', {
          credentials: 'include', // 쿠키 포함
        });
        
        if (response.ok) {
          const data: UserProfile = await response.json();
          setUserProfile(data);
          // sessionStorage에 캐싱 시도 (용량 초과 시 무시)
          // avatarUrl이 base64 이미지인 경우 용량이 클 수 있으므로 제거하고 저장
          try {
            const dataToCache = {
              ...data,
              avatarUrl: data.avatarUrl?.startsWith('data:image') ? '' : data.avatarUrl, // base64 이미지는 제외
            };
            sessionStorage.setItem('userProfile', JSON.stringify(dataToCache));
          } catch (storageError) {
            // 저장소 용량 초과 시 무시하고 계속 진행
            console.warn('Failed to cache profile in sessionStorage:', storageError);
            // 기존 캐시 삭제 시도
            try {
              sessionStorage.removeItem('userProfile');
              // 더 작은 데이터로 재시도 (avatarUrl 제외)
              const minimalData = {
                ...data,
                avatarUrl: '',
                identities: [], // identities도 제외
              };
              sessionStorage.setItem('userProfile', JSON.stringify(minimalData));
            } catch (e) {
              // 완전히 실패하면 캐싱 포기
              console.warn('Failed to cache even minimal profile data');
            }
          }
          setLoading(false);
          return; // 성공 시 함수 종료
        } else if (response.status === 401 && retryCount < maxRetries) {
          // 401 에러 시 재시도 (쿠키 설정 지연 대응)
          console.log(`Profile fetch 401, retrying... (${retryCount + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
          continue; // 재시도
        } else {
          console.error('Failed to fetch profile:', response.status, response.statusText);
          setLoading(false);
          return; // 재시도 불가능하거나 최대 재시도 횟수 초과
        }
      } catch (error) {
        console.error(`Error fetching profile (attempt ${retryCount + 1}/${maxRetries + 1}):`, error);
        
        // 네트워크 에러 시 재시도
        if (retryCount < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
          continue; // 재시도
        } else {
          setLoading(false);
          return; // 최대 재시도 횟수 초과
        }
      }
    }
    
    setLoading(false);
  }, []);

  // 초기 로드
  useEffect(() => {
    // 기존 캐시 정리 (용량 초과 문제 해결)
    try {
      // QuotaExceededError 발생 시 기존 캐시 삭제 시도
      sessionStorage.removeItem('userProfile');
    } catch (e) {
      // 무시
    }
    
    // sessionStorage에서 먼저 확인 (용량 초과 시 무시)
    try {
      const cached = sessionStorage.getItem('userProfile');
      if (cached) {
        try {
          setUserProfile(JSON.parse(cached));
          setLoading(false);
          // 백그라운드에서 최신 데이터 가져오기
          fetchProfile();
        } catch (e) {
          // 캐시된 데이터가 손상되었으면 새로 가져오기
          console.warn('Failed to parse cached profile:', e);
          try {
            sessionStorage.removeItem('userProfile');
          } catch (removeError) {
            // 무시
          }
          fetchProfile();
        }
      } else {
        fetchProfile();
      }
    } catch (storageError) {
      // sessionStorage 접근 실패 시 바로 새로 가져오기
      console.warn('Failed to access sessionStorage:', storageError);
      fetchProfile();
    }
  }, [fetchProfile]);

  const refreshProfile = useCallback(async () => {
    await fetchProfile();
  }, [fetchProfile]);

  const updateProfile = useCallback((profile: UserProfile) => {
    setUserProfile(profile);
    // sessionStorage 업데이트 시도 (용량 초과 시 무시)
    // avatarUrl이 base64 이미지인 경우 용량이 클 수 있으므로 제거하고 저장
    try {
      const dataToCache = {
        ...profile,
        avatarUrl: profile.avatarUrl?.startsWith('data:image') ? '' : profile.avatarUrl, // base64 이미지는 제외
      };
      sessionStorage.setItem('userProfile', JSON.stringify(dataToCache));
    } catch (storageError) {
      // 저장소 용량 초과 시 무시하고 계속 진행
      console.warn('Failed to update profile in sessionStorage:', storageError);
      // 기존 캐시 삭제 시도
      try {
        sessionStorage.removeItem('userProfile');
        // 더 작은 데이터로 재시도
        const minimalData = {
          ...profile,
          avatarUrl: '',
          identities: [], // identities도 제외
        };
        sessionStorage.setItem('userProfile', JSON.stringify(minimalData));
      } catch (e) {
        // 완전히 실패하면 캐싱 포기
        console.warn('Failed to cache even minimal profile data');
      }
    }
  }, []);

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

