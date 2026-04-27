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
          created_at: string
          description: string
          icon: string
          id: string
          is_public: boolean
          member_count: number
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          avg_rating?: number
          created_at?: string
          description?: string
          icon?: string
          id?: string
          is_public?: boolean
          member_count?: number
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          avg_rating?: number
          created_at?: string
          description?: string
          icon?: string
          id?: string
          is_public?: boolean
          member_count?: number
          name?: string
          owner_id?: string
          updated_at?: string
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
      daily_missions: {
        Row: {
          created_at: string
          description: string
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
      online_games: {
        Row: {
          black_player_id: string
          black_time: number
          created_at: string
          elo_applied: boolean
          end_reason: string | null
          fen: string
          id: string
          increment: number
          is_rated: boolean
          last_move_at: string | null
          last_move_from: string | null
          last_move_to: string | null
          move_number: number
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
          elo_applied?: boolean
          end_reason?: string | null
          fen?: string
          id?: string
          increment?: number
          is_rated?: boolean
          last_move_at?: string | null
          last_move_from?: string | null
          last_move_to?: string | null
          move_number?: number
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
          elo_applied?: boolean
          end_reason?: string | null
          fen?: string
          id?: string
          increment?: number
          is_rated?: boolean
          last_move_at?: string | null
          last_move_from?: string | null
          last_move_to?: string | null
          move_number?: number
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
          avatar_url: string | null
          bio: string | null
          bot_games_drawn: number
          bot_games_lost: number
          bot_games_played: number
          bot_games_won: number
          bot_peak_rating: number
          bot_rating: number
          country: string | null
          country_flag: string | null
          created_at: string
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
          peak_rating: number
          rating: number
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          bot_games_drawn?: number
          bot_games_lost?: number
          bot_games_played?: number
          bot_games_won?: number
          bot_peak_rating?: number
          bot_rating?: number
          country?: string | null
          country_flag?: string | null
          created_at?: string
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
          peak_rating?: number
          rating?: number
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          bot_games_drawn?: number
          bot_games_lost?: number
          bot_games_played?: number
          bot_games_won?: number
          bot_peak_rating?: number
          bot_rating?: number
          country?: string | null
          country_flag?: string | null
          created_at?: string
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
          peak_rating?: number
          rating?: number
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
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
          auto_started: boolean
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
          auto_started?: boolean
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
          auto_started?: boolean
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
      are_friends: { Args: { _a: string; _b: string }; Returns: boolean }
      can_manage_tournaments: { Args: { _user_id: string }; Returns: boolean }
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
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      finalize_online_game: {
        Args: { p_end_reason: string; p_game_id: string; p_result: string }
        Returns: Json
      }
      get_club_role: { Args: { _club: string; _user: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_club_member: {
        Args: { _club: string; _user: string }
        Returns: boolean
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
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
      server_now: { Args: never; Returns: string }
      tournament_color_balance: {
        Args: { _tournament_id: string }
        Returns: {
          blacks: number
          user_id: string
          whites: number
        }[]
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
