import type { CategoryAnalysis } from '@rased/shared';
import type { Locale } from '@/lib/types';
import { t } from '@/lib/translations';
import { BandPill } from './BandBadge';

export default function CategoryTable({
  categories,
  locale,
}: {
  categories: CategoryAnalysis[];
  locale: Locale;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <th className="px-4 py-3 font-medium">{t[locale].category}</th>
            <th className="px-4 py-3 font-medium">{t[locale].employees}</th>
            <th className="px-4 py-3 font-medium">{t[locale].nationals}</th>
            <th className="px-4 py-3 font-medium">%</th>
            <th className="px-4 py-3 font-medium">{t[locale].current_band}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {categories.map((cat) => (
            <tr key={cat.role_category} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-900">{cat.role_category.replace('_', ' ')}</td>
              <td className="px-4 py-3 text-gray-600">{cat.total_employees}</td>
              <td className="px-4 py-3 text-gray-600">{cat.national_employees}</td>
              <td className="px-4 py-3 text-gray-600">{cat.percentage.toFixed(1)}%</td>
              <td className="px-4 py-3"><BandPill band={cat.band} size="sm" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
