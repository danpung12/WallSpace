'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function NaverAuthCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState('네이버 로그인 정보를 처리 중입니다. 잠시만 기다려주세요...');

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const storedState = sessionStorage.getItem('oauth_state');

    if (!code || !state) {
      setError('잘못된 접근입니다. 로그인 페이지로 돌아가 다시 시도해주세요.');
      return;
    }

    if (state !== storedState) {
      setError('인증 정보가 일치하지 않습니다. 로그인 페이지로 돌아가 다시 시도해주세요.');
      return;
    }

    sessionStorage.removeItem('oauth_state');

    const handleLogin = async () => {
      const supabase = createClient();
      // 'naver-auth' Edge Function을 호출합니다.
      const { data, error: functionError } = await supabase.functions.invoke('naver-auth', {
        body: { code },
      });

      if (functionError) {
        console.error('Edge Function error:', functionError);
        setError(`로그인에 실패했습니다: ${functionError.message}`);
        return;
      }

      // Edge Function에서 반환된 세션 정보로 클라이언트의 인증 상태를 설정합니다.
      const { error: sessionError } = await supabase.auth.setSession(data.session);

      if (sessionError) {
        console.error('Session error:', sessionError);
        setError(`세션 설정에 실패했습니다: ${sessionError.message}`);
        return;
      }

      // 로그인 성공 후 홈으로 리디렉션합니다.
      // 또는 redirectTo 파라미터가 있었다면 해당 경로로 보낼 수 있습니다.
      router.push('/onboarding');
    };

    handleLogin();
  }, [searchParams, router]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
      <h1>로그인 처리 중</h1>
      <p>{error || message}</p>
      {error && <a href="/login" style={{ marginTop: '20px', color: 'blue' }}>로그인 페이지로 돌아가기</a>}
    </div>
  );
}

// Suspense로 감싸서 useSearchParams 사용 문제를 방지합니다.
export default function NaverAuthCallbackPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NaverAuthCallback />
    </Suspense>
  );
}

