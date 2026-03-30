'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useMediaQuery } from '@/hooks/use-media-query';
import { createClient } from '@/lib/supabase/client';
import { ConversationList } from './conversation-list';

export default function MessagesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const supabase = useRef(createClient()).current;
  const [firstConvId, setFirstConvId] = useState<string | null | undefined>(undefined);

  // One-shot query to find the most recent conversation (desktop redirect only)
  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from('conversations')
      .select('id')
      .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setFirstConvId(data?.id ?? null));
  }, [user?.id, supabase]);

  useEffect(() => {
    if (isDesktop && firstConvId) {
      router.replace(`/messages/${firstConvId}`);
    }
  }, [isDesktop, firstConvId, router]);

  return (
    <>
      {/* Mobile: full-page conversation list */}
      <div className="md:hidden">
        <header className="sticky top-0 z-30 bg-white border-b border-[#EBEBEA] px-4 py-3.5">
          <h1 className="text-base font-medium text-[#191919]">Messages</h1>
        </header>
        <ConversationList userId={user?.id} />
      </div>

      {/* Desktop: empty state if no conversations, otherwise blank while redirecting */}
      <div className="hidden md:flex flex-col items-center justify-center h-full text-center py-20">
        {firstConvId === null && (
          <>
            <MessageCircle className="h-10 w-10 text-[#E8E8E5] mb-3" strokeWidth={1.5} />
            <p className="text-sm font-medium text-[#191919]">No conversations yet</p>
            <p className="mt-1 text-sm text-[#A0A0A0]">Tap &quot;Message&quot; on any listing to start a conversation.</p>
          </>
        )}
      </div>
    </>
  );
}
