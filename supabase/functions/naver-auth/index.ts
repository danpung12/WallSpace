import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient, User } from 'https://esm.sh/@supabase/supabase-js@2';
import { create, getNumericDate } from 'https://deno.land/x/djwt@v2.8/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { code: naverAuthCode } = await req.json();
    const naverClientId = Deno.env.get('NAVER_CLIENT_ID');
    const naverClientSecret = Deno.env.get('NAVER_CLIENT_SECRET');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const jwtSecret = Deno.env.get('CUSTOM_JWT_SECRET');

    if (!naverClientId || !naverClientSecret || !supabaseUrl || !supabaseServiceRoleKey || !jwtSecret) {
      throw new Error('Missing required environment variables, including CUSTOM_JWT_SECRET.');
    }

    // 1. 네이버 토큰 교환
    const tokenResponse = await fetch('https://nid.naver.com/oauth2.0/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'authorization_code', client_id: naverClientId, client_secret: naverClientSecret, code: naverAuthCode, state: 'dummy_state' }),
    });
    if (!tokenResponse.ok) throw new Error(`Naver token exchange failed: ${await tokenResponse.text()}`);
    const tokens = await tokenResponse.json();

    // 2. 네이버 사용자 정보 조회
    const userResponse = await fetch('https://openapi.naver.com/v1/nid/me', { headers: { 'Authorization': `Bearer ${tokens.access_token}` } });
    if (!userResponse.ok) throw new Error(`Naver user fetch failed: ${await userResponse.text()}`);
    const naverUser = (await userResponse.json()).response;
    const userEmail = naverUser.email;
    if (!userEmail) throw new Error('Email not provided by Naver.');

    // 3. Supabase 사용자 조회
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
    let user: User | null;
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers({ email: userEmail });
    if (listError) throw listError;
    user = users && users.length > 0 ? users[0] : null;

    // 4. [핵심 수정] 사용자 상태에 따라 분기
    if (user && user.app_metadata?.provider !== 'naver') {
      // 기존 계정이 있지만, 네이버 연동이 안된 경우 -> 계정 충돌 상태 반환
      return new Response(JSON.stringify({ status: 'conflict', email: user.email }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
    }

    if (!user) {
      // 사용자가 없으면 새로 생성 (네이버 identity 포함)
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: userEmail,
        email_confirm: true,
        app_metadata: { provider: 'naver', provider_id: naverUser.id },
        user_metadata: { full_name: naverUser.name, avatar_url: naverUser.profile_image },
        // 네이버 identity를 함께 생성
        identities: [{
          provider: 'naver',
          identity_data: {
            sub: naverUser.id,
            email: userEmail,
            name: naverUser.name,
            picture: naverUser.profile_image,
          },
        }],
      });
      if (createError) throw createError;
      user = newUser.user;
    }
    if (!user) throw new Error('Could not create or find user.');

    // 기존 사용자에게 네이버 identity가 없으면 추가
    // 직접 SQL로 identities 조회 (listUserIdentities가 없으므로)
    const { data: existingIdentities, error: identityCheckError } = await supabaseAdmin
      .from('auth.identities')
      .select('provider')
      .eq('user_id', user.id)
      .eq('provider', 'naver');
    
    const hasNaverIdentity = existingIdentities && existingIdentities.length > 0;
    
    if (!hasNaverIdentity) {
      // 기존 사용자에 네이버 identity 추가
      try {
        // 직접 SQL로 identity 추가
        const { error: sqlError } = await supabaseAdmin
          .from('auth.identities')
          .insert({
            user_id: user.id,
            provider: 'naver',
            provider_id: naverUser.id,
            identity_data: {
              sub: naverUser.id,
              email: userEmail,
              name: naverUser.name,
              picture: naverUser.profile_image,
            },
            last_sign_in_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        
        if (sqlError) {
          console.error('네이버 identity 추가 실패:', sqlError);
          // 에러를 던지지 않고 계속 진행 (이미 로그인은 가능)
        } else {
          console.log('네이버 identity 추가 성공');
        }
      } catch (err) {
        console.error('네이버 identity 추가 중 예외 발생:', err);
        // 에러를 던지지 않고 계속 진행
      }
    }

    // 5. JWT를 직접 생성하여 완전한 세션을 만듭니다.
    const cryptoKey = await crypto.subtle.importKey('raw', new TextEncoder().encode(jwtSecret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const now = getNumericDate(0);
    const accessTokenExp = now + 3600; // 1 hour
    const refreshTokenExp = now + 604800; // 1 week

    const accessToken = await create({ alg: 'HS256', typ: 'JWT' }, { aud: 'authenticated', sub: user.id, role: 'authenticated', email: user.email, iat: now, exp: accessTokenExp }, cryptoKey);
    const refreshToken = await create({ alg: 'HS256', typ: 'JWT' }, { sub: user.id, iat: now, exp: refreshTokenExp }, cryptoKey);

    const session = {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: user,
      token_type: 'bearer',
      expires_in: 3600,
      expires_at: accessTokenExp,
    };

    return new Response(JSON.stringify({ session }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });

  } catch (error) {
    console.error('[FATAL] Edge function error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });
  }
});
