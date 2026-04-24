-- =====================================================================
-- Anti-cheat flagging for tournaments
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.tournament_anti_cheat_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL,
  user_id uuid NOT NULL,
  game_id uuid,
  signal_type text NOT NULL, -- 'tab_switch' | 'fast_moves' | 'perfect_accuracy' | 'engine_match' | 'manual'
  severity text NOT NULL DEFAULT 'low', -- 'low' | 'medium' | 'high' | 'critical'
  details jsonb,
  resolved boolean NOT NULL DEFAULT false,
  resolution text, -- 'cleared' | 'warned' | 'removed'
  resolved_by uuid,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tac_flags_tournament ON public.tournament_anti_cheat_flags(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tac_flags_user ON public.tournament_anti_cheat_flags(user_id);
CREATE INDEX IF NOT EXISTS idx_tac_flags_unresolved ON public.tournament_anti_cheat_flags(tournament_id, resolved) WHERE resolved = false;

ALTER TABLE public.tournament_anti_cheat_flags ENABLE ROW LEVEL SECURITY;

-- Players can see their own flags (so they know if/why they were removed)
CREATE POLICY "Users can view own flags"
  ON public.tournament_anti_cheat_flags
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins/organizers can see all flags
CREATE POLICY "Admins can view all flags"
  ON public.tournament_anti_cheat_flags
  FOR SELECT
  USING (public.can_manage_tournaments(auth.uid()));

-- Anyone authenticated can insert a flag for themselves (client-side signals like tab switches);
-- the edge function uses service role for server-side signals.
CREATE POLICY "Users can self-report signals"
  ON public.tournament_anti_cheat_flags
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Only admins/organizers can resolve (update) flags
CREATE POLICY "Admins can resolve flags"
  ON public.tournament_anti_cheat_flags
  FOR UPDATE
  USING (public.can_manage_tournaments(auth.uid()))
  WITH CHECK (public.can_manage_tournaments(auth.uid()));

-- =====================================================================
-- Track which pairs have already played each other (for no-rematch in Swiss)
-- This is derivable from tournament_pairings, so we use a view instead.
-- =====================================================================
CREATE OR REPLACE VIEW public.tournament_played_pairs AS
SELECT
  tournament_id,
  LEAST(white_player_id, black_player_id) AS player_a,
  GREATEST(white_player_id, black_player_id) AS player_b,
  array_agg(round ORDER BY round) AS rounds
FROM public.tournament_pairings
WHERE black_player_id IS NOT NULL
GROUP BY tournament_id, LEAST(white_player_id, black_player_id), GREATEST(white_player_id, black_player_id);

-- =====================================================================
-- Helper: count of white/black games per player in a tournament (for color balance)
-- =====================================================================
CREATE OR REPLACE FUNCTION public.tournament_color_balance(_tournament_id uuid)
RETURNS TABLE (user_id uuid, whites int, blacks int)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH whites AS (
    SELECT white_player_id AS user_id, COUNT(*)::int AS n
    FROM public.tournament_pairings
    WHERE tournament_id = _tournament_id AND black_player_id IS NOT NULL
    GROUP BY white_player_id
  ),
  blacks AS (
    SELECT black_player_id AS user_id, COUNT(*)::int AS n
    FROM public.tournament_pairings
    WHERE tournament_id = _tournament_id AND black_player_id IS NOT NULL
    GROUP BY black_player_id
  )
  SELECT
    COALESCE(w.user_id, b.user_id) AS user_id,
    COALESCE(w.n, 0) AS whites,
    COALESCE(b.n, 0) AS blacks
  FROM whites w
  FULL OUTER JOIN blacks b ON w.user_id = b.user_id;
$$;