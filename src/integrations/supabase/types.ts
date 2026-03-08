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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          category: string
          created_at: string
          description: string
          icon: string
          id: string
          key: string
          name: string
          requirement_type: string
          requirement_value: number
          reward_type: string | null
          reward_value: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          description: string
          icon?: string
          id?: string
          key: string
          name: string
          requirement_type?: string
          requirement_value?: number
          reward_type?: string | null
          reward_value?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          icon?: string
          id?: string
          key?: string
          name?: string
          requirement_type?: string
          requirement_value?: number
          reward_type?: string | null
          reward_value?: string | null
        }
        Relationships: []
      }
      friendships: {
        Row: {
          created_at: string
          friend_id: string
          id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          friend_id: string
          id?: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          friend_id?: string
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      game_messages: {
        Row: {
          created_at: string
          game_id: string
          id: string
          message: string
          user_id: string
        }
        Insert: {
          created_at?: string
          game_id: string
          id?: string
          message: string
          user_id: string
        }
        Update: {
          created_at?: string
          game_id?: string
          id?: string
          message?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_messages_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "online_games"
            referencedColumns: ["id"]
          },
        ]
      }
      matchmaking_queue: {
        Row: {
          created_at: string
          id: string
          rating: number
          time_control_label: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          rating?: number
          time_control_label?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          rating?: number
          time_control_label?: string
          user_id?: string
        }
        Relationships: []
      }
      online_games: {
        Row: {
          black_player_id: string
          black_time: number
          created_at: string
          fen: string
          id: string
          increment: number
          last_move_at: string | null
          last_move_from: string | null
          last_move_to: string | null
          pgn: string
          result: string | null
          status: string
          time_control_label: string
          turn: string
          updated_at: string
          white_player_id: string
          white_time: number
        }
        Insert: {
          black_player_id: string
          black_time?: number
          created_at?: string
          fen?: string
          id?: string
          increment?: number
          last_move_at?: string | null
          last_move_from?: string | null
          last_move_to?: string | null
          pgn?: string
          result?: string | null
          status?: string
          time_control_label?: string
          turn?: string
          updated_at?: string
          white_player_id: string
          white_time?: number
        }
        Update: {
          black_player_id?: string
          black_time?: number
          created_at?: string
          fen?: string
          id?: string
          increment?: number
          last_move_at?: string | null
          last_move_from?: string | null
          last_move_to?: string | null
          pgn?: string
          result?: string | null
          status?: string
          time_control_label?: string
          turn?: string
          updated_at?: string
          white_player_id?: string
          white_time?: number
        }
        Relationships: []
      }
      premium_chat_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          games_drawn: number
          games_lost: number
          games_played: number
          games_won: number
          id: string
          rating: number
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          games_drawn?: number
          games_lost?: number
          games_played?: number
          games_won?: number
          id?: string
          rating?: number
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          games_drawn?: number
          games_lost?: number
          games_played?: number
          games_won?: number
          id?: string
          rating?: number
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      puzzle_solves: {
        Row: {
          created_at: string
          id: string
          puzzle_date: string
          puzzle_index: number
          solved: boolean
          time_seconds: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          puzzle_date?: string
          puzzle_index: number
          solved?: boolean
          time_seconds?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          puzzle_date?: string
          puzzle_index?: number
          solved?: boolean
          time_seconds?: number | null
          user_id?: string
        }
        Relationships: []
      }
      tournament_pairings: {
        Row: {
          black_player_id: string | null
          created_at: string
          game_id: string | null
          id: string
          result: string | null
          round: number
          tournament_id: string
          white_player_id: string
        }
        Insert: {
          black_player_id?: string | null
          created_at?: string
          game_id?: string | null
          id?: string
          result?: string | null
          round: number
          tournament_id: string
          white_player_id: string
        }
        Update: {
          black_player_id?: string | null
          created_at?: string
          game_id?: string | null
          id?: string
          result?: string | null
          round?: number
          tournament_id?: string
          white_player_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_pairings_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "online_games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_pairings_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_registrations: {
        Row: {
          created_at: string
          id: string
          rating_at_join: number
          score: number
          tiebreak: number
          tournament_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          rating_at_join?: number
          score?: number
          tiebreak?: number
          tournament_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          rating_at_join?: number
          score?: number
          tiebreak?: number
          tournament_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_registrations_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournaments: {
        Row: {
          category: string
          created_at: string
          current_round: number
          description: string
          id: string
          max_players: number
          name: string
          round_started_at: string | null
          starts_at: string
          status: string
          time_control_increment: number
          time_control_label: string
          time_control_seconds: number
          total_rounds: number
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          current_round?: number
          description?: string
          id?: string
          max_players?: number
          name: string
          round_started_at?: string | null
          starts_at?: string
          status?: string
          time_control_increment?: number
          time_control_label?: string
          time_control_seconds?: number
          total_rounds?: number
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          current_round?: number
          description?: string
          id?: string
          max_players?: number
          name?: string
          round_started_at?: string | null
          starts_at?: string
          status?: string
          time_control_increment?: number
          time_control_label?: string
          time_control_seconds?: number
          total_rounds?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_collectibles: {
        Row: {
          collectible_key: string
          collectible_type: string
          earned_at: string
          equipped: boolean
          id: string
          user_id: string
        }
        Insert: {
          collectible_key: string
          collectible_type: string
          earned_at?: string
          equipped?: boolean
          id?: string
          user_id: string
        }
        Update: {
          collectible_key?: string
          collectible_type?: string
          earned_at?: string
          equipped?: boolean
          id?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      update_elo_ratings: {
        Args: { p_black_id: string; p_result: string; p_white_id: string }
        Returns: undefined
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
