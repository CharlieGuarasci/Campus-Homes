'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, MessageCircle, Clipboard, User, LogOut } from 'lucide-react';
import { cn, getAvatarInitials } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { useRef } from 'react';
import type { Profile } from '@/types';

const tabs = [
  { href: '/marketplace', label: 'Marketplace', icon: Home },
  { href: '/messages', label: 'Messages', icon: MessageCircle },
  { href: '/board', label: 'Board', icon: Clipboard },
  { href: '/profile', label: 'Profile', icon: User },
];

interface SidebarNavProps {
  profile?: Profile | null;
  unreadCount?: number;
}

export function SidebarNav({ profile, unreadCount = 0 }: SidebarNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useRef(createClient()).current;

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  const initials = getAvatarInitials(profile?.full_name ?? null);

  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-white border-r border-[#EBEBEA] flex flex-col z-40">
      {/* App name */}
      <div className="px-4 py-4 border-b border-[#EBEBEA]">
        <Link href="/marketplace" className="flex items-center gap-2.5">
          <div className="h-6 w-6 rounded bg-[#2383E2] flex items-center justify-center shrink-0">
            <span className="text-[11px] font-semibold text-white">E</span>
          </div>
          <span className="text-sm font-medium text-[#191919]">Exchange Housing</span>
        </Link>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {tabs.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href);
          const isMessages = href === '/messages';
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm transition-colors',
                isActive
                  ? 'bg-[#F0F0EE] text-[#2383E2]'
                  : 'text-[#6B6B6B] hover:bg-[#F7F7F5] hover:text-[#191919]'
              )}
            >
              <span className="relative shrink-0">
                <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
                {isMessages && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-[#2383E2] text-[9px] font-semibold text-white flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User row at bottom */}
      <div className="px-2 py-3 border-t border-[#EBEBEA] space-y-0.5">
        <Link
          href="/profile"
          className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md hover:bg-[#F7F7F5] transition-colors"
        >
          <div className="h-6 w-6 rounded-full bg-[#2383E2] flex items-center justify-center shrink-0">
            <span className="text-[10px] font-semibold text-white">{initials}</span>
          </div>
          <p className="text-xs font-medium text-[#191919] truncate flex-1 min-w-0">
            {profile?.full_name ?? 'My profile'}
          </p>
        </Link>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm text-[#6B6B6B] hover:bg-[#F7F7F5] hover:text-[#191919] transition-colors"
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" strokeWidth={1.5} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
