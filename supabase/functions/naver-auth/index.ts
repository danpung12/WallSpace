import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// CORS 헤더 설정 (모든 도메인에서의 요청을 허용)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // CORS preflight 요청 처리
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { code } = await req.json();

    // 1. 네이버에 Access Token 요청
    const tokenResponse = await fetch('https://nid.naver.com/oauth2.0/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: Deno.env.get('NAVER_CLIENT_ID')!,
        client_secret: Deno.env.get('NAVER_CLIENT_SECRET')!,
        code,
        state: 'dummy_state', // 실제 프로덕션에서는 state 값도 검증하는 것이 안전합니다.
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error(`네이버 토큰 요청 실패: ${await tokenResponse.text()}`);
    }
    const tokens = await tokenResponse.json();
    const accessToken = tokens.access_token;

    // 2. 네이버 사용자 정보 조회
    const userResponse = await fetch('https://openapi.naver.com/v1/nid/me', {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });

    if (!userResponse.ok) {
      throw new Error(`네이버 사용자 정보 조회 실패: ${await userResponse.text()}`);
    }
    const naverUser = (await userResponse.json()).response;

    // 3. Supabase Admin 클라이언트 초기화
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 4. Supabase에서 사용자 조회 또는 생성
    // 네이버 ID를 사용하여 사용자를 식별합니다.
    const providerId = naverUser.id;
    let { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('raw_user_meta_data->>provider_id', providerId)
      .single();

    if (userError && userError.code !== 'PGRST116') { // PGRST116: 'exact-single-row-not-found'
      throw userError;
    }

    // 사용자가 없으면 새로 생성
    if (!user) {
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: naverUser.email, // 네이버에서 제공하는 이메일 사용
        email_confirm: true, // 소셜 로그인이므로 이메일 인증된 것으로 간주
        user_metadata: {
          full_name: naverUser.name,
          avatar_url: naverUser.profile_image,
          provider: 'naver',
          provider_id: providerId,
        },
      });

      if (createError) throw createError;
      user = newUser;
    }

    // 5. 수동으로 세션 생성 (JWT 생성)
    // 이 부분은 Supabase의 내부 구현에 따라 변경될 수 있습니다.
    // 현재 버전에서는 직접 JWT를 생성하기보다, 클라이언트에서 처리하도록 세션 객체를 반환합니다.
    // 하지만 이 함수는 Admin 권한으로 실행되므로, 사용자 세션을 직접 만들어줄 수 있습니다.
    // 여기서는 간단하게 사용자 정보를 반환하고, 클라이언트에서 setSession을 통해 처리하도록 합니다.
    // 더 안전한 방법은 사용자 ID로 세션을 생성하는 것입니다.
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: user.email,
    });

    if (sessionError) throw sessionError;

    // generateLink에서 반환된 사용자 정보와 세션 정보를 조합합니다.
    const session = sessionData.properties;

    return new Response(JSON.stringify({ session }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

