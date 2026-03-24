'use client';
import { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { isAllowedEmailDomain } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function SignupPage() {
  const router = useRouter();
  const supabase = useRef(createClient()).current;

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    program: '',
    yearOfStudy: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!isAllowedEmailDomain(form.email)) {
      setError('Please use your university email address (e.g. @queensu.ca).');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);

    const { error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.fullName,
          program: form.program || null,
          year_of_study: form.yearOfStudy ? parseInt(form.yearOfStudy) : null,
        },
        emailRedirectTo: `${window.location.origin}/marketplace`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    router.push('/verify');
    setLoading(false);
  }

  const fieldClass = "w-full h-9 rounded-md border border-[#EBEBEA] bg-white px-3 text-sm text-[#191919] placeholder:text-[#A0A0A0] focus:outline-none focus:border-[#2383E2] transition-colors";
  const labelClass = "block text-xs font-medium text-[#6B6B6B] uppercase tracking-wide mb-1.5";

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#2383E2]">
          <span className="text-base font-semibold text-white">E</span>
        </div>
        <h1 className="text-xl font-medium text-[#191919]">Create account</h1>
        <p className="mt-1 text-sm text-[#A0A0A0]">Queen&apos;s University students only</p>
      </div>

      <div className="w-full max-w-sm">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="fullName" className={labelClass}>Full name</label>
            <input
              id="fullName"
              placeholder="Alex Taylor"
              value={form.fullName}
              onChange={(e) => update('fullName', e.target.value)}
              required
              autoComplete="name"
              className={fieldClass}
            />
          </div>

          <div>
            <label htmlFor="email" className={labelClass}>University email</label>
            <input
              id="email"
              type="email"
              placeholder="you@queensu.ca"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              required
              autoComplete="email"
              className={fieldClass}
            />
          </div>

          <div>
            <label htmlFor="password" className={labelClass}>Password</label>
            <input
              id="password"
              type="password"
              placeholder="Min. 8 characters"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              className={fieldClass}
            />
          </div>

          <div>
            <label htmlFor="program" className={labelClass}>
              Program <span className="normal-case font-normal text-[#A0A0A0]">(optional)</span>
            </label>
            <input
              id="program"
              placeholder="e.g. Commerce, Engineering…"
              value={form.program}
              onChange={(e) => update('program', e.target.value)}
              className={fieldClass}
            />
          </div>

          <div>
            <label className={labelClass}>
              Year of study <span className="normal-case font-normal text-[#A0A0A0]">(optional)</span>
            </label>
            <Select value={form.yearOfStudy} onValueChange={(v) => update('yearOfStudy', v)}>
              <SelectTrigger className="border-[#EBEBEA]">
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

          {error && (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-9 rounded-md bg-[#2383E2] text-white text-sm font-medium hover:bg-[#1a6fc9] disabled:opacity-50 transition-colors"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#A0A0A0]">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-[#2383E2] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
