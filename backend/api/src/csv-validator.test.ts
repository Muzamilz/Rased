import { describe, it, expect } from 'vitest';
import { validateCsv } from './csv-validator';

const validCsv = `employee_id,role_category,nationality,contract_status
E001,skilled,UAE,active
E002,skilled,Indian,active
E003,semi_skilled,Egyptian,active
E004,unskilled,UAE,active
E005,skilled,Pakistani,terminated`;

describe('validateCsv', () => {
  it('parses valid CSV correctly', () => {
    const result = validateCsv(validCsv);
    expect(result.errors).toHaveLength(0);
    expect(result.employees).toHaveLength(5);
    expect(result.employees[0].employee_id).toBe('E001');
    expect(result.employees[0].role_category).toBe('skilled');
    expect(result.employees[0].nationality).toBe('UAE');
    expect(result.employees[0].contract_status).toBe('active');
  });

  it('flags missing required columns', () => {
    const csv = `employee_id,role_category,nationality\nE001,skilled,UAE`;
    const result = validateCsv(csv);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0].field).toBe('headers');
    expect(result.employees).toHaveLength(0);
  });

  it('flags invalid role_category', () => {
    const csv = `employee_id,role_category,nationality,contract_status\nE001,invalid_role,UAE,active`;
    const result = validateCsv(csv);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].field).toBe('role_category');
  });

  it('flags invalid contract_status', () => {
    const csv = `employee_id,role_category,nationality,contract_status\nE001,skilled,UAE,unknown`;
    const result = validateCsv(csv);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].field).toBe('contract_status');
  });

  it('flags missing employee_id', () => {
    const csv = `employee_id,role_category,nationality,contract_status\n,skilled,UAE,active`;
    const result = validateCsv(csv);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].field).toBe('employee_id');
  });

  it('skips malformed rows and keeps valid ones', () => {
    const csv = `employee_id,role_category,nationality,contract_status
E001,skilled,UAE,active
E002,bad_role,UAE,active
E003,skilled,UAE,active`;
    const result = validateCsv(csv);
    expect(result.employees).toHaveLength(2);
    expect(result.errors).toHaveLength(1);
  });

  it('handles empty CSV', () => {
    const csv = `employee_id,role_category,nationality,contract_status`;
    const result = validateCsv(csv);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.employees).toHaveLength(0);
  });

  it('handles completely unparseable content', () => {
    const result = validateCsv('not even close to csv');
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
