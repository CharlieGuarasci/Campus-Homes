'use client';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { useConversations } from '@/hooks/use-conversations';
import { getAvatarInitials, truncate, formatRelativeTime } from '@/lib/utils';

export function ConversationList({ userId }: { userId?: string }) {
  const { conversations, loading } = useConversations(userId);

  if (loading) {
    return (
      <div className="divide-y divide-[#F0F0EE]">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3.5">
            <div className="h-9 w-9 rounded-full bg-[#F0F0EE] animate-pulse shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-28 rounded bg-[#F0F0EE] animate-pulse" />
              <div className="h-2.5 w-44 rounded bg-[#F0F0EE] animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-6">
        <MessageCircle className="h-10 w-10 text-[#E8E8E5] mb-3" strokeWidth={1.5} />
        <p className="text-sm font-medium text-[#191919]">No messages yet</p>
        <p className="mt-1 text-sm text-[#A0A0A0]">Tap &quot;Message&quot; on any listing to start a conversation.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-[#F0F0EE] bg-white">
      {conversations.map((conv) => {
        const other = conv.other_participant;
        const initials = getAvatarInitials(other?.full_name);
        const lastMsg = conv.last_message;
        const hasUnread = conv.unread_count > 0;

        return (
          <Link
            key={conv.id}
            href={`/messages/${conv.id}`}
            className="flex items-center gap-3 px-4 py-3.5 hover:bg-[#F7F7F5] transition-colors"
          >
            <span className="h-9 w-9 rounded-full bg-[#F0F0EE] text-[#6B6B6B] text-xs font-medium flex items-center justify-center shrink-0">
              {initials}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className={`text-sm truncate ${hasUnread ? 'font-medium text-[#191919]' : 'text-[#191919]'}`}>
                  {other?.full_name ?? 'Unknown'}
                </p>
                <div className="flex items-center gap-1.5 shrink-0">
                  {lastMsg && (
                    <span className="text-xs text-[#A0A0A0]">{formatRelativeTime(lastMsg.created_at)}</span>
                  )}
                  {hasUnread && (
                    <span className="h-4 w-4 rounded-full bg-[#2383E2] text-[10px] font-semibold text-white flex items-center justify-center">
                      {conv.unread_count > 9 ? '9+' : conv.unread_count}
                    </span>
                  )}
                </div>
              </div>
              {conv.listing && (
                <p className="text-xs text-[#2383E2] truncate">{conv.listing.title}</p>
              )}
              {lastMsg && (
                <p className={`text-xs truncate mt-0.5 ${hasUnread ? 'text-[#6B6B6B] font-medium' : 'text-[#A0A0A0]'}`}>
                  {lastMsg.sender_id === userId ? 'You: ' : ''}
                  {truncate(lastMsg.content, 60)}
                </p>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
