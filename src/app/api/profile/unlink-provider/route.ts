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

    // auth.identities 테이블에서 사용자의 모든 identity 조회
    const { data: identities, error: identitiesError } = await supabase
      .rpc('get_user_identities', { user_id_param: user.id });

    if (identitiesError) {
      console.error('Identity 조회 실패:', identitiesError);
      // RPC가 없을 경우 직접 쿼리 시도
      const { data: directIdentities, error: directError } = await supabase
        .from('identities')
        .select('*')
        .eq('user_id', user.id);
      
      if (directError) {
        console.error('직접 조회도 실패:', directError);
        return NextResponse.json(
          { error: 'Identity 조회에 실패했습니다.' },
          { status: 500 }
        );
      }
      
      // 연동된 계정이 2개 이상인지 확인
      if (!directIdentities || directIdentities.length <= 1) {
        return NextResponse.json(
          { error: '최소 1개의 로그인 방법이 필요합니다. 마지막 계정은 해제할 수 없습니다.' },
          { status: 400 }
        );
      }
    } else {
      // 연동된 계정이 2개 이상인지 확인
      if (!identities || identities.length <= 1) {
        return NextResponse.json(
          { error: '최소 1개의 로그인 방법이 필요합니다. 마지막 계정은 해제할 수 없습니다.' },
          { status: 400 }
        );
      }
    }

    // Supabase의 unlinkIdentity 메서드 사용
    const { data, error: unlinkError } = await supabase.auth.unlinkIdentity({
      provider: provider as any,
    });

    if (unlinkError) {
      console.error('Identity 연동 해제 실패:', unlinkError);
      return NextResponse.json(
        { error: unlinkError.message || 'Identity 연동 해제에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: `${provider} 계정 연동이 해제되었습니다.`,
      data
    });

  } catch (error: any) {
    console.error('연동 해제 중 오류:', error);
    return NextResponse.json(
      { error: error.message || '연동 해제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

