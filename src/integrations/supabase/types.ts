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
      aria_bookmarks: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          is_favorite: boolean | null
          tags: string[] | null
          title: string | null
          url: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_favorite?: boolean | null
          tags?: string[] | null
          title?: string | null
          url: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_favorite?: boolean | null
          tags?: string[] | null
          title?: string | null
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      aria_budgets: {
        Row: {
          category: string
          created_at: string | null
          id: string
          monthly_limit: number
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          monthly_limit: number
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          monthly_limit?: number
          user_id?: string
        }
        Relationships: []
      }
      aria_conversations: {
        Row: {
          created_at: string | null
          id: string
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      aria_documents: {
        Row: {
          category: string | null
          created_at: string | null
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          notes: string | null
          summary: string | null
          tags: string[] | null
          title: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          notes?: string | null
          summary?: string | null
          tags?: string[] | null
          title: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          notes?: string | null
          summary?: string | null
          tags?: string[] | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      aria_expenses: {
        Row: {
          amount: number
          category: string | null
          created_at: string | null
          date: string | null
          description: string | null
          id: string
          is_recurring: boolean | null
          recurrence_pattern: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          category?: string | null
          created_at?: string | null
          date?: string | null
          description?: string | null
          id?: string
          is_recurring?: boolean | null
          recurrence_pattern?: string | null
          type?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string | null
          date?: string | null
          description?: string | null
          id?: string
          is_recurring?: boolean | null
          recurrence_pattern?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      aria_focus_sessions: {
        Row: {
          completed: boolean | null
          duration_minutes: number
          ended_at: string | null
          id: string
          notes: string | null
          started_at: string | null
          task_id: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          duration_minutes: number
          ended_at?: string | null
          id?: string
          notes?: string | null
          started_at?: string | null
          task_id?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          duration_minutes?: number
          ended_at?: string | null
          id?: string
          notes?: string | null
          started_at?: string | null
          task_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "aria_focus_sessions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "aria_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      aria_goals: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          milestones: Json | null
          notes: string | null
          progress_percent: number | null
          target_date: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          milestones?: Json | null
          notes?: string | null
          progress_percent?: number | null
          target_date?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          milestones?: Json | null
          notes?: string | null
          progress_percent?: number | null
          target_date?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      aria_habit_logs: {
        Row: {
          completed_at: string | null
          habit_id: string
          id: string
          notes: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          habit_id: string
          id?: string
          notes?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          habit_id?: string
          id?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "aria_habit_logs_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "aria_habits"
            referencedColumns: ["id"]
          },
        ]
      }
      aria_habits: {
        Row: {
          best_streak: number | null
          category: string | null
          created_at: string | null
          current_streak: number | null
          description: string | null
          frequency: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          last_completed_at: string | null
          target_count: number | null
          title: string
          total_completions: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          best_streak?: number | null
          category?: string | null
          created_at?: string | null
          current_streak?: number | null
          description?: string | null
          frequency?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          last_completed_at?: string | null
          target_count?: number | null
          title: string
          total_completions?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          best_streak?: number | null
          category?: string | null
          created_at?: string | null
          current_streak?: number | null
          description?: string | null
          frequency?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          last_completed_at?: string | null
          target_count?: number | null
          title?: string
          total_completions?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      aria_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "aria_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "aria_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      aria_mood_entries: {
        Row: {
          ai_insight: string | null
          created_at: string | null
          energy_level: number | null
          id: string
          journal_entry: string | null
          mood_label: string
          mood_score: number
          tags: string[] | null
          user_id: string
        }
        Insert: {
          ai_insight?: string | null
          created_at?: string | null
          energy_level?: number | null
          id?: string
          journal_entry?: string | null
          mood_label: string
          mood_score: number
          tags?: string[] | null
          user_id: string
        }
        Update: {
          ai_insight?: string | null
          created_at?: string | null
          energy_level?: number | null
          id?: string
          journal_entry?: string | null
          mood_label?: string
          mood_score?: number
          tags?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      aria_notes: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          is_pinned: boolean | null
          tags: string[] | null
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          is_pinned?: boolean | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          is_pinned?: boolean | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      aria_profiles: {
        Row: {
          aria_context_summary: string | null
          avatar_url: string | null
          badges: Json | null
          challenges: string | null
          communication_style: string | null
          created_at: string | null
          goals_summary: string | null
          id: string
          level: number | null
          name: string | null
          notification_preferences: Json | null
          total_xp: number | null
          updated_at: string | null
          user_id: string
          work_situation: string | null
        }
        Insert: {
          aria_context_summary?: string | null
          avatar_url?: string | null
          badges?: Json | null
          challenges?: string | null
          communication_style?: string | null
          created_at?: string | null
          goals_summary?: string | null
          id?: string
          level?: number | null
          name?: string | null
          notification_preferences?: Json | null
          total_xp?: number | null
          updated_at?: string | null
          user_id: string
          work_situation?: string | null
        }
        Update: {
          aria_context_summary?: string | null
          avatar_url?: string | null
          badges?: Json | null
          challenges?: string | null
          communication_style?: string | null
          created_at?: string | null
          goals_summary?: string | null
          id?: string
          level?: number | null
          name?: string | null
          notification_preferences?: Json | null
          total_xp?: number | null
          updated_at?: string | null
          user_id?: string
          work_situation?: string | null
        }
        Relationships: []
      }
      aria_reminders: {
        Row: {
          created_at: string | null
          id: string
          is_sent: boolean | null
          remind_at: string
          task_id: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_sent?: boolean | null
          remind_at: string
          task_id?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_sent?: boolean | null
          remind_at?: string
          task_id?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "aria_reminders_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "aria_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      aria_tasks: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          due_at: string | null
          id: string
          is_recurring: boolean | null
          priority: string | null
          recurrence_pattern: string | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          due_at?: string | null
          id?: string
          is_recurring?: boolean | null
          priority?: string | null
          recurrence_pattern?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          due_at?: string | null
          id?: string
          is_recurring?: boolean | null
          priority?: string | null
          recurrence_pattern?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      aria_weekly_reviews: {
        Row: {
          ai_recommendations: string | null
          ai_summary: string | null
          challenges: string | null
          created_at: string | null
          goals_progress: Json | null
          highlights: string | null
          id: string
          mood_average: number | null
          tasks_completed: number | null
          tasks_total: number | null
          user_id: string
          week_start: string
          xp_earned: number | null
        }
        Insert: {
          ai_recommendations?: string | null
          ai_summary?: string | null
          challenges?: string | null
          created_at?: string | null
          goals_progress?: Json | null
          highlights?: string | null
          id?: string
          mood_average?: number | null
          tasks_completed?: number | null
          tasks_total?: number | null
          user_id: string
          week_start: string
          xp_earned?: number | null
        }
        Update: {
          ai_recommendations?: string | null
          ai_summary?: string | null
          challenges?: string | null
          created_at?: string | null
          goals_progress?: Json | null
          highlights?: string | null
          id?: string
          mood_average?: number | null
          tasks_completed?: number | null
          tasks_total?: number | null
          user_id?: string
          week_start?: string
          xp_earned?: number | null
        }
        Relationships: []
      }
      aria_xp_logs: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          source: string
          source_id: string | null
          user_id: string
          xp_amount: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          source: string
          source_id?: string | null
          user_id: string
          xp_amount: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          source?: string
          source_id?: string | null
          user_id?: string
          xp_amount?: number
        }
        Relationships: []
      }
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
