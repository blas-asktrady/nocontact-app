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
      characters: {
        Row: {
          avatar_url: string | null
          created_at: string
          creator_user_id: string
          description: string
          font: string | null
          id: string
          is_public: boolean
          name: string
          personality_traits: Json | null
          prompt_template: string | null
          specializations: string[] | null
          updated_at: string
          voice_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          creator_user_id: string
          description: string
          font?: string | null
          id: string
          is_public?: boolean
          name: string
          personality_traits?: Json | null
          prompt_template?: string | null
          specializations?: string[] | null
          updated_at?: string
          voice_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          creator_user_id?: string
          description?: string
          font?: string | null
          id?: string
          is_public?: boolean
          name?: string
          personality_traits?: Json | null
          prompt_template?: string | null
          specializations?: string[] | null
          updated_at?: string
          voice_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "characters_creator_user_id_fkey"
            columns: ["creator_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      chats: {
        Row: {
          character_id: string | null
          context: Json | null
          created_at: string
          id: string
          is_archived: boolean
          is_pinned: boolean
          last_message_preview: string | null
          llm: string
          title: string
          total_tokens_used: number
          updated_at: string
          user_id: string
        }
        Insert: {
          character_id?: string | null
          context?: Json | null
          created_at?: string
          id: string
          is_archived?: boolean
          is_pinned?: boolean
          last_message_preview?: string | null
          llm: string
          title: string
          total_tokens_used?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          character_id?: string | null
          context?: Json | null
          created_at?: string
          id?: string
          is_archived?: boolean
          is_pinned?: boolean
          last_message_preview?: string | null
          llm?: string
          title?: string
          total_tokens_used?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chats_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      journals: {
        Row: {
          ai_insights: string | null
          content: string
          created_at: string
          id: string
          is_favorite: boolean
          journal_type: string
          mood_score: number | null
          tags: string[] | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_insights?: string | null
          content: string
          created_at?: string
          id?: string
          is_favorite?: boolean
          journal_type: string
          mood_score?: number | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_insights?: string | null
          content?: string
          created_at?: string
          id?: string
          is_favorite?: boolean
          journal_type?: string
          mood_score?: number | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      mascots: {
        Row: {
          created_at: string
          emotion_streak: number | null
          emotional_level: number | null
          id: string
          last_interaction_date: string | null
          level: number | null
          name: string | null
          updated_at: string
          user_id: string
          xp: number | null
        }
        Insert: {
          created_at?: string
          emotion_streak?: number | null
          emotional_level?: number | null
          id: string
          last_interaction_date?: string | null
          level?: number | null
          name?: string | null
          updated_at?: string
          user_id: string
          xp?: number | null
        }
        Update: {
          created_at?: string
          emotion_streak?: number | null
          emotional_level?: number | null
          id?: string
          last_interaction_date?: string | null
          level?: number | null
          name?: string | null
          updated_at?: string
          user_id?: string
          xp?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "mascots_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          audio_url: string | null
          chat_id: string
          content: string
          created_at: string
          id: string
          is_read: boolean
          metadata: Json | null
          reactions: Json | null
          sender_id: string
          sender_type: Database["public"]["Enums"]["sender_type"]
          tokens_used: number
        }
        Insert: {
          audio_url?: string | null
          chat_id: string
          content: string
          created_at?: string
          id: string
          is_read?: boolean
          metadata?: Json | null
          reactions?: Json | null
          sender_id: string
          sender_type: Database["public"]["Enums"]["sender_type"]
          tokens_used?: number
        }
        Update: {
          audio_url?: string | null
          chat_id?: string
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean
          metadata?: Json | null
          reactions?: Json | null
          sender_id?: string
          sender_type?: Database["public"]["Enums"]["sender_type"]
          tokens_used?: number
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
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          id: string
          is_read: boolean
          message: string
          notification_type: string
          related_entity_id: string | null
          related_entity_type: string | null
          title: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          id: string
          is_read?: boolean
          message: string
          notification_type: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          title: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          notification_type?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      surveys: {
        Row: {
          created_at: string
          depression_duration: string | null
          healing_goal: string | null
          id: string
          last_depression_episode: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          depression_duration?: string | null
          healing_goal?: string | null
          id?: string
          last_depression_episode?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          depression_duration?: string | null
          healing_goal?: string | null
          id?: string
          last_depression_episode?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_goals: {
        Row: {
          category: string | null
          completed: boolean
          completed_at: string | null
          created_at: string
          description: string | null
          id: string
          progress_percentage: number
          reminders: Json | null
          target_date: string | null
          title: string
          user_id: string
        }
        Insert: {
          category?: string | null
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id: string
          progress_percentage?: number
          reminders?: Json | null
          target_date?: string | null
          title: string
          user_id: string
        }
        Update: {
          category?: string | null
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          progress_percentage?: number
          reminders?: Json | null
          target_date?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_learnings_progress: {
        Row: {
          completed: boolean
          favorite: boolean
          id: string
          last_accessed: string
          learning_id: string
          notes: string | null
          progress_percentage: number
          user_id: string
        }
        Insert: {
          completed?: boolean
          favorite?: boolean
          id: string
          last_accessed?: string
          learning_id: string
          notes?: string | null
          progress_percentage?: number
          user_id: string
        }
        Update: {
          completed?: boolean
          favorite?: boolean
          id?: string
          last_accessed?: string
          learning_id?: string
          notes?: string | null
          progress_percentage?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_learnings_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          allowed_monthly_messages: number
          id: string
          messages_used_this_month: number
          no_contact_date: string | null
          notification_preferences: Json | null
          profile_picture_url: string | null
          streak_count: number
          streak_date: string | null
          timezone: string | null
          user_id: string
          wants_tips: boolean | null
        }
        Insert: {
          allowed_monthly_messages?: number
          id: string
          messages_used_this_month?: number
          no_contact_date?: string | null
          notification_preferences?: Json | null
          profile_picture_url?: string | null
          streak_count?: number
          streak_date?: string | null
          timezone?: string | null
          user_id: string
          wants_tips?: boolean | null
        }
        Update: {
          allowed_monthly_messages?: number
          id?: string
          messages_used_this_month?: number
          no_contact_date?: string | null
          notification_preferences?: Json | null
          profile_picture_url?: string | null
          streak_count?: number
          streak_date?: string | null
          timezone?: string | null
          user_id?: string
          wants_tips?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          auth_provider: string
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_active: boolean
          is_onboarding_completed: boolean
          last_login: string | null
          payment_customer_id: string | null
          payment_method: string | null
          payment_provider: string | null
          subscription_end_date: string | null
          subscription_start_date: string | null
          subscription_tier: Database["public"]["Enums"]["subscription_tier"]
          updated_at: string
          username: string | null
        }
        Insert: {
          auth_provider: string
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          is_active?: boolean
          is_onboarding_completed?: boolean
          last_login?: string | null
          payment_customer_id?: string | null
          payment_method?: string | null
          payment_provider?: string | null
          subscription_end_date?: string | null
          subscription_start_date?: string | null
          subscription_tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
          username?: string | null
        }
        Update: {
          auth_provider?: string
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          is_onboarding_completed?: boolean
          last_login?: string | null
          payment_customer_id?: string | null
          payment_method?: string | null
          payment_provider?: string | null
          subscription_end_date?: string | null
          subscription_start_date?: string | null
          subscription_tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
          username?: string | null
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
      content_type: "article" | "video" | "audio" | "exercise"
      sender_type: "user" | "ai" | "system"
      subscription_tier: "free" | "paid"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
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
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
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
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
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
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
