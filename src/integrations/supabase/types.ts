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
      autopilot_activity_logs: {
        Row: {
          completion_rate: number
          created_at: string
          goal_id: string
          id: string
          log_date: string
          tasks_completed: number
          tasks_total: number
          user_id: string
        }
        Insert: {
          completion_rate?: number
          created_at?: string
          goal_id: string
          id?: string
          log_date?: string
          tasks_completed?: number
          tasks_total?: number
          user_id: string
        }
        Update: {
          completion_rate?: number
          created_at?: string
          goal_id?: string
          id?: string
          log_date?: string
          tasks_completed?: number
          tasks_total?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "autopilot_activity_logs_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "autopilot_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      autopilot_goals: {
        Row: {
          ai_plan: Json | null
          autopilot_enabled: boolean
          challenges: string | null
          created_at: string
          daily_time_minutes: number
          deadline: string | null
          difficulty: string
          goal_description: string
          id: string
          last_active_at: string | null
          milestones: Json | null
          motivation_type: string | null
          progress_percent: number
          status: string
          streak_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_plan?: Json | null
          autopilot_enabled?: boolean
          challenges?: string | null
          created_at?: string
          daily_time_minutes?: number
          deadline?: string | null
          difficulty?: string
          goal_description: string
          id?: string
          last_active_at?: string | null
          milestones?: Json | null
          motivation_type?: string | null
          progress_percent?: number
          status?: string
          streak_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_plan?: Json | null
          autopilot_enabled?: boolean
          challenges?: string | null
          created_at?: string
          daily_time_minutes?: number
          deadline?: string | null
          difficulty?: string
          goal_description?: string
          id?: string
          last_active_at?: string | null
          milestones?: Json | null
          motivation_type?: string | null
          progress_percent?: number
          status?: string
          streak_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      autopilot_notifications: {
        Row: {
          created_at: string
          goal_id: string | null
          id: string
          message: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          goal_id?: string | null
          id?: string
          message: string
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          goal_id?: string | null
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "autopilot_notifications_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "autopilot_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      autopilot_reports: {
        Row: {
          ai_feedback: string | null
          completion_rate: number
          created_at: string
          goal_id: string
          id: string
          next_week_strategy: string | null
          performance_score: number
          productivity_insights: Json | null
          summary: string
          user_id: string
          week_start: string
        }
        Insert: {
          ai_feedback?: string | null
          completion_rate?: number
          created_at?: string
          goal_id: string
          id?: string
          next_week_strategy?: string | null
          performance_score?: number
          productivity_insights?: Json | null
          summary: string
          user_id: string
          week_start: string
        }
        Update: {
          ai_feedback?: string | null
          completion_rate?: number
          created_at?: string
          goal_id?: string
          id?: string
          next_week_strategy?: string | null
          performance_score?: number
          productivity_insights?: Json | null
          summary?: string
          user_id?: string
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "autopilot_reports_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "autopilot_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      autopilot_tasks: {
        Row: {
          adjustment_flag: boolean
          adjustment_reason: string | null
          completed: boolean
          completed_at: string | null
          created_at: string
          due_date: string
          goal_id: string
          id: string
          priority: string
          task_text: string
          user_id: string
        }
        Insert: {
          adjustment_flag?: boolean
          adjustment_reason?: string | null
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          due_date?: string
          goal_id: string
          id?: string
          priority?: string
          task_text: string
          user_id: string
        }
        Update: {
          adjustment_flag?: boolean
          adjustment_reason?: string | null
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          due_date?: string
          goal_id?: string
          id?: string
          priority?: string
          task_text?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "autopilot_tasks_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "autopilot_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      chats: {
        Row: {
          coach_type: string
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          coach_type: string
          created_at?: string
          id?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          coach_type?: string
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_tasks: {
        Row: {
          ai_feedback: string | null
          ai_generated: boolean | null
          chat_id: string | null
          coach_type: string
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          priority: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_feedback?: string | null
          ai_generated?: boolean | null
          chat_id?: string | null
          coach_type: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_feedback?: string | null
          ai_generated?: boolean | null
          chat_id?: string | null
          coach_type?: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_tasks_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
        ]
      }
      habits: {
        Row: {
          created_at: string | null
          habit_name: string
          id: string
          is_active: boolean | null
          last_completed_at: string | null
          reminder_time: string | null
          streak_count: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          habit_name: string
          id?: string
          is_active?: boolean | null
          last_completed_at?: string | null
          reminder_time?: string | null
          streak_count?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          habit_name?: string
          id?: string
          is_active?: boolean | null
          last_completed_at?: string | null
          reminder_time?: string | null
          streak_count?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          ai_analysis: string | null
          content: string
          created_at: string | null
          id: string
          improvements: Json | null
          patterns: Json | null
          positivity_index: number | null
          themes: Json | null
          user_id: string
        }
        Insert: {
          ai_analysis?: string | null
          content: string
          created_at?: string | null
          id?: string
          improvements?: Json | null
          patterns?: Json | null
          positivity_index?: number | null
          themes?: Json | null
          user_id: string
        }
        Update: {
          ai_analysis?: string | null
          content?: string
          created_at?: string | null
          id?: string
          improvements?: Json | null
          patterns?: Json | null
          positivity_index?: number | null
          themes?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      life_snapshots: {
        Row: {
          ai_analysis: string
          created_at: string | null
          id: string
          life_score: number
          priority: string
          question_1: string
          question_2: string
          question_3: string
          user_id: string
        }
        Insert: {
          ai_analysis: string
          created_at?: string | null
          id?: string
          life_score: number
          priority: string
          question_1: string
          question_2: string
          question_3: string
          user_id: string
        }
        Update: {
          ai_analysis?: string
          created_at?: string | null
          id?: string
          life_score?: number
          priority?: string
          question_1?: string
          question_2?: string
          question_3?: string
          user_id?: string
        }
        Relationships: []
      }
      life_timelines: {
        Row: {
          created_at: string | null
          duration_months: number
          goal: string
          id: string
          milestones: Json
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          duration_months: number
          goal: string
          id?: string
          milestones: Json
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          duration_months?: number
          goal?: string
          id?: string
          milestones?: Json
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          chat_id: string
          content: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          chat_id: string
          content: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          chat_id?: string
          content?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
        ]
      }
      mood_entries: {
        Row: {
          created_at: string | null
          detected_mood: string
          emotions: Json
          id: string
          mood_score: number
          mood_text: string
          suggestions: Json
          user_id: string
        }
        Insert: {
          created_at?: string | null
          detected_mood: string
          emotions: Json
          id?: string
          mood_score: number
          mood_text: string
          suggestions: Json
          user_id: string
        }
        Update: {
          created_at?: string | null
          detected_mood?: string
          emotions?: Json
          id?: string
          mood_score?: number
          mood_text?: string
          suggestions?: Json
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscription_status: string
          trial_ends_at: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          stripe_customer_id?: string | null
          subscription_status?: string
          trial_ends_at?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscription_status?: string
          trial_ends_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      rituals: {
        Row: {
          created_at: string | null
          duration: number
          id: string
          is_active: boolean | null
          reminders: Json | null
          ritual_type: string
          steps: Json
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          duration: number
          id?: string
          is_active?: boolean | null
          reminders?: Json | null
          ritual_type: string
          steps: Json
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          duration?: number
          id?: string
          is_active?: boolean | null
          reminders?: Json | null
          ritual_type?: string
          steps?: Json
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      voice_wisdom: {
        Row: {
          created_at: string | null
          emotion_score: number
          id: string
          suggestions: Json
          summary: string
          transcription: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          emotion_score: number
          id?: string
          suggestions: Json
          summary: string
          transcription: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          emotion_score?: number
          id?: string
          suggestions?: Json
          summary?: string
          transcription?: string
          user_id?: string
        }
        Relationships: []
      }
      weekly_plans: {
        Row: {
          ai_insights: string | null
          created_at: string | null
          id: string
          plan_details: Json
          user_id: string
          week_start: string
        }
        Insert: {
          ai_insights?: string | null
          created_at?: string | null
          id?: string
          plan_details: Json
          user_id: string
          week_start: string
        }
        Update: {
          ai_insights?: string | null
          created_at?: string | null
          id?: string
          plan_details?: Json
          user_id?: string
          week_start?: string
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
