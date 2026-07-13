import {
  type Employee,
  type Band,
  type RoleCategory,
  type QuotaRule,
  type CompanySummary,
  type CategoryAnalysis,
  type GapToNextBand,
  type ComplianceResult,
  BAND_RANK,
  DEFAULT_QUOTA_RULES,
  ROLE_CATEGORIES,
  BAND_ORDER,
} from '@rased/shared';

function isNational(employee: Employee): boolean {
  return employee.nationality === 'UAE';
}

function filterActive(employees: Employee[]): Employee[] {
  return employees.filter((e) => e.contract_status === 'active');
}

export function calculateNationalPercentage(
  employees: Employee[],
  roleCategory: RoleCategory,
): number {
  const active = filterActive(employees);
  const inCategory = active.filter((e) => e.role_category === roleCategory);
  if (inCategory.length === 0) return 0;
  const nationals = inCategory.filter(isNational).length;
  return (nationals / inCategory.length) * 100;
}

export function determineBand(
  percentage: number,
  roleCategory: RoleCategory,
  rules: QuotaRule[] = DEFAULT_QUOTA_RULES,
): Band {
  const categoryRules = rules
    .filter((r) => r.role_category === roleCategory)
    .sort((a, b) => b.min_percentage - a.min_percentage);

  for (const rule of categoryRules) {
    if (percentage >= rule.min_percentage) {
      return rule.band;
    }
  }

  return 'red';
}

export function calculateGapToNextBand(
  percentage: number,
  roleCategory: RoleCategory,
  totalInCategory: number,
  rules: QuotaRule[] = DEFAULT_QUOTA_RULES,
): GapToNextBand | null {
  const currentBand = determineBand(percentage, roleCategory, rules);
  const currentRank = BAND_RANK[currentBand];

  if (currentRank === 0) return null;

  const categoryRules = rules
    .filter((r) => r.role_category === roleCategory)
    .sort((a, b) => b.min_percentage - a.min_percentage);

  const currentRuleIndex = categoryRules.findIndex((r) => r.band === currentBand);
  const nextRule = categoryRules[currentRuleIndex - 1];

  if (!nextRule) return null;

  if (totalInCategory === 0) {
    return {
      employees_needed: Math.ceil((nextRule.min_percentage / 100) * 1),
      role_category: roleCategory,
      target_band: nextRule.band,
    };
  }

  const currentNationals = (percentage / 100) * totalInCategory;
  const targetNationals = (nextRule.min_percentage / 100) * totalInCategory;
  const needed = Math.ceil(targetNationals - currentNationals);

  return {
    employees_needed: Math.max(needed, 1),
    role_category: roleCategory,
    target_band: nextRule.band,
  };
}

export function calculateCategoryFine(
  employees: Employee[],
  roleCategory: RoleCategory,
  rules: QuotaRule[] = DEFAULT_QUOTA_RULES,
): number {
  const percentage = calculateNationalPercentage(employees, roleCategory);
  const band = determineBand(percentage, roleCategory, rules);

  if (band !== 'red') return 0;

  const active = filterActive(employees);
  const inCategory = active.filter((e) => e.role_category === roleCategory);

  const redRule = rules.find(
    (r) => r.role_category === roleCategory && r.band === 'red',
  );
  const lowGreenRule = rules.find(
    (r) => r.role_category === roleCategory && r.band === 'low_green',
  );

  if (!redRule) return 0;

  const lowGreenThreshold = lowGreenRule?.min_percentage ?? 0;
  if (lowGreenThreshold === 0) {
    const totalCategory = inCategory.length;
    const nationals = inCategory.filter(isNational).length;
    const shortfall = totalCategory - nationals;
    return Math.max(shortfall, 0) * redRule.fine_per_position_aed;
  }

  const targetNationals = Math.ceil((lowGreenThreshold / 100) * inCategory.length);
  const currentNationals = inCategory.filter(isNational).length;
  const shortfall = targetNationals - currentNationals;

  return Math.max(shortfall, 0) * redRule.fine_per_position_aed;
}

export function analyzeCategory(
  employees: Employee[],
  roleCategory: RoleCategory,
  rules: QuotaRule[] = DEFAULT_QUOTA_RULES,
): CategoryAnalysis {
  const active = filterActive(employees);
  const inCategory = active.filter((e) => e.role_category === roleCategory);
  const totalInCategory = inCategory.length;
  const nationalsInCategory = inCategory.filter(isNational).length;
  const percentage = totalInCategory > 0 ? (nationalsInCategory / totalInCategory) * 100 : 0;
  const band = determineBand(percentage, roleCategory, rules);
  const gap = calculateGapToNextBand(percentage, roleCategory, totalInCategory, rules);
  const fine = calculateCategoryFine(employees, roleCategory, rules);

  return {
    role_category: roleCategory,
    total_employees: totalInCategory,
    national_employees: nationalsInCategory,
    percentage,
    band,
    gap_to_next_band: gap,
    fine_exposure_aed: fine,
  };
}

function determineOverallBand(categories: CategoryAnalysis[]): Band {
  let worstRank = -1;
  let worstBand: Band = 'red';
  let hasEmployees = false;

  for (const cat of categories) {
    if (cat.total_employees === 0) continue;
    hasEmployees = true;
    const rank = BAND_RANK[cat.band];
    if (rank > worstRank) {
      worstRank = rank;
      worstBand = cat.band;
    }
  }

  return hasEmployees ? worstBand : 'red';
}

function aggregateSummary(
  employees: Employee[],
  categories: CategoryAnalysis[],
): CompanySummary {
  const active = filterActive(employees);
  const total = active.length;
  const nationals = active.filter(isNational).length;
  const percentage = total > 0 ? (nationals / total) * 100 : 0;

  return {
    total_employees: total,
    national_employees: nationals,
    percentage,
  };
}

function generateRecommendations(
  categories: CategoryAnalysis[],
  rules: QuotaRule[] = DEFAULT_QUOTA_RULES,
): string[] {
  const recs: string[] = [];

  for (const cat of categories) {
    if (cat.gap_to_next_band) {
      const gap = cat.gap_to_next_band;
      const label = BAND_RANK[gap.target_band] <= BAND_RANK[cat.band] ? gap.target_band : cat.band;
      const catLabel = {
        skilled: 'skilled roles',
        semi_skilled: 'semi-skilled roles',
        unskilled: 'unskilled roles',
      }[cat.role_category];
      recs.push(
        `Hire ${gap.employees_needed} more Emirati national(s) in ${catLabel} to reach ${label} band.`,
      );
    }
  }

  if (recs.length === 0) {
    recs.push('Maintain current Emiratization levels to stay compliant.');
  }

  const allRed = categories.every((c) => c.band === 'red');
  if (allRed && categories.some((c) => c.total_employees > 0)) {
    const activeRecruits = categories
      .filter((c) => c.total_employees > 0)
      .sort((a, b) => b.total_employees - a.total_employees);
    if (activeRecruits.length > 0) {
      const top = activeRecruits[0];
      const needed = Math.ceil(
        ((rules.find((r) => r.role_category === top.role_category && r.band === 'low_green')
          ?.min_percentage ?? 2) /
          100) *
          top.total_employees,
      );
      recs.push(
        `Prioritize recruitment of Emirati nationals in ${top.role_category} roles (need at least ${needed} more) to exit Red band.`,
      );
    }
  }

  return recs.slice(0, 3);
}

export function analyzeCompliance(
  employees: Employee[],
  rules: QuotaRule[] = DEFAULT_QUOTA_RULES,
): ComplianceResult {
  const categories: CategoryAnalysis[] = ROLE_CATEGORIES.map((rc) =>
    analyzeCategory(employees, rc, rules),
  );

  const companySummary = aggregateSummary(employees, categories);
  const currentBand = determineOverallBand(categories);
  const gapToNextBand = categories.find((c) => c.gap_to_next_band)?.gap_to_next_band ?? null;
  const fineExposure = categories.reduce((sum, c) => sum + c.fine_exposure_aed, 0);
  const recommendations = generateRecommendations(categories, rules);

  return {
    company_summary: companySummary,
    categories,
    current_band: currentBand,
    gap_to_next_band: gapToNextBand,
    fine_exposure_aed: fineExposure,
    recommendations,
  };
}
