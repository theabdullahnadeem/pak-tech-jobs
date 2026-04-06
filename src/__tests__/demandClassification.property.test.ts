/**
 * Property-based tests for heatmap skill classification.
 *
 * **Property 6: Classification coverage — every skill in a snapshot is classified
 * as exactly one of "In-Demand", "Oversaturated", or neither (middle 60%)**
 * **Validates: Requirements 11.3**
 */

import { describe, it } from "vitest";
import * as fc from "fast-check";
import {
  classifySkills,
  type SkillCount,
  type SkillClassification,
} from "@/lib/demandClassification";

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/** A non-empty skill name (alphanumeric, no empty strings) */
const skillNameArb: fc.Arbitrary<string> = fc
  .stringMatching(/^[a-zA-Z][a-zA-Z0-9+#._-]{0,19}$/)
  .filter((s) => s.length > 0);

/** A positive integer count */
const countArb: fc.Arbitrary<number> = fc.integer({ min: 1, max: 10_000 });

/** An array of SkillCount with 1–50 unique skill names */
const skillArrayArb: fc.Arbitrary<SkillCount[]> = fc
  .uniqueArray(skillNameArb, { minLength: 1, maxLength: 50 })
  .chain((skills) =>
    fc
      .array(countArb, { minLength: skills.length, maxLength: skills.length })
      .map((counts) => skills.map((skill, i) => ({ skill, count: counts[i] })))
  );

// ---------------------------------------------------------------------------
// Property 6: Classification coverage
// ---------------------------------------------------------------------------

describe("Property 6: Classification coverage (Requirements 11.3)", () => {
  const VALID_LABELS = new Set<SkillClassification>([
    "In-Demand",
    "Oversaturated",
    "Neither",
  ]);

  // -------------------------------------------------------------------------
  // Property 6a: every skill is classified as exactly one valid label
  // -------------------------------------------------------------------------

  it("6a — every skill is classified as exactly one of 'In-Demand', 'Oversaturated', or 'Neither'", () => {
    fc.assert(
      fc.property(skillArrayArb, (skills) => {
        const result = classifySkills(skills);
        // Same number of outputs as inputs
        if (result.length !== skills.length) return false;
        // Every output has a valid classification
        for (const item of result) {
          if (!VALID_LABELS.has(item.classification)) return false;
        }
        return true;
      }),
      { numRuns: 1000 }
    );
  });

  // -------------------------------------------------------------------------
  // Property 6b: number of "In-Demand" skills is at most ceil(total * 0.2)
  // -------------------------------------------------------------------------

  it("6b — number of 'In-Demand' skills is at most ceil(total * 0.2)", () => {
    fc.assert(
      fc.property(skillArrayArb, (skills) => {
        const result = classifySkills(skills);
        const total = skills.length;
        const maxInDemand = Math.ceil(total * 0.2);
        const inDemandCount = result.filter(
          (s) => s.classification === "In-Demand"
        ).length;
        return inDemandCount <= maxInDemand;
      }),
      { numRuns: 1000 }
    );
  });

  // -------------------------------------------------------------------------
  // Property 6c: number of "Oversaturated" skills is at most ceil(total * 0.2)
  // -------------------------------------------------------------------------

  it("6c — number of 'Oversaturated' skills is at most ceil(total * 0.2)", () => {
    fc.assert(
      fc.property(skillArrayArb, (skills) => {
        const result = classifySkills(skills);
        const total = skills.length;
        const maxOversaturated = Math.ceil(total * 0.2);
        const oversaturatedCount = result.filter(
          (s) => s.classification === "Oversaturated"
        ).length;
        return oversaturatedCount <= maxOversaturated;
      }),
      { numRuns: 1000 }
    );
  });

  // -------------------------------------------------------------------------
  // Property 6d: "In-Demand" skills always have count >= any "Neither" skill's count
  // -------------------------------------------------------------------------

  it("6d — every 'In-Demand' skill has count >= every 'Neither' skill's count", () => {
    fc.assert(
      fc.property(skillArrayArb, (skills) => {
        const result = classifySkills(skills);
        const inDemandCounts = result
          .filter((s) => s.classification === "In-Demand")
          .map((s) => s.count);
        const neitherCounts = result
          .filter((s) => s.classification === "Neither")
          .map((s) => s.count);

        if (inDemandCounts.length === 0 || neitherCounts.length === 0)
          return true;

        const minInDemand = Math.min(...inDemandCounts);
        const maxNeither = Math.max(...neitherCounts);
        return minInDemand >= maxNeither;
      }),
      { numRuns: 1000 }
    );
  });

  // -------------------------------------------------------------------------
  // Property 6e: "Oversaturated" skills always have count <= any "Neither" skill's count
  // -------------------------------------------------------------------------

  it("6e — every 'Oversaturated' skill has count <= every 'Neither' skill's count", () => {
    fc.assert(
      fc.property(skillArrayArb, (skills) => {
        const result = classifySkills(skills);
        const oversaturatedCounts = result
          .filter((s) => s.classification === "Oversaturated")
          .map((s) => s.count);
        const neitherCounts = result
          .filter((s) => s.classification === "Neither")
          .map((s) => s.count);

        if (oversaturatedCounts.length === 0 || neitherCounts.length === 0)
          return true;

        const maxOversaturated = Math.max(...oversaturatedCounts);
        const minNeither = Math.min(...neitherCounts);
        return maxOversaturated <= minNeither;
      }),
      { numRuns: 1000 }
    );
  });

  // -------------------------------------------------------------------------
  // Property 6f: empty input returns empty output
  // -------------------------------------------------------------------------

  it("6f — empty input returns empty output", () => {
    fc.assert(
      fc.property(fc.constant([] as SkillCount[]), (skills) => {
        const result = classifySkills(skills);
        return result.length === 0;
      }),
      { numRuns: 10 }
    );
  });

  // -------------------------------------------------------------------------
  // Property 6g: single skill is classified without error
  // -------------------------------------------------------------------------

  it("6g — single skill input is classified as exactly one label", () => {
    fc.assert(
      fc.property(
        skillNameArb,
        countArb,
        (skill, count) => {
          const result = classifySkills([{ skill, count }]);
          return result.length === 1 && VALID_LABELS.has(result[0].classification);
        }
      ),
      { numRuns: 500 }
    );
  });
});
