/**
 * Property-based tests for the Dedicated Support widget visibility.
 *
 * **Feature: enterprise-tier, Property 12: Dedicated support widget visibility**
 * For any employer with `tier = ENTERPRISE` and a non-null, non-empty
 * `accountManagerName`, the dashboard SHALL render the Dedicated Support widget
 * containing the `accountManagerName` value.
 * For any employer with `tier = ENTERPRISE` and a null or empty
 * `accountManagerName`, the widget SHALL display the fallback message.
 * For any employer with `tier ≠ ENTERPRISE`, the widget SHALL not be rendered.
 *
 * **Validates: Requirements 5.1, 5.2, 5.3**
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  getDedicatedSupportWidgetState,
  type EmployerTier,
} from "@/lib/enterpriseTier";

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

const enterpriseTierArb = fc.constant("FREE" as EmployerTier);
const nonEnterpriseTierArb = fc.constantFrom("FREE" as EmployerTier, "PRO" as EmployerTier);
const anyTierArb = fc.constantFrom("FREE" as EmployerTier, "PRO" as EmployerTier, "ENTERPRISE" as EmployerTier);

/** Non-empty, non-whitespace-only string */
const nonEmptyNameArb = fc
  .string({ minLength: 1, maxLength: 100 })
  .filter((s) => s.trim().length > 0);

/** Null or empty/whitespace-only string */
const nullOrEmptyNameArb = fc.oneof(
  fc.constant(null),
  fc.constant(""),
  fc.string({ minLength: 1, maxLength: 20 }).map((s) => s.replace(/\S/g, " ")) // whitespace-only
);

// ---------------------------------------------------------------------------
// Property 12: Dedicated support widget visibility
// ---------------------------------------------------------------------------

describe("Feature: enterprise-tier, Property 12: Dedicated support widget visibility", () => {

  // ── 12a: Non-ENTERPRISE tier → widget not visible ─────────────────────────

  it("12a — non-ENTERPRISE tier always produces visible=false regardless of accountManagerName", () => {
    fc.assert(
      fc.property(
        nonEnterpriseTierArb,
        fc.option(fc.string(), { nil: null }),
        (tier, name) => {
          const state = getDedicatedSupportWidgetState(tier, name);
          return state.visible === false;
        }
      ),
      { numRuns: 100 }
    );
  });

  it("12b — non-ENTERPRISE tier always produces message=null", () => {
    fc.assert(
      fc.property(
        nonEnterpriseTierArb,
        fc.option(fc.string(), { nil: null }),
        (tier, name) => {
          const state = getDedicatedSupportWidgetState(tier, name);
          return state.message === null;
        }
      ),
      { numRuns: 100 }
    );
  });

  // ── 12c: ENTERPRISE + non-empty name → visible with name as message ────────

  it("12c — ENTERPRISE tier with non-empty accountManagerName produces visible=true", () => {
    fc.assert(
      fc.property(nonEmptyNameArb, (name) => {
        const state = getDedicatedSupportWidgetState("ENTERPRISE", name);
        return state.visible === true;
      }),
      { numRuns: 100 }
    );
  });

  it("12d — ENTERPRISE tier with non-empty accountManagerName produces message equal to the name", () => {
    fc.assert(
      fc.property(nonEmptyNameArb, (name) => {
        const state = getDedicatedSupportWidgetState("ENTERPRISE", name);
        return state.message === name;
      }),
      { numRuns: 100 }
    );
  });

  // ── 12e: ENTERPRISE + null/empty name → visible with null message (fallback) ─

  it("12e — ENTERPRISE tier with null or empty accountManagerName produces visible=true", () => {
    fc.assert(
      fc.property(nullOrEmptyNameArb, (name) => {
        const state = getDedicatedSupportWidgetState("ENTERPRISE", name);
        return state.visible === true;
      }),
      { numRuns: 100 }
    );
  });

  it("12f — ENTERPRISE tier with null or empty accountManagerName produces message=null (fallback)", () => {
    fc.assert(
      fc.property(nullOrEmptyNameArb, (name) => {
        const state = getDedicatedSupportWidgetState("ENTERPRISE", name);
        return state.message === null;
      }),
      { numRuns: 100 }
    );
  });

  // ── 12g: Invariant — visible is always false for non-ENTERPRISE ────────────

  it("12g — visible is true if and only if tier is ENTERPRISE", () => {
    fc.assert(
      fc.property(
        anyTierArb,
        fc.option(fc.string(), { nil: null }),
        (tier, name) => {
          const state = getDedicatedSupportWidgetState(tier, name);
          // visible must be true iff tier is ENTERPRISE
          return state.visible === (tier === "ENTERPRISE");
        }
      ),
      { numRuns: 100 }
    );
  });

  // ── 12h: Example-based tests ───────────────────────────────────────────────

  it("12h — example: FREE tier with name returns not visible", () => {
    const state = getDedicatedSupportWidgetState("FREE", "Ali Khan");
    expect(state).toEqual({ visible: false, message: null });
  });

  it("12i — example: PRO tier with name returns not visible", () => {
    const state = getDedicatedSupportWidgetState("PRO", "Ali Khan");
    expect(state).toEqual({ visible: false, message: null });
  });

  it("12j — example: ENTERPRISE tier with name returns visible with message", () => {
    const state = getDedicatedSupportWidgetState("ENTERPRISE", "Ali Khan");
    expect(state).toEqual({ visible: true, message: "Ali Khan" });
  });

  it("12k — example: ENTERPRISE tier with null name returns visible with null message", () => {
    const state = getDedicatedSupportWidgetState("ENTERPRISE", null);
    expect(state).toEqual({ visible: true, message: null });
  });

  it("12l — example: ENTERPRISE tier with empty string returns visible with null message", () => {
    const state = getDedicatedSupportWidgetState("ENTERPRISE", "");
    expect(state).toEqual({ visible: true, message: null });
  });

  it("12m — example: ENTERPRISE tier with whitespace-only name returns visible with null message", () => {
    const state = getDedicatedSupportWidgetState("ENTERPRISE", "   ");
    expect(state).toEqual({ visible: true, message: null });
  });

});
