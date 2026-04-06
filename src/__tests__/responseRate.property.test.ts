/**
 * Property-based tests for response rate calculation.
 *
 * **Property 2: Response rate invariant — responseRate = (responded / total) * 100 holds after every application status change**
 * **Validates: Requirements 9.2, 5.6**
 */

import { describe, it } from "vitest";
import * as fc from "fast-check";
import {
  calculateResponseRate,
  calculateAvgResponseTimeHours,
  type ApplicationMetric,
} from "@/lib/calculateResponseRate";

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

const SLA_MS = 14 * 24 * 60 * 60 * 1000;

const baseDate = new Date("2024-01-01T00:00:00Z");

/** Generates a Date offset from baseDate by a given number of milliseconds */
function offsetDate(ms: number): Date {
  return new Date(baseDate.getTime() + ms);
}

/** Application that responded within 14 days */
const respondedAppArb: fc.Arbitrary<ApplicationMetric> = fc
  .integer({ min: 0, max: SLA_MS })
  .map(diffMs => ({
    submittedAt: baseDate,
    firstActionAt: offsetDate(diffMs),
  }));

/** Application with no response */
const noResponseAppArb: fc.Arbitrary<ApplicationMetric> = fc.constant({
  submittedAt: baseDate,
  firstActionAt: null,
});

/** Application that responded AFTER 14 days */
const lateResponseAppArb: fc.Arbitrary<ApplicationMetric> = fc
  .integer({ min: SLA_MS + 1, max: SLA_MS * 3 })
  .map(diffMs => ({
    submittedAt: baseDate,
    firstActionAt: offsetDate(diffMs),
  }));

/** Any application (responded, no response, or late) */
const anyAppArb: fc.Arbitrary<ApplicationMetric> = fc.oneof(
  respondedAppArb,
  noResponseAppArb,
  lateResponseAppArb
);

/** Non-empty array of any applications */
const appArrayArb = fc.array(anyAppArb, { minLength: 1, maxLength: 50 });

// ---------------------------------------------------------------------------
// Property 2a: responseRate is always in [0, 100]
// ---------------------------------------------------------------------------

describe("Property 2: Response rate invariant (Requirements 9.2, 5.6)", () => {

  it("2a — responseRate is always in [0, 100]", () => {
    fc.assert(
      fc.property(appArrayArb, (apps) => {
        const rate = calculateResponseRate(apps);
        return rate >= 0 && rate <= 100;
      }),
      { numRuns: 1000 }
    );
  });

  // ---------------------------------------------------------------------------
  // Property 2b: formula holds exactly
  // ---------------------------------------------------------------------------

  it("2b — responseRate equals round((responded / total) * 100)", () => {
    fc.assert(
      fc.property(appArrayArb, (apps) => {
        const total = apps.length;
        const responded = apps.filter(app => {
          if (!app.firstActionAt) return false;
          const diff = app.firstActionAt.getTime() - app.submittedAt.getTime();
          return diff >= 0 && diff <= SLA_MS;
        }).length;
        const expected = Math.round((responded / total) * 100);
        return calculateResponseRate(apps) === expected;
      }),
      { numRuns: 1000 }
    );
  });

  // ---------------------------------------------------------------------------
  // Property 2c: all responded within 14 days → responseRate = 100
  // ---------------------------------------------------------------------------

  it("2c — if all applications responded within 14 days, responseRate = 100", () => {
    fc.assert(
      fc.property(fc.array(respondedAppArb, { minLength: 1, maxLength: 50 }), (apps) => {
        return calculateResponseRate(apps) === 100;
      }),
      { numRuns: 500 }
    );
  });

  // ---------------------------------------------------------------------------
  // Property 2d: no firstActionAt → responseRate = 0
  // ---------------------------------------------------------------------------

  it("2d — if no applications have firstActionAt, responseRate = 0", () => {
    fc.assert(
      fc.property(fc.array(noResponseAppArb, { minLength: 1, maxLength: 50 }), (apps) => {
        return calculateResponseRate(apps) === 0;
      }),
      { numRuns: 500 }
    );
  });

  // ---------------------------------------------------------------------------
  // Property 2e: adding a responded application never decreases responseRate
  // ---------------------------------------------------------------------------

  it("2e — adding a responded application never decreases responseRate", () => {
    fc.assert(
      fc.property(appArrayArb, respondedAppArb, (apps, extra) => {
        const before = calculateResponseRate(apps);
        const after = calculateResponseRate([...apps, extra]);
        return after >= before;
      }),
      { numRuns: 1000 }
    );
  });

  // ---------------------------------------------------------------------------
  // Property 2f: avgResponseTimeHours is null when no applications have firstActionAt
  // ---------------------------------------------------------------------------

  it("2f — avgResponseTimeHours is null when no applications have firstActionAt", () => {
    fc.assert(
      fc.property(fc.array(noResponseAppArb, { minLength: 1, maxLength: 50 }), (apps) => {
        return calculateAvgResponseTimeHours(apps) === null;
      }),
      { numRuns: 500 }
    );
  });

  // ---------------------------------------------------------------------------
  // Property 2g: avgResponseTimeHours is always >= 0 when not null
  // ---------------------------------------------------------------------------

  it("2g — avgResponseTimeHours is always >= 0 when not null", () => {
    fc.assert(
      fc.property(appArrayArb, (apps) => {
        const avg = calculateAvgResponseTimeHours(apps);
        if (avg === null) return true;
        return avg >= 0;
      }),
      { numRuns: 1000 }
    );
  });

});
