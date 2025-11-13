import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/payment/confirm
 * 토스페이먼츠 결제 승인 처리
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

    const body = await request.json();
    const { paymentKey, orderId, amount, reservationData } = body;

    if (!paymentKey || !orderId || !amount || !reservationData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 토스페이먼츠 결제 승인 API 호출
    const secretKey = process.env.TOSS_PAYMENTS_SECRET_KEY || 'test_gsk_docs_OaPz8L5KdmQXkzRz3y47BMw6';
    const confirmResponse = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(secretKey + ':').toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount,
      }),
    });

    if (!confirmResponse.ok) {
      const errorData = await confirmResponse.json();
      console.error('토스페이먼츠 결제 승인 실패:', errorData);
      return NextResponse.json(
        { error: 'Payment confirmation failed', details: errorData },
        { status: 400 }
      );
    }

    const paymentData = await confirmResponse.json();
    console.log('✅ 결제 승인 성공:', paymentData);

    // 예약 생성
    const { location_id, space_id, artwork_id, start_date, end_date } = reservationData;

    const { data: reservation, error: reservationError } = await supabase
      .from('reservations')
      .insert({
        artist_id: user.id,
        location_id,
        space_id,
        artwork_id,
        start_date,
        end_date,
        status: 'confirmed',
        total_price: amount,
        payment_key: paymentKey,
        order_id: orderId,
      })
      .select(`
        *,
        location:locations(*),
        space:spaces(*),
        artwork:artworks(*)
      `)
      .single();

    if (reservationError) {
      console.error('예약 생성 실패:', reservationError);
      return NextResponse.json(
        { error: 'Failed to create reservation', details: reservationError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      reservation,
      payment: paymentData,
    });
  } catch (error: any) {
    console.error('결제 승인 처리 오류:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}




