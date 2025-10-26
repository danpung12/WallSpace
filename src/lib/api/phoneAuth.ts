// src/lib/api/phoneAuth.ts
// 전화번호 인증 관련 API

import { createClient } from '@/lib/supabase/client'

/**
 * 전화번호 형식 검증
 */
export const validatePhoneNumber = (phone: string): boolean => {
  // 한국 전화번호 형식: 010-1234-5678 또는 01012345678
  const phoneRegex = /^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$/
  return phoneRegex.test(phone)
}

/**
 * 전화번호 포맷팅 (국제 형식으로 변환)
 * 010-1234-5678 → +821012345678
 */
export const formatPhoneNumber = (phone: string): string => {
  // 하이픈 제거
  const cleaned = phone.replace(/-/g, '')
  
  // 010으로 시작하면 +82로 변환
  if (cleaned.startsWith('010')) {
    return '+82' + cleaned.substring(1)
  }
  
  // 이미 +82로 시작하면 그대로 반환
  if (cleaned.startsWith('+82')) {
    return cleaned
  }
  
  return '+82' + cleaned
}

/**
 * SMS OTP 발송
 */
export const sendOTP = async (phone: string) => {
  try {
    const supabase = createClient()
    const formattedPhone = formatPhoneNumber(phone)
    
    console.log('📱 Sending OTP to:', formattedPhone)
    
    const { data, error } = await supabase.auth.signInWithOtp({
      phone: formattedPhone,
      options: {
        channel: 'sms',
      }
    })
    
    if (error) {
      console.error('OTP send error:', error)
      throw error
    }
    
    console.log('✅ OTP sent successfully')
    return { success: true, data, error: null }
  } catch (error) {
    console.error('Send OTP error:', error)
    return { success: false, data: null, error }
  }
}

/**
 * OTP 검증 및 로그인/회원가입
 */
export const verifyOTP = async (phone: string, otp: string) => {
  try {
    const supabase = createClient()
    const formattedPhone = formatPhoneNumber(phone)
    
    console.log('🔐 Verifying OTP for:', formattedPhone)
    
    const { data, error } = await supabase.auth.verifyOtp({
      phone: formattedPhone,
      token: otp,
      type: 'sms'
    })
    
    if (error) {
      console.error('OTP verify error:', error)
      throw error
    }
    
    console.log('✅ OTP verified successfully')
    return { success: true, user: data.user, session: data.session, error: null }
  } catch (error) {
    console.error('Verify OTP error:', error)
    return { success: false, user: null, session: null, error }
  }
}

/**
 * 전화번호로 사용자 존재 여부 확인
 */
export const checkPhoneExists = async (phone: string) => {
  try {
    const supabase = createClient()
    const formattedPhone = formatPhoneNumber(phone)
    
    // profiles 테이블에서 전화번호 확인
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, phone')
      .eq('phone', formattedPhone)
      .single()
    
    if (error && error.code !== 'PGRST116') {
      // PGRST116: 데이터 없음 (정상)
      throw error
    }
    
    return { exists: !!data, data, error: null }
  } catch (error) {
    console.error('Check phone exists error:', error)
    return { exists: false, data: null, error }
  }
}

/**
 * 전화번호 인증 후 프로필 업데이트
 */
export const updateProfileWithPhone = async (userId: string, phone: string, additionalData?: {
  name?: string
  nickname?: string
  user_type?: 'artist' | 'guest' | 'manager'
}) => {
  try {
    const supabase = createClient()
    const formattedPhone = formatPhoneNumber(phone)
    
    const updateData: any = {
      phone: formattedPhone,
      updated_at: new Date().toISOString()
    }
    
    if (additionalData) {
      if (additionalData.name) updateData.name = additionalData.name
      if (additionalData.nickname) updateData.nickname = additionalData.nickname
      if (additionalData.user_type) updateData.user_type = additionalData.user_type
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single()
    
    if (error) {
      throw error
    }
    
    console.log('✅ Profile updated with phone:', formattedPhone)
    return { success: true, profile: data, error: null }
  } catch (error) {
    console.error('Update profile with phone error:', error)
    return { success: false, profile: null, error }
  }
}

