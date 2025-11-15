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

    // 3. Supabase 사용자 조회
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
    let user: User | null = null;
    
    // 먼저 네이버 provider_id로 사용자 찾기 (올바른 계정 찾기 - 가장 우선)
    const { data: { users: allUsers }, error: listAllError } = await supabaseAdmin.auth.admin.listUsers();
    if (!listAllError && allUsers) {
      // 네이버 provider_id로 먼저 찾기
      user = allUsers.find((u: any) => 
        u.app_metadata?.provider_id === naverUser.id && u.app_metadata?.provider === 'naver'
      ) || null;
      
      // provider_id로 못 찾았으면 이메일로 찾기
      if (!user) {
        const emailUser = allUsers.find((u: any) => u.email === userEmail) || null;
        
        // [핵심 수정] 같은 이메일의 사용자가 있지만 네이버 연동이 안 되어 있는 경우
        if (emailUser) {
          // 네이버 identity가 있는지 확인
          const { data: { user: userWithIdentities }, error: getUserError } = await supabaseAdmin.auth.admin.getUserById(emailUser.id);
          const identities = userWithIdentities?.identities || [];
          const hasNaverIdentity = identities.some((id: any) => id.provider === 'naver');
          
          if (!hasNaverIdentity) {
            // 네이버 연동이 안 되어 있음 -> 계정 충돌 상태 반환
            console.log('계정 충돌 발견: 이메일은 같지만 네이버 연동 안됨:', userEmail);
            
            // 기존 계정의 user_type 조회
            const { data: profile } = await supabaseAdmin
              .from('profiles')
              .select('user_type')
              .eq('id', emailUser.id)
              .single();
            
            // 네이버 정보를 세션 스토리지에 임시 저장하기 위해 반환
            return new Response(JSON.stringify({ 
              status: 'conflict', 
              email: userEmail,
              naverUserId: naverUser.id,
              naverUserName: naverUser.name,
              naverProfileImage: naverUser.profile_image,
              userType: profile?.user_type || null,
              provider: 'naver',
            }), { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
              status: 200 
            });
          }
          
          // 네이버 identity가 이미 있으면 그대로 사용
          user = emailUser;
        }
      }
    }

    // 4. 사용자 상태에 따라 분기
    // 네이버 provider_id로 찾은 사용자면 그대로 사용
    if (user && user.app_metadata?.provider_id === naverUser.id && user.app_metadata?.provider === 'naver') {
      // 이미 올바른 계정에 연결되어 있음 - 계속 진행
      console.log('네이버 provider_id로 올바른 계정 찾음:', user.email);
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
    // getUserById로 최신 정보 가져오기 (identities 포함)
    const { data: { user: userWithIdentities }, error: getUserError } = await supabaseAdmin.auth.admin.getUserById(user.id);
    
    if (!getUserError && userWithIdentities) {
      const identities = userWithIdentities.identities || [];
      const hasNaverIdentity = identities.some((id: any) => id.provider === 'naver');
      
      if (!hasNaverIdentity) {
        // 기존 사용자에 네이버 identity 추가
        try {
          // PostgREST API를 사용하여 직접 insert 시도
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
              provider_id: naverUser.id,
              identity_data: {
                sub: naverUser.id,
                email: userEmail,
                name: naverUser.name,
                picture: naverUser.profile_image,
              },
              last_sign_in_at: new Date().toISOString(),
            }),
          });
          
          if (!insertResponse.ok) {
            const errorText = await insertResponse.text();
            console.error('네이버 identity 추가 실패:', insertResponse.status, errorText);
            // 에러를 던지지 않고 계속 진행 (이미 로그인은 가능)
          } else {
            console.log('네이버 identity 추가 성공');
          }
        } catch (err) {
          console.error('네이버 identity 추가 중 예외 발생:', err);
          // 에러를 던지지 않고 계속 진행 (이미 로그인은 가능)
        }
      } else {
        console.log('네이버 identity가 이미 존재합니다.');
      }
    }

    // 5. Magic Link를 생성하여 세션 토큰을 얻습니다.
    const { data: magicLinkData, error: magicLinkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: user.email!,
    });
    
    if (magicLinkError) throw magicLinkError;
    
    // Magic Link URL에서 refresh_token 추출
    const actionLink = magicLinkData.properties.action_link;
    const urlParams = new URLSearchParams(actionLink.split('?')[1]);
    const refreshToken = urlParams.get('refresh_token');
    
    if (!refreshToken) throw new Error('Could not extract refresh token from magic link.');
    
    // refresh_token으로 세션 교환
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.refreshSession({
      refresh_token: refreshToken,
    });
    
    if (sessionError) throw sessionError;

    return new Response(JSON.stringify({ session: sessionData.session }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });

  } catch (error) {
    console.error('[FATAL] Edge function error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });
  }
});
