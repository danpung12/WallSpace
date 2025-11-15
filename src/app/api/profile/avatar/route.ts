import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
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

    // FormData에서 파일 가져오기
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { message: 'No file provided' }, 
        { status: 400 }
      );
    }

    // 파일 확장자 추출
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    // Supabase Storage에 업로드
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true, // 같은 파일명이 있으면 덮어쓰기
      });

    if (uploadError) {
      console.error('Avatar upload error:', uploadError);
      return NextResponse.json(
        { message: 'Failed to upload avatar', error: uploadError.message }, 
        { status: 500 }
      );
    }

    // Public URL 가져오기
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    // 프로필에 avatar_url 업데이트
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', user.id);

    if (updateError) {
      console.error('Profile update error:', updateError);
      return NextResponse.json(
        { message: 'Failed to update profile', error: updateError.message }, 
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      avatarUrl: publicUrl,
      message: 'Avatar uploaded successfully' 
    });
  } catch (error) {
    console.error('POST /api/profile/avatar error:', error);
    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

