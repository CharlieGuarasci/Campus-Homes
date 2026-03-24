-- =============================================================================
-- Security Fixes: Restrict Profile Data Exposure
-- =============================================================================

-- Drop the old policy
drop policy if exists "profiles_select_all" on public.profiles;

-- Create new restrictive policy
create policy "profiles_select_own_or_conversation" on public.profiles
  for select using (
    auth.uid() = id or
    exists (
      select 1 from public.conversations c
      where (c.participant_1 = auth.uid() or c.participant_2 = auth.uid())
        and (c.participant_1 = profiles.id or c.participant_2 = profiles.id)
    )
  );

-- Create a view for limited public profile data (if needed for public access)
-- This view exposes only id and full_name for all users
create or replace view public.public_profiles as
  select id, full_name
  from public.profiles
  where email is not null;