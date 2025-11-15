import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, naverUserId, naverUserName, naverProfileImage } = body;

    if (!email || !naverUserId) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return NextResponse.json(
        { error: '서버 설정 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // 1. 이메일로 사용자 찾기
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('사용자 조회 오류:', listError);
      return NextResponse.json(
        { error: '사용자 조회에 실패했습니다.' },
        { status: 500 }
      );
    }

    const user = users?.find((u: any) => u.email === email);

    if (!user) {
      return NextResponse.json(
        { error: '해당 이메일의 사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 2. 사용자의 app_metadata에 네이버 정보 추가
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      app_metadata: {
        ...user.app_metadata,
        provider: 'naver',
        provider_id: naverUserId,
      },
      user_metadata: {
        ...user.user_metadata,
        full_name: naverUserName || user.user_metadata?.full_name,
        avatar_url: naverProfileImage || user.user_metadata?.avatar_url,
      },
    });

    if (updateError) {
      console.error('사용자 업데이트 오류:', updateError);
      return NextResponse.json(
        { error: '계정 연동에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 3. 네이버 identity 추가 (auth.identities 테이블)
    try {
      const insertResponse = await fetch(`${supabaseUrl}/rest/v1/auth.identities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceRoleKey,
          'Authorization': `Bearer ${supabaseServiceRoleKey}`,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          user_id: user.id,
          provider: 'naver',
          provider_id: naverUserId,
          identity_data: {
            sub: naverUserId,
            email: email,
            name: naverUserName,
            picture: naverProfileImage,
          },
          last_sign_in_at: new Date().toISOString(),
        }),
      });

      if (!insertResponse.ok) {
        const errorText = await insertResponse.text();
        console.error('네이버 identity 추가 실패:', insertResponse.status, errorText);
        // 에러를 던지지 않고 계속 진행 (이미 연동은 완료됨)
      }
    } catch (err) {
      console.error('네이버 identity 추가 중 예외 발생:', err);
      // 에러를 던지지 않고 계속 진행
    }

    // 4. Magic Link를 생성하여 세션 토큰 얻기
    const { data: magicLinkData, error: magicLinkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: user.email!,
    });

    if (magicLinkError) {
      console.error('Magic Link 생성 오류:', magicLinkError);
      return NextResponse.json(
        { error: '세션 생성에 실패했습니다.' },
        { status: 500 }
      );
    }

    // Magic Link URL에서 refresh_token 추출
    const actionLink = magicLinkData.properties.action_link;
    const urlParams = new URLSearchParams(actionLink.split('?')[1]);
    const refreshToken = urlParams.get('refresh_token');

    if (!refreshToken) {
      return NextResponse.json(
        { error: '세션 토큰을 추출할 수 없습니다.' },
        { status: 500 }
      );
    }

    // refresh_token으로 세션 교환
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (sessionError) {
      console.error('세션 교환 오류:', sessionError);
      return NextResponse.json(
        { error: '세션 생성에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ session: sessionData.session }, { status: 200 });
  } catch (error: any) {
    console.error('계정 연동 API 오류:', error);
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
