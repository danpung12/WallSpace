'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import LoginClient from '../components/LoginClient';
import { createClient } from '@/lib/supabase/client';

function LoginContent() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  // 이미 로그인된 사용자는 홈으로 리다이렉트
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        router.replace('/home');
      } else {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [router]);

  // 로딩 중이면 빈 화면 표시
  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-transparent">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D2B48C]"></div>
      </div>
    );
  }

  return <LoginClient />;
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-full flex items-center justify-center bg-transparent">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D2B48C]"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}

