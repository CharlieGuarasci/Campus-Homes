'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Message } from '@/types';

export function useMessages(conversationId: string, currentUserId: string | undefined) {
  const supabase = useRef(createClient()).current;
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    if (data) setMessages(data as Message[]);
    setLoading(false);
  }, [conversationId, supabase]);

  const markRead = useCallback(async () => {
    if (!currentUserId) return;
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .eq('is_read', false)
      .neq('sender_id', currentUserId);
  }, [conversationId, currentUserId, supabase]);

  useEffect(() => {
    fetchMessages().then(() => markRead());

    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => {
            if (prev.some((m) => m.id === (payload.new as Message).id)) return prev;
            return [...prev, payload.new as Message];
          });
          markRead();
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversationId, fetchMessages, markRead, supabase]);

  const sendMessage = useCallback(async (content: string) => {
    if (!currentUserId || !content.trim()) return;
    await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: currentUserId,
      content: content.trim(),
    });
    await fetchMessages();
  }, [conversationId, currentUserId, fetchMessages, supabase]);

  return { messages, loading, sendMessage };
}
