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
    const { code: naverAuthCode } = await req.json();

    // 1. 네이버에 Access Token 요청
    const tokenResponse = await fetch('https://nid.naver.com/oauth2.0/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: Deno.env.get('NAVER_CLIENT_ID')!,
        client_secret: Deno.env.get('NAVER_CLIENT_SECRET')!,
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

    // 3. Supabase Admin 클라이언트 초기화
    const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    // 4. Supabase에서 사용자 조회 또는 생성
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers({ email: naverUser.email });
    if (listError) throw listError;
    let user: User | null = users && users.length > 0 ? users[0] : null;

    if (!user) {
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: naverUser.email,
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
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
