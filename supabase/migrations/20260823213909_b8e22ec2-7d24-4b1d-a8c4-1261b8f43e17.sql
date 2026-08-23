drop policy if exists "invites_public_read" on public.tournament_invites;

create policy "invites_owner_read"
on public.tournament_invites
for select
to authenticated
using (auth.uid() = created_by);

revoke select on public.tournament_invites from anon;

create or replace function public.has_premium_access(_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.stream_subscriptions s
    where s.user_id = _user_id
      and s.status = 'active'
      and (s.expires_at is null or s.expires_at > now())
  )
  or exists (
    select 1 from public.user_roles r
    where r.user_id = _user_id and r.role = 'admin'
  )
$$;

drop policy if exists "Anyone can view premium chat" on public.premium_chat_messages;

create policy "Premium subscribers can view premium chat"
on public.premium_chat_messages
for select
to authenticated
using (public.has_premium_access(auth.uid()));

drop policy if exists "Authenticated users can insert" on public.premium_chat_messages;

create policy "Premium subscribers can post premium chat"
on public.premium_chat_messages
for insert
to authenticated
with check (auth.uid() = user_id and public.has_premium_access(auth.uid()));
