'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function GuestHomePage() {
  const router = useRouter();

  useEffect(() => {
    // /guest/home으로 접근 시 /guest로 리디렉션
    router.replace('/guest');
  }, [router]);

  return null;
}





