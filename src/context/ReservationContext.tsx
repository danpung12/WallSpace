'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { BookingDetail } from '@/types/database';
import { getBookingsByUser, updateBookingStatus, deleteBooking } from '@/lib/api/bookings';
import { getCurrentUser } from '@/lib/supabase/client';

interface ReservationContextType {
  reservations: BookingDetail[];
  loading: boolean;
  error: string | null;
  cancelReservation: (id: string) => Promise<boolean>;
  getReservationById: (id: string) => BookingDetail | undefined;
  updateReservationStatus: (id: string, status: 'pending' | 'confirmed' | 'cancelled' | 'completed', rejectionReason?: string) => Promise<boolean>;
  refreshReservations: () => Promise<void>;
}

const ReservationContext = createContext<ReservationContextType | null>(null);

export const ReservationProvider = ({ children }: { children: ReactNode }) => {
  const [reservations, setReservations] = useState<BookingDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load reservations from Supabase
  const loadReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { user } = await getCurrentUser();
      if (!user) {
        setReservations([]);
        return;
      }
      
      const userReservations = await getBookingsByUser(user.id);
      console.log('📦 Loaded reservations:', userReservations);
      console.log('📊 First reservation sample:', userReservations[0]);
      setReservations(userReservations);
    } catch (err) {
      console.error('Error loading reservations:', err);
      setError('예약 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, []);

  const cancelReservation = async (id: string): Promise<boolean> => {
    try {
      const success = await deleteBooking(id);
      if (success) {
        await loadReservations(); // 새로고침
      }
      return success;
    } catch (err) {
      console.error('Error cancelling reservation:', err);
      return false;
    }
  };
  
  const updateReservationStatus = async (id: string, status: 'pending' | 'confirmed' | 'cancelled' | 'completed', rejectionReason?: string): Promise<boolean> => {
    try {
      const updatedBooking = await updateBookingStatus(id, status, rejectionReason);
      if (updatedBooking) {
        await loadReservations(); // 새로고침
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error updating reservation status:', err);
      return false;
    }
  };

  const getReservationById = (id: string) => {
    return reservations.find(reservation => reservation.id === id);
  };

  const refreshReservations = async () => {
    await loadReservations();
  };

  return (
    <ReservationContext.Provider value={{ 
      reservations, 
      loading, 
      error, 
      cancelReservation, 
      getReservationById, 
      updateReservationStatus,
      refreshReservations
    }}>
      {children}
    </ReservationContext.Provider>
  );
};

export const useReservations = () => {
  const context = useContext(ReservationContext);
  if (!context) {
    throw new Error('useReservations must be used within a ReservationProvider');
  }
  return context;
};
