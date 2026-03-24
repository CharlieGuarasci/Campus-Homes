'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessageCircle, Clipboard, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { href: '/marketplace', label: 'Marketplace', icon: Home },
  { href: '/messages', label: 'Messages', icon: MessageCircle },
  { href: '/board', label: 'Board', icon: Clipboard },
  { href: '/profile', label: 'Profile', icon: User },
];

export function BottomNav({ unreadCount = 0 }: { unreadCount?: number }) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#EBEBEA] safe-area-pb">
      <div className="mx-auto max-w-lg">
        <div className="flex">
          {tabs.map(({ href, label, icon: Icon }) => {
            const isActive = pathname.startsWith(href);
            const isMessages = href === '/messages';
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors',
                  isActive ? 'text-[#2383E2]' : 'text-[#A0A0A0] hover:text-[#6B6B6B]'
                )}
              >
                <span className="relative">
                  <Icon className="h-5 w-5" strokeWidth={isActive ? 2 : 1.5} />
                  {isMessages && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-[#2383E2] text-[9px] font-semibold text-white flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </span>
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
