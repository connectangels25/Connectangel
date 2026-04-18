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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      events: {
        Row: {
          agenda: Json | null
          agree_terms: boolean | null
          arrival_instructions: string | null
          banner_url: string | null
          category: string
          created_at: string
          deadline_date: string | null
          deadline_time: string | null
          end_date: string | null
          end_time: string | null
          event_link: string | null
          event_mode: string
          faqs: Json | null
          full_description: string | null
          id: string
          location_type: string | null
          max_team_size: string | null
          organizer_logo_url: string | null
          organizer_name: string
          prizes: string | null
          room_floor: string | null
          short_summary: string | null
          show_timezone: boolean | null
          speakers: Json | null
          start_date: string | null
          start_time: string | null
          status: string
          support_email: string | null
          support_phone: string | null
          tags: string[] | null
          tickets: Json | null
          title: string
          total_capacity: string | null
          updated_at: string
          user_id: string
          venue_address: string | null
          venue_name: string | null
        }
        Insert: {
          agenda?: Json | null
          agree_terms?: boolean | null
          arrival_instructions?: string | null
          banner_url?: string | null
          category?: string
          created_at?: string
          deadline_date?: string | null
          deadline_time?: string | null
          end_date?: string | null
          end_time?: string | null
          event_link?: string | null
          event_mode?: string
          faqs?: Json | null
          full_description?: string | null
          id?: string
          location_type?: string | null
          max_team_size?: string | null
          organizer_logo_url?: string | null
          organizer_name: string
          prizes?: string | null
          room_floor?: string | null
          short_summary?: string | null
          show_timezone?: boolean | null
          speakers?: Json | null
          start_date?: string | null
          start_time?: string | null
          status?: string
          support_email?: string | null
          support_phone?: string | null
          tags?: string[] | null
          tickets?: Json | null
          title: string
          total_capacity?: string | null
          updated_at?: string
          user_id: string
          venue_address?: string | null
          venue_name?: string | null
        }
        Update: {
          agenda?: Json | null
          agree_terms?: boolean | null
          arrival_instructions?: string | null
          banner_url?: string | null
          category?: string
          created_at?: string
          deadline_date?: string | null
          deadline_time?: string | null
          end_date?: string | null
          end_time?: string | null
          event_link?: string | null
          event_mode?: string
          faqs?: Json | null
          full_description?: string | null
          id?: string
          location_type?: string | null
          max_team_size?: string | null
          organizer_logo_url?: string | null
          organizer_name?: string
          prizes?: string | null
          room_floor?: string | null
          short_summary?: string | null
          show_timezone?: boolean | null
          speakers?: Json | null
          start_date?: string | null
          start_time?: string | null
          status?: string
          support_email?: string | null
          support_phone?: string | null
          tags?: string[] | null
          tickets?: Json | null
          title?: string
          total_capacity?: string | null
          updated_at?: string
          user_id?: string
          venue_address?: string | null
          venue_name?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          id: string
          is_admin: boolean | null
          name: string | null
          signup_method: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id: string
          is_admin?: boolean | null
          name?: string | null
          signup_method?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_admin?: boolean | null
          name?: string | null
          signup_method?: string | null
          updated_at?: string
        }
        Relationships: []
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
