import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const supabaseAdmin = createAdminClient();

    // 1. 현재 로그인한 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // 2. Supabase Auth에서 사용자 삭제 (Admin 권한 필요)
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(user.id);

    if (deleteUserError) {
      console.error('Error deleting user from auth:', deleteUserError);
      // profiles 테이블에 on delete cascade가 설정되어 있어 자동으로 삭제됩니다.
      // 만약 auth.users에서 삭제 실패 시 500 에러를 반환합니다.
      return NextResponse.json(
        { message: 'Failed to delete account', error: deleteUserError.message },
        { status: 500 }
      );
    }

    // 3. (선택적) Storage에서 사용자 관련 파일 삭제
    // 예: avatars, artworks 등
    // 여기서는 profiles 테이블의 cascade 설정에 의존합니다.
    // 만약 Storage 파일 정리가 필요하다면 여기에 로직을 추가합니다.
    const { data: files, error: listError } = await supabase.storage.from('avatars').list(user.id);
    if (files && files.length > 0) {
      const filePaths = files.map(file => `${user.id}/${file.name}`);
      await supabase.storage.from('avatars').remove(filePaths);
    }

    return NextResponse.json({ message: 'Account deleted successfully' });

  } catch (error) {
    console.error('POST /api/profile/delete-account error:', error);
    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

