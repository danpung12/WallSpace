// src/lib/api/notifications.ts
// 알림 관련 API 서비스

import { createClient } from '@/lib/supabase/client'
import { 
  Notification, 
  NotificationInsert, 
  NotificationUpdate,
  NotificationSetting,
  UserSetting
} from '@/types/database'

// 사용자 알림 조회
export const getNotifications = async (userId: string): Promise<Notification[]> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching notifications:', error)
    return []
  }
  
  return data
}

// 읽지 않은 알림 조회
export const getUnreadNotifications = async (userId: string): Promise<Notification[]> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .eq('is_read', false)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching unread notifications:', error)
    return []
  }
  
  return data
}

// 알림 생성
export const createNotification = async (notification: NotificationInsert): Promise<Notification | null> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('notifications')
    .insert(notification)
    .select()
    .single()
  
  if (error) {
    console.error('Error creating notification:', error)
    return null
  }
  
  return data
}

// 알림 읽음 처리
export const markNotificationAsRead = async (notificationId: string): Promise<Notification | null> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .select()
    .single()
  
  if (error) {
    console.error('Error marking notification as read:', error)
    return null
  }
  
  return data
}

// 모든 알림 읽음 처리
export const markAllNotificationsAsRead = async (userId: string): Promise<boolean> => {
  const supabase = createClient()
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false)
  
  if (error) {
    console.error('Error marking all notifications as read:', error)
    return false
  }
  
  return true
}

// 알림 삭제
export const deleteNotification = async (notificationId: string): Promise<boolean> => {
  const supabase = createClient()
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId)
  
  if (error) {
    console.error('Error deleting notification:', error)
    return false
  }
  
  return true
}

// 사용자 알림 설정 조회
export const getNotificationSettings = async (userId: string): Promise<NotificationSetting | null> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('notification_settings')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  if (error) {
    console.error('Error fetching notification settings:', error)
    return null
  }
  
  return data
}

// 사용자 알림 설정 생성/업데이트
export const updateNotificationSettings = async (
  userId: string, 
  settings: {
    comments?: boolean
    exhibitions?: boolean
    messages?: boolean
  }
): Promise<NotificationSetting | null> => {
  const supabase = createClient()
  
  // 기존 설정이 있는지 확인
  const { data: existing } = await supabase
    .from('notification_settings')
    .select('id')
    .eq('user_id', userId)
    .single()
  
  if (existing) {
    // 업데이트
    const { data, error } = await supabase
      .from('notification_settings')
      .update(settings)
      .eq('user_id', userId)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating notification settings:', error)
      return null
    }
    
    return data
  } else {
    // 생성
    const { data, error } = await supabase
      .from('notification_settings')
      .insert({
        user_id: userId,
        ...settings
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error creating notification settings:', error)
      return null
    }
    
    return data
  }
}

// 사용자 설정 조회
export const getUserSettings = async (userId: string): Promise<UserSetting | null> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  if (error) {
    console.error('Error fetching user settings:', error)
    return null
  }
  
  return data
}

// 사용자 설정 생성/업데이트
export const updateUserSettings = async (
  userId: string, 
  settings: {
    dark_mode?: boolean
    language?: string
  }
): Promise<UserSetting | null> => {
  const supabase = createClient()
  
  // 기존 설정이 있는지 확인
  const { data: existing } = await supabase
    .from('user_settings')
    .select('id')
    .eq('user_id', userId)
    .single()
  
  if (existing) {
    // 업데이트
    const { data, error } = await supabase
      .from('user_settings')
      .update(settings)
      .eq('user_id', userId)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating user settings:', error)
      return null
    }
    
    return data
  } else {
    // 생성
    const { data, error } = await supabase
      .from('user_settings')
      .insert({
        user_id: userId,
        ...settings
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error creating user settings:', error)
      return null
    }
    
    return data
  }
}

// 알림 전송 (시스템 알림)
export const sendSystemNotification = async (
  userId: string,
  type: string,
  title: string,
  message: string
): Promise<Notification | null> => {
  const notification: NotificationInsert = {
    user_id: userId,
    type,
    title,
    message,
    is_read: false
  }
  
  return await createNotification(notification)
}

// 예약 관련 알림 전송
export const sendBookingNotification = async (
  userId: string,
  bookingId: string,
  type: 'reservation_confirmed' | 'reservation_cancelled' | 'exhibition_reminder',
  title: string,
  message: string
): Promise<Notification | null> => {
  return await sendSystemNotification(userId, type, title, message)
}
