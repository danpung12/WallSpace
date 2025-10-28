import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { UserProfile } from '@/data/profile';

export async function GET() {
  try {
    // 서버용 Supabase 클라이언트 생성
    const supabase = await createClient();
    
    // 현재 로그인한 사용자 정보 가져오기
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { message: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    // 프로필 정보 가져오기
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { message: 'Profile not found' }, 
        { status: 404 }
      );
    }

    // UserProfile 형식에 맞게 변환
    // user_metadata의 full_name을 우선 사용, 없으면 profiles 테이블의 name 사용
    const displayName = user.user_metadata?.full_name || 
                        user.user_metadata?.name || 
                        profile.name;
    
    const userProfile: UserProfile = {
      id: profile.id,
      nickname: profile.nickname,
      name: displayName,
      email: profile.email,
      avatarUrl: profile.avatar_url || '',
      phone: profile.phone || '',
      dob: profile.dob || undefined,
      gender: profile.gender || undefined,
      user_type: profile.user_type || 'artist', // user_type 추가
      notificationSettings: {
        comments: true,
        exhibitions: true,
        messages: true,
      },
      userSettings: {
        darkMode: false,
      },
    };

    // 프로필 데이터는 자주 변경되지 않으므로 캐싱
    return NextResponse.json(userProfile, {
      headers: {
        'Cache-Control': 'private, s-maxage=30, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('GET /api/profile error:', error);
    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    // 서버용 Supabase 클라이언트 생성
    const supabase = await createClient();
    
    // 현재 로그인한 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { message: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    const updatedProfileData: UserProfile = await req.json();

    // 간단한 유효성 검사
    if (!updatedProfileData || !updatedProfileData.id) {
      return NextResponse.json(
        { message: 'Invalid profile data' }, 
        { status: 400 }
      );
    }

    // 본인의 프로필만 수정 가능
    if (updatedProfileData.id !== user.id) {
      return NextResponse.json(
        { message: 'Forbidden' }, 
        { status: 403 }
      );
    }

    // Supabase 프로필 업데이트
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({
        name: updatedProfileData.name,
        nickname: updatedProfileData.nickname,
        phone: updatedProfileData.phone || null,
        avatar_url: updatedProfileData.avatarUrl || null,
        dob: updatedProfileData.dob || null,
        gender: updatedProfileData.gender || null,
      })
      .eq('id', user.id)
      .select()
      .single();

    if (updateError || !updatedProfile) {
      console.error('Profile update error:', updateError);
      return NextResponse.json(
        { message: 'Failed to update profile' }, 
        { status: 500 }
      );
    }

    // UserProfile 형식으로 변환하여 반환
    const userProfile: UserProfile = {
      id: updatedProfile.id,
      nickname: updatedProfile.nickname,
      name: updatedProfile.name,
      email: updatedProfile.email,
      avatarUrl: updatedProfile.avatar_url || '',
      phone: updatedProfile.phone || '',
      dob: updatedProfile.dob || undefined,
      gender: updatedProfile.gender || undefined,
      user_type: updatedProfile.user_type || 'artist', // user_type 추가
      notificationSettings: updatedProfileData.notificationSettings,
      userSettings: updatedProfileData.userSettings,
    };

    return NextResponse.json(userProfile);
  } catch (error) {
    console.error('PUT /api/profile error:', error);
    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
