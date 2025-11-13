'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function LinkNaverAccount() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const [userType, setUserType] = useState<'artist' | 'guest' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLinkAccount = async () => {
    if (!userType || !email) {
      setError('사용자 타입을 선택해주세요.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 계정 연동 및 로그인을 처리할 새로운 API 라우트를 호출합니다.
      const response = await fetch('/api/auth/link-naver', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, userType }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '계정 연동에 실패했습니다.');
      }

      // API로부터 받은 세션으로 클라이언트 로그인 상태를 설정합니다.
      const supabase = createClient();
      const { error: sessionError } = await supabase.auth.setSession(result.session);

      if (sessionError) {
        throw sessionError;
      }

      // 연동 및 로그인 성공 후, 홈으로 이동합니다.
      router.push('/home');

    } catch (e) {
      const error = e as Error;
      console.error('Error linking account:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  if (!email) {
    return <div>잘못된 접근입니다.</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <h1>계정 연동</h1>
      <p>이미 가입된 계정이 있습니다: <strong>{email}</strong></p>
      <p>네이버 계정과 기존 계정을 연동하시겠습니까?</p>

      <div style={{ marginTop: '30px' }}>
        <p>사용자 타입을 선택해주세요.</p>
        <button 
          onClick={() => setUserType('artist')} 
          style={{ padding: '10px', margin: '5px', border: userType === 'artist' ? '2px solid blue' : '1px solid black' }}
        >
          아티스트
        </button>
        <button 
          onClick={() => setUserType('guest')} 
          style={{ padding: '10px', margin: '5px', border: userType === 'guest' ? '2px solid blue' : '1px solid black' }}
        >
          게스트
        </button>
      </div>

      <button onClick={handleLinkAccount} disabled={loading || !userType} style={{ marginTop: '30px', padding: '15px', fontSize: '16px' }}>
        {loading ? '연동 중...' : '계정 연동하고 계속하기'}
      </button>

      {error && <p style={{ color: 'red', marginTop: '20px' }}>{error}</p>}
    </div>
  );
}

export default function LinkNaverAccountPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LinkNaverAccount />
        </Suspense>
    )
}
