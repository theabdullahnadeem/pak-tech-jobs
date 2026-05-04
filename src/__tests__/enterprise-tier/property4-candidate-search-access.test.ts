/**
 * Property-based tests for candidate search access control.
 *
 * **Feature: enterprise-tier, Property 4: Candidate search access control**
 * For any employer, access is granted if and only if `hasCvAccess = true`
 * OR `tier = ENTERPRISE`; all other employers receive a denial.
 *
 * Tests the pure `hasCandidateSearchAccess` function from
 * `src/lib/enterpriseTier.ts` — no HTTP or database mocking needed.
 *
 * **Validates: Requirements 3.1, 3.2**
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { hasCandidateSearchAccess, type EmployerTier } from "@/lib/enterpriseTier";

// ─── Arbitraries ──────────────────────────────────────────────────────────────

const tierArb: fc.Arbitrary<EmployerTier> = fc.constantFrom(
  "FREE",
  "PRO",
  "ENTERPRISE"
);

const employerStateArb = fc.record({
  hasCvAccess: fc.boolean(),
  tier: tierArb,
});

// ─── Property 4: Candidate search access control ──────────────────────────────

describe(
  "Feature: enterprise-tier, Property 4: Candidate search access control",
  () => {
    it(
      "4a — access is granted when hasCvAccess = true, regardless of tier",
      () => {
        fc.assert(
          fc.property(tierArb, (tier) => {
            const result = hasCandidateSearchAccess({ hasCvAccess: true, tier });
            return result === true;
          }),
          { numRuns: 100 }
        );
      }
    );

    it(
      "4b — access is granted when tier = ENTERPRISE, regardless of hasCvAccess",
      () => {
        fc.assert(
          fc.property(fc.boolean(), (hasCvAccess) => {
            const result = hasCandidateSearchAccess({
              hasCvAccess,
              tier: "ENTERPRISE",
            });
            return result === true;
          }),
          { numRuns: 100 }
        );
      }
    );

    it(
      "4c — access is denied when hasCvAccess = false AND tier is not ENTERPRISE",
      () => {
        const nonEnterpriseTierArb: fc.Arbitrary<EmployerTier> = fc.constantFrom(
          "FREE",
          "PRO"
        );
        fc.assert(
          fc.property(nonEnterpriseTierArb, (tier) => {
            const result = hasCandidateSearchAccess({
              hasCvAccess: false,
              tier,
            });
            return result === false;
          }),
          { numRuns: 100 }
        );
      }
    );

    it(
      "4d — access decision matches the expected formula for any employer state",
      () => {
        fc.assert(
          fc.property(employerStateArb, ({ hasCvAccess, tier }) => {
            const result = hasCandidateSearchAccess({ hasCvAccess, tier });
            const expected = hasCvAccess || tier === "ENTERPRISE";
            return result === expected;
          }),
          { numRuns: 100 }
        );
      }
    );

    it(
      "4e — FREE tier with hasCvAccess = false is always denied",
      () => {
        const result = hasCandidateSearchAccess({
          hasCvAccess: false,
          tier: "FREE",
        });
        expect(result).toBe(false);
      }
    );

    it(
      "4f — PRO tier with hasCvAccess = false is always denied",
      () => {
        const result = hasCandidateSearchAccess({
          hasCvAccess: false,
          tier: "PRO",
        });
        expect(result).toBe(false);
      }
    );

    it(
      "4g — ENTERPRISE tier with hasCvAccess = false is always granted",
      () => {
        const result = hasCandidateSearchAccess({
          hasCvAccess: false,
          tier: "ENTERPRISE",
        });
        expect(result).toBe(true);
      }
    );

    it(
      "4h — FREE tier with hasCvAccess = true is always granted",
      () => {
        const result = hasCandidateSearchAccess({
          hasCvAccess: true,
          tier: "FREE",
        });
        expect(result).toBe(true);
      }
    );
  }
);
