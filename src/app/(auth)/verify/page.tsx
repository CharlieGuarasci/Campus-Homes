'use client';
import Link from 'next/link';
import { Mail } from 'lucide-react';

export default function VerifyPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 border border-blue-100">
        <Mail className="h-6 w-6 text-[#2383E2]" strokeWidth={1.5} />
      </div>
      <h1 className="text-xl font-medium text-[#191919]">Check your inbox</h1>
      <p className="mt-2 max-w-sm text-sm text-[#6B6B6B] leading-relaxed">
        We sent a verification link to your university email. Click the link to verify your account
        and start browsing listings.
      </p>
      <p className="mt-6 text-sm text-[#A0A0A0]">
        Already verified?{' '}
        <Link href="/login" className="text-[#2383E2] hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
}
