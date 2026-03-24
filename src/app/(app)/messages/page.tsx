'use client';
import { MessageCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { ConversationList } from './conversation-list';

export default function MessagesPage() {
  const { user } = useAuth();

  return (
    <>
      {/* Mobile: full-page conversation list */}
      <div className="md:hidden">
        <header className="sticky top-0 z-30 bg-white border-b border-[#EBEBEA] px-4 py-3.5">
          <h1 className="text-base font-medium text-[#191919]">Messages</h1>
        </header>
        <ConversationList userId={user?.id} />
      </div>

      {/* Desktop: placeholder */}
      <div className="hidden md:flex flex-col items-center justify-center h-full text-center py-20">
        <MessageCircle className="h-10 w-10 text-[#E8E8E5] mb-3" strokeWidth={1.5} />
        <p className="text-sm font-medium text-[#191919]">Select a conversation</p>
        <p className="mt-1 text-sm text-[#A0A0A0]">Choose a conversation from the left to start chatting.</p>
      </div>
    </>
  );
}
