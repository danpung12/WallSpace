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
      setMessage('네이버 계정 정보를 확인하고 있습니다...');
      
      // Edge Function 호출 시 apikey 헤더 추가 (JWT 검증 우회)
      // Supabase 클라이언트가 자동으로 헤더를 추가하지만, 명시적으로 apikey를 추가
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      const { data, error: functionError } = await supabase.functions.invoke('naver-auth', {
        body: { code },
        ...(anonKey && {
          headers: {
            'apikey': anonKey,
          },
        }),
      });

      if (functionError) {
        console.error('Edge Function error:', functionError);
        setError(`로그인 처리 중 오류가 발생했습니다: ${functionError.message}`);
        return;
      }

      // [핵심 수정] 계정 충돌 상태를 확인하고 연동 페이지로 리디렉션합니다.
      if (data.status === 'conflict' && data.email) {
        router.push(`/auth/link/naver?email=${encodeURIComponent(data.email)}`);
        return;
      }

      if (!data.session) {
        setError('세션 정보를 받아오지 못했습니다.');
        return;
      }

      setMessage('로그인 세션을 설정하고 있습니다...');

      const { error: sessionError } = await supabase.auth.setSession(data.session);

      if (sessionError) {
        console.error('Session setting error:', sessionError);
        setError(`로그인에 실패했습니다: ${sessionError.message}`);
        return;
      }

      router.push('/onboarding');
    };

    handleLogin();
  }, [searchParams, router]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', textAlign: 'center', padding: '20px' }}>
      <h1>로그인 처리 중</h1>
      <p style={{ marginTop: '10px', color: error ? 'red' : 'black' }}>{error || message}</p>
      {error && <a href="/login" style={{ marginTop: '20px', color: 'blue' }}>로그인 페이지로 돌아가기</a>}
    </div>
  );
}

export default function NaverAuthCallbackPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NaverAuthCallback />
    </Suspense>
  );
}
