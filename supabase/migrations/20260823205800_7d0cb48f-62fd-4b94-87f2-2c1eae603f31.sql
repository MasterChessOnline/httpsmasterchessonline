create or replace function public.is_registered_for_tournament(_tournament_id uuid, _user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.tournament_registrations tr
    where tr.tournament_id = _tournament_id and tr.user_id = _user_id
  )
$$;

create or replace function public.is_tournament_creator(_tournament_id uuid, _user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.tournaments t
    where t.id = _tournament_id and t.created_by = _user_id
  )
$$;

drop policy if exists "View tournaments by visibility" on public.tournaments;
create policy "View tournaments by visibility"
on public.tournaments for select
using (
  visibility = 'public'
  or created_by = auth.uid()
  or public.is_registered_for_tournament(id, auth.uid())
);

drop policy if exists "Tournament organizer reads registrations" on public.tournament_registrations;
create policy "Tournament organizer reads registrations"
on public.tournament_registrations for select to authenticated
using (public.is_tournament_creator(tournament_id, auth.uid()));