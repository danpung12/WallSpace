// src/lib/api/reviews.ts
// 리뷰 관련 API 서비스

import { createClient } from '@/lib/supabase/client'
import { 
  Review, 
  ReviewInsert, 
  ReviewUpdate
} from '@/types/database'

// 모든 리뷰 조회
export const getReviews = async (): Promise<Review[]> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching reviews:', error)
    return []
  }
  
  return data
}

// 특정 리뷰 조회
export const getReview = async (reviewId: string): Promise<Review | null> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('id', reviewId)
    .single()
  
  if (error) {
    console.error('Error fetching review:', error)
    return null
  }
  
  return data
}

// 공간별 리뷰 조회
export const getReviewsByLocation = async (locationId: string): Promise<Review[]> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('location_id', locationId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching location reviews:', error)
    return []
  }
  
  return data
}

// 사용자별 리뷰 조회
export const getReviewsByUser = async (userId: string): Promise<Review[]> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching user reviews:', error)
    return []
  }
  
  return data
}

// 예약별 리뷰 조회
export const getReviewsByBooking = async (bookingId: string): Promise<Review[]> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('booking_id', bookingId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching booking reviews:', error)
    return []
  }
  
  return data
}

// 리뷰 생성
export const createReview = async (review: ReviewInsert): Promise<Review | null> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('reviews')
    .insert(review)
    .select()
    .single()
  
  if (error) {
    console.error('Error creating review:', error)
    return null
  }
  
  return data
}

// 리뷰 업데이트
export const updateReview = async (reviewId: string, updates: ReviewUpdate): Promise<Review | null> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('reviews')
    .update(updates)
    .eq('id', reviewId)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating review:', error)
    return null
  }
  
  return data
}

// 리뷰 삭제
export const deleteReview = async (reviewId: string): Promise<boolean> => {
  const supabase = createClient()
  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', reviewId)
  
  if (error) {
    console.error('Error deleting review:', error)
    return false
  }
  
  return true
}

// 공간별 평균 평점 조회
export const getLocationAverageRating = async (locationId: string): Promise<number | null> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('reviews')
    .select('rating')
    .eq('location_id', locationId)
    .not('rating', 'is', null)
  
  if (error) {
    console.error('Error fetching location average rating:', error)
    return null
  }
  
  if (data.length === 0) {
    return null
  }
  
  const average = data.reduce((sum, review) => sum + (review.rating || 0), 0) / data.length
  return Math.round(average * 10) / 10 // 소수점 둘째 자리까지 반올림
}

// 공간별 리뷰 통계 조회
export const getLocationReviewStats = async (locationId: string) => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('reviews')
    .select('rating')
    .eq('location_id', locationId)
    .not('rating', 'is', null)
  
  if (error) {
    console.error('Error fetching location review stats:', error)
    return null
  }
  
  if (data.length === 0) {
    return {
      totalReviews: 0,
      averageRating: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    }
  }
  
  const ratings = data.map(r => r.rating || 0)
  const totalReviews = ratings.length
  const averageRating = ratings.reduce((sum, rating) => sum + rating, 0) / totalReviews
  
  const ratingDistribution = ratings.reduce((dist, rating) => {
    dist[rating] = (dist[rating] || 0) + 1
    return dist
  }, {} as Record<number, number>)
  
  return {
    totalReviews,
    averageRating: Math.round(averageRating * 10) / 10,
    ratingDistribution
  }
}

// 평점별 리뷰 조회
export const getReviewsByRating = async (rating: number): Promise<Review[]> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('rating', rating)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching reviews by rating:', error)
    return []
  }
  
  return data
}
