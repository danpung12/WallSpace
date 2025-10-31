import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/inquiries
 * 사용자의 문의 목록 조회
 * Query params:
 *   - id: 특정 문의 조회
 *   - status: 'pending' | 'in_progress' | 'resolved' | 'closed'
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET /api/inquiries - Starting...');
    const supabase = await createClient();
    
    // 현재 로그인한 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('❌ Auth error:', authError);
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    console.log('✅ User authenticated:', user.id);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const status = searchParams.get('status');
    console.log('📊 Query params:', { id, status });

    // 특정 문의 ID로 조회
    if (id) {
      console.log('🔍 Fetching single inquiry:', id);
      const { data: inquiry, error: inquiryError } = await supabase
        .from('inquiries')
        .select(`
          *,
          user:profiles!user_id(email, name, nickname)
        `)
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (inquiryError) {
        console.error('❌ Error fetching inquiry:', inquiryError);
        return NextResponse.json(
          { error: 'Failed to fetch inquiry', details: inquiryError.message },
          { status: 500 }
        );
      }

      console.log('✅ Inquiry fetched:', inquiry?.id);
      return NextResponse.json(inquiry);
    }

    // 문의 목록 조회
    let query = supabase
      .from('inquiries')
      .select(`
        *,
        user:profiles!user_id(email, name, nickname)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // 상태별 필터링
    if (status) {
      query = query.eq('status', status);
    }

    const { data: inquiries, error: inquiriesError } = await query;

    if (inquiriesError) {
      console.error('❌ Error fetching inquiries:', inquiriesError);
      return NextResponse.json(
        { error: 'Failed to fetch inquiries', details: inquiriesError.message },
        { status: 500 }
      );
    }

    console.log('✅ Inquiries fetched:', inquiries?.length || 0);
    return NextResponse.json(inquiries || []);
  } catch (error) {
    console.error('❌ Unexpected error in GET /api/inquiries:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/inquiries
 * 새로운 문의 생성
 * Body:
 *   - subject: 'payment_error' | 'reservation_error' | 'general' | 'other'
 *   - content: string
 *   - image?: string (base64 encoded image)
 */
export async function POST(request: NextRequest) {
  try {
    console.log('📝 POST /api/inquiries - Starting...');
    const supabase = await createClient();
    
    // 현재 로그인한 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('❌ Auth error:', authError);
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    console.log('✅ User authenticated:', user.id);

    // 요청 본문 파싱
    const body = await request.json();
    const { subject, content, image } = body;

    // 입력 검증
    if (!subject || !content) {
      return NextResponse.json(
        { error: 'Subject and content are required' },
        { status: 400 }
      );
    }

    // 주제 유효성 검증
    const validSubjects = ['payment_error', 'reservation_error', 'general', 'other'];
    if (!validSubjects.includes(subject)) {
      return NextResponse.json(
        { error: 'Invalid subject type' },
        { status: 400 }
      );
    }

    // 내용 길이 검증 (최대 2000자)
    if (content.length > 2000) {
      return NextResponse.json(
        { error: 'Content must be less than 2000 characters' },
        { status: 400 }
      );
    }

    console.log('📊 Creating inquiry with:', { subject, contentLength: content.length, hasImage: !!image });

    let imageUrl: string | null = null;

    // 이미지가 있으면 업로드
    if (image) {
      try {
        // base64 이미지를 Buffer로 변환
        const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        // 파일 확장자 추출 (base64 헤더에서)
        const matches = image.match(/^data:image\/(\w+);base64,/);
        const ext = matches ? matches[1] : 'jpg';

        // 파일명 생성: user_id/timestamp.ext
        const fileName = `${user.id}/${Date.now()}.${ext}`;

        console.log('📤 Uploading image:', fileName);

        // Storage에 업로드
        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('inquiries')
          .upload(fileName, buffer, {
            contentType: `image/${ext}`,
            upsert: false
          });

        if (uploadError) {
          console.error('❌ Error uploading image:', uploadError);
          throw uploadError;
        }

        // Public URL 생성
        const { data: { publicUrl } } = supabase
          .storage
          .from('inquiries')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
        console.log('✅ Image uploaded:', imageUrl);
      } catch (imageError: any) {
        console.error('❌ Error processing image:', imageError);
        // 이미지 업로드 실패는 에러로 처리하지 않고 계속 진행
        // return NextResponse.json(
        //   { error: 'Failed to upload image', details: imageError.message },
        //   { status: 500 }
        // );
      }
    }

    // 문의 생성
    const { data: inquiry, error: createError } = await supabase
      .from('inquiries')
      .insert({
        user_id: user.id,
        subject,
        content: content.trim(),
        image_url: imageUrl,
        status: 'pending'
      })
      .select()
      .single();

    if (createError) {
      console.error('❌ Error creating inquiry:', createError);
      console.error('Error details:', JSON.stringify(createError, null, 2));
      return NextResponse.json(
        { 
          error: 'Failed to create inquiry', 
          details: createError.message,
          hint: createError.hint,
          code: createError.code 
        },
        { status: 500 }
      );
    }

    console.log('✅ Inquiry created:', inquiry?.id);
    return NextResponse.json(inquiry, { status: 201 });
  } catch (error: any) {
    console.error('❌ Unexpected error in POST /api/inquiries:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/inquiries
 * 문의 수정 (대기중 상태만 가능)
 * Body:
 *   - id: string
 *   - subject?: 'payment_error' | 'reservation_error' | 'general' | 'other'
 *   - content?: string
 */
export async function PATCH(request: NextRequest) {
  try {
    console.log('✏️ PATCH /api/inquiries - Starting...');
    const supabase = await createClient();
    
    // 현재 로그인한 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('❌ Auth error:', authError);
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    console.log('✅ User authenticated:', user.id);

    // 요청 본문 파싱
    const body = await request.json();
    const { id, subject, content } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Inquiry ID is required' },
        { status: 400 }
      );
    }

    // 기존 문의 확인
    const { data: existingInquiry, error: fetchError } = await supabase
      .from('inquiries')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !existingInquiry) {
      console.error('❌ Inquiry not found:', fetchError);
      return NextResponse.json(
        { error: 'Inquiry not found' },
        { status: 404 }
      );
    }

    // 대기중 상태가 아니면 수정 불가
    if (existingInquiry.status !== 'pending') {
      return NextResponse.json(
        { error: 'Can only modify pending inquiries' },
        { status: 403 }
      );
    }

    // 업데이트할 필드 구성
    const updates: any = {};
    
    if (subject) {
      const validSubjects = ['payment_error', 'reservation_error', 'general', 'other'];
      if (!validSubjects.includes(subject)) {
        return NextResponse.json(
          { error: 'Invalid subject type' },
          { status: 400 }
        );
      }
      updates.subject = subject;
    }

    if (content) {
      if (content.length > 2000) {
        return NextResponse.json(
          { error: 'Content must be less than 2000 characters' },
          { status: 400 }
        );
      }
      updates.content = content.trim();
    }

    // 업데이트할 내용이 없으면 에러
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    console.log('📊 Updating inquiry:', { id, updates });

    // 문의 업데이트
    const { data: updatedInquiry, error: updateError } = await supabase
      .from('inquiries')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error updating inquiry:', updateError);
      return NextResponse.json(
        { error: 'Failed to update inquiry', details: updateError.message },
        { status: 500 }
      );
    }

    console.log('✅ Inquiry updated:', updatedInquiry?.id);
    return NextResponse.json(updatedInquiry);
  } catch (error) {
    console.error('❌ Unexpected error in PATCH /api/inquiries:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/inquiries
 * 문의 삭제 (대기중 상태만 가능)
 * Query params:
 *   - id: string
 */
export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ DELETE /api/inquiries - Starting...');
    const supabase = await createClient();
    
    // 현재 로그인한 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('❌ Auth error:', authError);
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    console.log('✅ User authenticated:', user.id);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Inquiry ID is required' },
        { status: 400 }
      );
    }

    // 기존 문의 확인
    const { data: existingInquiry, error: fetchError } = await supabase
      .from('inquiries')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !existingInquiry) {
      console.error('❌ Inquiry not found:', fetchError);
      return NextResponse.json(
        { error: 'Inquiry not found' },
        { status: 404 }
      );
    }

    // 대기중 상태가 아니면 삭제 불가
    if (existingInquiry.status !== 'pending') {
      return NextResponse.json(
        { error: 'Can only delete pending inquiries' },
        { status: 403 }
      );
    }

    console.log('📊 Deleting inquiry:', id);

    // 문의 삭제
    const { error: deleteError } = await supabase
      .from('inquiries')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('❌ Error deleting inquiry:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete inquiry', details: deleteError.message },
        { status: 500 }
      );
    }

    console.log('✅ Inquiry deleted:', id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Unexpected error in DELETE /api/inquiries:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

