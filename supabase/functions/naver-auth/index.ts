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
    const { code } = await req.json();
    const naverClientId = Deno.env.get('NAVER_CLIENT_ID')!;
    const naverClientSecret = Deno.env.get('NAVER_CLIENT_SECRET')!;

    if (!naverClientId || !naverClientSecret) {
      throw new Error('Naver client ID or secret is not configured.');
    }

    // 1. 네이버에 Access Token 요청
    const tokenResponse = await fetch('https://nid.naver.com/oauth2.0/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: naverClientId,
        client_secret: naverClientSecret,
        code,
        state: 'dummy_state',
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      throw new Error(`Failed to get Naver token: ${errorText}`);
    }
    const tokens = await tokenResponse.json();
    const accessToken = tokens.access_token;

    // 2. 네이버 사용자 정보 조회
    const userResponse = await fetch('https://openapi.naver.com/v1/nid/me', {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      throw new Error(`Failed to get Naver user info: ${errorText}`);
    }
    const naverUser = (await userResponse.json()).response;
    const providerId = naverUser.id;
    const userEmail = naverUser.email;

    if (!userEmail) {
      throw new Error('Naver user email is not available. Please check API permissions.');
    }

    // 3. Supabase Admin 클라이언트 초기화
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 4. Supabase에서 이메일로 사용자 조회
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers({
      email: userEmail,
    });

    if (listError) throw listError;

    let user: User | null = users && users.length > 0 ? users[0] : null;

    // 사용자가 없으면 새로 생성
    if (!user) {
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: userEmail,
        email_confirm: true,
        user_metadata: {
          full_name: naverUser.name,
          avatar_url: naverUser.profile_image,
          provider: 'naver',
          provider_id: providerId,
        },
      });

      if (createError) throw createError;
      user = newUser.user;
    } else {
      // 기존 사용자가 있지만 네이버 연동 정보가 없으면 업데이트
      if (!user.user_metadata?.provider_id || user.user_metadata?.provider !== 'naver') {
        const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          user.id,
          {
            user_metadata: {
              ...user.user_metadata,
              full_name: naverUser.name,
              avatar_url: naverUser.profile_image,
              provider: 'naver',
              provider_id: providerId,
            }
          }
        );
        if (updateError) throw updateError;
        user = updatedUser.user;
      }
    }

    if (!user) {
      throw new Error('Failed to create or find user.');
    }

    // 5. Magic Link를 이용해 세션 정보 생성
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: user.email!,
    });

    if (sessionError) throw sessionError;

    const session = sessionData.properties;

    return new Response(JSON.stringify({ session }), {
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
