import type { Locale } from '@/lib/types';

export default function BilingualNarrative({
  narrativeEn,
  narrativeAr,
  locale,
}: {
  narrativeEn: string;
  narrativeAr: string;
  locale: Locale;
}) {
  return (
    <div className="space-y-4">
      <div className={`rounded-xl border border-gray-200 bg-white p-4 ${locale === 'en' ? 'border-l-4 border-l-indigo-400' : 'border-r-4 border-r-indigo-400'}`}>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">English</p>
        <p className="text-sm leading-relaxed text-gray-700">{narrativeEn}</p>
      </div>
      <div dir="rtl" className={`rounded-xl border border-gray-200 bg-white p-4 ${locale === 'ar' ? 'border-r-4 border-r-indigo-400' : 'border-l-4 border-l-indigo-400'}`}>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">العربية</p>
        <p className="text-sm leading-relaxed text-gray-700">{narrativeAr}</p>
      </div>
    </div>
  );
}
