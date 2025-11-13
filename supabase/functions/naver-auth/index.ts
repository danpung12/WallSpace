import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient, User } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 환경 변수 존재 여부 최우선 확인
    const naverClientId = Deno.env.get('NAVER_CLIENT_ID');
    const naverClientSecret = Deno.env.get('NAVER_CLIENT_SECRET');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!naverClientId || !naverClientSecret || !supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error('필수 환경 변수가 설정되지 않았습니다.');
    }

    const { code: naverAuthCode } = await req.json();

    // 1. 네이버에 Access Token 요청
    const tokenResponse = await fetch('https://nid.naver.com/oauth2.0/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: naverClientId,
        client_secret: naverClientSecret,
        code: naverAuthCode,
        state: 'dummy_state',
      }),
    });
    if (!tokenResponse.ok) throw new Error(`Naver token exchange failed: ${await tokenResponse.text()}`);
    const tokens = await tokenResponse.json();

    // 2. 네이버 사용자 정보 조회
    const userResponse = await fetch('https://openapi.naver.com/v1/nid/me', {
      headers: { 'Authorization': `Bearer ${tokens.access_token}` },
    });
    if (!userResponse.ok) throw new Error(`Naver user fetch failed: ${await userResponse.text()}`);
    const naverUser = (await userResponse.json()).response;

    // [디버깅 로그 추가] 네이버로부터 받은 사용자 정보 전체를 출력합니다.
    console.log('Naver user profile response:', JSON.stringify(naverUser, null, 2));

    const userEmail = naverUser.email;
    if (!userEmail) {
      throw new Error('An email address is required, but was not provided by Naver.');
    }

    // 3. Supabase Admin 클라이언트 초기화
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    // 4. Supabase에서 사용자 조회 또는 생성
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers({ email: userEmail });
    if (listError) throw listError;
    let user: User | null = users && users.length > 0 ? users[0] : null;

    if (!user) {
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: userEmail,
        email_confirm: true,
        user_metadata: {
          full_name: naverUser.name,
          avatar_url: naverUser.profile_image,
          provider: 'naver',
          provider_id: naverUser.id,
        },
      });
      if (createError) throw createError;
      user = newUser.user;
    }

    if (!user) throw new Error('Could not create or find user.');

    // 5. 세션 대신 PKCE 인증 코드를 생성하여 반환
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'sso',
      provider: 'sso',
      userId: user.id,
    });
    if (error) throw error;

    const code = data.properties.code;

    return new Response(JSON.stringify({ code }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Edge function error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
