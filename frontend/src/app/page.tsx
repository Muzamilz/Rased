'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Locale } from '@/lib/types';
import type { AnalyzeResponse } from '@/lib/types';
import { tr } from '@/lib/translations';
import LanguageToggle from '@/components/LanguageToggle';
import CsvUpload from '@/components/CsvUpload';
import Report from '@/components/Report';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function Home() {
  const [locale, setLocale] = useState<Locale>('en');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<AnalyzeResponse['validation_errors']>();
  const [result, setResult] = useState<AnalyzeResponse | null>(null);

  useEffect(() => {
    const html = document.documentElement;
    html.lang = locale;
    html.dir = locale === 'ar' ? 'rtl' : 'ltr';
  }, [locale]);

  const handleFile = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    setValidationErrors(undefined);
    setResult(null);

    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch(`${API_URL}/api/analyze`, { method: 'POST', body: form });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        if (body?.validation_errors) {
          setValidationErrors(body.validation_errors);
          setError(tr('validation_errors', locale));
        } else {
          setError(body?.error || tr('error_upload', locale));
        }
        return;
      }

      const data: AnalyzeResponse = await res.json();
      setResult(data);
    } catch {
      setError(tr('error_upload', locale));
    } finally {
      setLoading(false);
    }
  }, [locale]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-16">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Rased <span className="text-gray-400">(</span>رصد<span className="text-gray-400">)</span>
          </h1>
          <p className="mt-1 text-sm text-gray-500">{tr('subtitle', locale)}</p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/login"
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-indigo-700"
          >
            Sign In
          </a>
          <LanguageToggle locale={locale} onToggle={setLocale} />
        </div>
      </header>

      {!result && (
        <div className="mb-8">
          <CsvUpload locale={locale} onFile={handleFile} loading={loading} />

          <div className="mt-4 text-center">
            <a
              href="/sample.csv"
              download
              className="text-xs text-indigo-600 underline underline-offset-2 hover:text-indigo-800"
            >
              {tr('download_sample', locale)}
            </a>
          </div>

          {error && (
            <div className={`mt-6 rounded-xl border p-4 text-sm ${
              validationErrors
                ? 'border-yellow-200 bg-yellow-50 text-yellow-800'
                : 'border-red-200 bg-red-50 text-red-700'
            }`}>
              <p className="font-medium">{error}</p>
              {validationErrors && validationErrors.length > 0 && (
                <ul className="mt-2 list-inside list-disc space-y-1 text-xs">
                  {validationErrors.map((e, i) => (
                    <li key={i}>Row {e.row}: <strong>{e.field}</strong> — {e.message}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      {result && (
        <>
          <Report data={result} locale={locale} />
          <div className="mt-8 text-center">
            <button
              onClick={() => { setResult(null); setError(null); setValidationErrors(undefined); }}
              className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
            >
              {tr('upload_again', locale)}
            </button>
          </div>
        </>
      )}

      <footer className="mt-16 text-center text-xs text-gray-400">
        Rased (رصد) — MVP Demo
      </footer>
    </div>
  );
}
