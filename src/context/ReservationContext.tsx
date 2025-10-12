'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { reservationsData, Reservation } from '@/data/reservations';

interface ReservationContextType {
  reservations: Reservation[];
  cancelReservation: (id: string) => void;
  getReservationById: (id: string) => Reservation | undefined;
  updateReservationStatus: (id: string, status: Reservation['status']) => void;
}

const ReservationContext = createContext<ReservationContextType | null>(null);

export const ReservationProvider = ({ children }: { children: ReactNode }) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);

  // Load reservations from localStorage on initial render
  useEffect(() => {
    try {
      const storedReservations = localStorage.getItem('reservations');
      if (storedReservations) {
        const parsedReservations = JSON.parse(storedReservations);
        // Data integrity check: If the stored data is old (missing 'price'),
        // discard it and re-initialize with the updated mock data.
        if (parsedReservations && parsedReservations.length > 0 && parsedReservations[0].price !== undefined) {
          setReservations(parsedReservations);
        } else {
          setReservations(reservationsData);
        }
      } else {
        // If nothing in localStorage, initialize with mock data
        setReservations(reservationsData);
      }
    } catch (error) {
      // If parsing fails, fallback to initial data
      console.error("Failed to parse reservations from localStorage", error);
      setReservations(reservationsData);
    }
  }, []);

  // Save reservations to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('reservations', JSON.stringify(reservations));
    } catch (error) {
      console.error("Failed to save reservations to localStorage", error);
    }
  }, [reservations]);

  const cancelReservation = (id: string) => {
    // This function will now be used to truly remove a reservation if needed, 
    // but for cancellation, we'll use updateReservationStatus
    setReservations(prevReservations => 
      prevReservations.filter(reservation => reservation.id !== id)
    );
  };
  
  const updateReservationStatus = (id: string, status: Reservation['status']) => {
    setReservations(prevReservations =>
      prevReservations.map(reservation =>
        reservation.id === id ? { ...reservation, status } : reservation
      )
    );
  };

  const getReservationById = (id: string) => {
    return reservations.find(reservation => reservation.id === id);
  };

  return (
    <ReservationContext.Provider value={{ reservations, cancelReservation, getReservationById, updateReservationStatus }}>
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
