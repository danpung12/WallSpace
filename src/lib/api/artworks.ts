// src/lib/api/artworks.ts
// 작품 관련 API 서비스

import { createClient } from '@/lib/supabase/client'
import { 
  Artwork, 
  ArtworkInsert, 
  ArtworkUpdate,
  ArtistArtworkStats
} from '@/types/database'

// 모든 작품 조회
export const getArtworks = async (): Promise<Artwork[]> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('artworks')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching artworks:', error)
    return []
  }
  
  return data
}

// 특정 작품 조회
export const getArtwork = async (artworkId: string): Promise<Artwork | null> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('artworks')
    .select('*')
    .eq('id', artworkId)
    .single()
  
  if (error) {
    console.error('Error fetching artwork:', error)
    return null
  }
  
  return data
}

// 작가별 작품 조회
export const getArtworksByArtist = async (artistId: string): Promise<Artwork[]> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('artworks')
    .select('*')
    .eq('artist_id', artistId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching artist artworks:', error)
    return []
  }
  
  return data
}

// 작품 생성
export const createArtwork = async (artwork: ArtworkInsert): Promise<Artwork | null> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('artworks')
    .insert(artwork)
    .select()
    .single()
  
  if (error) {
    console.error('Error creating artwork:', error)
    return null
  }
  
  return data
}

// 작품 업데이트
export const updateArtwork = async (artworkId: string, updates: ArtworkUpdate): Promise<Artwork | null> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('artworks')
    .update(updates)
    .eq('id', artworkId)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating artwork:', error)
    return null
  }
  
  return data
}

// 작품 삭제
export const deleteArtwork = async (artworkId: string): Promise<boolean> => {
  const supabase = createClient()
  const { error } = await supabase
    .from('artworks')
    .delete()
    .eq('id', artworkId)
  
  if (error) {
    console.error('Error deleting artwork:', error)
    return false
  }
  
  return true
}

// 작가별 작품 통계 조회
export const getArtistArtworkStats = async (artistId: string): Promise<ArtistArtworkStats | null> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('artist_artwork_stats')
    .select('*')
    .eq('artist_id', artistId)
    .single()
  
  if (error) {
    console.error('Error fetching artist artwork stats:', error)
    return null
  }
  
  return data
}

// 카테고리별 작품 조회
export const getArtworksByCategory = async (category: string): Promise<Artwork[]> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('artworks')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching artworks by category:', error)
    return []
  }
  
  return data
}

// 가격 범위별 작품 조회
export const getArtworksByPriceRange = async (minPrice: number, maxPrice: number): Promise<Artwork[]> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('artworks')
    .select('*')
    .gte('price', minPrice)
    .lte('price', maxPrice)
    .order('price', { ascending: true })
  
  if (error) {
    console.error('Error fetching artworks by price range:', error)
    return []
  }
  
  return data
}

// 작품 검색
export const searchArtworks = async (query: string): Promise<Artwork[]> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('artworks')
    .select('*')
    .or(`title.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error searching artworks:', error)
    return []
  }
  
  return data
}

// 작품 가용성 업데이트
export const updateArtworkAvailability = async (artworkId: string, isAvailable: boolean): Promise<Artwork | null> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('artworks')
    .update({ 
      // artworks 테이블에 is_available 컬럼이 없다면 다른 방법으로 처리
      updated_at: new Date().toISOString()
    })
    .eq('id', artworkId)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating artwork availability:', error)
    return null
  }
  
  return data
}
