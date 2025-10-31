import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * PATCH /api/profile/user-type
 * 사용자의 user_type을 업데이트합니다 (artist <-> manager 전환)
 */
export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    // 현재 로그인한 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { message: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    // 요청 본문에서 user_type 가져오기
    const { user_type } = await req.json();

    // 유효성 검사
    if (!user_type || !['artist', 'manager', 'guest'].includes(user_type)) {
      return NextResponse.json(
        { message: 'Invalid user_type. Must be one of: artist, manager, guest' }, 
        { status: 400 }
      );
    }

    // Supabase에서 user_type 업데이트
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({
        user_type: user_type,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select('id, email, user_type, name, nickname, avatar_url')
      .single();

    if (updateError) {
      console.error('User type update error:', updateError);
      return NextResponse.json(
        { message: 'Failed to update user type', error: updateError.message }, 
        { status: 500 }
      );
    }

    console.log('✅ User type updated:', {
      userId: user.id,
      email: user.email,
      newUserType: user_type
    });

    return NextResponse.json({
      success: true,
      message: 'User type updated successfully',
      profile: updatedProfile
    });

  } catch (error) {
    console.error('PATCH /api/profile/user-type error:', error);
    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    );
  }
}












