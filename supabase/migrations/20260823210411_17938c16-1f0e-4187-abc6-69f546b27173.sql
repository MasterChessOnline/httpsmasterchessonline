create or replace function public.claim_achievement(_achievement_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  a public.achievements;
  p public.profiles;
  ok boolean := false;
begin
  if uid is null then
    return false;
  end if;

  select * into a from public.achievements where id = _achievement_id;
  if a.id is null then return false; end if;

  select * into p from public.profiles where user_id = uid;
  if p.user_id is null then return false; end if;

  -- Server-side verification: the player must actually meet the requirement.
  if a.requirement_type = 'games_won' then
    ok := coalesce(p.games_won, 0) >= coalesce(a.requirement_value, 0);
  elsif a.requirement_type = 'games_played' then
    ok := coalesce(p.games_played, 0) >= coalesce(a.requirement_value, 0);
  elsif a.requirement_type = 'rating' then
    ok := coalesce(p.rating, 0) >= coalesce(a.requirement_value, 0);
  elsif a.requirement_type in ('premium', 'tier_pro') then
    ok := coalesce(p.access_tier, 'free') <> 'free';
  elsif a.requirement_type = 'tier_elite' then
    ok := coalesce(p.access_tier, 'free') in ('elite', 'grandmaster');
  elsif a.requirement_type = 'tier_grandmaster' then
    ok := coalesce(p.access_tier, 'free') = 'grandmaster';
  else
    ok := false;
  end if;

  if not ok then return false; end if;

  insert into public.user_achievements (user_id, achievement_id)
  values (uid, _achievement_id)
  on conflict do nothing;

  if a.reward_type = 'collectible' and a.reward_value is not null then
    insert into public.user_collectibles (user_id, collectible_type, collectible_key)
    select uid, 'badge', a.reward_value
    where not exists (
      select 1 from public.user_collectibles uc
      where uc.user_id = uid and uc.collectible_key = a.reward_value
    );
  end if;

  return true;
end;
$$;

revoke execute on function public.claim_achievement(uuid) from anon;
grant execute on function public.claim_achievement(uuid) to authenticated;