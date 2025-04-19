export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          role: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
          role: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          booking_id: string | null
          created_at: string | null
          email: string | null
          id: string
          match_id: string | null
          name: string | null
          payment_id: string | null
          payment_method: string | null
          phone: string | null
          quantity: number | null
          seat_category_id: string | null
          seat_number: string | null
          seat_numbers: string[] | null
          section_id: string | null
          status: string | null
          tickets: number | null
          total_amount: number | null
          updated_at: string | null
          upi_id: string | null
          user_email: string | null
          user_name: string | null
          utr: string | null
          utr_number: string | null
        }
        Insert: {
          booking_id?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          match_id?: string | null
          name?: string | null
          payment_id?: string | null
          payment_method?: string | null
          phone?: string | null
          quantity?: number | null
          seat_category_id?: string | null
          seat_number?: string | null
          seat_numbers?: string[] | null
          section_id?: string | null
          status?: string | null
          tickets?: number | null
          total_amount?: number | null
          updated_at?: string | null
          upi_id?: string | null
          user_email?: string | null
          user_name?: string | null
          utr?: string | null
          utr_number?: string | null
        }
        Update: {
          booking_id?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          match_id?: string | null
          name?: string | null
          payment_id?: string | null
          payment_method?: string | null
          phone?: string | null
          quantity?: number | null
          seat_category_id?: string | null
          seat_number?: string | null
          seat_numbers?: string[] | null
          section_id?: string | null
          status?: string | null
          tickets?: number | null
          total_amount?: number | null
          updated_at?: string | null
          upi_id?: string | null
          user_email?: string | null
          user_name?: string | null
          utr?: string | null
          utr_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "stadium_sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_seat_category_id"
            columns: ["seat_category_id"]
            isOneToOne: false
            referencedRelation: "seat_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      match: {
        Row: {
          created_at: string | null
          id: string
          match_date: string
          stadium_id: string | null
          team1_id: string | null
          team2_id: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          match_date: string
          stadium_id?: string | null
          team1_id?: string | null
          team2_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          match_date?: string
          stadium_id?: string | null
          team1_id?: string | null
          team2_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "match_stadium_id_fkey"
            columns: ["stadium_id"]
            isOneToOne: false
            referencedRelation: "stadium"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          created_at: string | null
          date: string | null
          default_section_id: string | null
          gate_open_time: string | null
          id: string
          match_date: string
          match_id: string | null
          match_number: number | null
          match_type: string | null
          stadium_id: string | null
          status: string | null
          team1_id: string | null
          team2_id: string | null
          venue: string | null
        }
        Insert: {
          created_at?: string | null
          date?: string | null
          default_section_id?: string | null
          gate_open_time?: string | null
          id?: string
          match_date: string
          match_id?: string | null
          match_number?: number | null
          match_type?: string | null
          stadium_id?: string | null
          status?: string | null
          team1_id?: string | null
          team2_id?: string | null
          venue?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string | null
          default_section_id?: string | null
          gate_open_time?: string | null
          id?: string
          match_date?: string
          match_id?: string | null
          match_number?: number | null
          match_type?: string | null
          stadium_id?: string | null
          status?: string | null
          team1_id?: string | null
          team2_id?: string | null
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_stadium"
            columns: ["stadium_id"]
            isOneToOne: false
            referencedRelation: "stadiums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_team1"
            columns: ["team1_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_team2"
            columns: ["team2_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      news: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          image_url: string | null
          published: boolean | null
          published_at: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          image_url?: string | null
          published?: boolean | null
          published_at?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          image_url?: string | null
          published?: boolean | null
          published_at?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          match_id: string
          status: string | null
          updated_at: string | null
          user_email: string
          utr_number: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          match_id: string
          status?: string | null
          updated_at?: string | null
          user_email: string
          utr_number: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          match_id?: string
          status?: string | null
          updated_at?: string | null
          user_email?: string
          utr_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          created_at: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      seat_categories: {
        Row: {
          availability: number
          color_code: string | null
          created_at: string | null
          description: string | null
          id: string
          match_id: string
          name: string
          price: number
          section_id: string | null
          stadium_section_id: string | null
          updated_at: string | null
        }
        Insert: {
          availability?: number
          color_code?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          match_id: string
          name: string
          price: number
          section_id?: string | null
          stadium_section_id?: string | null
          updated_at?: string | null
        }
        Update: {
          availability?: number
          color_code?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          match_id?: string
          name?: string
          price?: number
          section_id?: string | null
          stadium_section_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_section_id"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seat_categories_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seat_categories_stadium_section_id_fkey"
            columns: ["stadium_section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      seats: {
        Row: {
          created_at: string | null
          id: string
          name: string
          stadium_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          name: string
          stadium_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          stadium_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_stadium"
            columns: ["stadium_id"]
            isOneToOne: false
            referencedRelation: "stadiums"
            referencedColumns: ["id"]
          },
        ]
      }
      sections: {
        Row: {
          category_id: string | null
          created_at: string | null
          id: string
          name: string
          stadium_id: string | null
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          id?: string
          name: string
          stadium_id?: string | null
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          id?: string
          name?: string
          stadium_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_sections_category"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "seat_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sections_stadium_id_fkey"
            columns: ["stadium_id"]
            isOneToOne: false
            referencedRelation: "stadiums"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          created_at: string | null
          id: string
          logo_url: string | null
          setting_key: string
          setting_value: Json
          site_name: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          setting_key: string
          setting_value: Json
          site_name?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          setting_key?: string
          setting_value?: Json
          site_name?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      stadium: {
        Row: {
          created_at: string | null
          id: string
          location: string | null
          name: string
        }
        Insert: {
          created_at?: string | null
          id: string
          location?: string | null
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          location?: string | null
          name?: string
        }
        Relationships: []
      }
      stadium_sections: {
        Row: {
          created_at: string | null
          id: string
          name: string
          stadium_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          name: string
          stadium_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          stadium_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stadium_sections_stadium_id_fkey"
            columns: ["stadium_id"]
            isOneToOne: false
            referencedRelation: "stadiums"
            referencedColumns: ["id"]
          },
        ]
      }
      stadiums: {
        Row: {
          address: string | null
          capacity: number | null
          city: string | null
          id: string
          image_url: string | null
          location: string | null
          name: string
          new_stadium_id: string | null
          stadium_id: number
        }
        Insert: {
          address?: string | null
          capacity?: number | null
          city?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          name: string
          new_stadium_id?: string | null
          stadium_id?: number
        }
        Update: {
          address?: string | null
          capacity?: number | null
          city?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          name?: string
          new_stadium_id?: string | null
          stadium_id?: number
        }
        Relationships: []
      }
      teams: {
        Row: {
          created_at: string | null
          description: string | null
          established_year: number | null
          home_venue: string | null
          id: string
          logo: string | null
          logo_url: string | null
          name: string | null
          short_name: string | null
          team_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          established_year?: number | null
          home_venue?: string | null
          id?: string
          logo?: string | null
          logo_url?: string | null
          name?: string | null
          short_name?: string | null
          team_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          established_year?: number | null
          home_venue?: string | null
          id?: string
          logo?: string | null
          logo_url?: string | null
          name?: string | null
          short_name?: string | null
          team_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      tickets: {
        Row: {
          booking_id: string | null
          id: number
          seat_number: string | null
          status: string | null
        }
        Insert: {
          booking_id?: string | null
          id?: never
          seat_number?: string | null
          status?: string | null
        }
        Update: {
          booking_id?: string | null
          id?: never
          seat_number?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tickets_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      create_admin_functions: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never> | { uid: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
