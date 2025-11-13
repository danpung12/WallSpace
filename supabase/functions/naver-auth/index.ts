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
    // Step 1: 환경 변수 및 요청 코드 확인
    console.log('Step 1: Validating environment variables and request body.');
    const { code: naverAuthCode } = await req.json();
    const naverClientId = Deno.env.get('NAVER_CLIENT_ID');
    const naverClientSecret = Deno.env.get('NAVER_CLIENT_SECRET');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!naverClientId || !naverClientSecret || !supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error('Missing required environment variables.');
    }
    if (!naverAuthCode) {
      throw new Error('Naver auth code is missing from the request body.');
    }

    // Step 2: 네이버 토큰 교환
    console.log('Step 2: Exchanging Naver auth code for access token.');
    let tokens;
    try {
      const tokenResponse = await fetch('https://nid.naver.com/oauth2.0/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ grant_type: 'authorization_code', client_id: naverClientId, client_secret: naverClientSecret, code: naverAuthCode, state: 'dummy_state' }),
      });
      if (!tokenResponse.ok) throw new Error(await tokenResponse.text());
      tokens = await tokenResponse.json();
    } catch (error) { throw new Error(`Naver token exchange failed: ${error.message}`); }

    // Step 3: 네이버 사용자 정보 조회
    console.log('Step 3: Fetching user profile from Naver.');
    let naverUser;
    try {
      const userResponse = await fetch('https://openapi.naver.com/v1/nid/me', { headers: { 'Authorization': `Bearer ${tokens.access_token}` } });
      if (!userResponse.ok) throw new Error(await userResponse.text());
      const profileData = await userResponse.json();
      // [안전장치] 순수한 JS 객체로 변환
      naverUser = JSON.parse(JSON.stringify(profileData.response));
    } catch (error) { throw new Error(`Naver user fetch failed: ${error.message}`); }

    // Step 4: 이메일 확인
    console.log('Step 4: Verifying email from Naver profile.');
    const userEmail = naverUser.email;
    if (!userEmail) {
      console.error('Naver profile did not contain email:', naverUser);
      throw new Error('Email not provided by Naver.');
    }

    // Step 5: Supabase 사용자 조회 또는 생성
    console.log(`Step 5: Looking up or creating user for email: ${userEmail}`);
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
    let user: User | null;
    try {
      const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers({ email: userEmail });
      if (listError) throw listError;
      user = users && users.length > 0 ? users[0] : null;

      if (!user) {
        console.log('User not found, creating a new user.');
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({ email: userEmail, email_confirm: true, user_metadata: { full_name: naverUser.name, avatar_url: naverUser.profile_image, provider: 'naver', provider_id: naverUser.id } });
        if (createError) throw createError;
        user = newUser.user;
      }
    } catch (error) { throw new Error(`Supabase user lookup/creation failed: ${error.message}`); }
    if (!user) throw new Error('Could not create or find user.');

    // Step 6: 인증 코드 생성
    console.log(`Step 6: Generating auth code for user ID: ${user.id}`);
    let code;
    try {
      const { data, error } = await supabaseAdmin.auth.admin.generateLink({ type: 'sso', provider: 'sso', userId: user.id });
      if (error) throw error;
      code = data.properties.code;
    } catch (error) { throw new Error(`Auth code generation failed: ${error.message}`); }

    console.log('Successfully generated auth code. Returning to client.');
    return new Response(JSON.stringify({ code }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });

  } catch (error) {
    console.error('[FATAL] Edge function error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });
  }
});
