/**
 * Property-based tests for new employer defaults.
 *
 * **Feature: enterprise-tier, Property 1: New employer defaults**
 * For any newly created employer, `tier = FREE`, `maxRecruiterSeats = 1`, `hasCvAccess = false`.
 *
 * **Validates: Requirements 1.2, 1.3, 1.6**
 */

import { describe, it } from "vitest";
import * as fc from "fast-check";
import { applyEmployerDefaults, type EmployerTierFields } from "@/lib/enterpriseTier";

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/**
 * Generates arbitrary employer creation inputs — the fields a caller might
 * supply when creating a new employer (i.e. the non-default fields).
 * We deliberately do NOT include the tier-related fields here because those
 * are what the system should default, not what the caller provides.
 */
const employerCreationInputArb = fc.record({
  name: fc.string({ minLength: 1, maxLength: 80 }),
  email: fc.emailAddress(),
  companyName: fc.option(fc.string({ minLength: 1, maxLength: 80 }), { nil: undefined }),
});

// ---------------------------------------------------------------------------
// Property 1: New employer defaults
// ---------------------------------------------------------------------------

describe("Feature: enterprise-tier, Property 1: New employer defaults", () => {

  it("1a — tier defaults to FREE for any newly created employer", () => {
    fc.assert(
      fc.property(employerCreationInputArb, (_input) => {
        // Simulate what Prisma returns when creating a new employer:
        // applyEmployerDefaults() with no overrides mirrors the schema defaults.
        const record: EmployerTierFields = applyEmployerDefaults();
        return record.tier === "FREE";
      }),
      { numRuns: 100 }
    );
  });

  it("1b — maxRecruiterSeats defaults to 1 for any newly created employer", () => {
    fc.assert(
      fc.property(employerCreationInputArb, (_input) => {
        const record: EmployerTierFields = applyEmployerDefaults();
        return record.maxRecruiterSeats === 1;
      }),
      { numRuns: 100 }
    );
  });

  it("1c — hasCvAccess defaults to false for any newly created employer", () => {
    fc.assert(
      fc.property(employerCreationInputArb, (_input) => {
        const record: EmployerTierFields = applyEmployerDefaults();
        return record.hasCvAccess === false;
      }),
      { numRuns: 100 }
    );
  });

  it("1d — all three defaults hold simultaneously for any newly created employer", () => {
    fc.assert(
      fc.property(employerCreationInputArb, (_input) => {
        const record: EmployerTierFields = applyEmployerDefaults();
        return (
          record.tier === "FREE" &&
          record.maxRecruiterSeats === 1 &&
          record.hasCvAccess === false
        );
      }),
      { numRuns: 100 }
    );
  });

  it("1e — explicit overrides are respected but unset fields still default correctly", () => {
    // Even when some fields are overridden (e.g. after an activation), the
    // default function correctly applies only the provided overrides.
    fc.assert(
      fc.property(
        fc.record({
          tier: fc.constantFrom("FREE" as const, "PRO" as const, "ENTERPRISE" as const),
          maxRecruiterSeats: fc.integer({ min: 1, max: 50 }),
        }),
        ({ tier, maxRecruiterSeats }) => {
          // Override tier and maxRecruiterSeats but leave hasCvAccess unset
          const record = applyEmployerDefaults({ tier, maxRecruiterSeats });
          return (
            record.tier === tier &&
            record.maxRecruiterSeats === maxRecruiterSeats &&
            record.hasCvAccess === false // still defaults to false
          );
        }
      ),
      { numRuns: 100 }
    );
  });

});
