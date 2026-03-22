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
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 safe-area-pb">
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
                  'flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors',
                  isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                )}
              >
                <span className="relative">
                  <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                  {isMessages && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center">
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
