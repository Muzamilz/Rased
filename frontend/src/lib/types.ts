import type { ComplianceResult } from '@rased/shared';
export type { Band, RoleCategory, Employee, CompanySummary, GapToNextBand, CategoryAnalysis, ComplianceResult } from '@rased/shared';
export type { Locale } from './translations';

export interface AnalyzeResponse extends ComplianceResult {
  narrative_en: string;
  narrative_ar: string;
  validation_errors?: { row: number; field: string; message: string }[];
}
