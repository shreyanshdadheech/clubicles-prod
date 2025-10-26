// Enhanced TypeScript types for Supabase integration
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
      analytics_cache: {
        Row: {
          id: string
          cache_key: string
          data: Json
          expires_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          cache_key: string
          data: Json
          expires_at: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          cache_key?: string
          data?: Json
          expires_at?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      booking_taxes: {
        Row: {
          id: string
          booking_id: string
          tax_id: string
          tax_name: string
          tax_percentage: number
          tax_amount: number
          base_amount: number
          created_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          tax_id: string
          tax_name: string
          tax_percentage: number
          tax_amount: number
          base_amount: number
          created_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          tax_id?: string
          tax_name?: string
          tax_percentage?: number
          tax_amount?: number
          base_amount?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_taxes_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_taxes_tax_id_fkey"
            columns: ["tax_id"]
            isOneToOne: false
            referencedRelation: "tax_configurations"
            referencedColumns: ["id"]
          }
        ]
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
          base_amount: number
          tax_amount: number | null
          total_amount: number
          owner_payout: number
          status: Database["public"]["Enums"]["booking_status"] | null
          payment_id: string | null
          booking_reference: string | null
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
          base_amount: number
          tax_amount?: number | null
          total_amount: number
          owner_payout: number
          status?: Database["public"]["Enums"]["booking_status"] | null
          payment_id?: string | null
          booking_reference?: string | null
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
          base_amount?: number
          tax_amount?: number | null
          total_amount?: number
          owner_payout?: number
          status?: Database["public"]["Enums"]["booking_status"] | null
          payment_id?: string | null
          booking_reference?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      owner_business_info: {
        Row: {
          id: string
          user_id: string
          company_name: string
          business_type: string
          gst_number: string | null
          pan_number: string | null
          address: string
          contact_email: string
          contact_phone: string
          verification_status: Database["public"]["Enums"]["verification_status"] | null
          verified_at: string | null
          verified_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company_name: string
          business_type: string
          gst_number?: string | null
          pan_number?: string | null
          address: string
          contact_email: string
          contact_phone: string
          verification_status?: Database["public"]["Enums"]["verification_status"] | null
          verified_at?: string | null
          verified_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company_name?: string
          business_type?: string
          gst_number?: string | null
          pan_number?: string | null
          address?: string
          contact_email?: string
          contact_phone?: string
          verification_status?: Database["public"]["Enums"]["verification_status"] | null
          verified_at?: string | null
          verified_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "owner_business_info_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "owner_business_info_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      owner_financials: {
        Row: {
          id: string
          owner_id: string
          total_revenue: number | null
          total_tax_deducted: number | null
          net_profit: number | null
          pending_payout: number | null
          total_bookings: number | null
          last_calculated: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          total_revenue?: number | null
          total_tax_deducted?: number | null
          net_profit?: number | null
          pending_payout?: number | null
          total_bookings?: number | null
          last_calculated?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          total_revenue?: number | null
          total_tax_deducted?: number | null
          net_profit?: number | null
          pending_payout?: number | null
          total_bookings?: number | null
          last_calculated?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "owner_financials_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      owner_payment_info: {
        Row: {
          id: string
          user_id: string
          account_holder_name: string
          bank_name: string
          account_number: string
          ifsc_code: string
          account_type: string
          upi_id: string | null
          payment_schedule: string | null
          minimum_payout: number | null
          tds_deduction: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          account_holder_name: string
          bank_name: string
          account_number: string
          ifsc_code: string
          account_type: string
          upi_id?: string | null
          payment_schedule?: string | null
          minimum_payout?: number | null
          tds_deduction?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          account_holder_name?: string
          bank_name?: string
          account_number?: string
          ifsc_code?: string
          account_type?: string
          upi_id?: string | null
          payment_schedule?: string | null
          minimum_payout?: number | null
          tds_deduction?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "owner_payment_info_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      payments: {
        Row: {
          id: string
          booking_id: string
          razorpay_payment_id: string | null
          razorpay_order_id: string | null
          amount: number
          currency: string | null
          status: Database["public"]["Enums"]["payment_status"] | null
          gateway_response: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          razorpay_payment_id?: string | null
          razorpay_order_id?: string | null
          amount: number
          currency?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          gateway_response?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          razorpay_payment_id?: string | null
          razorpay_order_id?: string | null
          amount?: number
          currency?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          gateway_response?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string | null
          phone: string | null
          avatar_url: string | null
          membership_type: Database["public"]["Enums"]["membership_type"] | null
          professional_role: Database["public"]["Enums"]["professional_role"] | null
          premium_plan: Database["public"]["Enums"]["premium_plan"] | null
          city: string | null
          address: string | null
          pincode: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          membership_type?: Database["public"]["Enums"]["membership_type"] | null
          professional_role?: Database["public"]["Enums"]["professional_role"] | null
          premium_plan?: Database["public"]["Enums"]["premium_plan"] | null
          city?: string | null
          address?: string | null
          pincode?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          membership_type?: Database["public"]["Enums"]["membership_type"] | null
          professional_role?: Database["public"]["Enums"]["professional_role"] | null
          premium_plan?: Database["public"]["Enums"]["premium_plan"] | null
          city?: string | null
          address?: string | null
          pincode?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      reviews: {
        Row: {
          id: string
          user_id: string
          space_id: string
          booking_id: string
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          space_id: string
          booking_id: string
          rating: number
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          space_id?: string
          booking_id?: string
          rating?: number
          comment?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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
          available_seats: number | null
          price_per_hour: number
          price_per_day: number
          amenities: string[] | null
          images: string[] | null
          status: Database["public"]["Enums"]["space_status"] | null
          rating: number | null
          total_bookings: number | null
          revenue: number | null
          hygiene_rating: number | null
          restroom_hygiene: number | null
          operating_hours: Json | null
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
          available_seats?: number | null
          price_per_hour: number
          price_per_day: number
          amenities?: string[] | null
          images?: string[] | null
          status?: Database["public"]["Enums"]["space_status"] | null
          rating?: number | null
          total_bookings?: number | null
          revenue?: number | null
          hygiene_rating?: number | null
          restroom_hygiene?: number | null
          operating_hours?: Json | null
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
          available_seats?: number | null
          price_per_hour?: number
          price_per_day?: number
          amenities?: string[] | null
          images?: string[] | null
          status?: Database["public"]["Enums"]["space_status"] | null
          rating?: number | null
          total_bookings?: number | null
          revenue?: number | null
          hygiene_rating?: number | null
          restroom_hygiene?: number | null
          operating_hours?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "spaces_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      tax_configurations: {
        Row: {
          id: string
          name: string
          percentage: number
          is_enabled: boolean | null
          applies_to: string
          description: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          percentage: number
          is_enabled?: boolean | null
          applies_to: string
          description?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          percentage?: number
          is_enabled?: boolean | null
          applies_to?: string
          description?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tax_configurations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          id: string
          email: string
          role: Database["public"]["Enums"]["user_role"]
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          role?: Database["public"]["Enums"]["user_role"]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: Database["public"]["Enums"]["user_role"]
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      dashboard_stats: {
        Row: {
          total_users: number | null
          total_spaces: number | null
          total_bookings: number | null
          total_revenue: number | null
          new_owners_this_month: number | null
          bookings_this_month: number | null
        }
        Relationships: []
      }
      owner_analytics: {
        Row: {
          owner_id: string | null
          owner_email: string | null
          owner_name: string | null
          total_spaces: number | null
          total_bookings: number | null
          total_revenue: number | null
          average_rating: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_space_rating: {
        Args: {
          space_uuid: string
        }
        Returns: number
      }
    }
    Enums: {
      booking_status: "pending" | "confirmed" | "cancelled" | "completed"
      membership_type: "grey" | "professional"
      payment_status: "pending" | "completed" | "failed" | "refunded"
      premium_plan: "basic" | "premium"
      professional_role: "violet" | "indigo" | "blue" | "green" | "yellow" | "orange" | "red" | "grey" | "white" | "black"
      space_status: "pending" | "approved" | "rejected" | "inactive"
      user_role: "user" | "owner" | "admin"
      verification_status: "pending" | "verified" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
        Database["public"]["Views"])
    ? (Database["public"]["Tables"] &
        Database["public"]["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][PublicEnumNameOrOptions]
    : never
