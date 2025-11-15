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

    // user 객체에서 identities 정보 가져오기
    const identities = user.identities || [];
    
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

    // Supabase의 unlinkIdentity 메서드 사용
    const { data, error: unlinkError } = await supabase.auth.unlinkIdentity({
      identity_id: targetIdentity.id,
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

