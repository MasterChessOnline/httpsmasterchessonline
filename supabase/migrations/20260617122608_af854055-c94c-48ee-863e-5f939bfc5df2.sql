
DROP POLICY IF EXISTS "Users can self-report signals" ON public.tournament_anti_cheat_flags;

DROP POLICY IF EXISTS "Anyone can view AI reviews" ON public.ai_game_reviews;
CREATE POLICY "Players can view AI reviews of their games"
ON public.ai_game_reviews
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.online_games g
    WHERE g.id = ai_game_reviews.game_id
      AND (g.white_player_id = auth.uid() OR g.black_player_id = auth.uid())
  )
);
