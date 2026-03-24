'use client';
import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Send } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useMessages } from '@/hooks/use-messages';
import { createClient } from '@/lib/supabase/client';
import { ChatBubble } from '@/components/chat-bubble';
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
    <div className="flex flex-col h-[100dvh] md:h-full">
      {/* Header */}
      <header className="shrink-0 bg-white border-b border-[#EBEBEA] px-4 py-3 flex items-center gap-3">
        <Link href="/messages" className="md:hidden text-[#6B6B6B] hover:text-[#191919] shrink-0">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <span className="h-8 w-8 rounded-full bg-[#F0F0EE] text-[#6B6B6B] text-xs font-medium flex items-center justify-center shrink-0">
          {initials}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#191919] truncate">{otherUser?.full_name ?? 'Loading…'}</p>
          {listing && (
            <p className="text-xs text-[#A0A0A0] truncate">{listing.title}</p>
          )}
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 bg-white">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="h-5 w-5 rounded-full border-2 border-[#2383E2] border-t-transparent animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-[#A0A0A0]">No messages yet. Say hi!</p>
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
      <div className="shrink-0 border-t border-[#EBEBEA] bg-white px-4 py-3 safe-area-pb">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message…"
            autoComplete="off"
            className="flex-1 h-9 rounded-md bg-[#F7F7F5] border border-[#EBEBEA] px-3 text-sm text-[#191919] placeholder:text-[#A0A0A0] focus:outline-none focus:border-[#2383E2] transition-colors"
          />
          <button
            type="submit"
            disabled={!text.trim() || sending}
            className="h-9 w-9 rounded-md bg-[#2383E2] text-white flex items-center justify-center hover:bg-[#1a6fc9] disabled:opacity-40 transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
