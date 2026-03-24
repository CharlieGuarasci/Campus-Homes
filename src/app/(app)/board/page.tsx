import { Construction } from 'lucide-react';

export default function BoardPage() {
  return (
    <>
      <header className="sticky top-0 z-30 bg-white border-b border-[#EBEBEA] px-4 py-3">
        <h1 className="text-base font-medium text-[#191919]">Board</h1>
      </header>
      <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
        <div className="h-14 w-14 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mb-4">
          <Construction className="h-6 w-6 text-amber-500" strokeWidth={1.5} />
        </div>
        <h2 className="text-base font-medium text-[#191919]">Coming soon</h2>
        <p className="mt-2 text-sm text-[#6B6B6B] max-w-xs leading-relaxed">
          The community board is coming in a future update. Here you&apos;ll find announcements,
          tips from other exchange students, and more.
        </p>
      </div>
    </>
  );
}
