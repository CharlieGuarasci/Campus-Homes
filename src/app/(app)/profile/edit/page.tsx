'use client';
import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';

export default function EditProfilePage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const supabase = useRef(createClient()).current;

  const [form, setForm] = useState({
    fullName: '',
    program: '',
    yearOfStudy: '',
    bio: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        fullName: profile.full_name ?? '',
        program: profile.program ?? '',
        yearOfStudy: profile.year_of_study?.toString() ?? '',
        bio: profile.bio ?? '',
      });
    }
  }, [profile]);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError('');
    setLoading(true);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: form.fullName || null,
        program: form.program || null,
        year_of_study: form.yearOfStudy ? parseInt(form.yearOfStudy) : null,
        bio: form.bio || null,
      })
      .eq('id', user.id);

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess(true);
      setTimeout(() => router.push('/profile'), 1000);
    }
    setLoading(false);
  }

  return (
    <>
      <header className="sticky top-0 z-30 bg-white border-b border-[#EBEBEA] px-4 py-3 flex items-center gap-3">
        <Link href="/profile" className="text-[#6B6B6B] hover:text-[#191919]">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-base font-medium text-[#191919]">Edit profile</h1>
      </header>

      <form onSubmit={handleSubmit} className="px-4 py-5 space-y-5 max-w-lg mx-auto">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#6B6B6B] uppercase tracking-wide">Email</label>
          <input
            value={user?.email ?? ''}
            disabled
            className="w-full h-9 rounded-md border border-[#EBEBEA] bg-[#F7F7F5] px-3 text-sm text-[#A0A0A0] cursor-not-allowed"
          />
          <p className="text-xs text-[#A0A0A0]">Email cannot be changed.</p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="fullName" className="text-xs font-medium text-[#6B6B6B] uppercase tracking-wide">Full name</label>
          <input
            id="fullName"
            placeholder="Your name"
            value={form.fullName}
            onChange={(e) => update('fullName', e.target.value)}
            className="w-full h-9 rounded-md border border-[#EBEBEA] bg-white px-3 text-sm text-[#191919] placeholder:text-[#A0A0A0] focus:outline-none focus:border-[#2383E2] transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="program" className="text-xs font-medium text-[#6B6B6B] uppercase tracking-wide">Program</label>
          <input
            id="program"
            placeholder="e.g. Commerce, Engineering…"
            value={form.program}
            onChange={(e) => update('program', e.target.value)}
            className="w-full h-9 rounded-md border border-[#EBEBEA] bg-white px-3 text-sm text-[#191919] placeholder:text-[#A0A0A0] focus:outline-none focus:border-[#2383E2] transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#6B6B6B] uppercase tracking-wide">Year of study</label>
          <Select value={form.yearOfStudy} onValueChange={(v) => update('yearOfStudy', v)}>
            <SelectTrigger className="border-[#EBEBEA] focus:border-[#2383E2]">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5].map((y) => (
                <SelectItem key={y} value={String(y)}>Year {y}</SelectItem>
              ))}
              <SelectItem value="graduate">Graduate</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="bio" className="text-xs font-medium text-[#6B6B6B] uppercase tracking-wide">Bio</label>
          <textarea
            id="bio"
            placeholder="A little about yourself…"
            value={form.bio}
            onChange={(e) => update('bio', e.target.value)}
            rows={4}
            className="w-full rounded-md border border-[#EBEBEA] bg-white px-3 py-2 text-sm text-[#191919] placeholder:text-[#A0A0A0] focus:outline-none focus:border-[#2383E2] transition-colors resize-none"
          />
        </div>

        {error && (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}
        {success && (
          <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-600">Profile updated!</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-9 rounded-md bg-[#2383E2] text-white text-sm font-medium hover:bg-[#1a6fc9] disabled:opacity-50 transition-colors"
        >
          {loading ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </>
  );
}
