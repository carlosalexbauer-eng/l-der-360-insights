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
      calibration_history: {
        Row: {
          calibrated_by_name: string
          calibrated_by_user_id: string
          created_at: string
          id: string
          leader_name: string
          successor_name: string
        }
        Insert: {
          calibrated_by_name: string
          calibrated_by_user_id: string
          created_at?: string
          id?: string
          leader_name: string
          successor_name: string
        }
        Update: {
          calibrated_by_name?: string
          calibrated_by_user_id?: string
          created_at?: string
          id?: string
          leader_name?: string
          successor_name?: string
        }
        Relationships: []
      }
      collaborators_data: {
        Row: {
          data: Json
          id: string
          is_active: boolean
          uploaded_at: string
          uploaded_by: string | null
        }
        Insert: {
          data: Json
          id?: string
          is_active?: boolean
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Update: {
          data?: Json
          id?: string
          is_active?: boolean
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      leaders_data: {
        Row: {
          data: Json
          id: string
          is_active: boolean
          uploaded_at: string
          uploaded_by: string | null
        }
        Insert: {
          data: Json
          id?: string
          is_active?: boolean
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Update: {
          data?: Json
          id?: string
          is_active?: boolean
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leaders_data_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      leaders_data_historical: {
        Row: {
          data: Json
          id: string
          is_active: boolean
          uploaded_at: string
          uploaded_by: string | null
        }
        Insert: {
          data: Json
          id?: string
          is_active?: boolean
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Update: {
          data?: Json
          id?: string
          is_active?: boolean
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      succession_map_change_log: {
        Row: {
          base_id: string
          change_type: string
          changed_at: string
          changed_by_name: string
          changed_by_user_id: string
          field_changed: string | null
          id: string
          leader_cargo: string | null
          leader_name: string
          new_value: string | null
          old_value: string | null
          successor_index: number | null
          successor_new_name: string | null
          successor_previous_name: string | null
        }
        Insert: {
          base_id: string
          change_type: string
          changed_at?: string
          changed_by_name: string
          changed_by_user_id: string
          field_changed?: string | null
          id?: string
          leader_cargo?: string | null
          leader_name: string
          new_value?: string | null
          old_value?: string | null
          successor_index?: number | null
          successor_new_name?: string | null
          successor_previous_name?: string | null
        }
        Update: {
          base_id?: string
          change_type?: string
          changed_at?: string
          changed_by_name?: string
          changed_by_user_id?: string
          field_changed?: string | null
          id?: string
          leader_cargo?: string | null
          leader_name?: string
          new_value?: string | null
          old_value?: string | null
          successor_index?: number | null
          successor_new_name?: string | null
          successor_previous_name?: string | null
        }
        Relationships: []
      }
      succession_map_edits: {
        Row: {
          base_id: string
          id: string
          leader_key: string
          successors: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          base_id: string
          id?: string
          leader_key: string
          successors?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          base_id?: string
          id?: string
          leader_key?: string
          successors?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      system_metadata: {
        Row: {
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: Json | null
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json | null
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "system_metadata_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          aprovado_admin: boolean
          ativo: boolean
          auth_id: string
          can_admin: boolean
          can_manage_users: boolean
          can_upload: boolean
          created_at: string
          diretoria: string | null
          email: string
          email_validado: boolean
          id: string
          nome: string
          role: Database["public"]["Enums"]["app_role"]
          status: Database["public"]["Enums"]["user_status"]
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          aprovado_admin?: boolean
          ativo?: boolean
          auth_id: string
          can_admin?: boolean
          can_manage_users?: boolean
          can_upload?: boolean
          created_at?: string
          diretoria?: string | null
          email: string
          email_validado?: boolean
          id?: string
          nome: string
          role?: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["user_status"]
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          aprovado_admin?: boolean
          ativo?: boolean
          auth_id?: string
          can_admin?: boolean
          can_manage_users?: boolean
          can_upload?: boolean
          created_at?: string
          diretoria?: string | null
          email?: string
          email_validado?: boolean
          id?: string
          nome?: string
          role?: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["user_status"]
        }
        Relationships: [
          {
            foreignKeyName: "users_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_manage_users: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_approved_user: { Args: { _user_id: string }; Returns: boolean }
      is_master: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "master" | "admin" | "bp" | "viewer"
      user_status: "aguardando_aprovacao" | "ativo" | "inativo" | "rejeitado"
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
    Enums: {
      app_role: ["master", "admin", "bp", "viewer"],
      user_status: ["aguardando_aprovacao", "ativo", "inativo", "rejeitado"],
    },
  },
} as const
