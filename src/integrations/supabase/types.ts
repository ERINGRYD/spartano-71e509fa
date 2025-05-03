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
      battle_themes: {
        Row: {
          created_at: string | null
          id: string
          status: string | null
          theme_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          status?: string | null
          theme_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          status?: string | null
          theme_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "battle_themes_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "themes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      questions: {
        Row: {
          additional_info: string | null
          correct_option: number
          created_at: string | null
          difficulty: string
          exam_board: string | null
          id: string
          option_comments: Json
          options: Json
          organization: string | null
          question_type: string
          subtheme_id: string | null
          text: string
          theme_id: string | null
          user_id: string | null
          year: number | null
        }
        Insert: {
          additional_info?: string | null
          correct_option: number
          created_at?: string | null
          difficulty: string
          exam_board?: string | null
          id?: string
          option_comments: Json
          options: Json
          organization?: string | null
          question_type: string
          subtheme_id?: string | null
          text: string
          theme_id?: string | null
          user_id?: string | null
          year?: number | null
        }
        Update: {
          additional_info?: string | null
          correct_option?: number
          created_at?: string | null
          difficulty?: string
          exam_board?: string | null
          id?: string
          option_comments?: Json
          options?: Json
          organization?: string | null
          question_type?: string
          subtheme_id?: string | null
          text?: string
          theme_id?: string | null
          user_id?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_subtheme_id_fkey"
            columns: ["subtheme_id"]
            isOneToOne: false
            referencedRelation: "subthemes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "themes"
            referencedColumns: ["id"]
          },
        ]
      }
      study_goals: {
        Row: {
          created_at: string | null
          current: number
          id: string
          name: string
          target: number
          unit: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          current: number
          id?: string
          name: string
          target: number
          unit: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          current?: number
          id?: string
          name?: string
          target?: number
          unit?: string
          user_id?: string | null
        }
        Relationships: []
      }
      study_sessions: {
        Row: {
          created_at: string | null
          date: string
          duration: number
          id: string
          questions: number
          themes: number
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          duration: number
          id?: string
          questions: number
          themes: number
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          duration?: number
          id?: string
          questions?: number
          themes?: number
          user_id?: string | null
        }
        Relationships: []
      }
      subjects: {
        Row: {
          created_at: string | null
          id: string
          name: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      subthemes: {
        Row: {
          created_at: string | null
          id: string
          name: string
          theme_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          theme_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          theme_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subthemes_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "themes"
            referencedColumns: ["id"]
          },
        ]
      }
      themes: {
        Row: {
          created_at: string | null
          id: string
          is_ready: boolean | null
          name: string
          next_review: string | null
          review_count: number | null
          status: string | null
          subject_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_ready?: boolean | null
          name: string
          next_review?: string | null
          review_count?: number | null
          status?: string | null
          subject_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_ready?: boolean | null
          name?: string
          next_review?: string | null
          review_count?: number | null
          status?: string | null
          subject_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "themes_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
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
