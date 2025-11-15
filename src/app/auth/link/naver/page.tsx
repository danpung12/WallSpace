'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function NaverLinkPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState<string>('');
  const [userType, setUserType] = useState<string>('');
  const [provider, setProvider] = useState<string>('naver');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    const userTypeParam = searchParams.get('userType');
    const providerParam = searchParams.get('provider');
    
    console.log('계정 연동 페이지 파라미터:', { emailParam, userTypeParam, providerParam });
    
    if (emailParam) {
      setEmail(emailParam);
      setUserType(userTypeParam || '');
      setProvider(providerParam || 'naver');
      
      // sessionStorage에서도 정보 가져오기 (URL 파라미터가 없을 경우 대비)
      const linkingInfoStr = sessionStorage.getItem('naver_linking_info');
      if (linkingInfoStr) {
        try {
          const linkingInfo = JSON.parse(linkingInfoStr);
          console.log('sessionStorage 정보:', linkingInfo);
          if (!userTypeParam && linkingInfo.userType) {
            setUserType(linkingInfo.userType);
          }
          if (!providerParam && linkingInfo.provider) {
            setProvider(linkingInfo.provider);
          }
        } catch (e) {
          console.error('sessionStorage 파싱 오류:', e);
        }
      }
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

  // 소셜 로그인 아이콘 렌더링 함수
  const renderProviderIcon = () => {
    switch (provider) {
      case 'naver':
        return (
          <div className="w-16 h-16 flex items-center justify-center bg-[#03C75A] rounded-xl">
            <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 6V16L11 6H4V26H11V16L19 26H26V6H19Z" fill="white"/>
            </svg>
          </div>
        );

      case 'google':
        return (
          <svg className="w-16 h-16" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            <path fill="none" d="M0 0h48v48H0z"/>
          </svg>
        );
      case 'kakao':
        return (
          <svg className="w-16 h-16" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="48" rx="8" fill="#FEE500"/>
            <path d="M24 10c-7.732 0-14 4.701-14 10.5 0 3.706 2.462 6.96 6.166 8.813l-1.58 5.797c-.14.513.485.916.94.605l6.594-4.515c.624.086 1.26.13 1.88.13 7.732 0 14-4.701 14-10.5S31.732 10 24 10z" fill="#3C1E1E"/>
          </svg>
        );
      default:
        return <div className="text-5xl">🔗</div>;
    }
  };

  // 사용자 유형 텍스트 변환 함수
  const getUserTypeText = () => {
    switch (userType) {
      case 'artist':
        return '작가/사장님';
      case 'guest':
        return '손님';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F1EC] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            {renderProviderIcon()}
          </div>
          <h1 className="text-2xl font-bold text-[#3E352F] mb-2">계정 연동</h1>
          <p className="text-[#6B5E54]">이미 가입된 계정을 찾았습니다</p>
        </div>

        <div className="bg-[#F5F1EC] rounded-xl p-4 mb-6">
          <p className="text-sm text-[#6B5E54] mb-2">이메일</p>
          <p className="text-lg font-semibold text-[#3E352F]">{email}</p>
          {userType && (
            <>
              <div className="border-t border-[#D2B48C]/30 my-3"></div>
              <p className="text-sm text-[#6B5E54] mb-1">계정 유형</p>
              <p className="text-base font-medium text-[#3E352F]">{getUserTypeText()}</p>
            </>
          )}
        </div>

        <div className="mb-6">
          <p className="text-sm text-[#6B5E54] leading-relaxed">
            이 이메일로 이미 가입된 계정이 있습니다.
            <br />
            {provider === 'naver' && '네이버'}
            {provider === 'google' && '구글'}
            {provider === 'kakao' && '카카오'} 간편로그인을 연동하시겠습니까?
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
                : provider === 'naver'
                ? 'bg-[#03C75A] hover:bg-[#02b350]'
                : provider === 'google'
                ? 'bg-[#4285F4] hover:bg-[#3367D6]'
                : provider === 'kakao'
                ? 'bg-[#FEE500] hover:bg-[#F7DC00] text-[#3C1E1E]'
                : 'bg-[#03C75A] hover:bg-[#02b350]'
            }`}
          >
            {loading ? '연동 중...' : `${provider === 'naver' ? '네이버' : provider === 'google' ? '구글' : provider === 'kakao' ? '카카오' : '네이버'}로 연동하기`}
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
          연동하면 {provider === 'naver' ? '네이버' : provider === 'google' ? '구글' : provider === 'kakao' ? '카카오' : '네이버'} 계정으로도 로그인할 수 있습니다.
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
