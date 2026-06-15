create table public.heartbeats (
  id uuid primary key default gen_random_uuid(),
  game_id uuid references public.online_games(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  move_number int not null check (move_number > 0),
  think_time_ms int not null check (think_time_ms >= 0),
  created_at timestamptz default now()
);

grant select, insert, delete on public.heartbeats to authenticated;
grant all on public.heartbeats to service_role;

alter table public.heartbeats enable row level security;

create policy "Players can insert their own heartbeats"
  on public.heartbeats
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Players can read heartbeats for their games"
  on public.heartbeats
  for select
  to authenticated
  using (
    exists (
      select 1 from public.online_games g
      where g.id = heartbeats.game_id
        and (g.white_player_id = auth.uid() or g.black_player_id = auth.uid())
    )
  );

create policy "Players can delete their own heartbeats"
  on public.heartbeats
  for delete
  to authenticated
  using (auth.uid() = user_id);

create or replace function public.game_heartbeats(p_game_id uuid)
returns table(move_number int, think_time_ms int, user_id uuid)
language sql
stable
security definer
set search_path = public
as $$
  select move_number, think_time_ms, user_id
  from public.heartbeats
  where game_id = p_game_id
  order by move_number asc;
$$;

grant execute on function public.game_heartbeats(uuid) to authenticated;