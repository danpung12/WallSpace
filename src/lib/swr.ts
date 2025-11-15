// SWR 전역 설정 및 유틸리티 함수

import useSWR, { SWRConfiguration, SWRResponse } from 'swr';

// Fetcher 함수 - 모든 API 호출에 사용
const fetcher = async (url: string) => {
  const res = await fetch(url, {
    credentials: 'include', // 쿠키 포함
  });
  
  if (!res.ok) {
    const error: any = new Error('An error occurred while fetching the data.');
    error.info = await res.json().catch(() => ({}));
    error.status = res.status;
    throw error;
  }
  
  return res.json();
};

// sessionStorage를 사용한 캐시 provider (새로고침 시에도 캐시 유지)
function sessionStorageProvider() {
  // 서버 사이드에서는 Map 사용
  if (typeof window === 'undefined') {
    return new Map();
  }

  // 클라이언트 사이드에서는 sessionStorage 사용
  const map = new Map(JSON.parse(sessionStorage.getItem('swr-cache') || '[]'));

  // 페이지 언로드 시 캐시 저장
  window.addEventListener('beforeunload', () => {
    const appCache = JSON.stringify(Array.from(map.entries()));
    sessionStorage.setItem('swr-cache', appCache);
  });

  return map;
}

// SWR 전역 설정
export const swrConfig: SWRConfiguration = {
  fetcher,
  provider: sessionStorageProvider, // sessionStorage 캐시 provider 사용
  revalidateOnFocus: false, // 포커스 시 자동 재검증 비활성화 (수동으로만 업데이트)
  revalidateOnReconnect: true, // 네트워크 재연결 시 재검증
  revalidateIfStale: true, // 오래된 데이터가 있으면 백그라운드에서 재검증
  dedupingInterval: 5000, // 5초 내 중복 요청 방지 (성능 최적화)
  focusThrottleInterval: 5000, // 포커스 시 throttle (5초)
  keepPreviousData: true, // 데이터가 변경되는 동안 이전 데이터 유지 (깜빡임 방지)
  errorRetryCount: 2, // 에러 시 재시도 횟수 (빠른 실패)
  errorRetryInterval: 1000, // 재시도 간격 (1초, 더 빠른 재시도)
  onError: (error) => {
    // 에러 로깅 (필요시 에러 리포트 서비스로 전송 가능)
    console.error('SWR Error:', error);
  },
};

// 커스텀 useSWR 훅 (추가 옵션 포함)
export function useApi<T = any>(
  key: string | null,
  config?: SWRConfiguration
): SWRResponse<T, any> {
  return useSWR<T>(key, {
    ...swrConfig,
    ...config,
  });
}

// 캐시 무효화를 위한 key 생성기
export const createCacheKey = (endpoint: string, params?: Record<string, any>) => {
  if (!params || Object.keys(params).length === 0) {
    return endpoint;
  }
  const queryString = new URLSearchParams(params).toString();
  return `${endpoint}?${queryString}`;
};

// 특정 key의 캐시 무효화 함수 (mutate를 사용)
export { mutate } from 'swr';

