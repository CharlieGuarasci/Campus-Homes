'use client';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { useConversations } from '@/hooks/use-conversations';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getAvatarInitials, truncate, formatRelativeTime } from '@/lib/utils';

export function ConversationList({ userId }: { userId?: string }) {
  const { conversations, loading } = useConversations(userId);

  if (loading) {
    return (
      <div className="divide-y divide-gray-100">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3">
            <div className="h-12 w-12 rounded-full bg-gray-200 animate-pulse shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 w-32 rounded bg-gray-200 animate-pulse" />
              <div className="h-3 w-48 rounded bg-gray-200 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-6">
        <MessageCircle className="h-12 w-12 text-gray-300 mb-3" />
        <p className="font-semibold text-gray-700">No messages yet</p>
        <p className="mt-1 text-sm text-gray-400">
          Tap &quot;Message&quot; on any listing to start a conversation.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100 bg-white">
      {conversations.map((conv) => {
        const other = conv.other_participant;
        const initials = getAvatarInitials(other?.full_name);
        const lastMsg = conv.last_message;
        const hasUnread = conv.unread_count > 0;

        return (
          <Link
            key={conv.id}
            href={`/messages/${conv.id}`}
            className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100 transition-colors"
          >
            <Avatar className="h-12 w-12 shrink-0">
              {other?.avatar_url && <AvatarImage src={other.avatar_url} />}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className={`text-sm truncate ${hasUnread ? 'font-bold text-gray-900' : 'font-medium text-gray-800'}`}>
                  {other?.full_name ?? 'Unknown'}
                </p>
                <div className="flex items-center gap-1.5 shrink-0">
                  {lastMsg && (
                    <span className="text-xs text-gray-400">
                      {formatRelativeTime(lastMsg.created_at)}
                    </span>
                  )}
                  {hasUnread && (
                    <span className="h-5 w-5 rounded-full bg-blue-600 text-[10px] font-bold text-white flex items-center justify-center">
                      {conv.unread_count > 9 ? '9+' : conv.unread_count}
                    </span>
                  )}
                </div>
              </div>
              {conv.listing && (
                <p className="text-xs text-blue-500 truncate">{conv.listing.title}</p>
              )}
              {lastMsg && (
                <p className={`text-xs truncate mt-0.5 ${hasUnread ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
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
