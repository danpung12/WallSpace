'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function NaverLinkPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    } else {
      // 이메일 정보가 없으면 로그인 페이지로
      router.replace('/login');
    }
  }, [searchParams, router]);

  const handleLink = async () => {
    setLoading(true);
    setError(null);

    try {
      // sessionStorage에서 네이버 정보 가져오기
      const linkingInfoStr = sessionStorage.getItem('naver_linking_info');
      if (!linkingInfoStr) {
        throw new Error('연동 정보를 찾을 수 없습니다. 다시 시도해주세요.');
      }

      const linkingInfo = JSON.parse(linkingInfoStr);

      // API 라우트 호출하여 계정 연동 처리
      const response = await fetch('/api/auth/link-naver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(linkingInfo),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '계정 연동에 실패했습니다.');
      }

      const data = await response.json();

      // 세션 설정
      const supabase = createClient();
      const { error: sessionError } = await supabase.auth.setSession(data.session);

      if (sessionError) {
        throw new Error('로그인 세션 설정에 실패했습니다.');
      }

      // sessionStorage 정리
      sessionStorage.removeItem('naver_linking_info');

      // 온보딩 페이지로 이동
      router.push('/onboarding');
    } catch (err: any) {
      console.error('계정 연동 오류:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // sessionStorage 정리
    sessionStorage.removeItem('naver_linking_info');
    // 로그인 페이지로 돌아가기
    router.push('/login');
  };

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F1EC]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D2B48C]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F1EC] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="text-5xl mb-4">🔗</div>
          <h1 className="text-2xl font-bold text-[#3E352F] mb-2">계정 연동</h1>
          <p className="text-[#6B5E54]">이미 가입된 계정을 찾았습니다</p>
        </div>

        <div className="bg-[#F5F1EC] rounded-xl p-4 mb-6">
          <p className="text-sm text-[#6B5E54] mb-2">이메일</p>
          <p className="text-lg font-semibold text-[#3E352F]">{email}</p>
        </div>

        <div className="mb-6">
          <p className="text-sm text-[#6B5E54] leading-relaxed">
            이 이메일로 이미 가입된 계정이 있습니다.
            <br />
            네이버 간편로그인을 연동하시겠습니까?
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleLink}
            disabled={loading}
            className={`w-full h-12 rounded-full font-semibold text-white transition-all ${
              loading
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-[#03C75A] hover:bg-[#02b350]'
            }`}
          >
            {loading ? '연동 중...' : '네이버로 연동하기'}
          </button>

          <button
            onClick={handleCancel}
            disabled={loading}
            className="w-full h-12 rounded-full font-semibold text-[#6B5E54] bg-[#EAE5DE] hover:bg-[#D2B48C]/30 transition-all disabled:opacity-50"
          >
            취소
          </button>
        </div>

        <p className="text-xs text-[#6B5E54] text-center mt-6">
          연동하면 네이버 계정으로도 로그인할 수 있습니다.
        </p>
      </div>
    </div>
  );
}

export default function NaverLinkPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F5F1EC]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D2B48C]"></div>
      </div>
    }>
      <NaverLinkPage />
    </Suspense>
  );
}
