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
          'max-w-[75%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed',
          isSent
            ? 'bg-[#2383E2] text-white rounded-br-sm'
            : 'bg-[#F0F0EE] text-[#191919] rounded-bl-sm'
        )}
      >
        {message.content}
      </div>
      {showTime && (
        <span className="mt-1 text-[10px] text-[#A0A0A0]">
          {formatRelativeTime(message.created_at)}
        </span>
      )}
    </div>
  );
}
