export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          artist_id: string
          artist_notes: string | null
          booking_date: string
          client_id: string
          client_notes: string | null
          created_at: string
          id: string
          negotiated_price: number | null
          original_price: number
          platform_fee: number | null
          service_id: string
          status: string
          travel_address: string | null
          updated_at: string
        }
        Insert: {
          artist_id: string
          artist_notes?: string | null
          booking_date: string
          client_id: string
          client_notes?: string | null
          created_at?: string
          id?: string
          negotiated_price?: number | null
          original_price: number
          platform_fee?: number | null
          service_id: string
          status?: string
          travel_address?: string | null
          updated_at?: string
        }
        Update: {
          artist_id?: string
          artist_notes?: string | null
          booking_date?: string
          client_id?: string
          client_notes?: string | null
          created_at?: string
          id?: string
          negotiated_price?: number | null
          original_price?: number
          platform_fee?: number | null
          service_id?: string
          status?: string
          travel_address?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "bookings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      makeupstudioappschema: {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_name: string | null
          account_number: string | null
          bank_name: string | null
          bio: string | null
          created_at: string
          facebook_page: string | null
          first_name: string | null
          id: string
          instagram_handle: string | null
          is_verified: boolean | null
          last_name: string | null
          location_city: string | null
          location_country: string | null
          location_state: string | null
          phone_number: string | null
          profile_picture_url: string | null
          subscription_active: boolean | null
          subscription_expires_at: string | null
          updated_at: string
          user_id: string
          user_type: string
          work_address: string | null
        }
        Insert: {
          account_name?: string | null
          account_number?: string | null
          bank_name?: string | null
          bio?: string | null
          created_at?: string
          facebook_page?: string | null
          first_name?: string | null
          id?: string
          instagram_handle?: string | null
          is_verified?: boolean | null
          last_name?: string | null
          location_city?: string | null
          location_country?: string | null
          location_state?: string | null
          phone_number?: string | null
          profile_picture_url?: string | null
          subscription_active?: boolean | null
          subscription_expires_at?: string | null
          updated_at?: string
          user_id: string
          user_type: string
          work_address?: string | null
        }
        Update: {
          account_name?: string | null
          account_number?: string | null
          bank_name?: string | null
          bio?: string | null
          created_at?: string
          facebook_page?: string | null
          first_name?: string | null
          id?: string
          instagram_handle?: string | null
          is_verified?: boolean | null
          last_name?: string | null
          location_city?: string | null
          location_country?: string | null
          location_state?: string | null
          phone_number?: string | null
          profile_picture_url?: string | null
          subscription_active?: boolean | null
          subscription_expires_at?: string | null
          updated_at?: string
          user_id?: string
          user_type?: string
          work_address?: string | null
        }
        Relationships: []
      }
      ratings: {
        Row: {
          artist_id: string
          booking_id: string
          client_id: string
          comment: string | null
          created_at: string
          id: string
          rating: number
          tip_amount: number | null
        }
        Insert: {
          artist_id: string
          booking_id: string
          client_id: string
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          tip_amount?: number | null
        }
        Update: {
          artist_id?: string
          booking_id?: string
          client_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          tip_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ratings_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ratings_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      services: {
        Row: {
          artist_id: string
          base_price: number
          created_at: string
          description: string | null
          id: string
          includes_bridal_shower: boolean | null
          max_people: number | null
          service_name: string
          service_type: string
          travel_required: boolean | null
          updated_at: string
        }
        Insert: {
          artist_id: string
          base_price: number
          created_at?: string
          description?: string | null
          id?: string
          includes_bridal_shower?: boolean | null
          max_people?: number | null
          service_name: string
          service_type: string
          travel_required?: boolean | null
          updated_at?: string
        }
        Update: {
          artist_id?: string
          base_price?: number
          created_at?: string
          description?: string | null
          id?: string
          includes_bridal_shower?: boolean | null
          max_people?: number | null
          service_name?: string
          service_type?: string
          travel_required?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
