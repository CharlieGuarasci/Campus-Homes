-- =============================================================================
-- Security Fixes: RLS Policies for UPDATE/DELETE Operations
-- =============================================================================

-- ---------------------------------------------------------------------------
-- CONVERSATIONS: Add UPDATE policy for participants
-- ---------------------------------------------------------------------------
create policy "conversations_update_participant" on public.conversations
  for update using (
    auth.uid() = participant_1 or auth.uid() = participant_2
  );

-- ---------------------------------------------------------------------------
-- MESSAGES: Add DELETE policy for own messages
-- ---------------------------------------------------------------------------
create policy "messages_delete_own" on public.messages
  for delete using (auth.uid() = sender_id);