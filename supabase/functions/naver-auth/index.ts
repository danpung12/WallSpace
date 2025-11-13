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
    const naverClientId = Deno.env.get('NAVER_CLIENT_ID');
    const naverClientSecret = Deno.env.get('NAVER_CLIENT_SECRET');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!naverClientId || !naverClientSecret || !supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error('필수 환경 변수가 설정되지 않았습니다.');
    }

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

    const userResponse = await fetch('https://openapi.naver.com/v1/nid/me', {
      headers: { 'Authorization': `Bearer ${tokens.access_token}` },
    });
    if (!userResponse.ok) throw new Error(`Naver user fetch failed: ${await userResponse.text()}`);
    const naverUser = (await userResponse.json()).response;

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers({ email: naverUser.email });
    if (listError) throw listError;
    let user: User | null = users && users.length > 0 ? users[0] : null;

    if (!user) {
      // [안전장치 추가] createUser 호출 직전에 이메일 변수를 다시 확인합니다.
      const emailForCreation = naverUser.email;
      if (!emailForCreation) {
        console.log('Naver profile data that caused error:', JSON.stringify(naverUser, null, 2));
        throw new Error('An email address is required for user creation, but it was missing just before the call.');
      }

      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: emailForCreation,
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
