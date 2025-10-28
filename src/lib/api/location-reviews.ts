// src/lib/api/location-reviews.ts
// 장소 리뷰 관련 API 서비스

import { createClient } from '@/lib/supabase/client'

export interface LocationReview {
  id: string
  location_id: string
  artist_id: string
  reservation_id: string | null
  rating: number | null
  comment: string | null
  created_at: string
  artist?: {
    id: string
    name: string | null
    nickname: string | null
    avatar_url: string | null
  }
}

export interface CreateLocationReviewData {
  location_id: string
  artist_id: string
  reservation_id?: string | null
  rating?: number | null
  comment: string
}

// 장소별 리뷰 조회 (작성자 정보 포함)
export const getLocationReviews = async (locationId: string): Promise<LocationReview[]> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('location_reviews')
    .select(`
      *,
      artist:profiles!location_reviews_artist_id_fkey (
        id,
        name,
        nickname,
        avatar_url
      )
    `)
    .eq('location_id', locationId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching location reviews:', error)
    return []
  }
  
  return data as LocationReview[]
}

// 사용자가 특정 장소에 리뷰를 남겼는지 확인
export const checkUserReviewExists = async (
  locationId: string, 
  userId: string
): Promise<boolean> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('location_reviews')
    .select('id')
    .eq('location_id', locationId)
    .eq('artist_id', userId)
    .maybeSingle()
  
  if (error) {
    console.error('Error checking user review:', error)
    return false
  }
  
  return !!data
}

// 리뷰 생성
export const createLocationReview = async (
  reviewData: CreateLocationReviewData
): Promise<LocationReview | null> => {
  const supabase = createClient()
  
  // 이미 리뷰를 작성했는지 확인
  const exists = await checkUserReviewExists(reviewData.location_id, reviewData.artist_id)
  if (exists) {
    console.error('User has already submitted a review for this location')
    return null
  }
  
  const { data, error } = await supabase
    .from('location_reviews')
    .insert({
      location_id: reviewData.location_id,
      artist_id: reviewData.artist_id,
      reservation_id: reviewData.reservation_id || null,
      rating: reviewData.rating || null,
      comment: reviewData.comment
    })
    .select(`
      *,
      artist:profiles!location_reviews_artist_id_fkey (
        id,
        name,
        nickname,
        avatar_url
      )
    `)
    .single()
  
  if (error) {
    console.error('Error creating location review:', error)
    return null
  }
  
  return data as LocationReview
}

// 리뷰 삭제
export const deleteLocationReview = async (reviewId: string): Promise<boolean> => {
  const supabase = createClient()
  const { error } = await supabase
    .from('location_reviews')
    .delete()
    .eq('id', reviewId)
  
  if (error) {
    console.error('Error deleting location review:', error)
    return false
  }
  
  return true
}

// 장소 평균 평점 조회
export const getLocationAverageRating = async (locationId: string): Promise<number | null> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('location_reviews')
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
  return Math.round(average * 10) / 10
}





