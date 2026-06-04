-- Lock down user_inventory: writes only via SECURITY DEFINER RPCs (purchase_shop_item, award_*)
DROP POLICY IF EXISTS "Users insert own inventory" ON public.user_inventory;

-- Lock down learning_streaks: writes only via server-side processes
DROP POLICY IF EXISTS "Users can insert own learning streak" ON public.learning_streaks;
DROP POLICY IF EXISTS "Users can update own learning streak" ON public.learning_streaks;

-- Lock down puzzle_solves: writes only via server-side validated RPC
DROP POLICY IF EXISTS "Users can insert own solves" ON public.puzzle_solves;
DROP POLICY IF EXISTS "Users can update own solves" ON public.puzzle_solves;

-- Lock down rating_history: writes only by server (update_elo_ratings etc.)
DROP POLICY IF EXISTS "Users can insert own rating history" ON public.rating_history;

-- Lock down tournament_streaks: writes only by server, reads only by owner
DROP POLICY IF EXISTS "Users can insert own streak" ON public.tournament_streaks;
DROP POLICY IF EXISTS "Users update own streaks" ON public.tournament_streaks;
DROP POLICY IF EXISTS "Anyone can view streaks" ON public.tournament_streaks;

CREATE POLICY "Users view own tournament streaks"
  ON public.tournament_streaks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
