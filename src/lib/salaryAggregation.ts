/**
 * Pure functions for salary aggregation logic.
 * Used by GET /api/salaries and testable in isolation.
 * Requirements: 10.6, 10.7
 */

export interface SalaryEntry {
  salaryAmount: number;
}

export interface AggregationResult {
  min: number;
  median: number;
  max: number;
  count: number;
  insufficientData?: boolean;
}

export const MIN_SAMPLE_SIZE = 3;

/**
 * Aggregate salary entries into min/median/max statistics.
 * Returns insufficientData=true when fewer than MIN_SAMPLE_SIZE entries are provided.
 */
export function aggregateSalaries(entries: SalaryEntry[]): AggregationResult {
  if (entries.length < MIN_SAMPLE_SIZE) {
    return { min: 0, median: 0, max: 0, count: entries.length, insufficientData: true };
  }

  const sorted = entries.map((e) => e.salaryAmount).sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const mid = Math.floor(sorted.length / 2);
  const median =
    sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

  return { min, median, max, count: entries.length };
}
