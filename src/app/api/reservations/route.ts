import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/reservations
 * 사용자의 예약 목록 조회
 * Query params:
 *   - status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
 *   - location_id: 특정 장소의 예약만 조회
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET /api/reservations - Starting...');
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
    const locationId = searchParams.get('location_id');
    const spaceId = searchParams.get('space_id');
    console.log('📊 Query params:', { id, status, locationId, spaceId });

    // 특정 예약 ID로 조회
    if (id) {
      console.log('🔍 Fetching single reservation:', id);
      const { data: reservation, error: reservationError } = await supabase
        .from('reservations')
        .select(`
          *,
          location:locations(*, images:location_images(image_url)),
          space:spaces(*),
          artwork:artworks(*),
          artist:profiles!reservations_artist_id_fkey(id, name, nickname, phone, email, avatar_url)
        `)
        .eq('id', id)
        .single();

      if (reservationError) {
        console.error('❌ Error fetching reservation:', reservationError);
        return NextResponse.json(
          { error: 'Failed to fetch reservation', details: reservationError.message },
          { status: 500 }
        );
      }

      if (!reservation) {
        return NextResponse.json(
          { error: 'Reservation not found' },
          { status: 404 }
        );
      }

      // 권한 확인: 예약한 작가 본인이거나 장소 관리자인 경우만 조회 가능
      const isArtist = reservation.artist_id === user.id;
      const isManager = (reservation as any).location?.manager_id === user.id;

      if (!isArtist && !isManager) {
        console.log('❌ Unauthorized access attempt:', { userId: user.id, artistId: reservation.artist_id, managerId: (reservation as any).location?.manager_id });
        return NextResponse.json(
          { error: 'Unauthorized to view this reservation' },
          { status: 403 }
        );
      }

      // Location 이미지를 배열로 변환
      if ((reservation as any).location?.images) {
        (reservation as any).location.images = ((reservation as any).location.images as any[]).map(img => img.image_url);
      }

      console.log('✅ Reservation fetched:', reservation?.id);
      return NextResponse.json(reservation);
    }

    // 예약 조회 쿼리 구성 (관련 데이터 JOIN으로 한 번에 조회)
    console.log('🔍 Fetching reservations...');
    let query = supabase
      .from('reservations')
      .select(`
        *,
        location:locations(
          *,
          images:location_images(image_url)
        ),
        space:spaces(*),
        artwork:artworks(*),
        artist:profiles!reservations_artist_id_fkey(id, name, nickname, phone, email, avatar_url)
      `);

    // location_id로 조회할 때 (사장님이 자기 가게의 모든 예약 조회)
    if (locationId) {
      console.log('🏪 Fetching by location_id (manager view):', locationId);
      // 사장님 권한 확인
      const { data: location } = await supabase
        .from('locations')
        .select('manager_id')
        .eq('id', locationId)
        .single();
      
      if (location && location.manager_id === user.id) {
        console.log('✅ Manager authorized for this location');
        query = query.eq('location_id', locationId);
      } else {
        console.log('❌ Manager not authorized for this location');
        return NextResponse.json(
          { error: 'Unauthorized to view this location reservations' },
          { status: 403 }
        );
      }
    }
    // space_id로 조회할 때 (사장님이 특정 공간의 예약 조회)
    else if (spaceId) {
      console.log('🏪 Fetching by space_id (manager view):', spaceId);
      // 사장님 권한 확인: 해당 공간이 자신의 location에 속하는지 체크
      const { data: space } = await supabase
        .from('spaces')
        .select('location_id, locations(manager_id)')
        .eq('id', spaceId)
        .single();
      
      if (space && (space as any).locations?.manager_id === user.id) {
        console.log('✅ Manager authorized for this space');
        query = query.eq('space_id', spaceId);
      } else {
        console.log('❌ Manager not authorized for this space');
        return NextResponse.json(
          { error: 'Unauthorized to view this space reservations' },
          { status: 403 }
        );
      }
    } else {
      // 일반 조회 (작가가 자신의 예약 조회)
      query = query.eq('artist_id', user.id);
    }

    query = query.order('created_at', { ascending: false });

    // 필터 적용
    if (status) {
      query = query.eq('status', status);
    }

    const { data: reservations, error: reservationsError } = await query;

    if (reservationsError) {
      console.error('❌ Error fetching reservations:', reservationsError);
      return NextResponse.json(
        { error: 'Failed to fetch reservations', details: reservationsError.message },
        { status: 500 }
      );
    }

    console.log('✅ Reservations fetched:', reservations?.length || 0);
    console.log('📊 Reservations summary:', reservations?.map(r => ({
      id: r.id.substring(0, 8),
      status: r.status,
      start_date: r.start_date,
      end_date: r.end_date
    })));

    // ⚡ JOIN으로 이미 모든 데이터를 가져왔으므로 추가 처리만 수행
    if (reservations && reservations.length > 0) {
      for (const reservation of reservations) {
        // Location 이미지를 배열로 변환
        if ((reservation as any).location?.images) {
          (reservation as any).location.images = ((reservation as any).location.images as any[]).map(img => img.image_url);
        }
      }
      console.log('✅ Reservations data processed');
    }

    return NextResponse.json(reservations);

  } catch (error) {
    console.error('❌ GET /api/reservations error:', error);
    console.error('Error details:', {
      message: (error as Error).message,
      stack: (error as Error).stack,
    });
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/reservations
 * 새 예약 생성
 * Body: {
 *   location_id: string,
 *   space_id: string,
 *   artwork_id: string,
 *   start_date: string (YYYY-MM-DD),
 *   end_date: string (YYYY-MM-DD)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // 현재 로그인한 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    // 사용자 타입 확인 (작가 또는 매니저만 예약 가능)
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single();

    if (!profile || !['artist', 'manager'].includes(profile.user_type)) {
      return NextResponse.json(
        { error: 'Only artists or managers can make reservations' },
        { status: 403 }
      );
    }

    // 요청 본문 파싱
    const body = await request.json();
    console.log('📦 Received reservation data:', body);
    const { location_id, space_id, artwork_id, start_date, end_date } = body;

    // 필수 필드 검증
    if (!location_id || !space_id || !artwork_id || !start_date || !end_date) {
      console.error('❌ Missing fields:', { location_id, space_id, artwork_id, start_date, end_date });
      return NextResponse.json(
        { error: 'Missing required fields: location_id, space_id, artwork_id, start_date, end_date' },
        { status: 400 }
      );
    }

    // 날짜 검증
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    if (startDate >= endDate) {
      return NextResponse.json(
        { error: 'end_date must be after start_date' },
        { status: 400 }
      );
    }

    // 공간 정보 가져오기 (가격 계산용)
    console.log('🔍 Fetching space:', space_id);
    const { data: space, error: spaceError } = await supabase
      .from('spaces')
      .select('price')
      .eq('id', space_id)
      .single();

    if (spaceError || !space) {
      console.error('❌ Space not found:', spaceError);
      return NextResponse.json(
        { error: 'Space not found', details: spaceError?.message },
        { status: 404 }
      );
    }
    console.log('✅ Space found:', space);

    // 날짜 중복 확인 (실제 예약 데이터로 체크)
    const { data: existingReservations } = await supabase
      .from('reservations')
      .select('id')
      .eq('space_id', space_id)
      .not('status', 'eq', 'cancelled')
      .or(`and(start_date.lte.${end_date},end_date.gte.${start_date})`);

    if (existingReservations && existingReservations.length > 0) {
      return NextResponse.json(
        { error: 'Space is already reserved for the selected dates' },
        { status: 409 }
      );
    }

    // 총 비용 계산
    const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const totalPrice = space.price * durationDays;
    console.log('💰 Price calculation:', { durationDays, pricePerDay: space.price, totalPrice });

    // 예약 생성
    console.log('📝 Creating reservation...');
    const { data: reservation, error: reservationError } = await supabase
      .from('reservations')
      .insert({
        artist_id: user.id,
        location_id,
        space_id,
        artwork_id,
        start_date,
        end_date,
        status: 'pending',
        total_price: totalPrice,
      })
      .select(`
        *,
        location:locations(*),
        space:spaces(*),
        artwork:artworks(*)
      `)
      .single();

    if (reservationError) {
      console.error('❌ Error creating reservation:', reservationError);
      return NextResponse.json(
        { error: 'Failed to create reservation', details: reservationError.message },
        { status: 500 }
      );
    }

    console.log('✅ Reservation created successfully:', reservation?.id);

    // 공간 상태 업데이트 (current_reservations 증가)
    console.log('🔄 Updating space status...');
    const { data: currentSpace } = await supabase
      .from('spaces')
      .select('current_reservations, max_artworks')
      .eq('id', space_id)
      .single();

    if (currentSpace) {
      const newCount = (currentSpace.current_reservations || 0) + 1;
      await supabase
        .from('spaces')
        .update({ 
          current_reservations: newCount,
          is_reserved: newCount >= currentSpace.max_artworks
        })
        .eq('id', space_id);
    }

    // location의 reserved_slots 증가 (선택사항)
    // 현재 값을 가져와서 +1
    const { data: currentLocation } = await supabase
      .from('locations')
      .select('reserved_slots')
      .eq('id', location_id)
      .single();

    if (currentLocation) {
      console.log('📊 Updating location reserved_slots...');
      await supabase
        .from('locations')
        .update({ 
          reserved_slots: (currentLocation.reserved_slots || 0) + 1 
        })
        .eq('id', location_id);
    }

    console.log('🎉 Reservation process completed:', reservation.id);

    return NextResponse.json(
      { 
        success: true,
        message: 'Reservation created successfully',
        reservation 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('❌ POST /api/reservations error:', error);
    console.error('Error details:', {
      message: (error as Error).message,
      stack: (error as Error).stack,
      name: (error as Error).name,
    });
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/reservations/[id]
 * 예약 상태 업데이트 (취소, 확정 등)
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // 현재 로그인한 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    const body = await request.json();
    const { reservation_id, status, rejection_reason } = body;

    if (!reservation_id || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: reservation_id, status' },
        { status: 400 }
      );
    }

    // 유효한 상태인지 확인
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // 예약 정보 가져오기
    const { data: reservation, error: fetchError } = await supabase
      .from('reservations')
      .select('*, space_id, location_id, artist_id')
      .eq('id', reservation_id)
      .single();

    if (fetchError || !reservation) {
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      );
    }

    // 권한 확인 (예약한 사람 또는 장소 관리자만 수정 가능)
    const { data: location } = await supabase
      .from('locations')
      .select('manager_id, name')
      .eq('id', reservation.location_id)
      .single();

    const isOwner = reservation.artist_id === user.id;
    const isManager = location?.manager_id === user.id;

    if (!isOwner && !isManager) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // 예약 상태 업데이트
    const updateData: any = { 
      status,
      updated_at: new Date().toISOString()
    };
    
    // 거절 시 거절 사유 저장
    if (status === 'cancelled' && rejection_reason) {
      updateData.rejection_reason = rejection_reason;
    }
    
    const { data: updatedReservation, error: updateError } = await supabase
      .from('reservations')
      .update(updateData)
      .eq('id', reservation_id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating reservation:', updateError);
      return NextResponse.json(
        { error: 'Failed to update reservation', details: updateError.message },
        { status: 500 }
      );
    }

    // 취소된 경우 공간 상태 업데이트
    if (status === 'cancelled') {
      // current_reservations 감소
      const { data: currentSpace } = await supabase
        .from('spaces')
        .select('current_reservations, max_artworks')
        .eq('id', reservation.space_id)
        .single();

      if (currentSpace && currentSpace.current_reservations > 0) {
        const newCount = currentSpace.current_reservations - 1;
        await supabase
          .from('spaces')
          .update({ 
            current_reservations: newCount,
            is_reserved: newCount >= currentSpace.max_artworks
          })
          .eq('id', reservation.space_id);
      }

      // reserved_slots 감소
      const { data: currentLocation } = await supabase
        .from('locations')
        .select('reserved_slots')
        .eq('id', reservation.location_id)
        .single();

      if (currentLocation && currentLocation.reserved_slots > 0) {
        await supabase
          .from('locations')
          .update({ 
            reserved_slots: currentLocation.reserved_slots - 1 
          })
          .eq('id', reservation.location_id);
      }
    }

    // 알림은 데이터베이스 트리거(notify_artist_on_status_change)에서 자동으로 생성됨
    // 트리거는 상태 변경 시 자동으로 알림을 생성하므로 여기서는 별도로 생성하지 않음
    console.log('🔔 Notification will be created by trigger for status:', status);

    console.log('✅ Reservation updated:', reservation_id, status);

    return NextResponse.json({
      success: true,
      message: 'Reservation updated successfully',
      reservation: updatedReservation
    });

  } catch (error) {
    console.error('PATCH /api/reservations error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

