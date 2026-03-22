'use client';
import { BottomNav } from '@/components/bottom-nav';
import { SidebarNav } from '@/components/sidebar-nav';
import { useConversations } from '@/hooks/use-conversations';
import { useAuth } from '@/hooks/use-auth';

export function BottomNavWrapper({ userId }: { userId?: string }) {
  const { totalUnread } = useConversations(userId);
  const { profile } = useAuth();

  return (
    <>
      {/* Desktop sidebar — hidden on mobile */}
      <div className="hidden md:block">
        <SidebarNav profile={profile} unreadCount={totalUnread} />
      </div>
      {/* Mobile bottom nav — hidden on desktop */}
      <div className="md:hidden">
        <BottomNav unreadCount={totalUnread} />
      </div>
    </>
  );
}
