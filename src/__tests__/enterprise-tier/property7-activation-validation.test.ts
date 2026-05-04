/**
 * Property-based tests for activation input validation.
 *
 * **Feature: enterprise-tier, Property 7: Activation input validation**
 * Any `durationMonths` outside [1, 60] or `seats` outside [1, 50] returns
 * an error message. Valid inputs return null (no error).
 *
 * **Validates: Requirements 4.6, 4.7, 4.8**
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  validateActivationPayload,
  type ActivateEnterprisePayload,
} from "@/lib/enterpriseTier";

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/** durationMonths below the valid range: < 1 */
const durationMonthsTooLowArb = fc.integer({ min: -1000, max: 0 });

/** durationMonths above the valid range: > 60 */
const durationMonthsTooHighArb = fc.integer({ min: 61, max: 1000 });

/** seats below the valid range: < 1 */
const seatsTooLowArb = fc.integer({ min: -1000, max: 0 });

/** seats above the valid range: > 50 */
const seatsTooHighArb = fc.integer({ min: 51, max: 1000 });

/** Valid durationMonths: integer in [1, 60] */
const validDurationMonthsArb = fc.integer({ min: 1, max: 60 });

/** Valid seats: integer in [1, 50] */
const validSeatsArb = fc.integer({ min: 1, max: 50 });

// ---------------------------------------------------------------------------
// Property 7: Activation input validation
// ---------------------------------------------------------------------------

describe("Feature: enterprise-tier, Property 7: Activation input validation", () => {

  it("7a — durationMonths < 1 always returns the expected error message", () => {
    fc.assert(
      fc.property(durationMonthsTooLowArb, validSeatsArb, (durationMonths, seats) => {
        const payload: ActivateEnterprisePayload = { durationMonths, seats };
        const error = validateActivationPayload(payload);
        return error === "durationMonths must be between 1 and 60";
      }),
      { numRuns: 100 }
    );
  });

  it("7b — durationMonths > 60 always returns the expected error message", () => {
    fc.assert(
      fc.property(durationMonthsTooHighArb, validSeatsArb, (durationMonths, seats) => {
        const payload: ActivateEnterprisePayload = { durationMonths, seats };
        const error = validateActivationPayload(payload);
        return error === "durationMonths must be between 1 and 60";
      }),
      { numRuns: 100 }
    );
  });

  it("7c — seats < 1 always returns the expected error message", () => {
    fc.assert(
      fc.property(validDurationMonthsArb, seatsTooLowArb, (durationMonths, seats) => {
        const payload: ActivateEnterprisePayload = { durationMonths, seats };
        const error = validateActivationPayload(payload);
        return error === "seats must be between 1 and 50";
      }),
      { numRuns: 100 }
    );
  });

  it("7d — seats > 50 always returns the expected error message", () => {
    fc.assert(
      fc.property(validDurationMonthsArb, seatsTooHighArb, (durationMonths, seats) => {
        const payload: ActivateEnterprisePayload = { durationMonths, seats };
        const error = validateActivationPayload(payload);
        return error === "seats must be between 1 and 50";
      }),
      { numRuns: 100 }
    );
  });

  it("7e — valid durationMonths and seats always returns null (no error)", () => {
    fc.assert(
      fc.property(validDurationMonthsArb, validSeatsArb, (durationMonths, seats) => {
        const payload: ActivateEnterprisePayload = { durationMonths, seats };
        const error = validateActivationPayload(payload);
        return error === null;
      }),
      { numRuns: 100 }
    );
  });

  it("7f — durationMonths out of range takes priority over seats when both are invalid", () => {
    // When durationMonths is invalid, the error for durationMonths is returned first
    fc.assert(
      fc.property(
        fc.oneof(durationMonthsTooLowArb, durationMonthsTooHighArb),
        fc.oneof(seatsTooLowArb, seatsTooHighArb),
        (durationMonths, seats) => {
          const payload: ActivateEnterprisePayload = { durationMonths, seats };
          const error = validateActivationPayload(payload);
          return error === "durationMonths must be between 1 and 60";
        }
      ),
      { numRuns: 100 }
    );
  });

  it("7g — boundary values 1 and 60 for durationMonths are valid", () => {
    expect(validateActivationPayload({ durationMonths: 1, seats: 1 })).toBe(null);
    expect(validateActivationPayload({ durationMonths: 60, seats: 1 })).toBe(null);
  });

  it("7h — boundary values 1 and 50 for seats are valid", () => {
    expect(validateActivationPayload({ durationMonths: 1, seats: 1 })).toBe(null);
    expect(validateActivationPayload({ durationMonths: 1, seats: 50 })).toBe(null);
  });

});
