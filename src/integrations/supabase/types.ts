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
      affiliate_clicks: {
        Row: {
          code: string
          created_at: string
          id: string
          referrer: string | null
          user_agent: string | null
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          referrer?: string | null
          user_agent?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          referrer?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_clicks_code_fkey"
            columns: ["code"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "affiliate_clicks_code_fkey"
            columns: ["code"]
            isOneToOne: false
            referencedRelation: "affiliates_public"
            referencedColumns: ["code"]
          },
        ]
      }
      affiliates: {
        Row: {
          code: string
          commission_coins_per_signup: number
          commission_coins_per_tournament_join: number
          created_at: string
          is_active: boolean
          owner_email: string | null
          owner_name: string
          owner_user_id: string | null
          partner_tier: string
          total_clicks: number
          total_coins_paid: number
          total_joins: number
          total_signups: number
          updated_at: string
        }
        Insert: {
          code: string
          commission_coins_per_signup?: number
          commission_coins_per_tournament_join?: number
          created_at?: string
          is_active?: boolean
          owner_email?: string | null
          owner_name: string
          owner_user_id?: string | null
          partner_tier?: string
          total_clicks?: number
          total_coins_paid?: number
          total_joins?: number
          total_signups?: number
          updated_at?: string
        }
        Update: {
          code?: string
          commission_coins_per_signup?: number
          commission_coins_per_tournament_join?: number
          created_at?: string
          is_active?: boolean
          owner_email?: string | null
          owner_name?: string
          owner_user_id?: string | null
          partner_tier?: string
          total_clicks?: number
          total_coins_paid?: number
          total_joins?: number
          total_signups?: number
          updated_at?: string
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
      blog_posts: {
        Row: {
          author_id: string | null
          body_md: string
          cover_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          published_at: string | null
          reading_minutes: number | null
          slug: string
          status: string
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          body_md: string
          cover_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published_at?: string | null
          reading_minutes?: number | null
          slug: string
          status?: string
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          body_md?: string
          cover_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published_at?: string | null
          reading_minutes?: number | null
          slug?: string
          status?: string
          tags?: string[]
          title?: string
          updated_at?: string
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
      challenge_links: {
        Row: {
          claimed_by: string | null
          code: string
          created_at: string
          creator_id: string | null
          expires_at: string
          game_id: string | null
          id: string
          increment: number
          initial_time: number
          is_rated: boolean
          status: string
          time_control_label: string
        }
        Insert: {
          claimed_by?: string | null
          code: string
          created_at?: string
          creator_id?: string | null
          expires_at?: string
          game_id?: string | null
          id?: string
          increment?: number
          initial_time?: number
          is_rated?: boolean
          status?: string
          time_control_label?: string
        }
        Update: {
          claimed_by?: string | null
          code?: string
          created_at?: string
          creator_id?: string | null
          expires_at?: string
          game_id?: string | null
          id?: string
          increment?: number
          initial_time?: number
          is_rated?: boolean
          status?: string
          time_control_label?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_links_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "online_games"
            referencedColumns: ["id"]
          },
        ]
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
          city: string | null
          created_at: string
          description: string
          icon: string
          id: string
          is_public: boolean
          lat: number | null
          lng: number | null
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
          city?: string | null
          created_at?: string
          description?: string
          icon?: string
          id?: string
          is_public?: boolean
          lat?: number | null
          lng?: number | null
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
          city?: string | null
          created_at?: string
          description?: string
          icon?: string
          id?: string
          is_public?: boolean
          lat?: number | null
          lng?: number | null
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
      confessions: {
        Row: {
          body: string
          created_at: string
          id: string
          is_public: boolean
          show_handle: boolean
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          is_public?: boolean
          show_handle?: boolean
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_public?: boolean
          show_handle?: boolean
          user_id?: string
        }
        Relationships: []
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
      daily_kings: {
        Row: {
          computed_at: string
          games_played: number
          id: string
          rating_gain: number
          reign_date: string
          user_id: string
        }
        Insert: {
          computed_at?: string
          games_played: number
          id?: string
          rating_gain: number
          reign_date: string
          user_id: string
        }
        Update: {
          computed_at?: string
          games_played?: number
          id?: string
          rating_gain?: number
          reign_date?: string
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
      feature_votes: {
        Row: {
          comment: string | null
          created_at: string
          feature_key: string
          id: string
          user_id: string
          weight: number
        }
        Insert: {
          comment?: string | null
          created_at?: string
          feature_key: string
          id?: string
          user_id: string
          weight?: number
        }
        Update: {
          comment?: string | null
          created_at?: string
          feature_key?: string
          id?: string
          user_id?: string
          weight?: number
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
      game_reactions: {
        Row: {
          created_at: string
          emoji: string
          game_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji: string
          game_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          game_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_reactions_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "online_games"
            referencedColumns: ["id"]
          },
        ]
      }
      gbp_posts: {
        Row: {
          body: string
          created_at: string
          created_by: string | null
          cta_label: string | null
          cta_url: string | null
          error: string | null
          id: string
          image_url: string | null
          published_at: string | null
          scheduled_for: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          body: string
          created_at?: string
          created_by?: string | null
          cta_label?: string | null
          cta_url?: string | null
          error?: string | null
          id?: string
          image_url?: string | null
          published_at?: string | null
          scheduled_for?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          created_by?: string | null
          cta_label?: string | null
          cta_url?: string | null
          error?: string | null
          id?: string
          image_url?: string | null
          published_at?: string | null
          scheduled_for?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
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
      heartbeats: {
        Row: {
          created_at: string | null
          game_id: string
          id: string
          move_number: number
          think_time_ms: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          game_id: string
          id?: string
          move_number: number
          think_time_ms: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          game_id?: string
          id?: string
          move_number?: number
          think_time_ms?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "heartbeats_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "online_games"
            referencedColumns: ["id"]
          },
        ]
      }
      koth_throne: {
        Row: {
          crowned_at: string
          current_king_id: string | null
          defended_count: number
          id: string
          last_challenge_at: string | null
          tournament_id: string
          updated_at: string
        }
        Insert: {
          crowned_at?: string
          current_king_id?: string | null
          defended_count?: number
          id?: string
          last_challenge_at?: string | null
          tournament_id: string
          updated_at?: string
        }
        Update: {
          crowned_at?: string
          current_king_id?: string | null
          defended_count?: number
          id?: string
          last_challenge_at?: string | null
          tournament_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "koth_throne_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: true
            referencedRelation: "tournaments"
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
      media_outreach: {
        Row: {
          category: string
          contact_email: string | null
          contact_name: string | null
          created_at: string
          id: string
          notes: string | null
          outlet: string
          pitch_url: string | null
          responded_at: string | null
          sent_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          category?: string
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          outlet: string
          pitch_url?: string | null
          responded_at?: string | null
          sent_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          category?: string
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          outlet?: string
          pitch_url?: string | null
          responded_at?: string | null
          sent_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      news_comments: {
        Row: {
          body: string
          created_at: string
          id: string
          parent_id: string | null
          post_id: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          parent_id?: string | null
          post_id: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          parent_id?: string | null
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "news_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "news_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      news_posts: {
        Row: {
          author_id: string | null
          author_name: string | null
          body_md: string | null
          comment_count: number
          cover_image: string | null
          created_at: string
          featured: boolean
          id: string
          kind: string
          score: number
          slug: string
          source: string | null
          title: string
          updated_at: string
          url: string | null
        }
        Insert: {
          author_id?: string | null
          author_name?: string | null
          body_md?: string | null
          comment_count?: number
          cover_image?: string | null
          created_at?: string
          featured?: boolean
          id?: string
          kind: string
          score?: number
          slug: string
          source?: string | null
          title: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          author_id?: string | null
          author_name?: string | null
          body_md?: string | null
          comment_count?: number
          cover_image?: string | null
          created_at?: string
          featured?: boolean
          id?: string
          kind?: string
          score?: number
          slug?: string
          source?: string | null
          title?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
      news_votes: {
        Row: {
          created_at: string
          post_id: string
          user_id: string
          value: number
        }
        Insert: {
          created_at?: string
          post_id: string
          user_id: string
          value: number
        }
        Update: {
          created_at?: string
          post_id?: string
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "news_votes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "news_posts"
            referencedColumns: ["id"]
          },
        ]
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
          access_tier: string
          avatar_frame: string | null
          avatar_url: string | null
          bio: string | null
          birth_year: number | null
          bot_games_drawn: number
          bot_games_lost: number
          bot_games_played: number
          bot_games_won: number
          bot_peak_rating: number
          bot_rating: number
          city: string | null
          city_key: string | null
          club: string | null
          coach_pro_until: string | null
          country: string | null
          country_flag: string | null
          created_at: string
          current_game_id: string | null
          discord_avatar: string | null
          discord_linked_at: string | null
          discord_user_id: string | null
          discord_username: string | null
          display_name: string | null
          favorite_opening: string | null
          favorite_openings: string[] | null
          federation: string | null
          fide_id: string | null
          fide_title: string | null
          first_name: string | null
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
          last_name: string | null
          login_streak: number
          login_streak_best: number
          loss_streak: number
          map_lat: number | null
          map_lng: number | null
          master_coins: number
          onboarding_completed: boolean
          peak_rating: number
          profile_banner: string | null
          push_notifications_enabled: boolean
          rating: number
          show_on_map: boolean
          skill_level: string | null
          total_xp: number
          unlocked_courses: Json
          updated_at: string
          user_id: string
          username: string | null
          username_style: string
          welcome_day: number
          welcome_last_claim: string | null
          win_streak: number
        }
        Insert: {
          access_tier?: string
          avatar_frame?: string | null
          avatar_url?: string | null
          bio?: string | null
          birth_year?: number | null
          bot_games_drawn?: number
          bot_games_lost?: number
          bot_games_played?: number
          bot_games_won?: number
          bot_peak_rating?: number
          bot_rating?: number
          city?: string | null
          city_key?: string | null
          club?: string | null
          coach_pro_until?: string | null
          country?: string | null
          country_flag?: string | null
          created_at?: string
          current_game_id?: string | null
          discord_avatar?: string | null
          discord_linked_at?: string | null
          discord_user_id?: string | null
          discord_username?: string | null
          display_name?: string | null
          favorite_opening?: string | null
          favorite_openings?: string[] | null
          federation?: string | null
          fide_id?: string | null
          fide_title?: string | null
          first_name?: string | null
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
          last_name?: string | null
          login_streak?: number
          login_streak_best?: number
          loss_streak?: number
          map_lat?: number | null
          map_lng?: number | null
          master_coins?: number
          onboarding_completed?: boolean
          peak_rating?: number
          profile_banner?: string | null
          push_notifications_enabled?: boolean
          rating?: number
          show_on_map?: boolean
          skill_level?: string | null
          total_xp?: number
          unlocked_courses?: Json
          updated_at?: string
          user_id: string
          username?: string | null
          username_style?: string
          welcome_day?: number
          welcome_last_claim?: string | null
          win_streak?: number
        }
        Update: {
          access_tier?: string
          avatar_frame?: string | null
          avatar_url?: string | null
          bio?: string | null
          birth_year?: number | null
          bot_games_drawn?: number
          bot_games_lost?: number
          bot_games_played?: number
          bot_games_won?: number
          bot_peak_rating?: number
          bot_rating?: number
          city?: string | null
          city_key?: string | null
          club?: string | null
          coach_pro_until?: string | null
          country?: string | null
          country_flag?: string | null
          created_at?: string
          current_game_id?: string | null
          discord_avatar?: string | null
          discord_linked_at?: string | null
          discord_user_id?: string | null
          discord_username?: string | null
          display_name?: string | null
          favorite_opening?: string | null
          favorite_openings?: string[] | null
          federation?: string | null
          fide_id?: string | null
          fide_title?: string | null
          first_name?: string | null
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
          last_name?: string | null
          login_streak?: number
          login_streak_best?: number
          loss_streak?: number
          map_lat?: number | null
          map_lng?: number | null
          master_coins?: number
          onboarding_completed?: boolean
          peak_rating?: number
          profile_banner?: string | null
          push_notifications_enabled?: boolean
          rating?: number
          show_on_map?: boolean
          skill_level?: string | null
          total_xp?: number
          unlocked_courses?: Json
          updated_at?: string
          user_id?: string
          username?: string | null
          username_style?: string
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
      puzzle_tournament_attempts: {
        Row: {
          attempted_at: string
          id: string
          puzzle_id: string
          solve_time_ms: number | null
          solved: boolean
          tournament_id: string
          user_id: string
        }
        Insert: {
          attempted_at?: string
          id?: string
          puzzle_id: string
          solve_time_ms?: number | null
          solved?: boolean
          tournament_id: string
          user_id: string
        }
        Update: {
          attempted_at?: string
          id?: string
          puzzle_id?: string
          solve_time_ms?: number | null
          solved?: boolean
          tournament_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "puzzle_tournament_attempts_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
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
      seo_query_opportunities: {
        Row: {
          acted_on: boolean
          avg_position: number | null
          clicks: number
          ctr: number
          id: string
          impressions: number
          picked_up_at: string
          query: string
          suggested_page: string | null
        }
        Insert: {
          acted_on?: boolean
          avg_position?: number | null
          clicks?: number
          ctr?: number
          id?: string
          impressions?: number
          picked_up_at?: string
          query: string
          suggested_page?: string | null
        }
        Update: {
          acted_on?: boolean
          avg_position?: number | null
          clicks?: number
          ctr?: number
          id?: string
          impressions?: number
          picked_up_at?: string
          query?: string
          suggested_page?: string | null
        }
        Relationships: []
      }
      site_config: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      site_ratings: {
        Row: {
          comment: string | null
          created_at: string
          featured: boolean
          helpful_count: number
          hidden: boolean
          id: string
          like_count: number
          love_count: number
          pinned: boolean
          rating: number
          report_count: number
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          featured?: boolean
          helpful_count?: number
          hidden?: boolean
          id?: string
          like_count?: number
          love_count?: number
          pinned?: boolean
          rating: number
          report_count?: number
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          featured?: boolean
          helpful_count?: number
          hidden?: boolean
          id?: string
          like_count?: number
          love_count?: number
          pinned?: boolean
          rating?: number
          report_count?: number
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      site_review_reactions: {
        Row: {
          created_at: string
          id: string
          reaction: string
          review_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reaction: string
          review_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reaction?: string
          review_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_review_reactions_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "site_ratings"
            referencedColumns: ["id"]
          },
        ]
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
      style_twins: {
        Row: {
          computed_at: string
          games_analyzed: number
          gm_name: string
          match_pct: number
          reasoning: string
          user_id: string
        }
        Insert: {
          computed_at?: string
          games_analyzed?: number
          gm_name: string
          match_pct: number
          reasoning: string
          user_id: string
        }
        Update: {
          computed_at?: string
          games_analyzed?: number
          gm_name?: string
          match_pct?: number
          reasoning?: string
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
      tournament_audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          id: string
          payload: Json
          tournament_id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          id?: string
          payload?: Json
          tournament_id: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          id?: string
          payload?: Json
          tournament_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_audit_log_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
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
      tournament_hall_of_fame: {
        Row: {
          category: string
          country: string | null
          created_at: string
          details: Json | null
          display_name: string
          edition_year: number
          id: string
          registration_id: string | null
          tournament_id: string
        }
        Insert: {
          category: string
          country?: string | null
          created_at?: string
          details?: Json | null
          display_name: string
          edition_year: number
          id?: string
          registration_id?: string | null
          tournament_id: string
        }
        Update: {
          category?: string
          country?: string | null
          created_at?: string
          details?: Json | null
          display_name?: string
          edition_year?: number
          id?: string
          registration_id?: string | null
          tournament_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_hall_of_fame_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "tournament_registrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_hall_of_fame_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "tournament_standings_v"
            referencedColumns: ["registration_id"]
          },
          {
            foreignKeyName: "tournament_hall_of_fame_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_invites: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          id: string
          max_uses: number
          reward_coins: number
          tournament_id: string
          uses: number
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          id?: string
          max_uses?: number
          reward_coins?: number
          tournament_id: string
          uses?: number
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          id?: string
          max_uses?: number
          reward_coins?: number
          tournament_id?: string
          uses?: number
        }
        Relationships: [
          {
            foreignKeyName: "tournament_invites_tournament_id_fkey"
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
          end_reason: string | null
          finished_at: string | null
          forfeit: boolean
          game_id: string | null
          id: string
          result: string | null
          round: number
          started_at: string | null
          tournament_id: string
          white_player_id: string
        }
        Insert: {
          black_player_id?: string | null
          created_at?: string
          end_reason?: string | null
          finished_at?: string | null
          forfeit?: boolean
          game_id?: string | null
          id?: string
          result?: string | null
          round: number
          started_at?: string | null
          tournament_id: string
          white_player_id: string
        }
        Update: {
          black_player_id?: string | null
          created_at?: string
          end_reason?: string | null
          finished_at?: string | null
          forfeit?: boolean
          game_id?: string | null
          id?: string
          result?: string | null
          round?: number
          started_at?: string | null
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
      tournament_payouts: {
        Row: {
          badge_key: string | null
          coins: number
          cosmetic_key: string | null
          id: string
          label: string | null
          paid_at: string
          place: number | null
          tournament_id: string
          user_id: string
        }
        Insert: {
          badge_key?: string | null
          coins?: number
          cosmetic_key?: string | null
          id?: string
          label?: string | null
          paid_at?: string
          place?: number | null
          tournament_id: string
          user_id: string
        }
        Update: {
          badge_key?: string | null
          coins?: number
          cosmetic_key?: string | null
          id?: string
          label?: string | null
          paid_at?: string
          place?: number | null
          tournament_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_payouts_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_predictions: {
        Row: {
          coins_staked: number
          created_at: string
          id: string
          payout: number | null
          predicted_champion_registration_id: string
          resolved: boolean
          tournament_id: string
          user_id: string
        }
        Insert: {
          coins_staked: number
          created_at?: string
          id?: string
          payout?: number | null
          predicted_champion_registration_id: string
          resolved?: boolean
          tournament_id: string
          user_id: string
        }
        Update: {
          coins_staked?: number
          created_at?: string
          id?: string
          payout?: number | null
          predicted_champion_registration_id?: string
          resolved?: boolean
          tournament_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_predictions_predicted_champion_registration_id_fkey"
            columns: ["predicted_champion_registration_id"]
            isOneToOne: false
            referencedRelation: "tournament_registrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_predictions_predicted_champion_registration_id_fkey"
            columns: ["predicted_champion_registration_id"]
            isOneToOne: false
            referencedRelation: "tournament_standings_v"
            referencedColumns: ["registration_id"]
          },
          {
            foreignKeyName: "tournament_predictions_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_prizes: {
        Row: {
          badge_key: string | null
          category: string
          coins: number
          cosmetic_key: string | null
          created_at: string
          id: string
          is_special: boolean
          label: string
          place_from: number
          place_to: number
          sort_order: number
          tournament_id: string
        }
        Insert: {
          badge_key?: string | null
          category?: string
          coins?: number
          cosmetic_key?: string | null
          created_at?: string
          id?: string
          is_special?: boolean
          label: string
          place_from: number
          place_to: number
          sort_order?: number
          tournament_id: string
        }
        Update: {
          badge_key?: string | null
          category?: string
          coins?: number
          cosmetic_key?: string | null
          created_at?: string
          id?: string
          is_special?: boolean
          label?: string
          place_from?: number
          place_to?: number
          sort_order?: number
          tournament_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_prizes_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_registrations: {
        Row: {
          birth_year: number | null
          buchholz: number
          buchholz_cut1: number
          bye_rounds: number[]
          checked_in: boolean
          checked_in_at: string | null
          city: string | null
          club: string | null
          confirmation_sent_at: string | null
          created_at: string
          fast_win_bonus: number
          federation: string | null
          fide_blitz_rating: number | null
          fide_id: string | null
          fide_profile_url: string | null
          fide_rapid_rating: number | null
          fide_standard_rating: number | null
          fide_title: string | null
          fide_verified: boolean
          fide_verified_at: string | null
          fide_verified_name: string | null
          first_name: string | null
          id: string
          is_test_bot: boolean
          last_name: string | null
          no_mistake_bonus: number
          performance_rating: number | null
          progressive_score: number
          rating_at_join: number
          referrer_invite_code: string | null
          reminded_2h_at: string | null
          score: number
          sonneborn: number
          tiebreak: number
          tournament_id: string
          tournament_seed: number | null
          user_id: string | null
          wins: number
          withdrew_at: string | null
        }
        Insert: {
          birth_year?: number | null
          buchholz?: number
          buchholz_cut1?: number
          bye_rounds?: number[]
          checked_in?: boolean
          checked_in_at?: string | null
          city?: string | null
          club?: string | null
          confirmation_sent_at?: string | null
          created_at?: string
          fast_win_bonus?: number
          federation?: string | null
          fide_blitz_rating?: number | null
          fide_id?: string | null
          fide_profile_url?: string | null
          fide_rapid_rating?: number | null
          fide_standard_rating?: number | null
          fide_title?: string | null
          fide_verified?: boolean
          fide_verified_at?: string | null
          fide_verified_name?: string | null
          first_name?: string | null
          id?: string
          is_test_bot?: boolean
          last_name?: string | null
          no_mistake_bonus?: number
          performance_rating?: number | null
          progressive_score?: number
          rating_at_join?: number
          referrer_invite_code?: string | null
          reminded_2h_at?: string | null
          score?: number
          sonneborn?: number
          tiebreak?: number
          tournament_id: string
          tournament_seed?: number | null
          user_id?: string | null
          wins?: number
          withdrew_at?: string | null
        }
        Update: {
          birth_year?: number | null
          buchholz?: number
          buchholz_cut1?: number
          bye_rounds?: number[]
          checked_in?: boolean
          checked_in_at?: string | null
          city?: string | null
          club?: string | null
          confirmation_sent_at?: string | null
          created_at?: string
          fast_win_bonus?: number
          federation?: string | null
          fide_blitz_rating?: number | null
          fide_id?: string | null
          fide_profile_url?: string | null
          fide_rapid_rating?: number | null
          fide_standard_rating?: number | null
          fide_title?: string | null
          fide_verified?: boolean
          fide_verified_at?: string | null
          fide_verified_name?: string | null
          first_name?: string | null
          id?: string
          is_test_bot?: boolean
          last_name?: string | null
          no_mistake_bonus?: number
          performance_rating?: number | null
          progressive_score?: number
          rating_at_join?: number
          referrer_invite_code?: string | null
          reminded_2h_at?: string | null
          score?: number
          sonneborn?: number
          tiebreak?: number
          tournament_id?: string
          tournament_seed?: number | null
          user_id?: string | null
          wins?: number
          withdrew_at?: string | null
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
      tournament_round_readiness: {
        Row: {
          created_at: string
          id: string
          ready: boolean
          registration_id: string
          round_number: number
          tournament_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          ready?: boolean
          registration_id: string
          round_number: number
          tournament_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          ready?: boolean
          registration_id?: string
          round_number?: number
          tournament_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_round_readiness_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "tournament_registrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_round_readiness_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "tournament_standings_v"
            referencedColumns: ["registration_id"]
          },
          {
            foreignKeyName: "tournament_round_readiness_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_round_state: {
        Row: {
          closed_at: string | null
          created_at: string
          id: string
          locked_at: string | null
          published_at: string | null
          round: number
          status: string
          tournament_id: string
          updated_at: string
        }
        Insert: {
          closed_at?: string | null
          created_at?: string
          id?: string
          locked_at?: string | null
          published_at?: string | null
          round: number
          status?: string
          tournament_id: string
          updated_at?: string
        }
        Update: {
          closed_at?: string | null
          created_at?: string
          id?: string
          locked_at?: string | null
          published_at?: string | null
          round?: number
          status?: string
          tournament_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_round_state_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_sponsors: {
        Row: {
          created_at: string
          display_order: number
          id: string
          logo_url: string | null
          name: string
          tier: string
          tournament_id: string
          website: string | null
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          logo_url?: string | null
          name: string
          tier?: string
          tournament_id: string
          website?: string | null
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          logo_url?: string | null
          name?: string
          tier?: string
          tournament_id?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tournament_sponsors_tournament_id_fkey"
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
      tournament_titles: {
        Row: {
          awarded_at: string
          created_at: string
          id: string
          metadata: Json
          season: string | null
          title_key: string
          title_label: string
          tournament_id: string | null
          user_id: string
        }
        Insert: {
          awarded_at?: string
          created_at?: string
          id?: string
          metadata?: Json
          season?: string | null
          title_key: string
          title_label: string
          tournament_id?: string | null
          user_id: string
        }
        Update: {
          awarded_at?: string
          created_at?: string
          id?: string
          metadata?: Json
          season?: string | null
          title_key?: string
          title_label?: string
          tournament_id?: string | null
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
          checkin_closes_at: string | null
          checkin_opens_at: string | null
          chess_results_status: string | null
          chess_results_submitted_at: string | null
          chief_arbiter: string | null
          city: string | null
          created_at: string
          created_by: string | null
          current_round: number
          deputy_arbiter: string | null
          description: string
          donation_total_eur: number
          entry_fee: number
          external_results_url: string | null
          fide_seeding_fallback: string
          fide_seeding_rating: string
          fide_verification_mode: string
          finished_at: string | null
          forfeit_minutes: number
          format: string
          id: string
          is_humanitarian: boolean
          is_rated: boolean
          is_signature: boolean
          max_players: number
          name: string
          organizer_email: string | null
          organizer_label: string | null
          paused_at: string | null
          prize_escalator_step: number
          prize_kind: string
          prize_pool_eur: number
          rating_type: string | null
          registration_deadline: string | null
          registration_locked_at: string | null
          roster_locked_at: string | null
          round_started_at: string | null
          signature_series: string | null
          sponsor_label: string | null
          start_time_locked: boolean
          starts_at: string
          status: string
          time_control_increment: number
          time_control_label: string
          time_control_seconds: number
          total_rounds: number
          tournament_type: string
          updated_at: string
          venue: string | null
          visibility: string
          winner_user_id: string | null
        }
        Insert: {
          anti_cheat_level?: string
          arena_duration_minutes?: number | null
          auto_started?: boolean
          berserk_allowed?: boolean
          category?: string
          checkin_closes_at?: string | null
          checkin_opens_at?: string | null
          chess_results_status?: string | null
          chess_results_submitted_at?: string | null
          chief_arbiter?: string | null
          city?: string | null
          created_at?: string
          created_by?: string | null
          current_round?: number
          deputy_arbiter?: string | null
          description?: string
          donation_total_eur?: number
          entry_fee?: number
          external_results_url?: string | null
          fide_seeding_fallback?: string
          fide_seeding_rating?: string
          fide_verification_mode?: string
          finished_at?: string | null
          forfeit_minutes?: number
          format?: string
          id?: string
          is_humanitarian?: boolean
          is_rated?: boolean
          is_signature?: boolean
          max_players?: number
          name: string
          organizer_email?: string | null
          organizer_label?: string | null
          paused_at?: string | null
          prize_escalator_step?: number
          prize_kind?: string
          prize_pool_eur?: number
          rating_type?: string | null
          registration_deadline?: string | null
          registration_locked_at?: string | null
          roster_locked_at?: string | null
          round_started_at?: string | null
          signature_series?: string | null
          sponsor_label?: string | null
          start_time_locked?: boolean
          starts_at?: string
          status?: string
          time_control_increment?: number
          time_control_label?: string
          time_control_seconds?: number
          total_rounds?: number
          tournament_type?: string
          updated_at?: string
          venue?: string | null
          visibility?: string
          winner_user_id?: string | null
        }
        Update: {
          anti_cheat_level?: string
          arena_duration_minutes?: number | null
          auto_started?: boolean
          berserk_allowed?: boolean
          category?: string
          checkin_closes_at?: string | null
          checkin_opens_at?: string | null
          chess_results_status?: string | null
          chess_results_submitted_at?: string | null
          chief_arbiter?: string | null
          city?: string | null
          created_at?: string
          created_by?: string | null
          current_round?: number
          deputy_arbiter?: string | null
          description?: string
          donation_total_eur?: number
          entry_fee?: number
          external_results_url?: string | null
          fide_seeding_fallback?: string
          fide_seeding_rating?: string
          fide_verification_mode?: string
          finished_at?: string | null
          forfeit_minutes?: number
          format?: string
          id?: string
          is_humanitarian?: boolean
          is_rated?: boolean
          is_signature?: boolean
          max_players?: number
          name?: string
          organizer_email?: string | null
          organizer_label?: string | null
          paused_at?: string | null
          prize_escalator_step?: number
          prize_kind?: string
          prize_pool_eur?: number
          rating_type?: string | null
          registration_deadline?: string | null
          registration_locked_at?: string | null
          roster_locked_at?: string | null
          round_started_at?: string | null
          signature_series?: string | null
          sponsor_label?: string | null
          start_time_locked?: boolean
          starts_at?: string
          status?: string
          time_control_increment?: number
          time_control_label?: string
          time_control_seconds?: number
          total_rounds?: number
          tournament_type?: string
          updated_at?: string
          venue?: string | null
          visibility?: string
          winner_user_id?: string | null
        }
        Relationships: []
      }
      unique_badges: {
        Row: {
          asset_url: string | null
          awarded_at: string | null
          badge_key: string
          badge_label: string
          created_at: string
          current_owner_id: string | null
          description: string | null
          id: string
          updated_at: string
        }
        Insert: {
          asset_url?: string | null
          awarded_at?: string | null
          badge_key: string
          badge_label: string
          created_at?: string
          current_owner_id?: string | null
          description?: string | null
          id?: string
          updated_at?: string
        }
        Update: {
          asset_url?: string | null
          awarded_at?: string | null
          badge_key?: string
          badge_label?: string
          created_at?: string
          current_owner_id?: string | null
          description?: string | null
          id?: string
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
      variation_explanations: {
        Row: {
          cache_key: string
          course_id: string
          created_at: string
          moves: Json
          summary: string | null
          variation_id: string
        }
        Insert: {
          cache_key: string
          course_id: string
          created_at?: string
          moves?: Json
          summary?: string | null
          variation_id: string
        }
        Update: {
          cache_key?: string
          course_id?: string
          created_at?: string
          moves?: Json
          summary?: string | null
          variation_id?: string
        }
        Relationships: []
      }
      weekly_spin_claims: {
        Row: {
          coins_awarded: number
          created_at: string
          id: string
          iso_week: number
          iso_year: number
          user_id: string
        }
        Insert: {
          coins_awarded: number
          created_at?: string
          id?: string
          iso_week: number
          iso_year: number
          user_id: string
        }
        Update: {
          coins_awarded?: number
          created_at?: string
          id?: string
          iso_week?: number
          iso_year?: number
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
      affiliates_public: {
        Row: {
          code: string | null
          commission_coins_per_signup: number | null
          commission_coins_per_tournament_join: number | null
          created_at: string | null
          is_active: boolean | null
          owner_name: string | null
          owner_user_id: string | null
          partner_tier: string | null
          total_clicks: number | null
          total_coins_paid: number | null
          total_joins: number | null
          total_signups: number | null
          updated_at: string | null
        }
        Insert: {
          code?: string | null
          commission_coins_per_signup?: number | null
          commission_coins_per_tournament_join?: number | null
          created_at?: string | null
          is_active?: boolean | null
          owner_name?: string | null
          owner_user_id?: string | null
          partner_tier?: string | null
          total_clicks?: number | null
          total_coins_paid?: number | null
          total_joins?: number | null
          total_signups?: number | null
          updated_at?: string | null
        }
        Update: {
          code?: string | null
          commission_coins_per_signup?: number | null
          commission_coins_per_tournament_join?: number | null
          created_at?: string | null
          is_active?: boolean | null
          owner_name?: string | null
          owner_user_id?: string | null
          partner_tier?: string | null
          total_clicks?: number | null
          total_coins_paid?: number | null
          total_joins?: number | null
          total_signups?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
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
      community_map_pins: {
        Row: {
          avatar_url: string | null
          city: string | null
          country: string | null
          id: string | null
          lat: number | null
          lng: number | null
          rating: number | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          id?: string | null
          lat?: number | null
          lng?: number | null
          rating?: number | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          id?: string | null
          lat?: number | null
          lng?: number | null
          rating?: number | null
          username?: string | null
        }
        Relationships: []
      }
      tournament_ambassador_v: {
        Row: {
          confirmed_invites: number | null
          invite_links_created: number | null
          inviter_user_id: string | null
          tournament_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tournament_invites_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
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
      tournament_standings_v: {
        Row: {
          country: string | null
          display_name: string | null
          fide_id: string | null
          games_played: number | null
          points: number | null
          rank: number | null
          rating_at_start: number | null
          registration_id: string | null
          tournament_id: string | null
          user_id: string | null
          wins: number | null
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
    }
    Functions: {
      _clear_current_game: { Args: { p_game_id: string }; Returns: undefined }
      _mc_claim_first_win_today: { Args: { p_user: string }; Returns: boolean }
      abort_online_game: { Args: { p_game_id: string }; Returns: Json }
      are_friends: { Args: { _a: string; _b: string }; Returns: boolean }
      assert_can_queue: { Args: never; Returns: Json }
      award_bot_game_coins:
        | {
            Args: {
              p_bot_rating: number
              p_result: string
              p_win_streak?: number
            }
            Returns: Json
          }
        | {
            Args: {
              p_bot_game_id?: string
              p_bot_rating: number
              p_result: string
              p_win_streak?: number
            }
            Returns: Json
          }
      award_online_game_coins: {
        Args: { p_game_id: string; p_win_streak?: number }
        Returns: Json
      }
      award_tournament_title: {
        Args: {
          _metadata?: Json
          _season?: string
          _title_key: string
          _title_label: string
          _tournament_id?: string
          _user_id: string
        }
        Returns: string
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
      claim_weekly_spin: { Args: never; Returns: Json }
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
      compute_daily_king: {
        Args: { p_date?: string }
        Returns: {
          computed_at: string
          games_played: number
          id: string
          rating_gain: number
          reign_date: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "daily_kings"
          isOneToOne: true
          isSetofReturn: false
        }
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
      email_queue_dispatch: { Args: never; Returns: undefined }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      finalize_online_game: {
        Args: { p_end_reason: string; p_game_id: string; p_result: string }
        Returns: Json
      }
      game_heartbeats: {
        Args: { p_game_id: string }
        Returns: {
          move_number: number
          think_time_ms: number
          user_id: string
        }[]
      }
      get_affiliate_public: {
        Args: { _code: string }
        Returns: {
          code: string
          created_at: string
          owner_name: string
          partner_tier: string
          total_clicks: number
          total_joins: number
          total_signups: number
        }[]
      }
      get_beat_nikola_leaderboard: {
        Args: { _limit?: number }
        Returns: {
          avatar_url: string
          created_at: string
          display_name: string
          move_count: number
          rating: number
          time_control_label: string
          user_id: string
        }[]
      }
      get_beat_nikola_stats: {
        Args: never
        Returns: {
          attempts: number
          wins: number
        }[]
      }
      get_club_role: { Args: { _club: string; _user: string }; Returns: string }
      get_current_daily_king: {
        Args: never
        Returns: {
          avatar_url: string
          display_name: string
          games_played: number
          rating_gain: number
          reign_date: string
          user_id: string
          username: string
        }[]
      }
      get_donation_progress: { Args: never; Returns: Json }
      get_my_private_profile: {
        Args: never
        Returns: {
          birth_year: number
          first_name: string
          last_name: string
          map_lat: number
          map_lng: number
        }[]
      }
      get_my_profile: {
        Args: never
        Returns: {
          access_tier: string
          avatar_frame: string | null
          avatar_url: string | null
          bio: string | null
          birth_year: number | null
          bot_games_drawn: number
          bot_games_lost: number
          bot_games_played: number
          bot_games_won: number
          bot_peak_rating: number
          bot_rating: number
          city: string | null
          city_key: string | null
          club: string | null
          coach_pro_until: string | null
          country: string | null
          country_flag: string | null
          created_at: string
          current_game_id: string | null
          discord_avatar: string | null
          discord_linked_at: string | null
          discord_user_id: string | null
          discord_username: string | null
          display_name: string | null
          favorite_opening: string | null
          favorite_openings: string[] | null
          federation: string | null
          fide_id: string | null
          fide_title: string | null
          first_name: string | null
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
          last_name: string | null
          login_streak: number
          login_streak_best: number
          loss_streak: number
          map_lat: number | null
          map_lng: number | null
          master_coins: number
          onboarding_completed: boolean
          peak_rating: number
          profile_banner: string | null
          push_notifications_enabled: boolean
          rating: number
          show_on_map: boolean
          skill_level: string | null
          total_xp: number
          unlocked_courses: Json
          updated_at: string
          user_id: string
          username: string | null
          username_style: string
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
      get_my_tournament_registration: {
        Args: { _tournament_id: string }
        Returns: {
          birth_year: number
          fide_id: string
        }[]
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
      get_public_style_twin: {
        Args: { p_username: string }
        Returns: {
          avatar_url: string
          computed_at: string
          display_name: string
          gm_name: string
          match_pct: number
          username: string
        }[]
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
      is_tournament_admin: {
        Args: { _tid: string; _user: string }
        Returns: boolean
      }
      join_battle_royale: { Args: never; Returns: Json }
      log_affiliate_click: {
        Args: { _code: string; _referrer?: string; _ua?: string }
        Returns: undefined
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
      public_confessions: {
        Args: { p_limit?: number }
        Returns: {
          body: string
          created_at: string
          handle: string
          id: string
        }[]
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
      recent_donors: {
        Args: { p_limit?: number }
        Returns: {
          amount_cents: number
          created_at: string
          currency: string
          display_name: string
        }[]
      }
      redeem_invite: {
        Args: { _code: string }
        Returns: {
          inviter_id: string
          reward_coins: number
          tournament_id: string
        }[]
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
      spin_wheel_legendary: { Args: never; Returns: Json }
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
      supporter_tier: { Args: { p_user_id: string }; Returns: Json }
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
      tournament_tiebreaks: {
        Args: { p_tournament_id: string }
        Returns: {
          buchholz: number
          buchholz_cut1: number
          registration_id: string
          sonneborn_berger: number
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
      transfer_unique_badge: {
        Args: { _badge_key: string; _new_owner: string }
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
