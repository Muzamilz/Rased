import type { ComplianceResult } from '@rased/shared';
import { buildSystemPrompt, buildUserPrompt } from './prompt';
import { callOpenRouter } from './client';

export interface NarrativeResult {
  narrative_en: string;
  narrative_ar: string;
}

function generateMockNarrative(result: ComplianceResult, language: 'en' | 'ar'): string {
  const { company_summary, current_band, fine_exposure_aed, recommendations } = result;
  const gap = result.gap_to_next_band;

  if (language === 'en') {
    let text = `Your company has a current Emiratization rate of ${company_summary.percentage.toFixed(1)}% (${company_summary.national_employees} UAE nationals out of ${company_summary.total_employees} total active employees), placing you in the ${current_band} compliance band.`;
    if (gap) {
      text += ` To reach the next band, you need to hire ${gap.employees_needed} more Emirati national(s) in ${gap.role_category} roles.`;
    }
    if (fine_exposure_aed > 0) {
      text += ` Your current fine exposure is AED ${fine_exposure_aed.toLocaleString()}.`;
    } else {
      text += ` You have no fine exposure at this time.`;
    }
    text += ` Recommendations: ${recommendations.join(' ')}`;
    return text;
  }

  let text = `نسبة التوطين الحالية في شركتك هي ${company_summary.percentage.toFixed(1)}% (${company_summary.national_employees} مواطن إماراتي من أصل ${company_summary.total_employees} موظف نشط)، مما يضعك في نطاق الامتثال ${current_band}.`;
  if (gap) {
    text += ` للوصول إلى النطاق التالي، تحتاج إلى توظيف ${gap.employees_needed} مواطن إماراتي إضافي في فئة ${gap.role_category}.`;
  }
  if (fine_exposure_aed > 0) {
    text += ` قيمة الغرامات المحتملة الحالية هي ${fine_exposure_aed.toLocaleString()} درهم إماراتي.`;
  } else {
    text += ` لا توجد غرامات محتملة في الوقت الحالي.`;
  }
  text += ` التوصيات: ${recommendations.join(' - ')}`;
  return text;
}

export async function generateNarrative(
  result: ComplianceResult,
  useMock: boolean = false,
): Promise<NarrativeResult> {
  if (useMock) {
    return {
      narrative_en: generateMockNarrative(result, 'en'),
      narrative_ar: generateMockNarrative(result, 'ar'),
    };
  }

  try {
    const [narrative_en, narrative_ar] = await Promise.all([
      callOpenRouter(buildSystemPrompt('en'), buildUserPrompt(result, 'en')),
      callOpenRouter(buildSystemPrompt('ar'), buildUserPrompt(result, 'ar')),
    ]);

    return { narrative_en, narrative_ar };
  } catch {
    return {
      narrative_en: generateMockNarrative(result, 'en'),
      narrative_ar: generateMockNarrative(result, 'ar'),
    };
  }
}
