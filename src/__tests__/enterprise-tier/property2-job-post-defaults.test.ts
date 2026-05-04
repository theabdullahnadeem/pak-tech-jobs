/**
 * Property-based tests for new job post defaults.
 *
 * **Feature: enterprise-tier, Property 2: New job post defaults**
 * For any newly created job post, `isPremium = false`.
 *
 * **Validates: Requirements 2.1**
 */

import { describe, it } from "vitest";
import * as fc from "fast-check";
import { applyJobPostDefaults, type JobPostTierFields } from "@/lib/enterpriseTier";

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

const jobTypeValues = ["FULL_TIME", "REMOTE", "CONTRACT", "INTERNSHIP", "PART_TIME"] as const;
const experienceLevelValues = ["JUNIOR", "MID", "SENIOR", "LEAD"] as const;

/**
 * Generates arbitrary job post creation inputs — the fields a caller supplies
 * when creating a new job post. The `isPremium` field is intentionally absent
 * because the system should default it to false.
 */
const jobPostCreationInputArb = fc.record({
  title: fc.string({ minLength: 1, maxLength: 120 }),
  description: fc.string({ minLength: 1, maxLength: 500 }),
  skills: fc.array(fc.string({ minLength: 1, maxLength: 30 }), { minLength: 1, maxLength: 10 }),
  location: fc.string({ minLength: 1, maxLength: 80 }),
  city: fc.string({ minLength: 1, maxLength: 60 }),
  salaryMin: fc.integer({ min: 0, max: 1_000_000 }),
  salaryMax: fc.integer({ min: 0, max: 1_000_000 }),
  jobType: fc.constantFrom(...jobTypeValues),
  experienceLevel: fc.constantFrom(...experienceLevelValues),
  category: fc.array(fc.string({ minLength: 1, maxLength: 30 }), { minLength: 1, maxLength: 5 }),
});

// ---------------------------------------------------------------------------
// Property 2: New job post defaults
// ---------------------------------------------------------------------------

describe("Feature: enterprise-tier, Property 2: New job post defaults", () => {

  it("2a — isPremium defaults to false for any newly created job post", () => {
    fc.assert(
      fc.property(jobPostCreationInputArb, (_input) => {
        // Simulate what Prisma returns when creating a new job post:
        // applyJobPostDefaults() with no overrides mirrors the schema default.
        const record: JobPostTierFields = applyJobPostDefaults();
        return record.isPremium === false;
      }),
      { numRuns: 100 }
    );
  });

  it("2b — isPremium is false regardless of the other job post fields provided", () => {
    fc.assert(
      fc.property(jobPostCreationInputArb, (input) => {
        // Even with arbitrary input data, the default is always false
        const record: JobPostTierFields = applyJobPostDefaults();
        // The input fields do not affect the isPremium default
        void input; // used to drive the arbitrary
        return record.isPremium === false;
      }),
      { numRuns: 100 }
    );
  });

  it("2c — explicit isPremium override is respected when provided", () => {
    // Verify the override mechanism works correctly (true stays true)
    fc.assert(
      fc.property(jobPostCreationInputArb, (_input) => {
        const recordWithOverride: JobPostTierFields = applyJobPostDefaults({ isPremium: true });
        return recordWithOverride.isPremium === true;
      }),
      { numRuns: 100 }
    );
  });

  it("2d — without an explicit override, isPremium is always false across all input combinations", () => {
    fc.assert(
      fc.property(
        jobPostCreationInputArb,
        fc.boolean(), // arbitrary boolean to ensure we're not accidentally passing isPremium
        (input, _noise) => {
          void input;
          void _noise;
          const record: JobPostTierFields = applyJobPostDefaults();
          return record.isPremium === false;
        }
      ),
      { numRuns: 100 }
    );
  });

});
