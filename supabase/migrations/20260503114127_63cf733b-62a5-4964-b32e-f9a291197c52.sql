-- ============= 1. CITIES CATALOG =============
CREATE TABLE public.cities (
  key text PRIMARY KEY,
  name text NOT NULL,
  country_code text NOT NULL,
  country_name text NOT NULL,
  flag text NOT NULL,
  region text NOT NULL,
  lat numeric,
  lng numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view cities" ON public.cities FOR SELECT USING (true);
CREATE POLICY "Admins manage cities" ON public.cities FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Seed: ex-YU + top svetskih (skraćeno na ~120)
INSERT INTO public.cities (key, name, country_code, country_name, flag, region) VALUES
  -- Srbija
  ('beograd','Beograd','RS','Serbia','🇷🇸','Balkans'),
  ('novi-sad','Novi Sad','RS','Serbia','🇷🇸','Balkans'),
  ('nis','Niš','RS','Serbia','🇷🇸','Balkans'),
  ('kragujevac','Kragujevac','RS','Serbia','🇷🇸','Balkans'),
  ('subotica','Subotica','RS','Serbia','🇷🇸','Balkans'),
  ('cacak','Čačak','RS','Serbia','🇷🇸','Balkans'),
  ('kraljevo','Kraljevo','RS','Serbia','🇷🇸','Balkans'),
  ('pancevo','Pančevo','RS','Serbia','🇷🇸','Balkans'),
  ('zrenjanin','Zrenjanin','RS','Serbia','🇷🇸','Balkans'),
  ('leskovac','Leskovac','RS','Serbia','🇷🇸','Balkans'),
  ('valjevo','Valjevo','RS','Serbia','🇷🇸','Balkans'),
  ('uzice','Užice','RS','Serbia','🇷🇸','Balkans'),
  -- Region
  ('zagreb','Zagreb','HR','Croatia','🇭🇷','Balkans'),
  ('split','Split','HR','Croatia','🇭🇷','Balkans'),
  ('rijeka','Rijeka','HR','Croatia','🇭🇷','Balkans'),
  ('osijek','Osijek','HR','Croatia','🇭🇷','Balkans'),
  ('sarajevo','Sarajevo','BA','Bosnia & Herzegovina','🇧🇦','Balkans'),
  ('banja-luka','Banja Luka','BA','Bosnia & Herzegovina','🇧🇦','Balkans'),
  ('mostar','Mostar','BA','Bosnia & Herzegovina','🇧🇦','Balkans'),
  ('podgorica','Podgorica','ME','Montenegro','🇲🇪','Balkans'),
  ('niksic','Nikšić','ME','Montenegro','🇲🇪','Balkans'),
  ('skopje','Skopje','MK','North Macedonia','🇲🇰','Balkans'),
  ('bitola','Bitola','MK','North Macedonia','🇲🇰','Balkans'),
  ('ljubljana','Ljubljana','SI','Slovenia','🇸🇮','Balkans'),
  ('maribor','Maribor','SI','Slovenia','🇸🇮','Balkans'),
  ('pristina','Priština','XK','Kosovo','🇽🇰','Balkans'),
  ('tirana','Tirana','AL','Albania','🇦🇱','Balkans'),
  -- Europe
  ('london','London','GB','United Kingdom','🇬🇧','Europe'),
  ('manchester','Manchester','GB','United Kingdom','🇬🇧','Europe'),
  ('paris','Paris','FR','France','🇫🇷','Europe'),
  ('marseille','Marseille','FR','France','🇫🇷','Europe'),
  ('berlin','Berlin','DE','Germany','🇩🇪','Europe'),
  ('munich','Munich','DE','Germany','🇩🇪','Europe'),
  ('hamburg','Hamburg','DE','Germany','🇩🇪','Europe'),
  ('madrid','Madrid','ES','Spain','🇪🇸','Europe'),
  ('barcelona','Barcelona','ES','Spain','🇪🇸','Europe'),
  ('rome','Rome','IT','Italy','🇮🇹','Europe'),
  ('milan','Milan','IT','Italy','🇮🇹','Europe'),
  ('amsterdam','Amsterdam','NL','Netherlands','🇳🇱','Europe'),
  ('brussels','Brussels','BE','Belgium','🇧🇪','Europe'),
  ('vienna','Vienna','AT','Austria','🇦🇹','Europe'),
  ('zurich','Zurich','CH','Switzerland','🇨🇭','Europe'),
  ('geneva','Geneva','CH','Switzerland','🇨🇭','Europe'),
  ('stockholm','Stockholm','SE','Sweden','🇸🇪','Europe'),
  ('oslo','Oslo','NO','Norway','🇳🇴','Europe'),
  ('copenhagen','Copenhagen','DK','Denmark','🇩🇰','Europe'),
  ('helsinki','Helsinki','FI','Finland','🇫🇮','Europe'),
  ('dublin','Dublin','IE','Ireland','🇮🇪','Europe'),
  ('warsaw','Warsaw','PL','Poland','🇵🇱','Europe'),
  ('krakow','Kraków','PL','Poland','🇵🇱','Europe'),
  ('prague','Prague','CZ','Czechia','🇨🇿','Europe'),
  ('budapest','Budapest','HU','Hungary','🇭🇺','Europe'),
  ('bucharest','Bucharest','RO','Romania','🇷🇴','Europe'),
  ('sofia','Sofia','BG','Bulgaria','🇧🇬','Europe'),
  ('athens','Athens','GR','Greece','🇬🇷','Europe'),
  ('istanbul','Istanbul','TR','Türkiye','🇹🇷','Europe'),
  ('ankara','Ankara','TR','Türkiye','🇹🇷','Europe'),
  ('lisbon','Lisbon','PT','Portugal','🇵🇹','Europe'),
  ('porto','Porto','PT','Portugal','🇵🇹','Europe'),
  ('moscow','Moscow','RU','Russia','🇷🇺','Europe'),
  ('saint-petersburg','Saint Petersburg','RU','Russia','🇷🇺','Europe'),
  ('kyiv','Kyiv','UA','Ukraine','🇺🇦','Europe'),
  ('minsk','Minsk','BY','Belarus','🇧🇾','Europe'),
  -- Americas
  ('new-york','New York','US','United States','🇺🇸','Americas'),
  ('los-angeles','Los Angeles','US','United States','🇺🇸','Americas'),
  ('chicago','Chicago','US','United States','🇺🇸','Americas'),
  ('san-francisco','San Francisco','US','United States','🇺🇸','Americas'),
  ('miami','Miami','US','United States','🇺🇸','Americas'),
  ('seattle','Seattle','US','United States','🇺🇸','Americas'),
  ('boston','Boston','US','United States','🇺🇸','Americas'),
  ('austin','Austin','US','United States','🇺🇸','Americas'),
  ('dallas','Dallas','US','United States','🇺🇸','Americas'),
  ('toronto','Toronto','CA','Canada','🇨🇦','Americas'),
  ('vancouver','Vancouver','CA','Canada','🇨🇦','Americas'),
  ('montreal','Montréal','CA','Canada','🇨🇦','Americas'),
  ('mexico-city','Mexico City','MX','Mexico','🇲🇽','Americas'),
  ('havana','Havana','CU','Cuba','🇨🇺','Americas'),
  ('san-juan','San Juan','PR','Puerto Rico','🇵🇷','Americas'),
  ('sao-paulo','São Paulo','BR','Brazil','🇧🇷','Americas'),
  ('rio-de-janeiro','Rio de Janeiro','BR','Brazil','🇧🇷','Americas'),
  ('buenos-aires','Buenos Aires','AR','Argentina','🇦🇷','Americas'),
  ('santiago','Santiago','CL','Chile','🇨🇱','Americas'),
  ('lima','Lima','PE','Peru','🇵🇪','Americas'),
  ('bogota','Bogotá','CO','Colombia','🇨🇴','Americas'),
  ('caracas','Caracas','VE','Venezuela','🇻🇪','Americas'),
  -- Asia
  ('tokyo','Tokyo','JP','Japan','🇯🇵','Asia'),
  ('osaka','Osaka','JP','Japan','🇯🇵','Asia'),
  ('seoul','Seoul','KR','South Korea','🇰🇷','Asia'),
  ('beijing','Beijing','CN','China','🇨🇳','Asia'),
  ('shanghai','Shanghai','CN','China','🇨🇳','Asia'),
  ('hong-kong','Hong Kong','HK','Hong Kong','🇭🇰','Asia'),
  ('singapore','Singapore','SG','Singapore','🇸🇬','Asia'),
  ('bangkok','Bangkok','TH','Thailand','🇹🇭','Asia'),
  ('jakarta','Jakarta','ID','Indonesia','🇮🇩','Asia'),
  ('manila','Manila','PH','Philippines','🇵🇭','Asia'),
  ('kuala-lumpur','Kuala Lumpur','MY','Malaysia','🇲🇾','Asia'),
  ('hanoi','Hanoi','VN','Vietnam','🇻🇳','Asia'),
  ('ho-chi-minh','Ho Chi Minh City','VN','Vietnam','🇻🇳','Asia'),
  ('mumbai','Mumbai','IN','India','🇮🇳','Asia'),
  ('delhi','Delhi','IN','India','🇮🇳','Asia'),
  ('bangalore','Bangalore','IN','India','🇮🇳','Asia'),
  ('chennai','Chennai','IN','India','🇮🇳','Asia'),
  ('karachi','Karachi','PK','Pakistan','🇵🇰','Asia'),
  ('lahore','Lahore','PK','Pakistan','🇵🇰','Asia'),
  ('dhaka','Dhaka','BD','Bangladesh','🇧🇩','Asia'),
  ('tashkent','Tashkent','UZ','Uzbekistan','🇺🇿','Asia'),
  ('almaty','Almaty','KZ','Kazakhstan','🇰🇿','Asia'),
  ('baku','Baku','AZ','Azerbaijan','🇦🇿','Asia'),
  ('tbilisi','Tbilisi','GE','Georgia','🇬🇪','Asia'),
  ('yerevan','Yerevan','AM','Armenia','🇦🇲','Asia'),
  ('tehran','Tehran','IR','Iran','🇮🇷','Asia'),
  ('dubai','Dubai','AE','United Arab Emirates','🇦🇪','Asia'),
  ('riyadh','Riyadh','SA','Saudi Arabia','🇸🇦','Asia'),
  ('doha','Doha','QA','Qatar','🇶🇦','Asia'),
  ('jerusalem','Jerusalem','IL','Israel','🇮🇱','Asia'),
  ('tel-aviv','Tel Aviv','IL','Israel','🇮🇱','Asia'),
  -- Africa
  ('cairo','Cairo','EG','Egypt','🇪🇬','Africa'),
  ('lagos','Lagos','NG','Nigeria','🇳🇬','Africa'),
  ('johannesburg','Johannesburg','ZA','South Africa','🇿🇦','Africa'),
  ('cape-town','Cape Town','ZA','South Africa','🇿🇦','Africa'),
  ('nairobi','Nairobi','KE','Kenya','🇰🇪','Africa'),
  ('addis-ababa','Addis Ababa','ET','Ethiopia','🇪🇹','Africa'),
  ('casablanca','Casablanca','MA','Morocco','🇲🇦','Africa'),
  ('algiers','Algiers','DZ','Algeria','🇩🇿','Africa'),
  ('tunis','Tunis','TN','Tunisia','🇹🇳','Africa'),
  ('accra','Accra','GH','Ghana','🇬🇭','Africa'),
  ('dakar','Dakar','SN','Senegal','🇸🇳','Africa'),
  -- Oceania
  ('sydney','Sydney','AU','Australia','🇦🇺','Oceania'),
  ('melbourne','Melbourne','AU','Australia','🇦🇺','Oceania'),
  ('brisbane','Brisbane','AU','Australia','🇦🇺','Oceania'),
  ('auckland','Auckland','NZ','New Zealand','🇳🇿','Oceania')
ON CONFLICT (key) DO NOTHING;

-- ============= 2. PROFILES dopune =============
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS city_key text REFERENCES public.cities(key) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS master_coins integer NOT NULL DEFAULT 500,
  ADD COLUMN IF NOT EXISTS is_streamer boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_profiles_city_key ON public.profiles(city_key);

-- ============= 3. ONLINE_GAMES dopune (Hand & Brain + sub-only) =============
ALTER TABLE public.online_games
  ADD COLUMN IF NOT EXISTS mode text NOT NULL DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS hand_brain_meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS streamer_only boolean NOT NULL DEFAULT false;

-- ============= 4. HAND & BRAIN ROLES (4 igrača) =============
CREATE TABLE public.hand_brain_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL UNIQUE,
  white_brain_id uuid NOT NULL,
  white_hand_id  uuid NOT NULL,
  black_brain_id uuid NOT NULL,
  black_hand_id  uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.hand_brain_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view H&B roles" ON public.hand_brain_roles
  FOR SELECT USING (true);
CREATE POLICY "Players can create H&B roles" ON public.hand_brain_roles
  FOR INSERT WITH CHECK (
    auth.uid() IN (white_brain_id, white_hand_id, black_brain_id, black_hand_id)
  );

-- ============= 5. SPECTATOR BETS =============
CREATE TABLE public.spectator_bets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL,
  user_id uuid NOT NULL,
  side text NOT NULL CHECK (side IN ('white','draw','black')),
  stake integer NOT NULL CHECK (stake > 0),
  odds_at_bet numeric NOT NULL CHECK (odds_at_bet > 0),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','won','lost','refunded')),
  payout integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);
ALTER TABLE public.spectator_bets ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_bets_game ON public.spectator_bets(game_id);
CREATE INDEX idx_bets_user ON public.spectator_bets(user_id);

CREATE POLICY "Anyone can view bets" ON public.spectator_bets FOR SELECT USING (true);
CREATE POLICY "Users place own bets" ON public.spectator_bets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============= 6. AI GAME REVIEWS =============
CREATE TABLE public.ai_game_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL UNIQUE,
  narrative text NOT NULL,
  moment_ply integer,
  moment_san text,
  moment_caption text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_game_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view AI reviews" ON public.ai_game_reviews FOR SELECT USING (true);
CREATE POLICY "Service role inserts AI reviews" ON public.ai_game_reviews FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- ============= 7. CITY LEADERBOARD VIEW =============
CREATE OR REPLACE VIEW public.city_leaderboard AS
SELECT
  c.key,
  c.name,
  c.country_name,
  c.flag,
  c.region,
  COUNT(p.user_id)::int                        AS players,
  COALESCE(SUM(p.games_won), 0)::int           AS total_wins,
  COALESCE(SUM(p.games_played), 0)::int        AS total_games,
  COALESCE(ROUND(AVG(NULLIF(p.rating, 0))), 0)::int AS avg_rating,
  COALESCE(MAX(p.peak_rating), 0)::int         AS top_rating
FROM public.cities c
LEFT JOIN public.profiles p ON p.city_key = c.key
GROUP BY c.key, c.name, c.country_name, c.flag, c.region;

GRANT SELECT ON public.city_leaderboard TO anon, authenticated;

-- ============= 8. RPC: place_spectator_bet (atomic deduct) =============
CREATE OR REPLACE FUNCTION public.place_spectator_bet(
  p_game_id uuid, p_side text, p_stake integer, p_odds numeric
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  caller uuid := auth.uid();
  current_balance integer;
  bet_id uuid;
BEGIN
  IF caller IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;
  IF p_stake IS NULL OR p_stake <= 0 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'bad_stake');
  END IF;
  IF p_side NOT IN ('white','draw','black') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'bad_side');
  END IF;

  -- Lock the row
  SELECT master_coins INTO current_balance
    FROM public.profiles WHERE user_id = caller FOR UPDATE;
  IF current_balance IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'no_profile');
  END IF;
  IF current_balance < p_stake THEN
    RETURN jsonb_build_object('ok', false, 'error', 'insufficient_coins', 'balance', current_balance);
  END IF;

  UPDATE public.profiles
    SET master_coins = master_coins - p_stake, updated_at = now()
    WHERE user_id = caller;

  INSERT INTO public.spectator_bets (game_id, user_id, side, stake, odds_at_bet)
    VALUES (p_game_id, caller, p_side, p_stake, p_odds)
    RETURNING id INTO bet_id;

  RETURN jsonb_build_object('ok', true, 'bet_id', bet_id, 'balance', current_balance - p_stake);
END;
$$;

-- ============= 9. RPC: settle_bets_for_game (called when game finishes) =============
CREATE OR REPLACE FUNCTION public.settle_bets_for_game(p_game_id uuid)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  g record;
  winning_side text;
  rec record;
  paid integer := 0;
  cnt integer := 0;
BEGIN
  SELECT * INTO g FROM public.online_games WHERE id = p_game_id;
  IF NOT FOUND OR g.status <> 'finished' OR g.result IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_finished');
  END IF;

  winning_side := CASE g.result
    WHEN '1-0' THEN 'white'
    WHEN '0-1' THEN 'black'
    WHEN '1/2-1/2' THEN 'draw'
    ELSE NULL END;

  FOR rec IN SELECT * FROM public.spectator_bets
             WHERE game_id = p_game_id AND status = 'open' FOR UPDATE
  LOOP
    cnt := cnt + 1;
    IF rec.side = winning_side THEN
      DECLARE
        win_amount integer := FLOOR(rec.stake * rec.odds_at_bet)::int;
      BEGIN
        UPDATE public.spectator_bets
          SET status = 'won', payout = win_amount, resolved_at = now()
          WHERE id = rec.id;
        UPDATE public.profiles
          SET master_coins = master_coins + win_amount, updated_at = now()
          WHERE user_id = rec.user_id;
        paid := paid + win_amount;
      END;
    ELSE
      UPDATE public.spectator_bets
        SET status = 'lost', payout = 0, resolved_at = now()
        WHERE id = rec.id;
    END IF;
  END LOOP;

  RETURN jsonb_build_object('ok', true, 'settled', cnt, 'paid_out', paid, 'winning_side', winning_side);
END;
$$;

-- ============= 10. Realtime publication for new tables =============
ALTER PUBLICATION supabase_realtime ADD TABLE public.spectator_bets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.hand_brain_roles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_game_reviews;