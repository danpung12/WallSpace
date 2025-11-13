'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export default function NaverOnboardingPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUser(data.user);
      } else {
        // 사용자가 없으면 로그인 페이지로 리디렉션
        router.replace('/login');
      }
      setLoading(false);
    };
    getUser();
  }, [router]);

  const handleSelectType = async (userType: 'artist' | 'guest') => {
    if (!user) return;

    const supabase = createClient();
    setError(null);

    try {
      // profiles 테이블에 user_type 업데이트
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ user_type: userType })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      // 성공 시 각자 대시보드로 리디렉션
      if (userType === 'guest') {
        router.push('/guest');
      } else {
        router.push('/home');
      }
    } catch (e) {
      const error = e as Error;
      console.error('Error updating user type:', error);
      setError('사용자 타입 업데이트에 실패했습니다. 다시 시도해주세요.');
    }
  };

  if (loading) {
    return <div>사용자 정보를 불러오는 중...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <h1>환영합니다!</h1>
      <p>서비스 이용을 위해 사용자 타입을 선택해주세요.</p>
      
      <div style={{ display: 'flex', gap: '20px', marginTop: '30px' }}>
        <button onClick={() => handleSelectType('artist')} style={{ padding: '20px', fontSize: '18px' }}>
          <h2>아티스트</h2>
          <p>작품을 전시합니다</p>
        </button>
        <button onClick={() => handleSelectType('guest')} style={{ padding: '20px', fontSize: '18px' }}>
          <h2>게스트</h2>
          <p>작품을 감상합니다</p>
        </button>
      </div>

      {error && <p style={{ color: 'red', marginTop: '20px' }}>{error}</p>}
    </div>
  );
}

