-- Allow anyone authenticated to view active games (for spectating)
DROP POLICY IF EXISTS "Anyone can view finished games" ON public.online_games;
CREATE POLICY "Anyone can view games for spectating"
ON public.online_games
FOR SELECT
USING (
  status = 'finished'
  OR status = 'active'
  OR auth.uid() = white_player_id
  OR auth.uid() = black_player_id
);