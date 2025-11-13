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
      throw new Error('Missing required environment variables.');
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

    // 3. Supabase 사용자 조회 또는 생성
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
    let user: User | null;
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers({ email: userEmail });
    if (listError) throw listError;
    user = users && users.length > 0 ? users[0] : null;

    if (!user) {
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({ email: userEmail, email_confirm: true, user_metadata: { full_name: naverUser.name, avatar_url: naverUser.profile_image, provider: 'naver', provider_id: naverUser.id } });
      if (createError) throw createError;
      user = newUser.user;
    }
    if (!user) throw new Error('Could not create or find user.');

    // 4. [핵심 수정] signInWithId를 사용하여 세션을 직접 생성합니다.
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.signInWithId(user.id);
    if (sessionError) {
      throw new Error(`Failed to create session with signInWithId: ${sessionError.message}`);
    }
    if (!sessionData || !sessionData.session) {
      throw new Error('Session data is missing from signInWithId response.');
    }

    console.log('Successfully created session. Returning to client.');
    return new Response(JSON.stringify({ session: sessionData.session }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });

  } catch (error) {
    console.error('[FATAL] Edge function error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });
  }
});
