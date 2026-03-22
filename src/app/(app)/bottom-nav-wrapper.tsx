'use client';
import { BottomNav } from '@/components/bottom-nav';
import { useConversations } from '@/hooks/use-conversations';

export function BottomNavWrapper({ userId }: { userId?: string }) {
  const { totalUnread } = useConversations(userId);
  return <BottomNav unreadCount={totalUnread} />;
}
