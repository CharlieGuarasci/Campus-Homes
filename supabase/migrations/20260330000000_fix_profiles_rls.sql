-- Allow any authenticated user to read any profile.
-- The previous policy only allowed reading profiles of conversation partners,
-- which broke the marketplace listing join.
drop policy if exists "profiles_select_own_or_conversation" on public.profiles;

create policy "profiles_select_authenticated" on public.profiles
  for select using (auth.uid() is not null);
