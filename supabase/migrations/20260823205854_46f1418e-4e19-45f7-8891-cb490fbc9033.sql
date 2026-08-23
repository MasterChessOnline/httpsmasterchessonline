create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path to 'public' as $function$
declare
  seed int;
begin
  seed := coalesce(nullif(NEW.raw_user_meta_data->>'starting_rating','')::int, 1200);
  if seed < 400 then seed := 400; end if;
  if seed > 2800 then seed := 2800; end if;

  insert into public.profiles (user_id, display_name, rating, peak_rating, bot_rating, bot_peak_rating)
  values (
    NEW.id,
    coalesce(NEW.raw_user_meta_data->>'display_name', 'Player'),
    seed, seed, seed, seed
  );

  insert into public.email_preferences (user_id, daily_puzzle)
  values (NEW.id, true)
  on conflict (user_id) do nothing;

  return NEW;
end;
$function$;