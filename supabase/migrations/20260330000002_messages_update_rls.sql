-- Allow conversation participants to mark messages as read (UPDATE is_read).
-- Without this policy, markRead() silently updates 0 rows despite RLS being enabled.
create policy "messages_update_read_status" on public.messages
  for update using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.participant_1 = auth.uid() or c.participant_2 = auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.participant_1 = auth.uid() or c.participant_2 = auth.uid())
    )
  );
