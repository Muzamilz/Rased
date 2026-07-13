import type { ComplianceResult } from '@rased/shared';

export interface NarrativeInput {
  result: ComplianceResult;
}

export function buildSystemPrompt(language: 'en' | 'ar'): string {
  if (language === 'en') {
    return `You are Rased, a workforce compliance reporting assistant for GCC employers.
Your role is to generate a brief, plain-language compliance report summary.
You will receive pre-calculated compliance numbers — do NOT compute any percentages or fines yourself.
Only narrate the numbers you are given. Keep it concise (2-4 sentences).`;
  }

  return `أنت راصد، مساعد تقارير الامتثال للقوى العاملة لأصحاب العمل في دول الخليج.
دورك هو إنشاء ملخص تقرير امتثال بلغة بسيطة ومباشرة.
ستتلقى أرقام الامتثال المحسوبة مسبقًا — لا تقم بحساب أي نسب مئوية أو غرامات بنفسك.
فقط قم بسرد الأرقام المقدمة لك. اجعل النص موجزًا (٢-٤ جمل).`;
}

export function buildUserPrompt(
  result: ComplianceResult,
  language: 'en' | 'ar',
): string {
  const { company_summary, current_band, fine_exposure_aed, recommendations } = result;
  const gap = result.gap_to_next_band;

  if (language === 'en') {
    return `Generate a brief compliance report summary in English using these exact numbers:

- Total active employees: ${company_summary.total_employees}
- Emirati nationals: ${company_summary.national_employees}
- Emiratization percentage: ${company_summary.percentage.toFixed(1)}%
- Current compliance band: ${current_band}
- Fine exposure (if non-compliant): AED ${fine_exposure_aed.toLocaleString()}
${gap ? `- Gap to next band: Hire ${gap.employees_needed} more Emirati(s) in ${gap.role_category} roles to reach ${gap.target_band}` : '- Already at the highest compliance band.'}
- Recommendations:
${recommendations.map((r) => `  * ${r}`).join('\n')}

Generate a 2-4 sentence plain-language summary.`;
  }

  return `قم بإنشاء ملخص تقرير امتثال باللغة العربية باستخدام هذه الأرقام بالضبط:

- إجمالي الموظفين النشطين: ${company_summary.total_employees}
- المواطنون الإماراتيون: ${company_summary.national_employees}
- نسبة التوطين: ${company_summary.percentage.toFixed(1)}%
- نطاق الامتثال الحالي: ${current_band}
- قيمة الغرامات المحتملة: ${fine_exposure_aed.toLocaleString()} درهم إماراتي
${gap ? `- الفجوة للنطاق التالي: توظيف ${gap.employees_needed} مواطن إماراتي إضافي في فئة ${gap.role_category} للوصول إلى نطاق ${gap.target_band}` : '- بالفعل في أعلى نطاق امتثال.'}
- التوصيات:
${recommendations.map((r) => `  * ${r}`).join('\n')}

قم بإنشاء ملخص من ٢-٤ جمل بلغة عربية بسيطة ومباشرة.`;
}
