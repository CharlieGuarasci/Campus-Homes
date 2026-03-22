import { createClient } from '@/lib/supabase/server';
import { BottomNavWrapper } from './bottom-nav-wrapper';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-gray-50 md:flex">
      <BottomNavWrapper userId={user?.id} />
      {/* On mobile: full width with bottom nav padding. On desktop: push right of 64 sidebar */}
      <main className="flex-1 min-w-0 pb-20 md:pb-0 md:ml-64">
        {children}
      </main>
    </div>
  );
}
