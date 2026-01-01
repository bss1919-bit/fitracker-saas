export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      admins: {
        Row: {
          created_at: string | null
          email: string
          id: string
          role: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          role?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          role?: string | null
        }
        Relationships: []
      }
      clients: {
        Row: {
          coach_id: string
          created_at: string | null
          email: string | null
          first_name: string
          id: string
          last_name: string | null
          mobile_user_id: string | null
          notes: string | null
          status: string | null
        }
        Insert: {
          coach_id: string
          created_at?: string | null
          email?: string | null
          first_name: string
          id?: string
          last_name?: string | null
          mobile_user_id?: string | null
          notes?: string | null
          status?: string | null
        }
        Update: {
          coach_id?: string
          created_at?: string | null
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string | null
          mobile_user_id?: string | null
          notes?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_exercises: {
        Row: {
          category: string | null
          coach_id: string
          created_at: string | null
          id: string
          instructions: Json | null
          name: Json
          video_url: string | null
        }
        Insert: {
          category?: string | null
          coach_id: string
          created_at?: string | null
          id?: string
          instructions?: Json | null
          name: Json
          video_url?: string | null
        }
        Update: {
          category?: string | null
          coach_id?: string
          created_at?: string | null
          id?: string
          instructions?: Json | null
          name?: Json
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coach_exercises_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_programs: {
        Row: {
          coach_id: string
          created_at: string | null
          description: Json | null
          id: string
          is_template: boolean | null
          name: Json
          structure: Json
        }
        Insert: {
          coach_id: string
          created_at?: string | null
          description?: Json | null
          id?: string
          is_template?: boolean | null
          name: Json
          structure: Json
        }
        Update: {
          coach_id?: string
          created_at?: string | null
          description?: Json | null
          id?: string
          is_template?: boolean | null
          name?: Json
          structure?: Json
        }
        Relationships: [
          {
            foreignKeyName: "coach_programs_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
        ]
      }
      coaches: {
        Row: {
          business_name: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          logo_url: string | null
          onboarding_completed: boolean | null
          settings: Json | null
          specialties: string[] | null
          subscription_tier: string | null
          website: string | null
        }
        Insert: {
          business_name?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          logo_url?: string | null
          onboarding_completed?: boolean | null
          settings?: Json | null
          specialties?: string[] | null
          subscription_tier?: string | null
          website?: string | null
        }
        Update: {
          business_name?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          logo_url?: string | null
          onboarding_completed?: boolean | null
          settings?: Json | null
          specialties?: string[] | null
          subscription_tier?: string | null
          website?: string | null
        }
        Relationships: []
      }
      program_assignments: {
        Row: {
          client_id: string
          created_at: string | null
          id: string
          program_id: string
          start_date: string | null
          status: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          id?: string
          program_id: string
          start_date?: string | null
          status?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          id?: string
          program_id?: string
          start_date?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "program_assignments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_assignments_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "coach_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      synced_data: {
        Row: {
          client_id: string
          data_type: string
          id: string
          mobile_object_id: string
          payload: Json
          performed_at: string | null
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          client_id: string
          data_type: string
          id?: string
          mobile_object_id: string
          payload: Json
          performed_at?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          data_type?: string
          id?: string
          mobile_object_id?: string
          payload?: Json
          performed_at?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "synced_data_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

