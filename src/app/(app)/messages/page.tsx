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
        <header className="sticky top-0 z-30 bg-[#1a2035] px-4 pt-safe-top pb-4">
          <h1 className="text-xl font-bold text-white pt-2">Messages</h1>
        </header>
        <ConversationList userId={user?.id} />
      </div>

      {/* Desktop: placeholder — the list lives in messages/layout.tsx sidebar */}
      <div className="hidden md:flex flex-col items-center justify-center h-full text-center py-20">
        <MessageCircle className="h-14 w-14 text-gray-200 mb-4" />
        <p className="font-semibold text-gray-500">Select a conversation</p>
        <p className="mt-1 text-sm text-gray-400">
          Choose a conversation from the left to start chatting.
        </p>
      </div>
    </>
  );
}
