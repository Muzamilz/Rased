import { describe, it, expect } from 'vitest';
import {
  calculateNationalPercentage,
  determineBand,
  calculateGapToNextBand,
  calculateCategoryFine,
  analyzeCategory,
  analyzeCompliance,
} from '../engine';
import type { Employee } from '@rased/shared';

function makeEmployee(
  id: string,
  role: 'skilled' | 'semi_skilled' | 'unskilled',
  nationality: string,
  status: 'active' | 'terminated' = 'active',
): Employee {
  return {
    employee_id: id,
    role_category: role,
    nationality,
    contract_status: status,
  };
}

describe('calculateNationalPercentage', () => {
  it('returns 0 for empty category', () => {
    const employees: Employee[] = [
      makeEmployee('1', 'skilled', 'Indian'),
    ];
    expect(calculateNationalPercentage(employees, 'semi_skilled')).toBe(0);
  });

  it('returns correct percentage for mixed category', () => {
    const employees: Employee[] = [
      makeEmployee('1', 'skilled', 'UAE'),
      makeEmployee('2', 'skilled', 'Indian'),
      makeEmployee('3', 'skilled', 'UAE'),
      makeEmployee('4', 'skilled', 'Egyptian'),
    ];
    expect(calculateNationalPercentage(employees, 'skilled')).toBe(50);
  });

  it('excludes terminated employees', () => {
    const employees: Employee[] = [
      makeEmployee('1', 'skilled', 'UAE'),
      makeEmployee('2', 'skilled', 'UAE', 'terminated'),
      makeEmployee('3', 'skilled', 'Indian'),
    ];
    expect(calculateNationalPercentage(employees, 'skilled')).toBe(50);
  });

  it('returns 100 when all are nationals', () => {
    const employees: Employee[] = [
      makeEmployee('1', 'skilled', 'UAE'),
      makeEmployee('2', 'skilled', 'UAE'),
    ];
    expect(calculateNationalPercentage(employees, 'skilled')).toBe(100);
  });

  it('returns 0 when none are nationals', () => {
    const employees: Employee[] = [
      makeEmployee('1', 'skilled', 'Indian'),
      makeEmployee('2', 'skilled', 'Egyptian'),
    ];
    expect(calculateNationalPercentage(employees, 'skilled')).toBe(0);
  });
});

describe('determineBand', () => {
  it('returns platinum for 12% skilled', () => {
    expect(determineBand(12, 'skilled')).toBe('platinum');
  });

  it('returns high_green for 9% skilled', () => {
    expect(determineBand(9, 'skilled')).toBe('high_green');
  });

  it('returns medium_green for 6% skilled', () => {
    expect(determineBand(6, 'skilled')).toBe('medium_green');
  });

  it('returns low_green for 3% skilled', () => {
    expect(determineBand(3, 'skilled')).toBe('low_green');
  });

  it('returns red for 1% skilled', () => {
    expect(determineBand(1, 'skilled')).toBe('red');
  });

  it('returns red for 0% skilled', () => {
    expect(determineBand(0, 'skilled')).toBe('red');
  });

  it('returns platinum for 10% semi_skilled', () => {
    expect(determineBand(10, 'semi_skilled')).toBe('platinum');
  });

  it('returns red for 0% semi_skilled', () => {
    expect(determineBand(0, 'semi_skilled')).toBe('red');
  });

  it('handles boundary at exact threshold', () => {
    expect(determineBand(2, 'skilled')).toBe('low_green');
    expect(determineBand(5, 'skilled')).toBe('medium_green');
    expect(determineBand(8, 'skilled')).toBe('high_green');
    expect(determineBand(10, 'skilled')).toBe('platinum');
  });
});

describe('calculateGapToNextBand', () => {
  it('returns null when already at platinum', () => {
    expect(calculateGapToNextBand(15, 'skilled', 100)).toBeNull();
  });

  it('calculates gap from high_green to platinum', () => {
    // 9% of 100 = 9 nationals; need 10% = 10 nationals → 1 more
    const gap = calculateGapToNextBand(9, 'skilled', 100);
    expect(gap).not.toBeNull();
    expect(gap!.employees_needed).toBe(1);
    expect(gap!.target_band).toBe('platinum');
  });

  it('calculates gap from red to low_green', () => {
    // 1% of 100 = 1 national; need 2% = 2 nationals → 1 more
    const gap = calculateGapToNextBand(1, 'skilled', 100);
    expect(gap).not.toBeNull();
    expect(gap!.employees_needed).toBe(1);
    expect(gap!.target_band).toBe('low_green');
  });

  it('rounds up employees_needed', () => {
    // 0% of 50 = 0 nationals; need 2% = 1 national → 1 more
    const gap = calculateGapToNextBand(0, 'skilled', 50);
    expect(gap).not.toBeNull();
    expect(gap!.employees_needed).toBe(1);
  });

  it('returns at least 1 employee needed', () => {
    // 1.9% of 1000 = 19 nationals; need 2% = 20 nationals → 1 more
    const gap = calculateGapToNextBand(1.9, 'skilled', 1000);
    expect(gap).not.toBeNull();
    expect(gap!.employees_needed).toBeGreaterThanOrEqual(1);
  });
});

describe('calculateCategoryFine', () => {
  it('returns 0 when band is not red', () => {
    const employees: Employee[] = [
      makeEmployee('1', 'skilled', 'UAE'),
      makeEmployee('2', 'skilled', 'Indian'),
    ];
    expect(calculateCategoryFine(employees, 'skilled')).toBe(0);
  });

  it('calculates fine correctly for red band', () => {
    const employees: Employee[] = Array.from({ length: 50 }, (_, i) =>
      makeEmployee(`${i}`, 'skilled', 'Indian'),
    );
    // 0% Emirati → red → need 2% of 50 = 1 national; shortfall = 1
    // 1 × 120,000 = 120,000
    const fine = calculateCategoryFine(employees, 'skilled');
    expect(fine).toBe(120_000);
  });

  it('returns 0 for empty category', () => {
    expect(calculateCategoryFine([], 'skilled')).toBe(0);
  });
});

describe('analyzeCategory', () => {
  it('returns correct analysis for a mixed category', () => {
    const employees: Employee[] = [
      makeEmployee('1', 'skilled', 'UAE'),
      makeEmployee('2', 'skilled', 'Indian'),
      makeEmployee('3', 'skilled', 'Indian'),
    ];
    const result = analyzeCategory(employees, 'skilled');
    expect(result.total_employees).toBe(3);
    expect(result.national_employees).toBe(1);
    expect(result.percentage).toBeCloseTo(33.33, 1);
    expect(result.band).toBe('platinum');
    expect(result.fine_exposure_aed).toBe(0);
  });
});

describe('analyzeCompliance', () => {
  it('returns red band for all non-national workforce', () => {
    const employees: Employee[] = Array.from({ length: 100 }, (_, i) =>
      makeEmployee(`${i}`, 'skilled', 'Indian'),
    );
    const result = analyzeCompliance(employees);
    expect(result.current_band).toBe('red');
    expect(result.fine_exposure_aed).toBeGreaterThan(0);
    expect(result.recommendations.length).toBeGreaterThanOrEqual(1);
  });

  it('returns platinum for high Emiratization', () => {
    const employees: Employee[] = [
      ...Array.from({ length: 15 }, (_, i) =>
        makeEmployee(`uae-${i}`, 'skilled', 'UAE'),
      ),
      ...Array.from({ length: 85 }, (_, i) =>
        makeEmployee(`non-${i}`, 'skilled', 'Indian'),
      ),
    ];
    const result = analyzeCompliance(employees);
    expect(result.current_band).toBe('platinum');
    expect(result.fine_exposure_aed).toBe(0);
  });

  it('generates recommendations with gap info', () => {
    const employees: Employee[] = [
      makeEmployee('1', 'skilled', 'UAE'),
      ...Array.from({ length: 99 }, (_, i) =>
        makeEmployee(`${i + 2}`, 'skilled', 'Indian'),
      ),
    ];
    const result = analyzeCompliance(employees);
    expect(result.recommendations.length).toBeGreaterThanOrEqual(1);
    expect(result.recommendations[0]).toContain('Hire');
    expect(result.recommendations[0]).toContain('Emirati');
  });

  it('handles multiple role categories', () => {
    const employees: Employee[] = [
      makeEmployee('1', 'skilled', 'UAE'),
      makeEmployee('2', 'skilled', 'Indian'),
      makeEmployee('3', 'semi_skilled', 'Indian'),
      makeEmployee('4', 'semi_skilled', 'Indian'),
      makeEmployee('5', 'unskilled', 'UAE'),
      makeEmployee('6', 'unskilled', 'Indian'),
    ];
    const result = analyzeCompliance(employees);
    expect(result.categories).toHaveLength(3);
    expect(result.categories.find((c) => c.role_category === 'skilled')!.band).toBe('platinum');
    expect(result.categories.find((c) => c.role_category === 'semi_skilled')!.band).toBe('red');
    expect(result.categories.find((c) => c.role_category === 'unskilled')!.band).toBe('platinum');
  });

  it('handles empty employee list', () => {
    const result = analyzeCompliance([]);
    expect(result.company_summary.total_employees).toBe(0);
    expect(result.company_summary.national_employees).toBe(0);
    expect(result.company_summary.percentage).toBe(0);
    expect(result.current_band).toBe('red');
  });
});
