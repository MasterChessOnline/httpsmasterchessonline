-- 1) Add tag, banner color, weekly counters to clubs
ALTER TABLE public.clubs
  ADD COLUMN IF NOT EXISTS tag text,
  ADD COLUMN IF NOT EXISTS banner_color text NOT NULL DEFAULT '#d4a843',
  ADD COLUMN IF NOT EXISTS weekly_wins integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_wins integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS weekly_reset_at timestamptz NOT NULL DEFAULT date_trunc('week', now());

-- Tag validation + uniqueness (case-insensitive). Allow nulls (clubs without tag yet).
ALTER TABLE public.clubs
  DROP CONSTRAINT IF EXISTS clubs_tag_format_chk;
ALTER TABLE public.clubs
  ADD CONSTRAINT clubs_tag_format_chk
  CHECK (tag IS NULL OR tag ~ '^[A-Z0-9]{2,5}$');

CREATE UNIQUE INDEX IF NOT EXISTS clubs_tag_unique_ci
  ON public.clubs (UPPER(tag))
  WHERE tag IS NOT NULL;

-- 2) Clan quests table — one shared daily goal per club
CREATE TABLE IF NOT EXISTS public.clan_quests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL,
  quest_date date NOT NULL DEFAULT (now() AT TIME ZONE 'UTC')::date,
  quest_key text NOT NULL DEFAULT 'team_wins',
  title text NOT NULL DEFAULT 'Team Wins Today',
  description text NOT NULL DEFAULT 'Win games together as a clan',
  target_value integer NOT NULL DEFAULT 25,
  current_value integer NOT NULL DEFAULT 0,
  coin_reward_per_member integer NOT NULL DEFAULT 200,
  completed_at timestamptz,
  rewarded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (club_id, quest_date)
);

GRANT SELECT ON public.clan_quests TO anon;
GRANT SELECT ON public.clan_quests TO authenticated;
GRANT ALL ON public.clan_quests TO service_role;

ALTER TABLE public.clan_quests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view clan quests"
  ON public.clan_quests FOR SELECT
  USING (true);

-- 3) RPC: get or create today's quest for a club
CREATE OR REPLACE FUNCTION public.get_or_create_clan_quest(p_club_id uuid)
RETURNS public.clan_quests
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  today date := (now() AT TIME ZONE 'UTC')::date;
  q public.clan_quests;
  member_count_now integer;
  target integer;
BEGIN
  SELECT * INTO q
    FROM public.clan_quests
   WHERE club_id = p_club_id AND quest_date = today;
  IF FOUND THEN
    RETURN q;
  END IF;

  SELECT COALESCE(member_count, 1) INTO member_count_now
    FROM public.clubs WHERE id = p_club_id;

  -- Scale target with membership: ~3 wins/member, capped 10..500
  target := GREATEST(10, LEAST(500, member_count_now * 3));

  INSERT INTO public.clan_quests (club_id, target_value)
    VALUES (p_club_id, target)
  ON CONFLICT (club_id, quest_date) DO NOTHING
  RETURNING * INTO q;

  IF q.id IS NULL THEN
    SELECT * INTO q
      FROM public.clan_quests
     WHERE club_id = p_club_id AND quest_date = today;
  END IF;

  RETURN q;
END;
$$;

-- 4) RPC: contribute to all clans the caller belongs to
CREATE OR REPLACE FUNCTION public.contribute_clan_quest(p_metric text, p_amount integer DEFAULT 1)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller uuid := auth.uid();
  today date := (now() AT TIME ZONE 'UTC')::date;
  rec record;
  awarded_clubs uuid[] := ARRAY[]::uuid[];
  q public.clan_quests;
  members_paid integer;
  reward integer;
BEGIN
  IF caller IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;
  IF p_amount IS NULL OR p_amount <= 0 OR p_amount > 100 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'bad_amount');
  END IF;
  IF p_metric IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'bad_metric');
  END IF;

  -- Always bump weekly_wins on the parent clubs for the "team_wins" metric
  IF p_metric = 'team_wins' THEN
    UPDATE public.clubs c
       SET weekly_wins = weekly_wins + p_amount,
           total_wins  = total_wins  + p_amount,
           updated_at  = now()
      WHERE c.id IN (SELECT cm.club_id FROM public.club_members cm WHERE cm.user_id = caller);
  END IF;

  FOR rec IN
    SELECT cm.club_id FROM public.club_members cm WHERE cm.user_id = caller
  LOOP
    -- Ensure a quest row exists for today
    PERFORM public.get_or_create_clan_quest(rec.club_id);

    -- Increment progress, capped at target
    UPDATE public.clan_quests
       SET current_value = LEAST(target_value, current_value + p_amount),
           completed_at = CASE
             WHEN completed_at IS NULL AND current_value + p_amount >= target_value THEN now()
             ELSE completed_at
           END
     WHERE club_id = rec.club_id
       AND quest_date = today
       AND quest_key = p_metric
     RETURNING * INTO q;

    IF q.id IS NULL THEN
      CONTINUE;
    END IF;

    -- If just completed and not yet rewarded, pay every member.
    IF q.completed_at IS NOT NULL AND q.rewarded_at IS NULL THEN
      reward := q.coin_reward_per_member;
      PERFORM set_config('request.masterchess_internal', 'true', true);
      WITH paid AS (
        UPDATE public.profiles p
           SET master_coins = master_coins + reward,
               updated_at = now()
          FROM public.club_members cm
         WHERE cm.club_id = rec.club_id
           AND cm.user_id = p.user_id
         RETURNING p.user_id
      )
      SELECT COUNT(*) INTO members_paid FROM paid;

      UPDATE public.clan_quests
         SET rewarded_at = now()
       WHERE id = q.id;

      awarded_clubs := array_append(awarded_clubs, rec.club_id);
    END IF;
  END LOOP;

  RETURN jsonb_build_object('ok', true, 'completed_clubs', to_jsonb(awarded_clubs));
END;
$$;

-- 5) Top clans leaderboard (read-only RPC)
CREATE OR REPLACE FUNCTION public.top_clans(p_limit integer DEFAULT 20)
RETURNS TABLE (
  id uuid,
  name text,
  tag text,
  icon text,
  banner_color text,
  member_count integer,
  avg_rating integer,
  weekly_wins integer,
  total_wins integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.id, c.name, c.tag, c.icon, c.banner_color,
         c.member_count, c.avg_rating, c.weekly_wins, c.total_wins
    FROM public.clubs c
   WHERE c.is_public = true
   ORDER BY c.weekly_wins DESC, c.total_wins DESC, c.member_count DESC, c.avg_rating DESC
   LIMIT GREATEST(1, LEAST(100, p_limit));
$$;
