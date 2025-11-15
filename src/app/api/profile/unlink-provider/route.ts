import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { provider } = await request.json();

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider를 지정해주세요.' },
        { status: 400 }
      );
    }

    // 현재 사용자 확인
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: '인증되지 않은 사용자입니다.' },
        { status: 401 }
      );
    }

    // 갱신된 user 객체에서 identities 정보 가져오기
    const identities = user.identities || [];
    
    // 마지막 로그인 수단은 해제할 수 없도록 체크
    if (identities.length <= 1) {
      return NextResponse.json(
        { error: '마지막으로 남은 로그인 방법은 해제할 수 없습니다. 계정 잠김을 방지하기 위한 조치입니다.' },
        { status: 400 }
      );
    }

    console.log('User identities:', identities);
    console.log('Provider to unlink:', provider);

    // 해당 provider가 연동되어 있는지 확인
    const targetIdentity = identities.find((id: any) => id.provider === provider);
    
    if (!targetIdentity) {
      return NextResponse.json(
        { error: '해당 provider가 연동되어 있지 않습니다.' },
        { status: 404 }
      );
    }

    // identity_id 유효성 검사 (identity_id 필드 사용, id 필드가 아님!)
    const identityIdToUnlink = targetIdentity.identity_id || targetIdentity.id;
    
    if (!identityIdToUnlink) {
      console.error('Identity ID가 없습니다:', targetIdentity);
      return NextResponse.json(
        { 
          error: 'Identity ID를 찾을 수 없습니다.',
          debug: {
            targetIdentity,
            allIdentities: identities,
            provider
          }
        },
        { status: 400 }
      );
    }

    console.log('Target identity_id:', identityIdToUnlink);
    console.log('Identity ID type:', typeof identityIdToUnlink);

    // unlinkIdentity API 사용 (identity_id 필드 사용)
    const { data: unlinkData, error: unlinkError } = await supabase.auth.unlinkIdentity({
      identity_id: identityIdToUnlink,
    });

    if (unlinkError) {
      console.error('Identity 연동 해제 실패:', unlinkError);
      
      // Manual linking이 비활성화된 경우
      if (unlinkError.message?.includes('manual linking')) {
        return NextResponse.json(
          { 
            error: 'Identity 연동 해제 기능이 비활성화되어 있습니다.',
            hint: 'Supabase 대시보드에서 Authentication > Providers > Enable manual linking을 활성화해주세요.',
            details: unlinkError.message
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { 
          error: unlinkError.message || 'Identity 연동 해제에 실패했습니다.',
          details: unlinkError,
          debug: {
            identityId: identityIdToUnlink,
            identityIdType: typeof identityIdToUnlink,
            targetIdentity,
            provider
          }
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: `${provider} 계정 연동이 해제되었습니다.`,
      data: unlinkData
    });

  } catch (error: any) {
    console.error('연동 해제 중 오류:', error);
    return NextResponse.json(
      { error: error.message || '연동 해제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

