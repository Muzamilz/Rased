'use client';

import type { AnalyzeResponse, Locale } from '@/lib/types';
import { t } from '@/lib/translations';
import BandBadge from './BandBadge';
import CategoryTable from './CategoryTable';
import RecommendationsList from './RecommendationsList';
import BilingualNarrative from './BilingualNarrative';

export default function Report({ data, locale }: { data: AnalyzeResponse; locale: Locale }) {
  const { company_summary, current_band, gap_to_next_band, fine_exposure_aed, categories, recommendations, narrative_en, narrative_ar } = data;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard label={t[locale].total_employees} value={company_summary.total_employees} />
        <SummaryCard label={t[locale].national_employees} value={company_summary.national_employees} />
        <SummaryCard
          label={t[locale].percentage}
          value={`${company_summary.percentage.toFixed(1)}%`}
          highlight
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">{t[locale].current_band}</p>
          <BandBadge band={current_band} size="lg" />
          {gap_to_next_band && (
            <p className="mt-3 text-sm text-gray-600">
              {t[locale].gap_title}: {gap_to_next_band.employees_needed} more in {gap_to_next_band.role_category.replace('_', ' ')} → {gap_to_next_band.target_band}
            </p>
          )}
          {!gap_to_next_band && (
            <p className="mt-3 text-sm text-green-600">{t[locale].no_gap}</p>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">{t[locale].fine_exposure}</p>
          <p className={`text-3xl font-bold ${fine_exposure_aed > 0 ? 'text-band-red' : 'text-green-600'}`}>
            AED {fine_exposure_aed.toLocaleString()}
          </p>
          {fine_exposure_aed === 0 && (
            <p className="mt-1 text-sm text-green-600">{t[locale].no_fine}</p>
          )}
        </div>
      </div>

      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">{t[locale].per_category}</p>
        <CategoryTable categories={categories} locale={locale} />
      </div>

      {recommendations.length > 0 && (
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">{t[locale].recommendations}</p>
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <RecommendationsList recommendations={recommendations} />
          </div>
        </div>
      )}

      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">{t[locale].narrative}</p>
        <BilingualNarrative narrativeEn={narrative_en} narrativeAr={narrative_ar} locale={locale} />
      </div>
    </div>
  );
}

function SummaryCard({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
      <p className={`text-2xl font-bold ${highlight ? 'text-indigo-600' : 'text-gray-900'}`}>{value}</p>
    </div>
  );
}
