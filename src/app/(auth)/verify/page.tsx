'use client';
import Link from 'next/link';
import { Mail } from 'lucide-react';

export default function VerifyPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
        <Mail className="h-8 w-8 text-blue-600" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900">Check your inbox</h1>
      <p className="mt-2 max-w-sm text-sm text-gray-500 leading-relaxed">
        We sent a verification link to your university email. Click the link to verify your account
        and start browsing listings.
      </p>
      <p className="mt-6 text-sm text-gray-400">
        Already verified?{' '}
        <Link href="/login" className="text-blue-600 hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
}
