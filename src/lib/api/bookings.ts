// src/lib/api/bookings.ts
// 예약 관련 API 서비스

import { createClient } from '@/lib/supabase/client'
import { 
  Booking, 
  BookingInsert, 
  BookingUpdate,
  BookingDetail
} from '@/types/database'

// 모든 예약 조회 (상세 정보 포함)
export const getBookings = async (): Promise<BookingDetail[]> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('booking_details')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching bookings:', error)
    return []
  }
  
  return data
}

// 특정 예약 조회
export const getBooking = async (bookingId: string): Promise<BookingDetail | null> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('booking_details')
    .select('*')
    .eq('id', bookingId)
    .single()
  
  if (error) {
    console.error('Error fetching booking:', error)
    return null
  }
  
  return data
}

// 사용자별 예약 조회
export const getBookingsByUser = async (userId: string): Promise<BookingDetail[]> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('booking_details')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching user bookings:', error)
    return []
  }
  
  return data
}

// 공간별 예약 조회
export const getBookingsByLocation = async (locationId: string): Promise<BookingDetail[]> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('booking_details')
    .select('*')
    .eq('location_id', locationId)
    .order('start_date', { ascending: true })
  
  if (error) {
    console.error('Error fetching location bookings:', error)
    return []
  }
  
  return data
}

// 예약 생성
export const createBooking = async (booking: BookingInsert): Promise<Booking | null> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('bookings')
    .insert(booking)
    .select()
    .single()
  
  if (error) {
    console.error('Error creating booking:', error)
    return null
  }
  
  return data
}

// 예약 업데이트
export const updateBooking = async (bookingId: string, updates: BookingUpdate): Promise<Booking | null> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('bookings')
    .update(updates)
    .eq('id', bookingId)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating booking:', error)
    return null
  }
  
  return data
}

// 예약 상태 업데이트
export const updateBookingStatus = async (
  bookingId: string, 
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
): Promise<Booking | null> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', bookingId)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating booking status:', error)
    return null
  }
  
  return data
}

// 예약 삭제
export const deleteBooking = async (bookingId: string): Promise<boolean> => {
  const supabase = createClient()
  const { error } = await supabase
    .from('bookings')
    .delete()
    .eq('id', bookingId)
  
  if (error) {
    console.error('Error deleting booking:', error)
    return false
  }
  
  return true
}

// 날짜 범위별 예약 조회
export const getBookingsByDateRange = async (
  startDate: string, 
  endDate: string
): Promise<BookingDetail[]> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('booking_details')
    .select('*')
    .gte('start_date', startDate)
    .lte('end_date', endDate)
    .order('start_date', { ascending: true })
  
  if (error) {
    console.error('Error fetching bookings by date range:', error)
    return []
  }
  
  return data
}

// 상태별 예약 조회
export const getBookingsByStatus = async (
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
): Promise<BookingDetail[]> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('booking_details')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching bookings by status:', error)
    return []
  }
  
  return data
}

// 예약 가능 여부 확인
export const checkBookingAvailability = async (
  spaceId: string,
  startDate: string,
  endDate: string,
  excludeBookingId?: string
): Promise<boolean> => {
  const supabase = createClient()
  
  let query = supabase
    .from('bookings')
    .select('id')
    .eq('space_id', spaceId)
    .in('status', ['pending', 'confirmed'])
    .or(`start_date.lte.${endDate},end_date.gte.${startDate}`)
  
  if (excludeBookingId) {
    query = query.neq('id', excludeBookingId)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error checking booking availability:', error)
    return false
  }
  
  return data.length === 0
}

// 예약 통계 조회
export const getBookingStats = async (userId?: string) => {
  const supabase = createClient()
  
  let query = supabase
    .from('bookings')
    .select('status, total_price')
  
  if (userId) {
    query = query.eq('user_id', userId)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching booking stats:', error)
    return null
  }
  
  const stats = {
    total: data.length,
    pending: data.filter(b => b.status === 'pending').length,
    confirmed: data.filter(b => b.status === 'confirmed').length,
    cancelled: data.filter(b => b.status === 'cancelled').length,
    completed: data.filter(b => b.status === 'completed').length,
    totalRevenue: data.reduce((sum, b) => sum + (b.total_price || 0), 0)
  }
  
  return stats
}
