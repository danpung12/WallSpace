// src/lib/api/locations.ts
// 공간 관련 API 서비스

import { createClient } from '@/lib/supabase/client'
import { 
  Location, 
  LocationInsert, 
  LocationUpdate, 
  LocationDetail,
  Category,
  Tag,
  LocationOption,
  LocationImage,
  LocationSNS,
  Space,
  SpaceInsert,
  SpaceUpdate
} from '@/types/database'

// 모든 공간 조회 (상세 정보 포함)
export const getLocations = async (): Promise<LocationDetail[]> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('location_details')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching locations:', error)
    return []
  }
  
  return data
}

// 특정 공간 조회
export const getLocation = async (locationId: string): Promise<LocationDetail | null> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('location_details')
    .select('*')
    .eq('id', locationId)
    .single()
  
  if (error) {
    console.error('Error fetching location:', error)
    return null
  }
  
  return data
}

// 공간 생성
export const createLocation = async (location: LocationInsert): Promise<Location | null> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('locations')
    .insert(location)
    .select()
    .single()
  
  if (error) {
    console.error('Error creating location:', error)
    return null
  }
  
  return data
}

// 공간 업데이트
export const updateLocation = async (locationId: string, updates: LocationUpdate): Promise<Location | null> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('locations')
    .update(updates)
    .eq('id', locationId)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating location:', error)
    return null
  }
  
  return data
}

// 공간 삭제
export const deleteLocation = async (locationId: string): Promise<boolean> => {
  const supabase = createClient()
  const { error } = await supabase
    .from('locations')
    .delete()
    .eq('id', locationId)
  
  if (error) {
    console.error('Error deleting location:', error)
    return false
  }
  
  return true
}

// 카테고리 조회
export const getCategories = async (): Promise<Category[]> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')
  
  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }
  
  return data
}

// 태그 조회
export const getTags = async (): Promise<Tag[]> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .order('name')
  
  if (error) {
    console.error('Error fetching tags:', error)
    return []
  }
  
  return data
}

// 공간 옵션 조회
export const getLocationOptions = async (locationId: string): Promise<LocationOption | null> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('location_options')
    .select('*')
    .eq('location_id', locationId)
    .single()
  
  if (error) {
    console.error('Error fetching location options:', error)
    return null
  }
  
  return data
}

// 공간 이미지 조회
export const getLocationImages = async (locationId: string): Promise<LocationImage[]> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('location_images')
    .select('*')
    .eq('location_id', locationId)
    .order('sort_order')
  
  if (error) {
    console.error('Error fetching location images:', error)
    return []
  }
  
  return data
}

// 공간 SNS 링크 조회
export const getLocationSNS = async (locationId: string): Promise<LocationSNS[]> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('location_sns')
    .select('*')
    .eq('location_id', locationId)
  
  if (error) {
    console.error('Error fetching location SNS:', error)
    return []
  }
  
  return data
}

// 공간 내 세부 공간 조회
export const getSpaces = async (locationId: string): Promise<Space[]> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('spaces')
    .select('*')
    .eq('location_id', locationId)
    .order('created_at')
  
  if (error) {
    console.error('Error fetching spaces:', error)
    return []
  }
  
  return data
}

// 세부 공간 생성
export const createSpace = async (space: SpaceInsert): Promise<Space | null> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('spaces')
    .insert(space)
    .select()
    .single()
  
  if (error) {
    console.error('Error creating space:', error)
    return null
  }
  
  return data
}

// 세부 공간 업데이트
export const updateSpace = async (spaceId: string, updates: SpaceUpdate): Promise<Space | null> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('spaces')
    .update(updates)
    .eq('id', spaceId)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating space:', error)
    return null
  }
  
  return data
}

// 위치 기반 공간 검색
export const searchLocationsByLocation = async (
  lat: number, 
  lng: number, 
  radius: number = 10
): Promise<LocationDetail[]> => {
  const supabase = createClient()
  
  // PostGIS를 사용한 반경 검색 (실제 구현에서는 PostGIS 함수 사용)
  const { data, error } = await supabase
    .from('location_details')
    .select('*')
    .eq('status', 'available')
  
  if (error) {
    console.error('Error searching locations:', error)
    return []
  }
  
  // 클라이언트 사이드에서 거리 계산 (실제로는 서버 사이드에서 처리하는 것이 좋음)
  const filteredData = data?.filter(location => {
    const distance = calculateDistance(lat, lng, location.lat, location.lng)
    return distance <= radius
  }) || []
  
  return filteredData
}

// 거리 계산 헬퍼 함수
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371 // 지구 반지름 (km)
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}
