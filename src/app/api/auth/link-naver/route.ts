import { createRouteHandlerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { create, getNumericDate } from 'djwt';

// Supabase Admin 클라이언트를 생성하는 함수 (보안을 위해 별도 파일로 분리하는 것이 좋음)
// 여기서는 간단하게 route 핸들러 내에서 직접 생성합니다.
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  const { email, userType } = await request.json();

  if (!email || !userType) {
    return NextResponse.json({ error: 'Email and userType are required' }, { status: 400 });
  }

  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const jwtSecret = process.env.CUSTOM_JWT_SECRET;

    if (!jwtSecret) {
      throw new Error('JWT secret is not configured.');
    }

    // 1. 이메일로 사용자 조회
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers({ email });
    if (listError || !users || users.length === 0) {
      throw new Error('User not found.');
    }
    const user = users[0];

    // 2. 사용자 정보 업데이트 (계정 연동)
    const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      app_metadata: { ...user.app_metadata, provider: 'naver' },
    });
    if (updateError) throw updateError;

    // 3. 프로필에 user_type 업데이트
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ user_type: userType })
      .eq('id', user.id);
    if (profileError) throw profileError;

    // 4. 새로운 세션(JWT) 생성 (djwt/create 사용으로 수정)
    const cryptoKey = await crypto.subtle.importKey('raw', new TextEncoder().encode(jwtSecret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const now = getNumericDate(0);
    const accessTokenExp = now + 3600; // 1 hour
    const refreshTokenExp = now + 604800; // 1 week

    const accessToken = await create({ alg: 'HS256', typ: 'JWT' }, { aud: 'authenticated', sub: user.id, role: 'authenticated', email: user.email, iat: now, exp: accessTokenExp }, cryptoKey);
    const refreshToken = await create({ alg: 'HS256', typ: 'JWT' }, { sub: user.id, iat: now, exp: refreshTokenExp }, cryptoKey);

    const session = {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: updatedUser.user, // 업데이트된 사용자 정보 사용
      token_type: 'bearer',
      expires_in: 3600,
      expires_at: accessTokenExp,
    };

    return NextResponse.json({ session });

  } catch (error) {
    console.error('Link Naver account error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}