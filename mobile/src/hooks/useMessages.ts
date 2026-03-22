import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import type { Message } from '@/types';

export function useMessages(conversationId: string, userId: string | undefined) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const markedReadRef = useRef(false);

  const markRead = useCallback(async () => {
    if (!userId || markedReadRef.current) return;
    markedReadRef.current = true;
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .eq('is_read', false)
      .neq('sender_id', userId);
  }, [conversationId, userId]);

  const fetchMessages = useCallback(async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setMessages(data as Message[]);
      markRead();
    }
    setLoading(false);
  }, [conversationId, markRead]);

  useEffect(() => {
    markedReadRef.current = false;
    fetchMessages();

    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => [...prev, newMsg]);
          if (newMsg.sender_id !== userId) {
            supabase
              .from('messages')
              .update({ is_read: true })
              .eq('id', newMsg.id);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversationId, userId, fetchMessages]);

  const sendMessage = useCallback(async (content: string) => {
    if (!userId || !content.trim()) return;
    await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: userId,
      content: content.trim(),
      is_read: false,
    });
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);
  }, [conversationId, userId]);

  return { messages, loading, sendMessage };
}
