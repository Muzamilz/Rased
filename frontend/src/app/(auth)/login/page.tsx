'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LanguageToggle from '@/components/LanguageToggle';
import type { Locale } from '@/lib/types';

export default function LoginPage() {
  const [locale, setLocale] = useState<Locale>('en');
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const { signInWithMagicLink } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const { error: err } = await signInWithMagicLink(email);
    if (err) {
      setError(err);
    } else {
      setSent(true);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4">
      <div className="mb-8 self-end">
        <LanguageToggle locale={locale} onToggle={setLocale} />
      </div>

      <div className="w-full rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-2xl font-bold text-gray-900">
          Rased <span className="text-gray-400">(</span>رصد<span className="text-gray-400">)</span>
        </h1>
        <p className="mb-6 text-sm text-gray-500">
          {locale === 'en' ? 'Sign in with your email' : 'تسجيل الدخول بالبريد الإلكتروني'}
        </p>

        {sent ? (
          <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            {locale === 'en'
              ? 'Magic link sent! Check your email to sign in.'
              : 'تم إرسال رابط التسجيل! تحقق من بريدك الإلكتروني.'}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {locale === 'en' ? 'Email' : 'البريد الإلكتروني'}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                placeholder="you@company.com"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <button
              type="submit"
              className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
            >
              {locale === 'en' ? 'Send Magic Link' : 'إرسال رابط التسجيل'}
            </button>
          </form>
        )}
      </div>

      <p className="mt-6 text-xs text-gray-400">
        <a href="/" className="underline underline-offset-2 hover:text-gray-600">
          {locale === 'en' ? 'Back to home' : 'العودة للرئيسية'}
        </a>
      </p>
    </div>
  );
}
