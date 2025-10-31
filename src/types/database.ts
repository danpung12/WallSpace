// src/types/database.ts
// Supabase 데이터베이스 타입 정의

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          user_type: 'artist' | 'guest' | 'manager'
          bio: string | null
          website: string | null
          phone: string | null
          address: string | null
          dob: string | null
          gender: string | null
          created_at: string
          updated_at: string
          nickname: string | null
          name: string | null
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          user_type?: 'artist' | 'guest' | 'manager'
          bio?: string | null
          website?: string | null
          phone?: string | null
          address?: string | null
          dob?: string | null
          gender?: string | null
          created_at?: string
          updated_at?: string
          nickname?: string | null
          name?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          user_type?: 'artist' | 'guest' | 'manager'
          bio?: string | null
          website?: string | null
          phone?: string | null
          address?: string | null
          dob?: string | null
          gender?: string | null
          created_at?: string
          updated_at?: string
          nickname?: string | null
          name?: string | null
        }
      }
      locations: {
        Row: {
          id: string
          name: string
          address: string | null
          lat: number
          lng: number
          description: string | null
          images: string[] | null
          total_slots: number
          reserved_slots: number
          status: 'available' | 'occupied' | 'maintenance'
          type: 'gallery' | 'cafe' | 'cultural_center'
          created_at: string
          updated_at: string
          category_id: string | null
          phone: string | null
          status_text: string | null
          status_color: string | null
        }
        Insert: {
          id?: string
          name: string
          address?: string | null
          lat: number
          lng: number
          description?: string | null
          images?: string[] | null
          total_slots?: number
          reserved_slots?: number
          status?: 'available' | 'occupied' | 'maintenance'
          type?: 'gallery' | 'cafe' | 'cultural_center'
          created_at?: string
          updated_at?: string
          category_id?: string | null
          phone?: string | null
          status_text?: string | null
          status_color?: string | null
        }
        Update: {
          id?: string
          name?: string
          address?: string | null
          lat?: number
          lng?: number
          description?: string | null
          images?: string[] | null
          total_slots?: number
          reserved_slots?: number
          status?: 'available' | 'occupied' | 'maintenance'
          type?: 'gallery' | 'cafe' | 'cultural_center'
          created_at?: string
          updated_at?: string
          category_id?: string | null
          phone?: string | null
          status_text?: string | null
          status_color?: string | null
        }
      }
      spaces: {
        Row: {
          id: string
          location_id: string | null
          name: string
          size: string | null
          price: number | null
          description: string | null
          images: string[] | null
          amenities: string[] | null
          is_reserved: boolean
          max_artworks: number
          current_reservations: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          location_id?: string | null
          name: string
          size?: string | null
          price?: number | null
          description?: string | null
          images?: string[] | null
          amenities?: string[] | null
          is_reserved?: boolean
          max_artworks?: number
          current_reservations?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          location_id?: string | null
          name?: string
          size?: string | null
          price?: number | null
          description?: string | null
          images?: string[] | null
          amenities?: string[] | null
          is_reserved?: boolean
          max_artworks?: number
          current_reservations?: number
          created_at?: string
          updated_at?: string
        }
      }
      artworks: {
        Row: {
          id: string
          artist_id: string | null
          title: string
          description: string | null
          dimensions: string | null
          price: number | null
          image_url: string | null
          alt_text: string | null
          category: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          artist_id?: string | null
          title: string
          description?: string | null
          dimensions?: string | null
          price?: number | null
          image_url?: string | null
          alt_text?: string | null
          category?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          artist_id?: string | null
          title?: string
          description?: string | null
          dimensions?: string | null
          price?: number | null
          image_url?: string | null
          alt_text?: string | null
          category?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      reservations: {
        Row: {
          id: string
          artist_id: string | null
          location_id: string | null
          space_id: string | null
          artwork_id: string | null
          start_date: string
          end_date: string
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          total_price: number | null
          rejection_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          artist_id?: string | null
          location_id?: string | null
          space_id?: string | null
          artwork_id?: string | null
          start_date: string
          end_date: string
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          total_price?: number | null
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          artist_id?: string | null
          location_id?: string | null
          space_id?: string | null
          artwork_id?: string | null
          start_date?: string
          end_date?: string
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          total_price?: number | null
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          user_id: string | null
          location_id: string | null
          booking_id: string | null
          rating: number | null
          comment: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          location_id?: string | null
          booking_id?: string | null
          rating?: number | null
          comment?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          location_id?: string | null
          booking_id?: string | null
          rating?: number | null
          comment?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
        }
      }
      tags: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      location_options: {
        Row: {
          id: string
          location_id: string | null
          parking: boolean
          pets: boolean
          twenty_four_hours: boolean
          created_at: string
        }
        Insert: {
          id?: string
          location_id?: string | null
          parking?: boolean
          pets?: boolean
          twenty_four_hours?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          location_id?: string | null
          parking?: boolean
          pets?: boolean
          twenty_four_hours?: boolean
          created_at?: string
        }
      }
      location_images: {
        Row: {
          id: string
          location_id: string | null
          image_url: string
          alt_text: string | null
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          location_id?: string | null
          image_url: string
          alt_text?: string | null
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          location_id?: string | null
          image_url?: string
          alt_text?: string | null
          sort_order?: number
          created_at?: string
        }
      }
      location_tags: {
        Row: {
          location_id: string
          tag_id: string
        }
        Insert: {
          location_id: string
          tag_id: string
        }
        Update: {
          location_id?: string
          tag_id?: string
        }
      }
      location_sns: {
        Row: {
          id: string
          location_id: string | null
          platform: string
          url: string
          created_at: string
        }
        Insert: {
          id?: string
          location_id?: string | null
          platform: string
          url: string
          created_at?: string
        }
        Update: {
          id?: string
          location_id?: string | null
          platform?: string
          url?: string
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string | null
          type: string
          title: string
          message: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          type: string
          title: string
          message: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          type?: string
          title?: string
          message?: string
          is_read?: boolean
          created_at?: string
        }
      }
      notification_settings: {
        Row: {
          id: string
          user_id: string | null
          comments: boolean
          exhibitions: boolean
          messages: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          comments?: boolean
          exhibitions?: boolean
          messages?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          comments?: boolean
          exhibitions?: boolean
          messages?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_settings: {
        Row: {
          id: string
          user_id: string | null
          dark_mode: boolean
          language: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          dark_mode?: boolean
          language?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          dark_mode?: boolean
          language?: string
          created_at?: string
          updated_at?: string
        }
      }
      inquiries: {
        Row: {
          id: string
          user_id: string
          subject: 'payment_error' | 'reservation_error' | 'general' | 'other'
          content: string
          status: 'pending' | 'in_progress' | 'resolved' | 'closed'
          admin_reply: string | null
          created_at: string
          updated_at: string
          resolved_at: string | null
          user?: {
            email: string
            name: string | null
            nickname: string | null
          }
        }
        Insert: {
          id?: string
          user_id: string
          subject: 'payment_error' | 'reservation_error' | 'general' | 'other'
          content: string
          status?: 'pending' | 'in_progress' | 'resolved' | 'closed'
          admin_reply?: string | null
          created_at?: string
          updated_at?: string
          resolved_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          subject?: 'payment_error' | 'reservation_error' | 'general' | 'other'
          content?: string
          status?: 'pending' | 'in_progress' | 'resolved' | 'closed'
          admin_reply?: string | null
          created_at?: string
          updated_at?: string
          resolved_at?: string | null
        }
      }
    }
    Views: {
      location_details: {
        Row: {
          id: string
          name: string
          address: string | null
          lat: number
          lng: number
          description: string | null
          total_slots: number
          reserved_slots: number
          status: string
          type: string
          created_at: string
          updated_at: string
          category_id: string | null
          phone: string | null
          status_text: string | null
          status_color: string | null
          category_name: string | null
          parking: boolean | null
          pets: boolean | null
          twenty_four_hours: boolean | null
          tags: string[] | null
          location_images: string[] | null
        }
      }
      reservation_details: {
        Row: {
          id: string
          artist_id: string | null
          location_id: string | null
          space_id: string | null
          artwork_id: string | null
          start_date: string
          end_date: string
          status: string
          total_price: number | null
          rejection_reason: string | null
          created_at: string
          updated_at: string
          artist_name: string | null
          artist_nickname: string | null
          location_name: string | null
          location_address: string | null
          space_name: string | null
          artwork_title: string | null
          artwork_image: string | null
          location?: any
          space?: any
          artwork?: any
          artist?: any
        }
      }
      artist_artwork_stats: {
        Row: {
          artist_id: string
          artist_name: string | null
          total_artworks: number
          priced_artworks: number
          average_price: number | null
          latest_artwork_date: string | null
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// 편의를 위한 타입 별칭들
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Location = Database['public']['Tables']['locations']['Row']
export type Space = Database['public']['Tables']['spaces']['Row']
export type Artwork = Database['public']['Tables']['artworks']['Row']
export type Booking = Database['public']['Tables']['reservations']['Row']
export type Reservation = Database['public']['Tables']['reservations']['Row']
export type Review = Database['public']['Tables']['reviews']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type Tag = Database['public']['Tables']['tags']['Row']
export type LocationOption = Database['public']['Tables']['location_options']['Row']
export type LocationImage = Database['public']['Tables']['location_images']['Row']
export type LocationSNS = Database['public']['Tables']['location_sns']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']
export type NotificationSetting = Database['public']['Tables']['notification_settings']['Row']
export type UserSetting = Database['public']['Tables']['user_settings']['Row']

// 뷰 타입들
export type LocationDetail = Database['public']['Views']['location_details']['Row']
export type BookingDetail = Database['public']['Views']['reservation_details']['Row']
export type ReservationDetail = Database['public']['Views']['reservation_details']['Row']
export type ArtistArtworkStats = Database['public']['Views']['artist_artwork_stats']['Row']

// 인서트 타입들
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type LocationInsert = Database['public']['Tables']['locations']['Insert']
export type SpaceInsert = Database['public']['Tables']['spaces']['Insert']
export type ArtworkInsert = Database['public']['Tables']['artworks']['Insert']
export type BookingInsert = Database['public']['Tables']['reservations']['Insert']
export type ReservationInsert = Database['public']['Tables']['reservations']['Insert']
export type ReviewInsert = Database['public']['Tables']['reviews']['Insert']

// 업데이트 타입들
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type LocationUpdate = Database['public']['Tables']['locations']['Update']
export type SpaceUpdate = Database['public']['Tables']['spaces']['Update']
export type ArtworkUpdate = Database['public']['Tables']['artworks']['Update']
export type BookingUpdate = Database['public']['Tables']['reservations']['Update']
export type ReservationUpdate = Database['public']['Tables']['reservations']['Update']
export type ReviewUpdate = Database['public']['Tables']['reviews']['Update']