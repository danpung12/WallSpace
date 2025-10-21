'use client';

import Head from 'next/head';
import BookingSuccess from './components/BookingSuccess';
import BottomNav from '../components/BottomNav';

export default function BookingPage() {
  return (
    <>
      <Head>
        <title>Booking Confirmation</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <BookingSuccess />
      <BottomNav />
    </>
  );
}
