'use client';
import { useAuth } from '@/hooks/use-auth';
import { ConversationList } from './conversation-list';

export default function MessagesLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  return (
    <div className="md:flex md:h-screen">
      {/* Desktop left pane: conversation list */}
      <aside className="hidden md:flex md:w-80 md:shrink-0 md:flex-col md:border-r md:border-gray-200 md:bg-white md:overflow-y-auto">
        <div className="sticky top-0 z-10 bg-[#1a2035] px-4 py-4">
          <h1 className="text-xl font-bold text-white">Messages</h1>
        </div>
        <ConversationList userId={user?.id} />
      </aside>

      {/* Right pane (full width on mobile) */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
