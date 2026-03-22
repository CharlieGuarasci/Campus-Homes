import { createClient } from '@/lib/supabase/server';
import { BottomNavWrapper } from './bottom-nav-wrapper';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-lg pb-20">
        {children}
      </main>
      <BottomNavWrapper userId={user?.id} />
    </div>
  );
}
