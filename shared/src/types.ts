export type Band = 'platinum' | 'high_green' | 'medium_green' | 'low_green' | 'red';

export type ContractStatus = 'active' | 'terminated';

export type RoleCategory = 'skilled' | 'semi_skilled' | 'unskilled';

export interface Employee {
  employee_id: string;
  role_category: RoleCategory;
  nationality: string;
  contract_status: ContractStatus;
}

export interface QuotaRule {
  role_category: RoleCategory;
  band: Band;
  min_percentage: number;
  fine_per_position_aed: number;
}

export interface CompanySummary {
  total_employees: number;
  national_employees: number;
  percentage: number;
}

export interface GapToNextBand {
  employees_needed: number;
  role_category: RoleCategory;
  target_band: Band;
}

export interface CategoryAnalysis {
  role_category: RoleCategory;
  total_employees: number;
  national_employees: number;
  percentage: number;
  band: Band;
  gap_to_next_band: GapToNextBand | null;
  fine_exposure_aed: number;
}

export interface ComplianceResult {
  company_summary: CompanySummary;
  categories: CategoryAnalysis[];
  current_band: Band;
  gap_to_next_band: GapToNextBand | null;
  fine_exposure_aed: number;
  recommendations: string[];
}
