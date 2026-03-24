import { createClient } from '@/lib/supabase/server';
import { BottomNavWrapper } from './bottom-nav-wrapper';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-white md:flex">
      <BottomNavWrapper userId={user?.id} />
      <main className="flex-1 min-w-0 pb-20 md:pb-0 md:ml-60">
        {children}
      </main>
    </div>
  );
}
