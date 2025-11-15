import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/';

  if (code) {
    const supabase = await createClient();
    
    // OAuth 코드를 세션으로 교환
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('OAuth callback error:', error);
      return NextResponse.redirect(`${requestUrl.origin}/login?error=auth_failed`);
    }

    if (data.user) {
      const user = data.user;
      const email = user.email;
      const provider = user.app_metadata?.provider || 'email';

      // 소셜 로그인인 경우에만 기존 계정 확인
      if (provider !== 'email' && email) {
        // 1. 같은 이메일로 가입한 다른 계정이 있는지 확인
        const { data: existingProfile, error: profileError } = await supabase
          .from('profiles')
          .select('id, email')
          .eq('email', email)
          .single();

        // 2. 프로필이 없다면 신규 가입 (자동 생성됨)
        if (profileError || !existingProfile) {
          // profiles 테이블에 트리거가 있어 자동으로 생성됩니다.
          return NextResponse.redirect(`${requestUrl.origin}${next}`);
        }

        // 3. 프로필이 있다면, 이미 연동된 계정인지 확인
        const { data: identities } = await supabase.auth.getUserIdentities();
        
        const isAlreadyLinked = identities?.identities?.some(
          (identity: any) => identity.provider === provider
        );

        // 이미 연동된 계정이면 바로 로그인
        if (isAlreadyLinked) {
          return NextResponse.redirect(`${requestUrl.origin}${next}`);
        }

        // 4. 연동되지 않은 기존 계정이 있다면 연동 확인 페이지로 리디렉션
        // 연동 확인 페이지에서 사용자가 "연동하기"를 선택하면 자동으로 연동됩니다.
        return NextResponse.redirect(
          `${requestUrl.origin}/auth/link-account?provider=${provider}&email=${encodeURIComponent(email)}&next=${encodeURIComponent(next)}`
        );
      }
    }
  }

  // 기본적으로 next 경로로 리디렉션
  return NextResponse.redirect(`${requestUrl.origin}${next}`);
}

