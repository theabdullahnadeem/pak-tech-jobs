/**
 * Property-based tests for premium listing persistence.
 *
 * **Feature: enterprise-tier, Property 10: Premium listing persistence**
 * For any job post submitted with `isPremium = true` by an employer with
 * `tier = PRO` or `ENTERPRISE`, the persisted job post record SHALL have
 * `isPremium = true`.
 *
 * **Validates: Requirements 6.5**
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  canSetPremiumListing,
  applyJobPostDefaults,
  type EmployerTier,
  type JobPostTierFields,
} from "@/lib/enterpriseTier";

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

const paidTierArb = fc.constantFrom("PRO" as EmployerTier, "ENTERPRISE" as EmployerTier);
const freeTierArb = fc.constant("FREE" as EmployerTier);
const anyTierArb = fc.constantFrom("FREE" as EmployerTier, "PRO" as EmployerTier, "ENTERPRISE" as EmployerTier);

/**
 * Simulates persisting a job post submission.
 * If the employer can set premium listings, the isPremium flag is honoured.
 * Otherwise it is forced to false (as the API should enforce).
 */
function persistJobPost(
  tier: EmployerTier,
  submittedIsPremium: boolean
): JobPostTierFields {
  const canPremium = canSetPremiumListing(tier);
  return applyJobPostDefaults({
    isPremium: canPremium ? submittedIsPremium : false,
  });
}

// ---------------------------------------------------------------------------
// Property 10: Premium listing persistence
// ---------------------------------------------------------------------------

describe("Feature: enterprise-tier, Property 10: Premium listing persistence", () => {

  it("10a — canSetPremiumListing returns true for PRO and ENTERPRISE tiers", () => {
    fc.assert(
      fc.property(paidTierArb, (tier) => {
        return canSetPremiumListing(tier) === true;
      }),
      { numRuns: 100 }
    );
  });

  it("10b — canSetPremiumListing returns false for FREE tier", () => {
    fc.assert(
      fc.property(freeTierArb, (tier) => {
        return canSetPremiumListing(tier) === false;
      }),
      { numRuns: 100 }
    );
  });

  it("10c — job post submitted with isPremium=true by PRO/ENTERPRISE persists with isPremium=true", () => {
    fc.assert(
      fc.property(paidTierArb, (tier) => {
        const persisted = persistJobPost(tier, true);
        return persisted.isPremium === true;
      }),
      { numRuns: 100 }
    );
  });

  it("10d — job post submitted with isPremium=false by PRO/ENTERPRISE persists with isPremium=false", () => {
    fc.assert(
      fc.property(paidTierArb, (tier) => {
        const persisted = persistJobPost(tier, false);
        return persisted.isPremium === false;
      }),
      { numRuns: 100 }
    );
  });

  it("10e — job post submitted with isPremium=true by FREE tier persists with isPremium=false", () => {
    fc.assert(
      fc.property(freeTierArb, (tier) => {
        const persisted = persistJobPost(tier, true);
        return persisted.isPremium === false;
      }),
      { numRuns: 100 }
    );
  });

  it("10f — isPremium persists correctly for any tier and any submitted value", () => {
    fc.assert(
      fc.property(anyTierArb, fc.boolean(), (tier, submittedIsPremium) => {
        const persisted = persistJobPost(tier, submittedIsPremium);
        const canPremium = canSetPremiumListing(tier);
        const expectedIsPremium = canPremium ? submittedIsPremium : false;
        return persisted.isPremium === expectedIsPremium;
      }),
      { numRuns: 100 }
    );
  });

  it("10g — example: PRO employer submitting isPremium=true persists correctly", () => {
    expect(canSetPremiumListing("PRO")).toBe(true);
    const persisted = persistJobPost("PRO", true);
    expect(persisted.isPremium).toBe(true);
  });

  it("10h — example: ENTERPRISE employer submitting isPremium=true persists correctly", () => {
    expect(canSetPremiumListing("ENTERPRISE")).toBe(true);
    const persisted = persistJobPost("ENTERPRISE", true);
    expect(persisted.isPremium).toBe(true);
  });

  it("10i — example: FREE employer cannot set isPremium=true", () => {
    expect(canSetPremiumListing("FREE")).toBe(false);
    const persisted = persistJobPost("FREE", true);
    expect(persisted.isPremium).toBe(false);
  });

});
