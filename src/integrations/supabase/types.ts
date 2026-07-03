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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      ciclos: {
        Row: {
          checkpoint_date: string | null
          created_at: string
          habilidades_prioritarias: string[]
          id: number
          objetivo: string | null
          proximo_foco: string | null
          semana_atual: number
          status: string
          student_id: number
          updated_at: string
          user_id: string
        }
        Insert: {
          checkpoint_date?: string | null
          created_at?: string
          habilidades_prioritarias?: string[]
          id?: number
          objetivo?: string | null
          proximo_foco?: string | null
          semana_atual?: number
          status?: string
          student_id: number
          updated_at?: string
          user_id?: string
        }
        Update: {
          checkpoint_date?: string | null
          created_at?: string
          habilidades_prioritarias?: string[]
          id?: number
          objetivo?: string | null
          proximo_foco?: string | null
          semana_atual?: number
          status?: string
          student_id?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ciclos_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      class_history: {
        Row: {
          class_date: string
          conteudo_id: number | null
          contexto: string | null
          created_at: string
          id: string
          missao_pos_aula: string | null
          notes: string | null
          pontos_atencao: string | null
          status: string
          student_id: number
          topic: string | null
          user_id: string
          vocabulario: string | null
          weekly_planner_id: number | null
        }
        Insert: {
          class_date: string
          conteudo_id?: number | null
          contexto?: string | null
          created_at?: string
          id?: string
          missao_pos_aula?: string | null
          notes?: string | null
          pontos_atencao?: string | null
          status?: string
          student_id: number
          topic?: string | null
          user_id: string
          vocabulario?: string | null
          weekly_planner_id?: number | null
        }
        Update: {
          class_date?: string
          conteudo_id?: number | null
          contexto?: string | null
          created_at?: string
          id?: string
          missao_pos_aula?: string | null
          notes?: string | null
          pontos_atencao?: string | null
          status?: string
          student_id?: number
          topic?: string | null
          user_id?: string
          vocabulario?: string | null
          weekly_planner_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "class_history_conteudo_id_fkey"
            columns: ["conteudo_id"]
            isOneToOne: false
            referencedRelation: "conteudos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_history_weekly_planner_id_fkey"
            columns: ["weekly_planner_id"]
            isOneToOne: false
            referencedRelation: "weekly_planner"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_student"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      conteudos: {
        Row: {
          created_at: string
          descricao: string | null
          id: number
          link: string | null
          nivel: string
          tema: string | null
          tipo: string
          titulo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          id?: number
          link?: string | null
          nivel?: string
          tema?: string | null
          tipo?: string
          titulo: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          id?: number
          link?: string | null
          nivel?: string
          tema?: string | null
          tipo?: string
          titulo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      feedbacks: {
        Row: {
          ciclo_id: number | null
          created_at: string
          data: string
          id: number
          is_conquista: boolean
          nivel_confianca: string | null
          nivel_grammar: string | null
          nivel_listening: string | null
          nivel_pronunciation: string | null
          nivel_speaking: string | null
          nivel_vocabulary: string | null
          observacao: string | null
          student_id: number
          updated_at: string
          user_id: string
        }
        Insert: {
          ciclo_id?: number | null
          created_at?: string
          data?: string
          id?: number
          is_conquista?: boolean
          nivel_confianca?: string | null
          nivel_grammar?: string | null
          nivel_listening?: string | null
          nivel_pronunciation?: string | null
          nivel_speaking?: string | null
          nivel_vocabulary?: string | null
          observacao?: string | null
          student_id: number
          updated_at?: string
          user_id?: string
        }
        Update: {
          ciclo_id?: number | null
          created_at?: string
          data?: string
          id?: number
          is_conquista?: boolean
          nivel_confianca?: string | null
          nivel_grammar?: string | null
          nivel_listening?: string | null
          nivel_pronunciation?: string | null
          nivel_speaking?: string | null
          nivel_vocabulary?: string | null
          observacao?: string | null
          student_id?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedbacks_ciclo_id_fkey"
            columns: ["ciclo_id"]
            isOneToOne: false
            referencedRelation: "ciclos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedbacks_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_history: {
        Row: {
          amount: number
          created_at: string
          due_date: string | null
          id: string
          notes: string | null
          payment_date: string
          status: string
          student_id: number
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          due_date?: string | null
          id?: string
          notes?: string | null
          payment_date: string
          status?: string
          student_id: number
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          due_date?: string | null
          id?: string
          notes?: string | null
          payment_date?: string
          status?: string
          student_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_student"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          is_autonomous: boolean | null
          organization: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_autonomous?: boolean | null
          organization?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_autonomous?: boolean | null
          organization?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          age: number
          completed_classes: number
          contact: string
          created_at: string
          id: number
          last_class_date: string | null
          last_payment_date: string | null
          level: string
          name: string
          next_lesson_topic: string | null
          payment_amount: number | null
          payment_due_date: string | null
          payment_status: string | null
          total_classes: number
          updated_at: string
          user_id: string
        }
        Insert: {
          age?: number
          completed_classes?: number
          contact?: string
          created_at?: string
          id?: number
          last_class_date?: string | null
          last_payment_date?: string | null
          level?: string
          name?: string
          next_lesson_topic?: string | null
          payment_amount?: number | null
          payment_due_date?: string | null
          payment_status?: string | null
          total_classes?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          age?: number
          completed_classes?: number
          contact?: string
          created_at?: string
          id?: number
          last_class_date?: string | null
          last_payment_date?: string | null
          level?: string
          name?: string
          next_lesson_topic?: string | null
          payment_amount?: number | null
          payment_due_date?: string | null
          payment_status?: string | null
          total_classes?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      weekly_planner: {
        Row: {
          ciclo_id: number
          created_at: string
          id: number
          missao: string | null
          objetivo: string | null
          semana: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ciclo_id: number
          created_at?: string
          id?: number
          missao?: string | null
          objetivo?: string | null
          semana?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          ciclo_id?: number
          created_at?: string
          id?: number
          missao?: string | null
          objetivo?: string | null
          semana?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_planner_ciclo_id_fkey"
            columns: ["ciclo_id"]
            isOneToOne: false
            referencedRelation: "ciclos"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_first_admin: { Args: never; Returns: undefined }
      get_system_stats: { Args: never; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      promote_to_admin: { Args: { user_email: string }; Returns: boolean }
      update_payment_status: { Args: never; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
