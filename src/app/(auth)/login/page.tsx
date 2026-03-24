'use client';
import { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const supabase = useRef(createClient()).current;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError(authError.message);
    } else {
      router.push('/marketplace');
      router.refresh();
    }
    setLoading(false);
  }

  async function handleForgotPassword() {
    if (!email) { setError('Enter your email address first.'); return; }
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/auth/callback`,
    });
    if (resetError) { setError(resetError.message); }
    else { setError(''); alert('Password reset email sent. Check your inbox.'); }
  }

  const fieldClass = "w-full h-9 rounded-md border border-[#EBEBEA] bg-white px-3 text-sm text-[#191919] placeholder:text-[#A0A0A0] focus:outline-none focus:border-[#2383E2] transition-colors";

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#2383E2]">
          <span className="text-base font-semibold text-white">E</span>
        </div>
        <h1 className="text-xl font-medium text-[#191919]">Exchange Housing</h1>
        <p className="mt-1 text-sm text-[#A0A0A0]">Find your home away from home</p>
      </div>

      <div className="w-full max-w-sm">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-xs font-medium text-[#6B6B6B] uppercase tracking-wide">University email</label>
            <input
              id="email"
              type="email"
              placeholder="you@queensu.ca"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className={fieldClass}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-xs font-medium text-[#6B6B6B] uppercase tracking-wide">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className={fieldClass}
            />
          </div>

          {error && (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-9 rounded-md bg-[#2383E2] text-white text-sm font-medium hover:bg-[#1a6fc9] disabled:opacity-50 transition-colors"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <button
          type="button"
          onClick={handleForgotPassword}
          className="mt-3 w-full text-center text-sm text-[#2383E2] hover:underline"
        >
          Forgot password?
        </button>

        <p className="mt-6 text-center text-sm text-[#A0A0A0]">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-medium text-[#2383E2] hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
