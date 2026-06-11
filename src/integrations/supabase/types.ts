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
      ai_game_reviews: {
        Row: {
          created_at: string
          game_id: string
          id: string
          moment_caption: string | null
          moment_ply: number | null
          moment_san: string | null
          narrative: string
        }
        Insert: {
          created_at?: string
          game_id: string
          id?: string
          moment_caption?: string | null
          moment_ply?: number | null
          moment_san?: string | null
          narrative: string
        }
        Update: {
          created_at?: string
          game_id?: string
          id?: string
          moment_caption?: string | null
          moment_ply?: number | null
          moment_san?: string | null
          narrative?: string
        }
        Relationships: []
      }
      badges_catalog: {
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
          tier: string
        }
        Insert: {
          category?: string
          created_at?: string
          description: string
          icon?: string
          id?: string
          key: string
          name: string
          requirement_type: string
          requirement_value?: number
          tier?: string
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
          tier?: string
        }
        Relationships: []
      }
      battle_pass_claims: {
        Row: {
          claimed_at: string
          id: string
          reward_coins: number
          season_id: string
          tier_index: number
          track: string
          user_id: string
        }
        Insert: {
          claimed_at?: string
          id?: string
          reward_coins?: number
          season_id: string
          tier_index: number
          track?: string
          user_id: string
        }
        Update: {
          claimed_at?: string
          id?: string
          reward_coins?: number
          season_id?: string
          tier_index?: number
          track?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "battle_pass_claims_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      battle_pass_premium: {
        Row: {
          granted_at: string
          id: string
          price_paid: number
          season_id: string
          user_id: string
        }
        Insert: {
          granted_at?: string
          id?: string
          price_paid?: number
          season_id: string
          user_id: string
        }
        Update: {
          granted_at?: string
          id?: string
          price_paid?: number
          season_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "battle_pass_premium_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      battle_royale_matches: {
        Row: {
          created_at: string
          id: string
          player_a: string | null
          player_b: string | null
          round: number
          session_id: string
          slot: number
          status: string
          winner_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          player_a?: string | null
          player_b?: string | null
          round: number
          session_id: string
          slot: number
          status?: string
          winner_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          player_a?: string | null
          player_b?: string | null
          round?: number
          session_id?: string
          slot?: number
          status?: string
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "battle_royale_matches_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "battle_royale_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      battle_royale_queue: {
        Row: {
          joined_at: string
          user_id: string
        }
        Insert: {
          joined_at?: string
          user_id: string
        }
        Update: {
          joined_at?: string
          user_id?: string
        }
        Relationships: []
      }
      battle_royale_sessions: {
        Row: {
          finished_at: string | null
          id: string
          started_at: string
          status: string
          winner_id: string | null
        }
        Insert: {
          finished_at?: string | null
          id?: string
          started_at?: string
          status?: string
          winner_id?: string | null
        }
        Update: {
          finished_at?: string | null
          id?: string
          started_at?: string
          status?: string
          winner_id?: string | null
        }
        Relationships: []
      }
      bot_games: {
        Row: {
          bot_key: string | null
          bot_name: string
          bot_rating: number
          created_at: string
          id: string
          move_count: number
          outcome: string
          pgn: string
          player_color: string
          rating_change: number | null
          result: string
          time_control_label: string
          user_id: string
        }
        Insert: {
          bot_key?: string | null
          bot_name: string
          bot_rating: number
          created_at?: string
          id?: string
          move_count?: number
          outcome: string
          pgn?: string
          player_color: string
          rating_change?: number | null
          result: string
          time_control_label?: string
          user_id: string
        }
        Update: {
          bot_key?: string | null
          bot_name?: string
          bot_rating?: number
          created_at?: string
          id?: string
          move_count?: number
          outcome?: string
          pgn?: string
          player_color?: string
          rating_change?: number | null
          result?: string
          time_control_label?: string
          user_id?: string
        }
        Relationships: []
      }
      cities: {
        Row: {
          country_code: string
          country_name: string
          created_at: string
          flag: string
          key: string
          lat: number | null
          lng: number | null
          name: string
          region: string
        }
        Insert: {
          country_code: string
          country_name: string
          created_at?: string
          flag: string
          key: string
          lat?: number | null
          lng?: number | null
          name: string
          region: string
        }
        Update: {
          country_code?: string
          country_name?: string
          created_at?: string
          flag?: string
          key?: string
          lat?: number | null
          lng?: number | null
          name?: string
          region?: string
        }
        Relationships: []
      }
      clan_quests: {
        Row: {
          club_id: string
          coin_reward_per_member: number
          completed_at: string | null
          created_at: string
          current_value: number
          description: string
          id: string
          quest_date: string
          quest_key: string
          rewarded_at: string | null
          target_value: number
          title: string
        }
        Insert: {
          club_id: string
          coin_reward_per_member?: number
          completed_at?: string | null
          created_at?: string
          current_value?: number
          description?: string
          id?: string
          quest_date?: string
          quest_key?: string
          rewarded_at?: string | null
          target_value?: number
          title?: string
        }
        Update: {
          club_id?: string
          coin_reward_per_member?: number
          completed_at?: string | null
          created_at?: string
          current_value?: number
          description?: string
          id?: string
          quest_date?: string
          quest_key?: string
          rewarded_at?: string | null
          target_value?: number
          title?: string
        }
        Relationships: []
      }
      club_members: {
        Row: {
          club_id: string
          id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          club_id: string
          id?: string
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          club_id?: string
          id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "club_members_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      club_messages: {
        Row: {
          club_id: string
          created_at: string
          id: string
          message: string
          user_id: string
        }
        Insert: {
          club_id: string
          created_at?: string
          id?: string
          message: string
          user_id: string
        }
        Update: {
          club_id?: string
          created_at?: string
          id?: string
          message?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "club_messages_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      clubs: {
        Row: {
          avg_rating: number
          banner_color: string
          created_at: string
          description: string
          icon: string
          id: string
          is_public: boolean
          member_count: number
          name: string
          owner_id: string
          tag: string | null
          total_wins: number
          updated_at: string
          weekly_reset_at: string
          weekly_wins: number
        }
        Insert: {
          avg_rating?: number
          banner_color?: string
          created_at?: string
          description?: string
          icon?: string
          id?: string
          is_public?: boolean
          member_count?: number
          name: string
          owner_id: string
          tag?: string | null
          total_wins?: number
          updated_at?: string
          weekly_reset_at?: string
          weekly_wins?: number
        }
        Update: {
          avg_rating?: number
          banner_color?: string
          created_at?: string
          description?: string
          icon?: string
          id?: string
          is_public?: boolean
          member_count?: number
          name?: string
          owner_id?: string
          tag?: string | null
          total_wins?: number
          updated_at?: string
          weekly_reset_at?: string
          weekly_wins?: number
        }
        Relationships: []
      }
      community_posts: {
        Row: {
          comments_count: number
          content: string
          created_at: string
          fen: string | null
          game_id: string | null
          id: string
          image_url: string | null
          likes_count: number
          post_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          comments_count?: number
          content: string
          created_at?: string
          fen?: string | null
          game_id?: string | null
          id?: string
          image_url?: string | null
          likes_count?: number
          post_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          comments_count?: number
          content?: string
          created_at?: string
          fen?: string | null
          game_id?: string | null
          id?: string
          image_url?: string | null
          likes_count?: number
          post_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "online_games"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
        }
        Relationships: []
      }
      custom_lessons: {
        Row: {
          created_at: string
          id: string
          key_ideas: Json
          opening_eco: string | null
          opening_name: string
          pgn: string | null
          practice_lines: Json
          recommended_moves: Json
          source_game_id: string | null
          summary: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          key_ideas?: Json
          opening_eco?: string | null
          opening_name: string
          pgn?: string | null
          practice_lines?: Json
          recommended_moves?: Json
          source_game_id?: string | null
          summary: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          key_ideas?: Json
          opening_eco?: string | null
          opening_name?: string
          pgn?: string | null
          practice_lines?: Json
          recommended_moves?: Json
          source_game_id?: string | null
          summary?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_missions: {
        Row: {
          created_at: string
          description: string
          difficulty: string
          icon: string
          id: string
          is_active: boolean
          key: string
          mission_type: string
          sort_order: number
          target_value: number
          title: string
          xp_reward: number
        }
        Insert: {
          created_at?: string
          description: string
          difficulty?: string
          icon?: string
          id?: string
          is_active?: boolean
          key: string
          mission_type: string
          sort_order?: number
          target_value?: number
          title: string
          xp_reward?: number
        }
        Update: {
          created_at?: string
          description?: string
          difficulty?: string
          icon?: string
          id?: string
          is_active?: boolean
          key?: string
          mission_type?: string
          sort_order?: number
          target_value?: number
          title?: string
          xp_reward?: number
        }
        Relationships: []
      }
      daily_spin_claims: {
        Row: {
          claim_date: string
          coins_awarded: number
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          claim_date?: string
          coins_awarded: number
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          claim_date?: string
          coins_awarded?: number
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      direct_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          read_at: string | null
          recipient_id: string
          sender_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read_at?: string | null
          recipient_id: string
          sender_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      donation_goals: {
        Row: {
          created_at: string
          currency: string
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean
          target_amount: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          target_amount: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          target_amount?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
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
      game_invites: {
        Row: {
          created_at: string
          expires_at: string
          game_id: string | null
          id: string
          is_rated: boolean
          message: string | null
          recipient_id: string
          responded_at: string | null
          sender_color: string
          sender_id: string
          status: string
          time_control_increment: number
          time_control_label: string
          time_control_seconds: number
        }
        Insert: {
          created_at?: string
          expires_at?: string
          game_id?: string | null
          id?: string
          is_rated?: boolean
          message?: string | null
          recipient_id: string
          responded_at?: string | null
          sender_color?: string
          sender_id: string
          status?: string
          time_control_increment?: number
          time_control_label?: string
          time_control_seconds?: number
        }
        Update: {
          created_at?: string
          expires_at?: string
          game_id?: string | null
          id?: string
          is_rated?: boolean
          message?: string | null
          recipient_id?: string
          responded_at?: string | null
          sender_color?: string
          sender_id?: string
          status?: string
          time_control_increment?: number
          time_control_label?: string
          time_control_seconds?: number
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
      hand_brain_roles: {
        Row: {
          black_brain_id: string
          black_hand_id: string
          created_at: string
          game_id: string
          id: string
          white_brain_id: string
          white_hand_id: string
        }
        Insert: {
          black_brain_id: string
          black_hand_id: string
          created_at?: string
          game_id: string
          id?: string
          white_brain_id: string
          white_hand_id: string
        }
        Update: {
          black_brain_id?: string
          black_hand_id?: string
          created_at?: string
          game_id?: string
          id?: string
          white_brain_id?: string
          white_hand_id?: string
        }
        Relationships: []
      }
      learning_streaks: {
        Row: {
          current_streak: number
          id: string
          last_activity_date: string | null
          longest_streak: number
          total_lessons_completed: number
          updated_at: string
          user_id: string
        }
        Insert: {
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          longest_streak?: number
          total_lessons_completed?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          longest_streak?: number
          total_lessons_completed?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      lesson_bookmarks: {
        Row: {
          course_id: string
          created_at: string
          id: string
          lesson_id: string
          user_id: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          lesson_id: string
          user_id: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          lesson_id?: string
          user_id?: string
        }
        Relationships: []
      }
      lesson_progress: {
        Row: {
          completed: boolean
          completed_at: string | null
          course_id: string
          created_at: string
          id: string
          lesson_id: string
          score: number | null
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          course_id: string
          created_at?: string
          id?: string
          lesson_id: string
          score?: number | null
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          course_id?: string
          created_at?: string
          id?: string
          lesson_id?: string
          score?: number | null
          user_id?: string
        }
        Relationships: []
      }
      lobby_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
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
      notification_preferences: {
        Row: {
          challenges: boolean
          created_at: string
          daily_reminder: boolean
          direct_messages: boolean
          friend_activity: boolean
          tournaments: boolean
          updated_at: string
          user_id: string
          your_turn: boolean
        }
        Insert: {
          challenges?: boolean
          created_at?: string
          daily_reminder?: boolean
          direct_messages?: boolean
          friend_activity?: boolean
          tournaments?: boolean
          updated_at?: string
          user_id: string
          your_turn?: boolean
        }
        Update: {
          challenges?: boolean
          created_at?: string
          daily_reminder?: boolean
          direct_messages?: boolean
          friend_activity?: boolean
          tournaments?: boolean
          updated_at?: string
          user_id?: string
          your_turn?: boolean
        }
        Relationships: []
      }
      online_draw_offers: {
        Row: {
          created_at: string
          from_user_id: string
          game_id: string
          id: string
          resolved_at: string | null
          status: string
        }
        Insert: {
          created_at?: string
          from_user_id: string
          game_id: string
          id?: string
          resolved_at?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          from_user_id?: string
          game_id?: string
          id?: string
          resolved_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "online_draw_offers_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "online_games"
            referencedColumns: ["id"]
          },
        ]
      }
      online_game_moves: {
        Row: {
          black_time: number
          color: string
          created_at: string
          fen_after: string
          fen_before: string
          from_square: string
          game_id: string
          id: string
          pgn_after: string
          player_id: string
          ply: number
          promotion: string | null
          san: string
          to_square: string
          white_time: number
        }
        Insert: {
          black_time: number
          color: string
          created_at?: string
          fen_after: string
          fen_before: string
          from_square: string
          game_id: string
          id?: string
          pgn_after?: string
          player_id: string
          ply: number
          promotion?: string | null
          san: string
          to_square: string
          white_time: number
        }
        Update: {
          black_time?: number
          color?: string
          created_at?: string
          fen_after?: string
          fen_before?: string
          from_square?: string
          game_id?: string
          id?: string
          pgn_after?: string
          player_id?: string
          ply?: number
          promotion?: string | null
          san?: string
          to_square?: string
          white_time?: number
        }
        Relationships: []
      }
      online_game_presence: {
        Row: {
          game_id: string
          last_seen: string
          user_id: string
        }
        Insert: {
          game_id: string
          last_seen?: string
          user_id: string
        }
        Update: {
          game_id?: string
          last_seen?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "online_game_presence_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "online_games"
            referencedColumns: ["id"]
          },
        ]
      }
      online_games: {
        Row: {
          black_player_id: string
          black_time: number
          created_at: string
          elo_applied: boolean
          end_reason: string | null
          fen: string
          hand_brain_meta: Json
          id: string
          increment: number
          is_rated: boolean
          last_move_at: string | null
          last_move_from: string | null
          last_move_to: string | null
          mode: string
          move_number: number
          pgn: string
          result: string | null
          status: string
          streamer_only: boolean
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
          elo_applied?: boolean
          end_reason?: string | null
          fen?: string
          hand_brain_meta?: Json
          id?: string
          increment?: number
          is_rated?: boolean
          last_move_at?: string | null
          last_move_from?: string | null
          last_move_to?: string | null
          mode?: string
          move_number?: number
          pgn?: string
          result?: string | null
          status?: string
          streamer_only?: boolean
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
          elo_applied?: boolean
          end_reason?: string | null
          fen?: string
          hand_brain_meta?: Json
          id?: string
          increment?: number
          is_rated?: boolean
          last_move_at?: string | null
          last_move_from?: string | null
          last_move_to?: string | null
          mode?: string
          move_number?: number
          pgn?: string
          result?: string | null
          status?: string
          streamer_only?: boolean
          time_control_label?: string
          turn?: string
          updated_at?: string
          white_player_id?: string
          white_time?: number
        }
        Relationships: []
      }
      player_badges: {
        Row: {
          badge_key: string
          context: Json | null
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_key: string
          context?: Json | null
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_key?: string
          context?: Json | null
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      post_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
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
          avatar_frame: string | null
          avatar_url: string | null
          bio: string | null
          bot_games_drawn: number
          bot_games_lost: number
          bot_games_played: number
          bot_games_won: number
          bot_peak_rating: number
          bot_rating: number
          city_key: string | null
          country: string | null
          country_flag: string | null
          created_at: string
          current_game_id: string | null
          display_name: string | null
          favorite_openings: string[] | null
          followers_count: number
          following_count: number
          games_drawn: number
          games_lost: number
          games_played: number
          games_won: number
          highest_title_key: string | null
          id: string
          is_streamer: boolean
          last_login_reward_date: string | null
          login_streak: number
          login_streak_best: number
          loss_streak: number
          master_coins: number
          peak_rating: number
          profile_banner: string | null
          push_notifications_enabled: boolean
          rating: number
          total_xp: number
          updated_at: string
          user_id: string
          username: string | null
          welcome_day: number
          welcome_last_claim: string | null
          win_streak: number
        }
        Insert: {
          avatar_frame?: string | null
          avatar_url?: string | null
          bio?: string | null
          bot_games_drawn?: number
          bot_games_lost?: number
          bot_games_played?: number
          bot_games_won?: number
          bot_peak_rating?: number
          bot_rating?: number
          city_key?: string | null
          country?: string | null
          country_flag?: string | null
          created_at?: string
          current_game_id?: string | null
          display_name?: string | null
          favorite_openings?: string[] | null
          followers_count?: number
          following_count?: number
          games_drawn?: number
          games_lost?: number
          games_played?: number
          games_won?: number
          highest_title_key?: string | null
          id?: string
          is_streamer?: boolean
          last_login_reward_date?: string | null
          login_streak?: number
          login_streak_best?: number
          loss_streak?: number
          master_coins?: number
          peak_rating?: number
          profile_banner?: string | null
          push_notifications_enabled?: boolean
          rating?: number
          total_xp?: number
          updated_at?: string
          user_id: string
          username?: string | null
          welcome_day?: number
          welcome_last_claim?: string | null
          win_streak?: number
        }
        Update: {
          avatar_frame?: string | null
          avatar_url?: string | null
          bio?: string | null
          bot_games_drawn?: number
          bot_games_lost?: number
          bot_games_played?: number
          bot_games_won?: number
          bot_peak_rating?: number
          bot_rating?: number
          city_key?: string | null
          country?: string | null
          country_flag?: string | null
          created_at?: string
          current_game_id?: string | null
          display_name?: string | null
          favorite_openings?: string[] | null
          followers_count?: number
          following_count?: number
          games_drawn?: number
          games_lost?: number
          games_played?: number
          games_won?: number
          highest_title_key?: string | null
          id?: string
          is_streamer?: boolean
          last_login_reward_date?: string | null
          login_streak?: number
          login_streak_best?: number
          loss_streak?: number
          master_coins?: number
          peak_rating?: number
          profile_banner?: string | null
          push_notifications_enabled?: boolean
          rating?: number
          total_xp?: number
          updated_at?: string
          user_id?: string
          username?: string | null
          welcome_day?: number
          welcome_last_claim?: string | null
          win_streak?: number
        }
        Relationships: [
          {
            foreignKeyName: "profiles_city_key_fkey"
            columns: ["city_key"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "profiles_city_key_fkey"
            columns: ["city_key"]
            isOneToOne: false
            referencedRelation: "city_leaderboard"
            referencedColumns: ["key"]
          },
        ]
      }
      purchases: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          item_id: string | null
          item_type: string
          status: string
          stripe_session_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          item_id?: string | null
          item_type: string
          status?: string
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          item_id?: string | null
          item_type?: string
          status?: string
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          last_used_at: string
          p256dh: string
          platform: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          last_used_at?: string
          p256dh: string
          platform?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          last_used_at?: string
          p256dh?: string
          platform?: string | null
          user_agent?: string | null
          user_id?: string
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
      rating_history: {
        Row: {
          created_at: string
          id: string
          new_rating: number
          old_rating: number
          opponent_label: string | null
          opponent_rating: number | null
          rating_change: number
          rating_type: string
          result: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          new_rating: number
          old_rating: number
          opponent_label?: string | null
          opponent_rating?: number | null
          rating_change: number
          rating_type?: string
          result: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          new_rating?: number
          old_rating?: number
          opponent_label?: string | null
          opponent_rating?: number | null
          rating_change?: number
          rating_type?: string
          result?: string
          user_id?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          converted_at: string | null
          created_at: string
          first_game_bonus_paid: boolean
          id: string
          ref_code: string
          referred_user_id: string | null
          referrer_user_id: string | null
          signup_bonus_paid: boolean
          status: string
          user_agent: string | null
          visitor_fingerprint: string | null
        }
        Insert: {
          converted_at?: string | null
          created_at?: string
          first_game_bonus_paid?: boolean
          id?: string
          ref_code: string
          referred_user_id?: string | null
          referrer_user_id?: string | null
          signup_bonus_paid?: boolean
          status?: string
          user_agent?: string | null
          visitor_fingerprint?: string | null
        }
        Update: {
          converted_at?: string | null
          created_at?: string
          first_game_bonus_paid?: boolean
          id?: string
          ref_code?: string
          referred_user_id?: string | null
          referrer_user_id?: string | null
          signup_bonus_paid?: boolean
          status?: string
          user_agent?: string | null
          visitor_fingerprint?: string | null
        }
        Relationships: []
      }
      season_results: {
        Row: {
          created_at: string
          final_rank: number
          final_rating: number
          games_played: number
          games_won: number
          id: string
          peak_rating: number
          rating_type: string
          reward_tier: string | null
          season_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          final_rank: number
          final_rating: number
          games_played?: number
          games_won?: number
          id?: string
          peak_rating: number
          rating_type?: string
          reward_tier?: string | null
          season_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          final_rank?: number
          final_rating?: number
          games_played?: number
          games_won?: number
          id?: string
          peak_rating?: number
          rating_type?: string
          reward_tier?: string | null
          season_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "season_results_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      seasons: {
        Row: {
          created_at: string
          ends_at: string
          id: string
          name: string
          season_number: number
          starts_at: string
          status: string
        }
        Insert: {
          created_at?: string
          ends_at: string
          id?: string
          name: string
          season_number: number
          starts_at?: string
          status?: string
        }
        Update: {
          created_at?: string
          ends_at?: string
          id?: string
          name?: string
          season_number?: number
          starts_at?: string
          status?: string
        }
        Relationships: []
      }
      site_ratings: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      spectator_bets: {
        Row: {
          created_at: string
          game_id: string
          id: string
          odds_at_bet: number
          payout: number | null
          resolved_at: string | null
          side: string
          stake: number
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          game_id: string
          id?: string
          odds_at_bet: number
          payout?: number | null
          resolved_at?: string | null
          side: string
          stake: number
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          game_id?: string
          id?: string
          odds_at_bet?: number
          payout?: number | null
          resolved_at?: string | null
          side?: string
          stake?: number
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      stockfish_eval_cache: {
        Row: {
          created_at: string
          depth: number
          engine: string
          evaluation: number
          fen: string
          id: string
          mate: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          depth: number
          engine?: string
          evaluation?: number
          fen: string
          id?: string
          mate?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          depth?: number
          engine?: string
          evaluation?: number
          fen?: string
          id?: string
          mate?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      story_progress: {
        Row: {
          chapter_key: string
          completed: boolean
          completed_at: string | null
          created_at: string
          id: string
          stars: number
          user_id: string
        }
        Insert: {
          chapter_key: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          stars?: number
          user_id: string
        }
        Update: {
          chapter_key?: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          stars?: number
          user_id?: string
        }
        Relationships: []
      }
      stream_chat_messages: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          is_highlighted: boolean
          message: string
          role: string
          user_id: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          is_highlighted?: boolean
          message: string
          role?: string
          user_id: string
          username?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          is_highlighted?: boolean
          message?: string
          role?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      stream_donations: {
        Row: {
          alert_shown: boolean
          amount: number
          created_at: string
          currency: string
          id: string
          message: string | null
          user_id: string | null
          username: string
        }
        Insert: {
          alert_shown?: boolean
          amount: number
          created_at?: string
          currency?: string
          id?: string
          message?: string | null
          user_id?: string | null
          username?: string
        }
        Update: {
          alert_shown?: boolean
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          message?: string | null
          user_id?: string | null
          username?: string
        }
        Relationships: []
      }
      stream_queue: {
        Row: {
          avatar_url: string | null
          created_at: string
          game_mode: string
          id: string
          priority: number
          role: string
          status: string
          user_id: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          game_mode?: string
          id?: string
          priority?: number
          role?: string
          status?: string
          user_id: string
          username?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          game_mode?: string
          id?: string
          priority?: number
          role?: string
          status?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      stream_subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          status: string
          stripe_subscription_id: string | null
          tier: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          status?: string
          stripe_subscription_id?: string | null
          tier?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          status?: string
          stripe_subscription_id?: string | null
          tier?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      team_battle_members: {
        Row: {
          battle_id: string
          id: string
          joined_at: string
          score: number
          team: string
          user_id: string
        }
        Insert: {
          battle_id: string
          id?: string
          joined_at?: string
          score?: number
          team: string
          user_id: string
        }
        Update: {
          battle_id?: string
          id?: string
          joined_at?: string
          score?: number
          team?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_battle_members_battle_id_fkey"
            columns: ["battle_id"]
            isOneToOne: false
            referencedRelation: "team_battles"
            referencedColumns: ["id"]
          },
        ]
      }
      team_battles: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          ends_at: string | null
          id: string
          max_per_team: number
          name: string
          starts_at: string
          status: string
          team_a_name: string
          team_a_score: number
          team_b_name: string
          team_b_score: number
          time_control_label: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          ends_at?: string | null
          id?: string
          max_per_team?: number
          name: string
          starts_at?: string
          status?: string
          team_a_name?: string
          team_a_score?: number
          team_b_name?: string
          team_b_score?: number
          time_control_label?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          max_per_team?: number
          name?: string
          starts_at?: string
          status?: string
          team_a_name?: string
          team_a_score?: number
          team_b_name?: string
          team_b_score?: number
          time_control_label?: string
          updated_at?: string
        }
        Relationships: []
      }
      tournament_anti_cheat_flags: {
        Row: {
          created_at: string
          details: Json | null
          game_id: string | null
          id: string
          resolution: string | null
          resolved: boolean
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          signal_type: string
          tournament_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          details?: Json | null
          game_id?: string | null
          id?: string
          resolution?: string | null
          resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          signal_type: string
          tournament_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          details?: Json | null
          game_id?: string | null
          id?: string
          resolution?: string | null
          resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          signal_type?: string
          tournament_id?: string
          user_id?: string
        }
        Relationships: []
      }
      tournament_chat_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          tournament_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          tournament_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          tournament_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_chat_messages_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          tournament_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          tournament_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          tournament_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_messages_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
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
          buchholz: number
          created_at: string
          id: string
          rating_at_join: number
          score: number
          sonneborn: number
          tiebreak: number
          tournament_id: string
          user_id: string
          wins: number
        }
        Insert: {
          buchholz?: number
          created_at?: string
          id?: string
          rating_at_join?: number
          score?: number
          sonneborn?: number
          tiebreak?: number
          tournament_id: string
          user_id: string
          wins?: number
        }
        Update: {
          buchholz?: number
          created_at?: string
          id?: string
          rating_at_join?: number
          score?: number
          sonneborn?: number
          tiebreak?: number
          tournament_id?: string
          user_id?: string
          wins?: number
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
      tournament_streaks: {
        Row: {
          current_streak: number
          id: string
          last_participation_date: string | null
          longest_streak: number
          total_tournaments_played: number
          updated_at: string
          user_id: string
        }
        Insert: {
          current_streak?: number
          id?: string
          last_participation_date?: string | null
          longest_streak?: number
          total_tournaments_played?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          current_streak?: number
          id?: string
          last_participation_date?: string | null
          longest_streak?: number
          total_tournaments_played?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tournaments: {
        Row: {
          anti_cheat_level: string
          arena_duration_minutes: number | null
          auto_started: boolean
          berserk_allowed: boolean
          category: string
          created_at: string
          created_by: string | null
          current_round: number
          description: string
          entry_fee: number
          format: string
          id: string
          is_rated: boolean
          max_players: number
          name: string
          registration_deadline: string | null
          round_started_at: string | null
          start_time_locked: boolean
          starts_at: string
          status: string
          time_control_increment: number
          time_control_label: string
          time_control_seconds: number
          total_rounds: number
          tournament_type: string
          updated_at: string
          visibility: string
        }
        Insert: {
          anti_cheat_level?: string
          arena_duration_minutes?: number | null
          auto_started?: boolean
          berserk_allowed?: boolean
          category?: string
          created_at?: string
          created_by?: string | null
          current_round?: number
          description?: string
          entry_fee?: number
          format?: string
          id?: string
          is_rated?: boolean
          max_players?: number
          name: string
          registration_deadline?: string | null
          round_started_at?: string | null
          start_time_locked?: boolean
          starts_at?: string
          status?: string
          time_control_increment?: number
          time_control_label?: string
          time_control_seconds?: number
          total_rounds?: number
          tournament_type?: string
          updated_at?: string
          visibility?: string
        }
        Update: {
          anti_cheat_level?: string
          arena_duration_minutes?: number | null
          auto_started?: boolean
          berserk_allowed?: boolean
          category?: string
          created_at?: string
          created_by?: string | null
          current_round?: number
          description?: string
          entry_fee?: number
          format?: string
          id?: string
          is_rated?: boolean
          max_players?: number
          name?: string
          registration_deadline?: string | null
          round_started_at?: string | null
          start_time_locked?: boolean
          starts_at?: string
          status?: string
          time_control_increment?: number
          time_control_label?: string
          time_control_seconds?: number
          total_rounds?: number
          tournament_type?: string
          updated_at?: string
          visibility?: string
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
      user_daily_streaks: {
        Row: {
          created_at: string
          current_streak: number
          freeze_available: boolean
          freeze_used_date: string | null
          id: string
          last_active_date: string | null
          longest_streak: number
          total_active_days: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_streak?: number
          freeze_available?: boolean
          freeze_used_date?: string | null
          id?: string
          last_active_date?: string | null
          longest_streak?: number
          total_active_days?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_streak?: number
          freeze_available?: boolean
          freeze_used_date?: string | null
          id?: string
          last_active_date?: string | null
          longest_streak?: number
          total_active_days?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_inventory: {
        Row: {
          acquired_at: string
          id: string
          item_key: string
          item_type: string
          price_paid: number
          user_id: string
        }
        Insert: {
          acquired_at?: string
          id?: string
          item_key: string
          item_type: string
          price_paid?: number
          user_id: string
        }
        Update: {
          acquired_at?: string
          id?: string
          item_key?: string
          item_type?: string
          price_paid?: number
          user_id?: string
        }
        Relationships: []
      }
      user_mission_progress: {
        Row: {
          claimed: boolean
          claimed_at: string | null
          completed: boolean
          completed_at: string | null
          created_at: string
          current_value: number
          id: string
          mission_date: string
          mission_key: string
          updated_at: string
          user_id: string
        }
        Insert: {
          claimed?: boolean
          claimed_at?: string | null
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          current_value?: number
          id?: string
          mission_date?: string
          mission_key: string
          updated_at?: string
          user_id: string
        }
        Update: {
          claimed?: boolean
          claimed_at?: string | null
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          current_value?: number
          id?: string
          mission_date?: string
          mission_key?: string
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
          role: Database["public"]["Enums"]["app_role"]
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
      win_streaks: {
        Row: {
          best_streak: number
          current_streak: number
          id: string
          last_result: string | null
          loss_streak: number
          rating_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          best_streak?: number
          current_streak?: number
          id?: string
          last_result?: string | null
          loss_streak?: number
          rating_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          best_streak?: number
          current_streak?: number
          id?: string
          last_result?: string | null
          loss_streak?: number
          rating_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      city_leaderboard: {
        Row: {
          avg_rating: number | null
          country_name: string | null
          flag: string | null
          key: string | null
          name: string | null
          players: number | null
          region: string | null
          top_rating: number | null
          total_games: number | null
          total_wins: number | null
        }
        Relationships: []
      }
      tournament_played_pairs: {
        Row: {
          player_a: string | null
          player_b: string | null
          rounds: number[] | null
          tournament_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tournament_pairings_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      _clear_current_game: { Args: { p_game_id: string }; Returns: undefined }
      _mc_claim_first_win_today: { Args: { p_user: string }; Returns: boolean }
      abort_online_game: { Args: { p_game_id: string }; Returns: Json }
      are_friends: { Args: { _a: string; _b: string }; Returns: boolean }
      assert_can_queue: { Args: never; Returns: Json }
      award_bot_game_coins: {
        Args: { p_bot_rating: number; p_result: string; p_win_streak?: number }
        Returns: Json
      }
      award_online_game_coins: {
        Args: { p_game_id: string; p_win_streak?: number }
        Returns: Json
      }
      battle_pass_progress: {
        Args: { _user: string }
        Returns: {
          ends_at: string
          season_id: string
          season_name: string
          season_xp: number
        }[]
      }
      bump_mission_progress: {
        Args: {
          p_amount?: number
          p_mission_type: string
          p_set_absolute?: number
        }
        Returns: Json
      }
      bump_win_streak: {
        Args: { p_rating_type: string; p_result: string }
        Returns: Json
      }
      buy_premium_pass: { Args: never; Returns: Json }
      can_manage_tournaments: { Args: { _user_id: string }; Returns: boolean }
      claim_afk_win: { Args: { p_game_id: string }; Returns: Json }
      claim_battle_pass_tier:
        | { Args: { _tier: number }; Returns: Json }
        | { Args: { _tier: number; _track?: string }; Returns: Json }
      claim_daily_mission: { Args: { p_key: string }; Returns: Json }
      claim_daily_reward: { Args: never; Returns: Json }
      claim_daily_spin: { Args: never; Returns: Json }
      claim_referral_first_games: { Args: never; Returns: Json }
      claim_referral_signup: { Args: { p_ref_code: string }; Returns: Json }
      claim_welcome_reward: { Args: never; Returns: Json }
      cleanup_stale_game: { Args: { p_user_id: string }; Returns: string }
      commit_online_move: {
        Args: {
          p_black_time: number
          p_color: string
          p_end_reason?: string
          p_expected_move_number: number
          p_fen_after: string
          p_fen_before: string
          p_from: string
          p_game_id: string
          p_pgn_after: string
          p_promotion: string
          p_result?: string
          p_san: string
          p_to: string
          p_turn_after: string
          p_white_time: number
        }
        Returns: Json
      }
      contribute_clan_quest: {
        Args: { p_amount?: number; p_metric: string }
        Returns: Json
      }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      dismiss_game_invite: { Args: { p_invite_id: string }; Returns: Json }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      finalize_online_game: {
        Args: { p_end_reason: string; p_game_id: string; p_result: string }
        Returns: Json
      }
      get_club_role: { Args: { _club: string; _user: string }; Returns: string }
      get_my_profile: {
        Args: never
        Returns: {
          avatar_frame: string | null
          avatar_url: string | null
          bio: string | null
          bot_games_drawn: number
          bot_games_lost: number
          bot_games_played: number
          bot_games_won: number
          bot_peak_rating: number
          bot_rating: number
          city_key: string | null
          country: string | null
          country_flag: string | null
          created_at: string
          current_game_id: string | null
          display_name: string | null
          favorite_openings: string[] | null
          followers_count: number
          following_count: number
          games_drawn: number
          games_lost: number
          games_played: number
          games_won: number
          highest_title_key: string | null
          id: string
          is_streamer: boolean
          last_login_reward_date: string | null
          login_streak: number
          login_streak_best: number
          loss_streak: number
          master_coins: number
          peak_rating: number
          profile_banner: string | null
          push_notifications_enabled: boolean
          rating: number
          total_xp: number
          updated_at: string
          user_id: string
          username: string | null
          welcome_day: number
          welcome_last_claim: string | null
          win_streak: number
        }[]
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_or_create_clan_quest: {
        Args: { p_club_id: string }
        Returns: {
          club_id: string
          coin_reward_per_member: number
          completed_at: string | null
          created_at: string
          current_value: number
          description: string
          id: string
          quest_date: string
          quest_key: string
          rewarded_at: string | null
          target_value: number
          title: string
        }
        SetofOptions: {
          from: "*"
          to: "clan_quests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_today_missions: {
        Args: { p_date?: string }
        Returns: {
          description: string
          difficulty: string
          icon: string
          id: string
          key: string
          mission_type: string
          sort_order: number
          target_value: number
          title: string
          xp_reward: number
        }[]
      }
      has_premium_pass: {
        Args: { _season: string; _user: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      heartbeat_online_game: { Args: { p_game_id: string }; Returns: undefined }
      is_club_member: {
        Args: { _club: string; _user: string }
        Returns: boolean
      }
      join_battle_royale: { Args: never; Returns: Json }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      my_referral_stats: { Args: never; Returns: Json }
      offer_draw: { Args: { p_game_id: string }; Returns: Json }
      place_spectator_bet: {
        Args: {
          p_game_id: string
          p_odds: number
          p_side: string
          p_stake: number
        }
        Returns: Json
      }
      purchase_shop_item: {
        Args: { p_item_key: string; p_item_type: string; p_price: number }
        Returns: Json
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      recalc_tournament_tiebreaks: {
        Args: { _tid: string }
        Returns: undefined
      }
      report_battle_royale_winner: {
        Args: { _match: string; _winner: string }
        Returns: Json
      }
      resolve_ref_code: { Args: { _ref_code: string }; Returns: string }
      respond_draw_offer: {
        Args: { p_accept: boolean; p_offer_id: string }
        Returns: Json
      }
      server_now: { Args: never; Returns: string }
      settle_bets_for_game: { Args: { p_game_id: string }; Returns: Json }
      spin_wheel_paid: { Args: never; Returns: Json }
      start_online_game: {
        Args: {
          p_black_id: string
          p_black_time: number
          p_increment: number
          p_time_control_label: string
          p_white_id: string
          p_white_time: number
        }
        Returns: Json
      }
      top_clans: {
        Args: { p_limit?: number }
        Returns: {
          avg_rating: number
          banner_color: string
          icon: string
          id: string
          member_count: number
          name: string
          tag: string
          total_wins: number
          weekly_wins: number
        }[]
      }
      tournament_color_balance: {
        Args: { _tournament_id: string }
        Returns: {
          blacks: number
          user_id: string
          whites: number
        }[]
      }
      track_referral_visit: {
        Args: {
          p_fingerprint: string
          p_ref_code: string
          p_user_agent?: string
        }
        Returns: undefined
      }
      update_elo_ratings: {
        Args: { p_black_id: string; p_result: string; p_white_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "organizer"
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
      app_role: ["admin", "moderator", "user", "organizer"],
    },
  },
} as const
