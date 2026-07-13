import type { Band, QuotaRule, RoleCategory } from './types';

// MOHRE Emiratization band thresholds for skilled roles
// Based on publicly available MOHRE guidelines (2025-2026)
export const BAND_THRESHOLDS: Record<Band, { label_en: string; label_ar: string }> = {
  platinum:       { label_en: 'Platinum',     label_ar: 'بلاتيني' },
  high_green:     { label_en: 'High Green',   label_ar: 'أخضر عالي' },
  medium_green:   { label_en: 'Medium Green', label_ar: 'أخضر متوسط' },
  low_green:      { label_en: 'Low Green',    label_ar: 'أخضر منخفض' },
  red:            { label_en: 'Red',           label_ar: 'أحمر' },
};

// Default quota rules — these should be verified against current MOHRE regulations
// before production use. Fine rates are illustrative for MVP.
export const DEFAULT_QUOTA_RULES: QuotaRule[] = [
  { role_category: 'skilled',       band: 'platinum',     min_percentage: 10, fine_per_position_aed: 120_000 },
  { role_category: 'skilled',       band: 'high_green',   min_percentage: 8,  fine_per_position_aed: 120_000 },
  { role_category: 'skilled',       band: 'medium_green', min_percentage: 5,  fine_per_position_aed: 120_000 },
  { role_category: 'skilled',       band: 'low_green',    min_percentage: 2,  fine_per_position_aed: 120_000 },
  { role_category: 'semi_skilled',  band: 'platinum',     min_percentage: 8,  fine_per_position_aed: 96_000 },
  { role_category: 'semi_skilled',  band: 'high_green',   min_percentage: 6,  fine_per_position_aed: 96_000 },
  { role_category: 'semi_skilled',  band: 'medium_green', min_percentage: 4,  fine_per_position_aed: 96_000 },
  { role_category: 'semi_skilled',  band: 'low_green',    min_percentage: 1,  fine_per_position_aed: 96_000 },
  { role_category: 'unskilled',     band: 'platinum',     min_percentage: 5,  fine_per_position_aed: 72_000 },
  { role_category: 'unskilled',     band: 'high_green',   min_percentage: 3,  fine_per_position_aed: 72_000 },
  { role_category: 'unskilled',     band: 'medium_green', min_percentage: 2,  fine_per_position_aed: 72_000 },
  { role_category: 'unskilled',     band: 'low_green',    min_percentage: 0,  fine_per_position_aed: 72_000 },
];

export const ROLE_CATEGORIES: RoleCategory[] = ['skilled', 'semi_skilled', 'unskilled'];

export const BAND_ORDER: Band[] = ['platinum', 'high_green', 'medium_green', 'low_green', 'red'];

export const BAND_RANK: Record<Band, number> = {
  platinum: 0,
  high_green: 1,
  medium_green: 2,
  low_green: 3,
  red: 4,
};
