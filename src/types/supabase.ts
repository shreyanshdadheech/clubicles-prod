export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          role: 'user' | 'owner' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          role?: 'user' | 'owner' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'user' | 'owner' | 'admin'
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string | null
          phone: string | null
          avatar_url: string | null
          membership_type: 'grey' | 'vibgyor' | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          membership_type?: 'grey' | 'vibgyor' | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          membership_type?: 'grey' | 'vibgyor' | null
          created_at?: string
          updated_at?: string
        }
      }
      spaces: {
        Row: {
          id: string
          owner_id: string
          name: string
          description: string
          address: string
          city: string
          pincode: string
          latitude: number | null
          longitude: number | null
          total_seats: number
          available_seats: number
          price_per_hour: number
          price_per_day: number
          amenities: string[]
          images: string[]
          status: 'pending' | 'approved' | 'rejected' | 'inactive'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          description: string
          address: string
          city: string
          pincode: string
          latitude?: number | null
          longitude?: number | null
          total_seats: number
          available_seats?: number
          price_per_hour: number
          price_per_day: number
          amenities?: string[]
          images?: string[]
          status?: 'pending' | 'approved' | 'rejected' | 'inactive'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          description?: string
          address?: string
          city?: string
          pincode?: string
          latitude?: number | null
          longitude?: number | null
          total_seats?: number
          available_seats?: number
          price_per_hour?: number
          price_per_day?: number
          amenities?: string[]
          images?: string[]
          status?: 'pending' | 'approved' | 'rejected' | 'inactive'
          created_at?: string
          updated_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          user_id: string
          space_id: string
          start_time: string
          end_time: string
          date: string
          seats_booked: number
          total_amount: number
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          payment_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          space_id: string
          start_time: string
          end_time: string
          date: string
          seats_booked: number
          total_amount: number
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          payment_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          space_id?: string
          start_time?: string
          end_time?: string
          date?: string
          seats_booked?: number
          total_amount?: number
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          payment_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          booking_id: string
          razorpay_payment_id: string | null
          razorpay_order_id: string | null
          amount: number
          currency: string
          status: 'pending' | 'completed' | 'failed' | 'refunded'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          razorpay_payment_id?: string | null
          razorpay_order_id?: string | null
          amount: number
          currency?: string
          status?: 'pending' | 'completed' | 'failed' | 'refunded'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          razorpay_payment_id?: string | null
          razorpay_order_id?: string | null
          amount?: number
          currency?: string
          status?: 'pending' | 'completed' | 'failed' | 'refunded'
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
