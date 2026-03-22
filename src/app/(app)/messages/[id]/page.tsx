'use client';
import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Send } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useMessages } from '@/hooks/use-messages';
import { createClient } from '@/lib/supabase/client';
import { ChatBubble } from '@/components/chat-bubble';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getAvatarInitials } from '@/lib/utils';
import type { Profile, Listing } from '@/types';
import Link from 'next/link';

export default function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { messages, loading, sendMessage } = useMessages(id, user?.id);
  const supabase = useRef(createClient()).current;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [otherUser, setOtherUser] = useState<Profile | null>(null);
  const [listing, setListing] = useState<Listing | null>(null);

  useEffect(() => {
    if (!user) return;
    async function loadConversation() {
      const { data: conv } = await supabase
        .from('conversations')
        .select('*, listing:listings(*)')
        .eq('id', id)
        .single();

      if (!conv) { router.push('/messages'); return; }
      const convData = conv as typeof conv & { listing: Listing | null };
      setListing(convData.listing);

      const otherId = conv.participant_1 === user!.id ? conv.participant_2 : conv.participant_1;
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', otherId)
        .single();
      setOtherUser(profile);
    }
    loadConversation();
  }, [id, user, supabase, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    await sendMessage(text);
    setText('');
    setSending(false);
  }

  const initials = getAvatarInitials(otherUser?.full_name ?? null);

  return (
    // h-[100dvh] on mobile fills viewport; md:h-full fills the flex container from messages/layout.tsx
    <div className="flex flex-col h-[100dvh] md:h-full">
      {/* Header */}
      <header className="shrink-0 bg-[#1a2035] px-4 pt-safe-top pb-3 flex items-center gap-3">
        {/* Back link — only visible on mobile */}
        <Link href="/messages" className="md:hidden text-white/70 hover:text-white shrink-0">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <Avatar className="h-9 w-9 shrink-0">
          {otherUser?.avatar_url && <AvatarImage src={otherUser.avatar_url} />}
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="font-semibold text-white text-sm truncate">{otherUser?.full_name ?? 'Loading…'}</p>
          {listing && (
            <p className="text-xs text-white/60 truncate">{listing.title}</p>
          )}
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 bg-gray-50">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="h-6 w-6 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-gray-400">No messages yet. Say hi!</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isSent = msg.sender_id === user?.id;
            const showTime = i === messages.length - 1 ||
              new Date(messages[i + 1]?.created_at).getTime() - new Date(msg.created_at).getTime() > 5 * 60 * 1000;
            return (
              <ChatBubble key={msg.id} message={msg} isSent={isSent} showTime={showTime} />
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="shrink-0 border-t border-gray-200 bg-white px-4 py-3 safe-area-pb">
        <form onSubmit={handleSend} className="flex gap-2">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message…"
            className="flex-1"
            autoComplete="off"
          />
          <Button type="submit" size="icon" disabled={!text.trim() || sending}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
