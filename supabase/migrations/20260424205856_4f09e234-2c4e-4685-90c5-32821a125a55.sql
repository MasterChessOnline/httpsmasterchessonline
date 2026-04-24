-- Clean up all finished/past tournaments and seed fresh upcoming ones starting from now (April 24, 2026)

-- 1. Delete all dependent records first
DELETE FROM public.tournament_chat_messages
WHERE tournament_id IN (SELECT id FROM public.tournaments WHERE starts_at < now() OR status = 'finished');

DELETE FROM public.tournament_anti_cheat_flags
WHERE tournament_id IN (SELECT id FROM public.tournaments WHERE starts_at < now() OR status = 'finished');

-- Delete tournament_pairings if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='tournament_pairings') THEN
    EXECUTE 'DELETE FROM public.tournament_pairings WHERE tournament_id IN (SELECT id FROM public.tournaments WHERE starts_at < now() OR status = ''finished'')';
  END IF;
END $$;

-- Delete tournament_participants / registrations if they exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='tournament_participants') THEN
    EXECUTE 'DELETE FROM public.tournament_participants WHERE tournament_id IN (SELECT id FROM public.tournaments WHERE starts_at < now() OR status = ''finished'')';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='tournament_registrations') THEN
    EXECUTE 'DELETE FROM public.tournament_registrations WHERE tournament_id IN (SELECT id FROM public.tournaments WHERE starts_at < now() OR status = ''finished'')';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='tournament_standings') THEN
    EXECUTE 'DELETE FROM public.tournament_standings WHERE tournament_id IN (SELECT id FROM public.tournaments WHERE starts_at < now() OR status = ''finished'')';
  END IF;
END $$;

-- 2. Delete the past tournaments themselves
DELETE FROM public.tournaments WHERE starts_at < now() OR status = 'finished';

-- 3. Seed 12 fresh upcoming tournaments across the next 14 days
INSERT INTO public.tournaments (
  name, description, tournament_type, format, category,
  time_control_label, time_control_seconds, time_control_increment,
  starts_at, max_players, total_rounds, is_rated, visibility,
  anti_cheat_level, status, start_time_locked
) VALUES
  ('Tonight''s Bullet Brawl', 'Fast 1+0 bullet sprint. Open to everyone.', 'arena', 'arena', 'bullet', '1+0', 60, 0, now() + interval '2 hours', 64, 1, true, 'public', 'strict', 'registering', true),
  ('Late Night Blitz Arena', 'Wind down with 3+2 blitz games.', 'arena', 'arena', 'blitz', '3+2', 180, 2, now() + interval '5 hours', 128, 1, true, 'public', 'strict', 'registering', true),
  ('Friday Night Swiss', '5-round Swiss, 5+3 blitz.', 'swiss', 'swiss', 'blitz', '5+3', 300, 3, now() + interval '1 day', 64, 5, true, 'public', 'strict', 'registering', true),
  ('Weekend Rapid Open', '4-round 10+5 rapid Swiss.', 'swiss', 'swiss', 'rapid', '10+5', 600, 5, now() + interval '2 days', 96, 4, true, 'public', 'strict', 'registering', true),
  ('Sunday Classical', '30-minute classical games. Slow and serious.', 'swiss', 'swiss', 'classical', '30+0', 1800, 0, now() + interval '3 days', 32, 4, true, 'public', 'strict', 'registering', true),
  ('Monday Morning Blitz', 'Wake up with 3+0 blitz.', 'arena', 'arena', 'blitz', '3+0', 180, 0, now() + interval '4 days', 64, 1, true, 'public', 'strict', 'registering', true),
  ('Tuesday Bullet Madness', '2+1 bullet arena. 60 minutes of chaos.', 'arena', 'arena', 'bullet', '2+1', 120, 1, now() + interval '5 days', 128, 1, true, 'public', 'strict', 'registering', true),
  ('Mid-Week Round Robin', '8-player round robin, 5+0 blitz.', 'round_robin', 'round-robin', 'blitz', '5+0', 300, 0, now() + interval '6 days', 8, 7, true, 'public', 'strict', 'registering', true),
  ('Weekly Knockout Cup', '15+10 rapid knockout. Win or go home.', 'swiss', 'swiss', 'rapid', '15+10', 900, 10, now() + interval '7 days', 32, 5, true, 'public', 'strict', 'registering', true),
  ('Saturday Speed Chess Cup', '5+3 blitz Swiss, 6 rounds.', 'swiss', 'swiss', 'blitz', '5+3', 300, 3, now() + interval '9 days', 64, 6, true, 'public', 'strict', 'registering', true),
  ('Sunday Rapid Showdown', '10+0 rapid arena.', 'arena', 'arena', 'rapid', '10+0', 600, 0, now() + interval '10 days', 96, 1, true, 'public', 'strict', 'registering', true),
  ('Monthly Classical Championship', 'Premier 30-minute classical event. 5 rounds.', 'swiss', 'swiss', 'classical', '30+0', 1800, 0, now() + interval '14 days', 64, 5, true, 'public', 'strict', 'registering', true);
