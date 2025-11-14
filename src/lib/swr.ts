// SWR 전역 설정 및 유틸리티 함수

import useSWR, { SWRConfiguration, SWRResponse } from 'swr';

// Fetcher 함수 - 모든 API 호출에 사용
const fetcher = async (url: string) => {
  const res = await fetch(url);
  
  if (!res.ok) {
    const error: any = new Error('An error occurred while fetching the data.');
    error.info = await res.json().catch(() => ({}));
    error.status = res.status;
    throw error;
  }
  
  return res.json();
};

// SWR 전역 설정
export const swrConfig: SWRConfiguration = {
  fetcher,
  revalidateOnFocus: false, // 포커스 시 자동 재검증 비활성화 (수동으로만 업데이트)
  revalidateOnReconnect: true, // 네트워크 재연결 시 재검증
  revalidateIfStale: true, // 오래된 데이터가 있으면 재검증
  dedupingInterval: 2000, // 2초 내 중복 요청 방지
  focusThrottleInterval: 5000, // 포커스 시 throttle (5초)
  keepPreviousData: true, // 데이터가 변경되는 동안 이전 데이터 유지 (깜빡임 방지)
  errorRetryCount: 3, // 에러 시 재시도 횟수
  errorRetryInterval: 5000, // 재시도 간격 (5초)
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

