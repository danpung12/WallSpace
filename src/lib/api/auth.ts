// src/lib/api/auth.ts
// 인증 관련 API 서비스

import { createClient, signUp, signIn, signOut, getCurrentUser } from '@/lib/supabase/client'
import { Profile, ProfileInsert, ProfileUpdate } from '@/types/database'

// 사용자 프로필 조회
export const getProfile = async (userId: string): Promise<Profile | null> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }
  
  return data
}

// 사용자 프로필 생성
export const createProfile = async (profile: ProfileInsert): Promise<Profile | null> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('profiles')
    .insert(profile)
    .select()
    .single()
  
  if (error) {
    console.error('Error creating profile:', error)
    return null
  }
  
  return data
}

// 사용자 프로필 업데이트
export const updateProfile = async (userId: string, updates: ProfileUpdate): Promise<Profile | null> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating profile:', error)
    return null
  }
  
  return data
}

// 사용자 등록 (회원가입)
export const registerUser = async (
  email: string, 
  password: string, 
  userData: {
    full_name: string
    nickname: string
    user_type: 'artist' | 'guest' | 'manager'
    phone?: string
  }
) => {
  try {
    // 1. Supabase Auth에 사용자 등록
    const { data: authData, error: authError } = await signUp(email, password, userData)
    
    if (authError) {
      throw authError
    }

    if (!authData.user) {
      throw new Error('User creation failed')
    }

    // 2. 프로필 생성
    const profileData: ProfileInsert = {
      id: authData.user.id,
      email: authData.user.email!,
      full_name: userData.full_name,
      nickname: userData.nickname,
      user_type: userData.user_type,
      phone: userData.phone || null
    }

    const profile = await createProfile(profileData)
    
    return { user: authData.user, profile, error: null }
  } catch (error) {
    console.error('Registration error:', error)
    return { user: null, profile: null, error }
  }
}

// 사용자 로그인
export const loginUser = async (email: string, password: string) => {
  try {
    const { data, error } = await signIn(email, password)
    
    if (error) {
      throw error
    }

    if (!data.user) {
      throw new Error('Login failed')
    }

    // 프로필 정보도 함께 가져오기
    const profile = await getProfile(data.user.id)
    
    return { user: data.user, profile, error: null }
  } catch (error) {
    console.error('Login error:', error)
    return { user: null, profile: null, error }
  }
}

// 사용자 로그아웃
export const logoutUser = async () => {
  try {
    const { error } = await signOut()
    
    if (error) {
      throw error
    }
    
    return { error: null }
  } catch (error) {
    console.error('Logout error:', error)
    return { error }
  }
}

// 현재 사용자 정보 가져오기
export const getCurrentUserWithProfile = async () => {
  try {
    const { user, error: userError } = await getCurrentUser()
    
    if (userError || !user) {
      return { user: null, profile: null, error: userError }
    }

    const profile = await getProfile(user.id)
    
    return { user, profile, error: null }
  } catch (error) {
    console.error('Get current user error:', error)
    return { user: null, profile: null, error }
  }
}
