/**
 * Property-based tests for enterprise activation mutation.
 *
 * **Feature: enterprise-tier, Property 6: Enterprise activation mutation**
 * For any valid activation payload, the employer record is updated with
 * `tier = ENTERPRISE`, `hasCvAccess = true`, `maxRecruiterSeats = seats`,
 * and `subscriptionExpiry ≈ now + durationMonths` (within 60-second tolerance).
 *
 * **Validates: Requirements 4.2, 4.3, 4.4, 4.5**
 */

import { describe, it } from "vitest";
import * as fc from "fast-check";
import {
  computeEnterpriseActivation,
  type ActivateEnterprisePayload,
} from "@/lib/enterpriseTier";

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/** Valid durationMonths: integer in [1, 60] */
const durationMonthsArb = fc.integer({ min: 1, max: 60 });

/** Valid seats: integer in [1, 50] */
const seatsArb = fc.integer({ min: 1, max: 50 });

/** Optional account manager name */
const accountManagerNameArb = fc.option(
  fc.string({ minLength: 1, maxLength: 80 }),
  { nil: undefined }
);

/** Valid activation payload */
const validPayloadArb: fc.Arbitrary<ActivateEnterprisePayload> = fc.record({
  durationMonths: durationMonthsArb,
  seats: seatsArb,
  accountManagerName: accountManagerNameArb,
});

// ---------------------------------------------------------------------------
// Property 6: Enterprise activation mutation
// ---------------------------------------------------------------------------

describe("Feature: enterprise-tier, Property 6: Enterprise activation mutation", () => {

  it("6a — tier is always set to ENTERPRISE after activation", () => {
    fc.assert(
      fc.property(validPayloadArb, (payload) => {
        const now = new Date();
        const result = computeEnterpriseActivation(now, payload);
        return result.tier === "ENTERPRISE";
      }),
      { numRuns: 100 }
    );
  });

  it("6b — hasCvAccess is always true after activation", () => {
    fc.assert(
      fc.property(validPayloadArb, (payload) => {
        const now = new Date();
        const result = computeEnterpriseActivation(now, payload);
        return result.hasCvAccess === true;
      }),
      { numRuns: 100 }
    );
  });

  it("6c — maxRecruiterSeats equals the provided seats value", () => {
    fc.assert(
      fc.property(validPayloadArb, (payload) => {
        const now = new Date();
        const result = computeEnterpriseActivation(now, payload);
        return result.maxRecruiterSeats === payload.seats;
      }),
      { numRuns: 100 }
    );
  });

  it("6d — subscriptionExpiry is approximately now + durationMonths (within 60-second tolerance)", () => {
    fc.assert(
      fc.property(validPayloadArb, (payload) => {
        const now = new Date();
        const result = computeEnterpriseActivation(now, payload);

        // Compute the expected expiry independently
        const expected = new Date(now);
        expected.setMonth(expected.getMonth() + payload.durationMonths);

        const diff = Math.abs(
          result.subscriptionExpiry!.getTime() - expected.getTime()
        );
        // Allow up to 60 seconds of tolerance
        return diff <= 60_000;
      }),
      { numRuns: 100 }
    );
  });

  it("6e — all four fields are correctly set simultaneously for any valid payload", () => {
    fc.assert(
      fc.property(validPayloadArb, (payload) => {
        const now = new Date();
        const result = computeEnterpriseActivation(now, payload);

        const expected = new Date(now);
        expected.setMonth(expected.getMonth() + payload.durationMonths);
        const expiryDiff = Math.abs(
          result.subscriptionExpiry!.getTime() - expected.getTime()
        );

        return (
          result.tier === "ENTERPRISE" &&
          result.hasCvAccess === true &&
          result.maxRecruiterSeats === payload.seats &&
          expiryDiff <= 60_000
        );
      }),
      { numRuns: 100 }
    );
  });

  it("6f — accountManagerName is set to the provided value or null when absent", () => {
    fc.assert(
      fc.property(validPayloadArb, (payload) => {
        const now = new Date();
        const result = computeEnterpriseActivation(now, payload);
        const expected =
          typeof payload.accountManagerName === "string"
            ? payload.accountManagerName
            : null;
        return result.accountManagerName === expected;
      }),
      { numRuns: 100 }
    );
  });

});
