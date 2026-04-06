/**
 * Property-based tests for salary aggregation threshold.
 *
 * **Property 5: Minimum sample invariant — salary range statistics are only returned
 * when at least 3 verified entries exist for the queried combination**
 * **Validates: Requirements 10.6, 10.7**
 */

import { describe, it } from "vitest";
import * as fc from "fast-check";
import { aggregateSalaries, MIN_SAMPLE_SIZE, type SalaryEntry } from "@/lib/salaryAggregation";

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/** A single salary entry with a positive integer salary */
const salaryEntryArb: fc.Arbitrary<SalaryEntry> = fc
  .integer({ min: 1, max: 10_000_000 })
  .map((salaryAmount) => ({ salaryAmount }));

/** Array with fewer than MIN_SAMPLE_SIZE entries (0, 1, or 2) */
const insufficientEntriesArb = fc.array(salaryEntryArb, {
  minLength: 0,
  maxLength: MIN_SAMPLE_SIZE - 1,
});

/** Array with at least MIN_SAMPLE_SIZE entries */
const sufficientEntriesArb = fc.array(salaryEntryArb, {
  minLength: MIN_SAMPLE_SIZE,
  maxLength: 100,
});

/** Any array of salary entries */
const anyEntriesArb = fc.array(salaryEntryArb, { minLength: 0, maxLength: 100 });

// ---------------------------------------------------------------------------
// Property 5a: entries.length < 3 → insufficientData = true
// ---------------------------------------------------------------------------

describe("Property 5: Minimum sample invariant (Requirements 10.6, 10.7)", () => {

  it("5a — fewer than 3 entries returns insufficientData=true", () => {
    fc.assert(
      fc.property(insufficientEntriesArb, (entries) => {
        const result = aggregateSalaries(entries);
        return result.insufficientData === true;
      }),
      { numRuns: 1000 }
    );
  });

  // ---------------------------------------------------------------------------
  // Property 5b: entries.length >= 3 → insufficientData is NOT set
  // ---------------------------------------------------------------------------

  it("5b — 3 or more entries does NOT return insufficientData", () => {
    fc.assert(
      fc.property(sufficientEntriesArb, (entries) => {
        const result = aggregateSalaries(entries);
        return !result.insufficientData;
      }),
      { numRuns: 1000 }
    );
  });

  // ---------------------------------------------------------------------------
  // Property 5c: min <= median <= max when count >= 3
  // ---------------------------------------------------------------------------

  it("5c — min <= median <= max always holds when count >= 3", () => {
    fc.assert(
      fc.property(sufficientEntriesArb, (entries) => {
        const result = aggregateSalaries(entries);
        return result.min <= result.median && result.median <= result.max;
      }),
      { numRuns: 1000 }
    );
  });

  // ---------------------------------------------------------------------------
  // Property 5d: min is always the smallest value in the input
  // ---------------------------------------------------------------------------

  it("5d — min equals the smallest salary in the input", () => {
    fc.assert(
      fc.property(sufficientEntriesArb, (entries) => {
        const result = aggregateSalaries(entries);
        const expectedMin = Math.min(...entries.map((e) => e.salaryAmount));
        return result.min === expectedMin;
      }),
      { numRuns: 1000 }
    );
  });

  // ---------------------------------------------------------------------------
  // Property 5e: max is always the largest value in the input
  // ---------------------------------------------------------------------------

  it("5e — max equals the largest salary in the input", () => {
    fc.assert(
      fc.property(sufficientEntriesArb, (entries) => {
        const result = aggregateSalaries(entries);
        const expectedMax = Math.max(...entries.map((e) => e.salaryAmount));
        return result.max === expectedMax;
      }),
      { numRuns: 1000 }
    );
  });

  // ---------------------------------------------------------------------------
  // Property 5f: count always equals entries.length
  // ---------------------------------------------------------------------------

  it("5f — count always equals entries.length", () => {
    fc.assert(
      fc.property(anyEntriesArb, (entries) => {
        const result = aggregateSalaries(entries);
        return result.count === entries.length;
      }),
      { numRuns: 1000 }
    );
  });

});
