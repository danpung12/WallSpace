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
      console.error('GET /api/profile - Auth error:', authError);
      return NextResponse.json(
        { message: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    // 프로필 정보, 알림 설정, 사용자 설정을 병렬로 가져오기 (성능 최적화)
    const [profileResult, notificationSettingsResult, userSettingsResult] = await Promise.all([
      supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single(),
      supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', user.id)
        .single(),
      supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single(),
    ]);

    const { data: profile, error: profileError } = profileResult;
    const { data: notificationSettings } = notificationSettingsResult;
    const { data: userSettings } = userSettingsResult;

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
      user_type: profile.user_type || 'artist',
      notificationSettings: {
        comments: notificationSettings?.comments ?? true,
        exhibitions: notificationSettings?.exhibitions ?? true,
        exhibition_distance: notificationSettings?.exhibition_distance ?? 5,
      },
      userSettings: {
        darkMode: userSettings?.dark_mode ?? false,
      },
      identities: (user.identities || []).map((identity: any) => ({
        ...identity,
        identity_data: {
          ...identity.identity_data,
          user_type: profile.user_type, // profiles 테이블의 user_type으로 동기화
        },
      })),
    };

    // 프로필 데이터는 자주 변경되지 않으므로 캐싱 (더 긴 캐시 시간)
    return NextResponse.json(userProfile, {
      headers: {
        'Cache-Control': 'private, s-maxage=60, stale-while-revalidate=120',
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

    // 알림 설정 업데이트 (upsert)
    if (updatedProfileData.notificationSettings) {
      const { error: notifError } = await supabase
        .from('notification_settings')
        .upsert({
          user_id: user.id,
          comments: updatedProfileData.notificationSettings.comments,
          exhibitions: updatedProfileData.notificationSettings.exhibitions,
          exhibition_distance: updatedProfileData.notificationSettings.exhibition_distance,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (notifError) {
        console.error('Notification settings update error:', notifError);
      }
    }

    // 사용자 설정 업데이트 (upsert)
    if (updatedProfileData.userSettings) {
      const { error: settingsError } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          dark_mode: updatedProfileData.userSettings.darkMode,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (settingsError) {
        console.error('User settings update error:', settingsError);
      }
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
      user_type: updatedProfile.user_type || 'artist',
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

export async function DELETE() {
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

    // 1. 사용자 관련 데이터 삭제 (CASCADE로 자동 삭제되지 않는 경우를 대비)
    // notification_settings, user_settings는 CASCADE로 자동 삭제됨
    
    // 2. profiles 테이블에서 사용자 삭제 (CASCADE로 관련 데이터도 삭제됨)
    const { error: deleteProfileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', user.id);

    if (deleteProfileError) {
      console.error('Profile deletion error:', deleteProfileError);
      return NextResponse.json(
        { message: 'Failed to delete profile data' }, 
        { status: 500 }
      );
    }

    // 3. Supabase Auth에서 사용자 계정 삭제
    const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(user.id);

    if (deleteAuthError) {
      console.error('Auth user deletion error:', deleteAuthError);
      return NextResponse.json(
        { message: 'Failed to delete user account' }, 
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Account deleted successfully' }, 
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE /api/profile error:', error);
    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
