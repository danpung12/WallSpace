import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/artworks
 * 작품 목록 조회
 * Query params:
 *   - mine=true: 현재 사용자의 작품만 조회
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🎨 GET /api/artworks - Starting...');
    
    const supabase = await createClient();
    console.log('✅ Supabase client created');
    
    const { searchParams } = new URL(request.url);
    const mineOnly = searchParams.get('mine') === 'true';
    console.log('📊 Query params - mine:', mineOnly);

    if (mineOnly) {
      // 현재 사용자의 작품만 조회
      console.log('🔐 Fetching current user...');
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError) {
        console.error('❌ Auth error:', authError);
        return NextResponse.json(
          { error: 'Unauthorized', details: authError.message },
          { status: 401 }
        );
      }

      if (!user) {
        console.error('❌ No user found');
        return NextResponse.json(
          { error: 'Unauthorized - No user session' },
          { status: 401 }
        );
      }

      console.log('✅ User authenticated:', user.id);

      console.log('🔍 Querying artworks for user:', user.id);
      const { data, error } = await supabase
        .from('artworks')
        .select('*')
        .eq('artist_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching user artworks:', error);
        return NextResponse.json(
          { error: 'Failed to fetch artworks', details: error.message },
          { status: 500 }
        );
      }

      console.log('✅ Artworks fetched:', data?.length || 0);
      return NextResponse.json(data || []);
    }

    // 모든 작품 조회
    const { data, error } = await supabase
      .from('artworks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching artworks:', error);
      return NextResponse.json(
        { error: 'Failed to fetch artworks', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);

  } catch (error) {
    console.error('GET /api/artworks error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

