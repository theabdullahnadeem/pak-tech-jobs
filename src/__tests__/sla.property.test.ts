/**
 * Property-based tests for SLA expiry transition logic.
 *
 * **Property 3: SLA monotonicity — an application that reaches EXPIRED never transitions back to an earlier stage**
 * **Validates: Requirements 6.2, 6.3**
 */

import { describe, it } from "vitest";
import * as fc from "fast-check";
import {
  applyTransitions,
  isValidTransition,
  STAGE_ORDER,
  type Stage,
} from "@/lib/slaLogic";

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

const ALL_STAGES: Stage[] = [
  "APPLIED",
  "SEEN",
  "SHORTLISTED",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
  "EXPIRED",
];

const NON_TERMINAL_STAGES: Stage[] = [
  "APPLIED",
  "SEEN",
  "SHORTLISTED",
  "INTERVIEW",
  "OFFER",
];

/** Any stage */
const stageArb = fc.constantFrom(...ALL_STAGES);

/** Any non-terminal stage (can still transition) */
const nonTerminalStageArb = fc.constantFrom(...NON_TERMINAL_STAGES);

/** A random sequence of stages (may be empty) */
const transitionSeqArb = fc.array(stageArb, { minLength: 0, maxLength: 20 });

/** A non-empty random sequence of stages */
const nonEmptyTransitionSeqArb = fc.array(stageArb, {
  minLength: 1,
  maxLength: 20,
});

// ---------------------------------------------------------------------------
// Property 3a: Once EXPIRED, no subsequent transition can change the stage
// ---------------------------------------------------------------------------

describe("Property 3: SLA monotonicity (Requirements 6.2, 6.3)", () => {
  it("3a — once a stage reaches EXPIRED, no subsequent transition can change it", () => {
    fc.assert(
      fc.property(transitionSeqArb, (transitions) => {
        const result = applyTransitions("EXPIRED", transitions);
        return result === "EXPIRED";
      }),
      { numRuns: 1000 }
    );
  });

  // ---------------------------------------------------------------------------
  // Property 3b: Once REJECTED, no subsequent transition can change the stage
  // ---------------------------------------------------------------------------

  it("3b — once a stage reaches REJECTED, no subsequent transition can change it", () => {
    fc.assert(
      fc.property(transitionSeqArb, (transitions) => {
        const result = applyTransitions("REJECTED", transitions);
        return result === "REJECTED";
      }),
      { numRuns: 1000 }
    );
  });

  // ---------------------------------------------------------------------------
  // Property 3c: Stage order is monotonically non-decreasing through valid transitions
  // ---------------------------------------------------------------------------

  it("3c — stage order is monotonically non-decreasing through valid transitions", () => {
    fc.assert(
      fc.property(stageArb, transitionSeqArb, (initial, transitions) => {
        let current = initial;
        for (const next of transitions) {
          const before = STAGE_ORDER[current];
          if (isValidTransition(current, next)) {
            current = next;
            // After a valid transition, order must be strictly greater
            if (STAGE_ORDER[current] <= before) return false;
          }
          // Invalid transitions leave current unchanged — order stays the same
        }
        return true;
      }),
      { numRuns: 1000 }
    );
  });

  // ---------------------------------------------------------------------------
  // Property 3d: applyTransitions with empty transitions returns the initial stage
  // ---------------------------------------------------------------------------

  it("3d — applyTransitions with empty transitions returns the initial stage", () => {
    fc.assert(
      fc.property(stageArb, (initial) => {
        return applyTransitions(initial, []) === initial;
      }),
      { numRuns: 200 }
    );
  });

  // ---------------------------------------------------------------------------
  // Property 3e: EXPIRED is always a valid target from any non-terminal stage
  // ---------------------------------------------------------------------------

  it("3e — EXPIRED is always a valid target from any non-terminal stage", () => {
    fc.assert(
      fc.property(nonTerminalStageArb, (stage) => {
        return isValidTransition(stage, "EXPIRED") === true;
      }),
      { numRuns: 200 }
    );
  });

  // ---------------------------------------------------------------------------
  // Property 3f: isValidTransition(EXPIRED, X) is always false for any X
  // ---------------------------------------------------------------------------

  it("3f — isValidTransition(EXPIRED, X) is always false for any X", () => {
    fc.assert(
      fc.property(stageArb, (target) => {
        return isValidTransition("EXPIRED", target) === false;
      }),
      { numRuns: 200 }
    );
  });
});
