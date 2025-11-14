import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// 즐겨찾기 목록 조회
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { message: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    // 특정 장소의 즐겨찾기 여부 확인
    const locationId = req.nextUrl.searchParams.get('locationId');
    
    if (locationId) {
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('location_id', locationId)
        .maybeSingle();

      if (error) {
        console.error('Favorites check error:', error);
        return NextResponse.json(
          { message: 'Failed to check favorite status' }, 
          { status: 500 }
        );
      }

      return NextResponse.json({ isFavorite: !!data });
    }

    // 전체 즐겨찾기 목록 조회
    const { data: favorites, error } = await supabase
      .from('favorites')
      .select(`
        id,
        location_id,
        created_at,
        locations (*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Favorites fetch error:', error);
      return NextResponse.json(
        { message: 'Failed to fetch favorites' }, 
        { status: 500 }
      );
    }

    // 캐싱 헤더 추가 - 즐겨찾기는 변경 빈도가 낮으므로 더 긴 캐싱
    return NextResponse.json(favorites || [], {
      headers: {
        'Cache-Control': 'private, s-maxage=120, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('GET /api/favorites error:', error);
    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// 즐겨찾기 추가
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { message: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    const { locationId } = await req.json();

    if (!locationId) {
      return NextResponse.json(
        { message: 'Location ID is required' }, 
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('favorites')
      .insert({
        user_id: user.id,
        location_id: locationId,
      })
      .select()
      .single();

    if (error) {
      // 이미 즐겨찾기에 있는 경우
      if (error.code === '23505') {
        return NextResponse.json(
          { message: 'Already in favorites' }, 
          { status: 409 }
        );
      }
      console.error('Favorites insert error:', error);
      return NextResponse.json(
        { message: 'Failed to add favorite' }, 
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('POST /api/favorites error:', error);
    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// 즐겨찾기 삭제
export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { message: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    const locationId = req.nextUrl.searchParams.get('locationId');

    if (!locationId) {
      return NextResponse.json(
        { message: 'Location ID is required' }, 
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('location_id', locationId);

    if (error) {
      console.error('Favorites delete error:', error);
      return NextResponse.json(
        { message: 'Failed to remove favorite' }, 
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/favorites error:', error);
    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    );
  }
}


