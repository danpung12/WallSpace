import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/payment/success
 * 토스페이먼츠 결제 성공 후 리다이렉트 처리
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const paymentKey = searchParams.get('paymentKey');
    const orderId = searchParams.get('orderId');
    const amount = searchParams.get('amount');

    if (!paymentKey || !orderId || !amount) {
      return NextResponse.redirect(new URL('/confirm-booking?error=missing_params', request.url));
    }

    // 결제 승인 처리
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
        amount: parseInt(amount),
      }),
    });

    if (!confirmResponse.ok) {
      return NextResponse.redirect(new URL('/confirm-booking?error=payment_failed', request.url));
    }

    // 결제 성공 - 예약 상세 페이지로 리다이렉트
    // 실제로는 orderId를 기반으로 예약을 찾아서 리다이렉트해야 함
    return NextResponse.redirect(new URL(`/bookingdetail?orderId=${orderId}`, request.url));
  } catch (error: any) {
    console.error('결제 성공 처리 오류:', error);
    return NextResponse.redirect(new URL('/confirm-booking?error=server_error', request.url));
  }
}




