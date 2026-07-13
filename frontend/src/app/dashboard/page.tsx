'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import LanguageToggle from '@/components/LanguageToggle';
import CsvUpload from '@/components/CsvUpload';
import Report from '@/components/Report';
import type { Locale } from '@/lib/types';
import type { AnalyzeResponse } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function DashboardContent() {
  const { user, signOut } = useAuth();
  const [locale, setLocale] = useState<Locale>('en');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  const getToken = async () => {
    const supabase = (await import('@/utils/supabase/client')).createClient();
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token;
  };

  const loadReports = async () => {
    const token = await getToken();
    if (!token) return;
    const res = await fetch(`${API_URL}/api/reports`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setReports(data);
    }
  };

  const handleFile = async (file: File) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const form = new FormData();
      form.append('file', file);
      const token = await getToken();
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        body: form,
        headers,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error || 'Upload failed');
        return;
      }

      const data: AnalyzeResponse = await res.json();
      setResult(data);
      loadReports();
    } catch {
      setError('Upload failed. Make sure the API server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Rased <span className="text-gray-400">(</span>رصد<span className="text-gray-400">)</span>
          </h1>
          <p className="text-xs text-gray-400">{user?.email}</p>
        </div>
        <div className="flex items-center gap-3">
          <LanguageToggle locale={locale} onToggle={setLocale} />
          <button
            onClick={signOut}
            className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-200"
          >
            Sign Out
          </button>
        </div>
      </header>

      <div className="mb-8">
        <CsvUpload locale={locale} onFile={handleFile} loading={loading} />
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {result && (
        <div className="mb-8">
          <Report data={result} locale={locale} />
          <div className="mt-6 text-center">
            <button
              onClick={async () => {
                setResult(null);
                if (result.report_id) {
                  window.open(`${API_URL}/api/reports/${result.report_id}/pdf`, '_blank');
                }
              }}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
            >
              {result.report_id ? 'Download PDF' : 'Clear'}
            </button>
          </div>
        </div>
      )}

      {reports.length > 0 && (
        <div>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Report History
          </h2>
          <div className="space-y-2">
            {reports.map((r: any) => (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Band: {r.summary?.current_band || 'N/A'} — AED {(r.summary?.fine_exposure_aed || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(r.created_at).toLocaleDateString()} · {r.summary?.company_summary?.total_employees || 0} employees
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => window.open(`${API_URL}/api/reports/${r.id}/pdf`, '_blank')}
                    className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-200"
                  >
                    PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
