/**
 * Property-based tests for premium listing toggle state.
 *
 * **Feature: enterprise-tier, Property 9: Premium listing toggle state**
 * For any employer with `tier = FREE`, the Premium Listing toggle SHALL be
 * rendered in a disabled state with tooltip "Contact Sales to Unlock".
 * For any employer with `tier = PRO` or `ENTERPRISE`, the toggle SHALL be
 * rendered in an enabled state.
 *
 * **Validates: Requirements 6.2, 6.3, 6.4**
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  getPremiumToggleState,
  type EmployerTier,
} from "@/lib/enterpriseTier";

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

const freeTierArb = fc.constant("FREE" as EmployerTier);
const paidTierArb = fc.constantFrom("PRO" as EmployerTier, "ENTERPRISE" as EmployerTier);
const anyTierArb = fc.constantFrom("FREE" as EmployerTier, "PRO" as EmployerTier, "ENTERPRISE" as EmployerTier);

// ---------------------------------------------------------------------------
// Property 9: Premium listing toggle state
// ---------------------------------------------------------------------------

describe("Feature: enterprise-tier, Property 9: Premium listing toggle state", () => {

  it("9a — FREE tier always produces a disabled toggle", () => {
    fc.assert(
      fc.property(freeTierArb, (tier) => {
        const state = getPremiumToggleState(tier);
        return state.disabled === true;
      }),
      { numRuns: 100 }
    );
  });

  it("9b — FREE tier always produces tooltip 'Contact Sales to Unlock'", () => {
    fc.assert(
      fc.property(freeTierArb, (tier) => {
        const state = getPremiumToggleState(tier);
        return state.tooltip === "Contact Sales to Unlock";
      }),
      { numRuns: 100 }
    );
  });

  it("9c — PRO or ENTERPRISE tier always produces an enabled toggle", () => {
    fc.assert(
      fc.property(paidTierArb, (tier) => {
        const state = getPremiumToggleState(tier);
        return state.disabled === false;
      }),
      { numRuns: 100 }
    );
  });

  it("9d — PRO or ENTERPRISE tier always produces null tooltip", () => {
    fc.assert(
      fc.property(paidTierArb, (tier) => {
        const state = getPremiumToggleState(tier);
        return state.tooltip === null;
      }),
      { numRuns: 100 }
    );
  });

  it("9e — disabled and tooltip are consistent: disabled iff tooltip is non-null", () => {
    fc.assert(
      fc.property(anyTierArb, (tier) => {
        const state = getPremiumToggleState(tier);
        // disabled === true iff tooltip !== null (they must agree)
        return state.disabled === (state.tooltip !== null);
      }),
      { numRuns: 100 }
    );
  });

  it("9f — example: FREE tier returns expected state", () => {
    const state = getPremiumToggleState("FREE");
    expect(state).toEqual({ disabled: true, tooltip: "Contact Sales to Unlock" });
  });

  it("9g — example: PRO tier returns expected state", () => {
    const state = getPremiumToggleState("PRO");
    expect(state).toEqual({ disabled: false, tooltip: null });
  });

  it("9h — example: ENTERPRISE tier returns expected state", () => {
    const state = getPremiumToggleState("ENTERPRISE");
    expect(state).toEqual({ disabled: false, tooltip: null });
  });

});
