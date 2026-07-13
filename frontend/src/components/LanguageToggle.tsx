'use client';

import type { Locale } from '@/lib/translations';

export default function LanguageToggle({
  locale,
  onToggle,
}: {
  locale: Locale;
  onToggle: (l: Locale) => void;
}) {
  return (
    <div className="flex items-center gap-1 rounded-full bg-gray-100 p-0.5 shadow-inner">
      <button
        onClick={() => onToggle('ar')}
        className={`rounded-full px-3 py-1 text-sm font-medium transition-all ${
          locale === 'ar'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        AR
      </button>
      <button
        onClick={() => onToggle('en')}
        className={`rounded-full px-3 py-1 text-sm font-medium transition-all ${
          locale === 'en'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        EN
      </button>
    </div>
  );
}
