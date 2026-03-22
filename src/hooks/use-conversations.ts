'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { ConversationWithDetails } from '@/types';

export function useConversations(userId: string | undefined) {
  const supabase = useRef(createClient()).current;
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    if (!userId) { setLoading(false); return; }

    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        listing:listings(id, title, price_per_month),
        profile_1:profiles!conversations_participant_1_fkey(*),
        profile_2:profiles!conversations_participant_2_fkey(*)
      `)
      .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
      .order('updated_at', { ascending: false });

    if (error || !data) { setLoading(false); return; }

    const enriched = await Promise.all(
      data.map(async (conv: Record<string, unknown>) => {
        const otherProfile = conv.participant_1 === userId ? conv.profile_2 : conv.profile_1;

        const { data: messages } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1);

        const { count: unreadCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
          .eq('is_read', false)
          .neq('sender_id', userId);

        return {
          ...conv,
          other_participant: otherProfile,
          last_message: messages?.[0] ?? null,
          unread_count: unreadCount ?? 0,
        } as ConversationWithDetails;
      })
    );

    setConversations(enriched);
    setLoading(false);
  }, [userId, supabase]);

  useEffect(() => {
    fetchConversations();

    if (!userId) return;
    const channel = supabase
      .channel('conversations-refresh')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
        fetchConversations();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId, fetchConversations, supabase]);

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread_count, 0);

  return { conversations, loading, totalUnread, refetch: fetchConversations };
}
