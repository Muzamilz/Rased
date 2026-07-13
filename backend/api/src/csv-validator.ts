import { parse } from 'csv-parse/sync';
import type { Employee, RoleCategory, ContractStatus } from '@rased/shared';

export interface ValidationError {
  row: number;
  field: string;
  message: string;
}

export interface ValidationResult {
  employees: Employee[];
  errors: ValidationError[];
}

const VALID_ROLES: RoleCategory[] = ['skilled', 'semi_skilled', 'unskilled'];
const VALID_STATUSES: ContractStatus[] = ['active', 'terminated'];

export function validateCsv(
  csvContent: string,
): ValidationResult {
  const employees: Employee[] = [];
  const errors: ValidationError[] = [];

  let records: Record<string, string>[];
  try {
    records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
    });
  } catch {
    errors.push({ row: 0, field: 'file', message: 'Failed to parse CSV. Check file format.' });
    return { employees, errors };
  }

  if (records.length === 0) {
    errors.push({ row: 0, field: 'file', message: 'CSV file is empty.' });
    return { employees, errors };
  }

  const requiredColumns = ['employee_id', 'role_category', 'nationality', 'contract_status'];
  const headers = records.length > 0 ? Object.keys(records[0]) : [];
  const missingCols = requiredColumns.filter((c) => !headers.includes(c));

  if (missingCols.length > 0) {
    errors.push({
      row: 0,
      field: 'headers',
      message: `Missing columns: ${missingCols.join(', ')}. Required: ${requiredColumns.join(', ')}`,
    });
    return { employees, errors };
  }

  for (let i = 0; i < records.length; i++) {
    const row = records[i];
    const rowNum = i + 2;
    let skip = false;

    if (!row.employee_id || row.employee_id.trim() === '') {
      errors.push({ row: rowNum, field: 'employee_id', message: 'employee_id is required.' });
      skip = true;
    }

    if (!row.role_category || !(VALID_ROLES as string[]).includes(row.role_category.trim())) {
      errors.push({
        row: rowNum,
        field: 'role_category',
        message: `Invalid role_category "${row.role_category}". Must be one of: ${VALID_ROLES.join(', ')}`,
      });
      skip = true;
    }

    if (!row.nationality || row.nationality.trim() === '') {
      errors.push({ row: rowNum, field: 'nationality', message: 'nationality is required.' });
      skip = true;
    }

    if (!row.contract_status || !(VALID_STATUSES as string[]).includes(row.contract_status.trim())) {
      errors.push({
        row: rowNum,
        field: 'contract_status',
        message: `Invalid contract_status "${row.contract_status}". Must be one of: ${VALID_STATUSES.join(', ')}`,
      });
      skip = true;
    }

    if (!skip) {
      employees.push({
        employee_id: row.employee_id.trim(),
        role_category: row.role_category.trim() as RoleCategory,
        nationality: row.nationality.trim(),
        contract_status: row.contract_status.trim() as ContractStatus,
      });
    }
  }

  return { employees, errors };
}
