'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessageCircle, Clipboard, User } from 'lucide-react';
import { cn, getAvatarInitials } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-[#1a2035] flex flex-col z-40">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-blue-500 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-white">E</span>
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">Exchange Housing</p>
            <p className="text-xs text-white/50">Find your home away</p>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {tabs.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href);
          const isMessages = href === '/messages';
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              )}
            >
              <span className="relative shrink-0">
                <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                {isMessages && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User info at bottom */}
      <div className="px-4 py-4 border-t border-white/10">
        <Link
          href="/profile"
          className="flex items-center gap-3 rounded-xl p-2 hover:bg-white/5 transition-colors"
        >
          <Avatar className="h-9 w-9 shrink-0">
            {profile?.avatar_url && <AvatarImage src={profile.avatar_url} />}
            <AvatarFallback className="text-xs bg-blue-600 text-white">
              {getAvatarInitials(profile?.full_name ?? null)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {profile?.full_name ?? 'My Profile'}
            </p>
            <p className="text-xs text-white/50 truncate">
              {profile?.university ?? "Queen's University"}
            </p>
          </div>
        </Link>
      </div>
    </aside>
  );
}
