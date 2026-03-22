import { Construction } from 'lucide-react';

export default function BoardPage() {
  return (
    <>
      <header className="sticky top-0 z-30 bg-[#1a2035] px-4 pt-safe-top pb-4">
        <h1 className="text-xl font-bold text-white pt-2">Board</h1>
      </header>
      <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
        <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
          <Construction className="h-8 w-8 text-amber-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Coming soon</h2>
        <p className="mt-2 text-sm text-gray-500 max-w-xs leading-relaxed">
          The community board is coming in a future update. Here you&apos;ll find announcements,
          tips from other exchange students, and more.
        </p>
      </div>
    </>
  );
}
