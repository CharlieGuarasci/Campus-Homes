import { cn, formatRelativeTime } from '@/lib/utils';
import type { Message } from '@/types';

interface ChatBubbleProps {
  message: Message;
  isSent: boolean;
  showTime?: boolean;
}

export function ChatBubble({ message, isSent, showTime = false }: ChatBubbleProps) {
  return (
    <div className={cn('flex flex-col', isSent ? 'items-end' : 'items-start')}>
      <div
        className={cn(
          'max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
          isSent
            ? 'bg-blue-600 text-white rounded-br-sm'
            : 'bg-gray-100 text-gray-900 rounded-bl-sm'
        )}
      >
        {message.content}
      </div>
      {showTime && (
        <span className="mt-1 text-[10px] text-gray-400">
          {formatRelativeTime(message.created_at)}
        </span>
      )}
    </div>
  );
}
