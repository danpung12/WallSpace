// lib/supabase/client.js
import { createBrowserClient } from '@supabase/ssr'

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

// 타입 정의를 위한 추가 함수들
export const getSupabaseUrl = () => process.env.NEXT_PUBLIC_SUPABASE_URL
export const getSupabaseAnonKey = () => process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 인증 관련 헬퍼 함수들
export const signUp = async (email, password, userData) => {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        ...userData,
        // Supabase Auth의 Display name으로 표시될 필드
        full_name: userData.full_name,
        name: userData.full_name, // 일부 Supabase 버전은 'name'을 사용
      }
    }
  })
  return { data, error }
}

export const signIn = async (email, password) => {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

export const signOut = async () => {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}