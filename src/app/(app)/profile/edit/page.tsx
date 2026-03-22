'use client';
import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
      <header className="sticky top-0 z-30 bg-[#1a2035] px-4 pt-safe-top pb-3 flex items-center gap-3">
        <Link href="/profile" className="text-white/70 hover:text-white">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-lg font-bold text-white">Edit profile</h1>
      </header>

      <form onSubmit={handleSubmit} className="px-4 py-4 space-y-5">
        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input value={user?.email ?? ''} disabled className="opacity-60" />
          <p className="text-xs text-gray-400">Email cannot be changed.</p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="fullName">Full name</Label>
          <Input
            id="fullName"
            placeholder="Your name"
            value={form.fullName}
            onChange={(e) => update('fullName', e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="program">Program</Label>
          <Input
            id="program"
            placeholder="e.g. Commerce, Engineering…"
            value={form.program}
            onChange={(e) => update('program', e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Year of study</Label>
          <Select value={form.yearOfStudy} onValueChange={(v) => update('yearOfStudy', v)}>
            <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">Not specified</SelectItem>
              {[1, 2, 3, 4, 5].map((y) => (
                <SelectItem key={y} value={String(y)}>Year {y}</SelectItem>
              ))}
              <SelectItem value="graduate">Graduate</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            placeholder="A little about yourself…"
            value={form.bio}
            onChange={(e) => update('bio', e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 border border-red-200">{error}</p>
        )}
        {success && (
          <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-600 border border-green-200">Profile updated!</p>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Saving…' : 'Save changes'}
        </Button>
      </form>
    </>
  );
}
