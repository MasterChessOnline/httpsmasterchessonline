
CREATE OR REPLACE FUNCTION public.update_elo_ratings(p_white_id uuid, p_black_id uuid, p_result text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
  white_rating integer;
  black_rating integer;
  expected_white float;
  k integer := 32;
  white_score float;
  black_score float;
  new_white integer;
  new_black integer;
BEGIN
  SELECT rating INTO white_rating FROM profiles WHERE user_id = p_white_id;
  SELECT rating INTO black_rating FROM profiles WHERE user_id = p_black_id;
  
  IF white_rating IS NULL OR black_rating IS NULL THEN RETURN; END IF;
  
  expected_white := 1.0 / (1.0 + power(10.0, (black_rating - white_rating)::float / 400.0));
  
  IF p_result = '1-0' THEN
    white_score := 1.0; black_score := 0.0;
  ELSIF p_result = '0-1' THEN
    white_score := 0.0; black_score := 1.0;
  ELSE
    white_score := 0.5; black_score := 0.5;
  END IF;
  
  new_white := white_rating + round(k * (white_score - expected_white))::integer;
  new_black := black_rating + round(k * (black_score - (1.0 - expected_white)))::integer;
  
  UPDATE profiles SET 
    rating = GREATEST(400, new_white),
    games_played = games_played + 1,
    games_won = games_won + CASE WHEN p_result = '1-0' THEN 1 ELSE 0 END,
    games_lost = games_lost + CASE WHEN p_result = '0-1' THEN 1 ELSE 0 END,
    games_drawn = games_drawn + CASE WHEN p_result = '1/2-1/2' THEN 1 ELSE 0 END
  WHERE user_id = p_white_id;
  
  UPDATE profiles SET 
    rating = GREATEST(400, new_black),
    games_played = games_played + 1,
    games_won = games_won + CASE WHEN p_result = '0-1' THEN 1 ELSE 0 END,
    games_lost = games_lost + CASE WHEN p_result = '1-0' THEN 1 ELSE 0 END,
    games_drawn = games_drawn + CASE WHEN p_result = '1/2-1/2' THEN 1 ELSE 0 END
  WHERE user_id = p_black_id;
END;
$$;
