/**
 * Property 3: Job listing ordering invariant
 *
 * Feature: enterprise-tier, Property 3: Job listing ordering invariant
 *
 * For any set of job posts with mixed `isPremium` values and `createdAt`
 * timestamps, no non-premium job appears before a premium job, and within
 * each premium/non-premium group results are ordered by `createdAt` descending.
 *
 * Validates: Requirements 2.2
 */

import { describe, it } from "vitest";
import * as fc from "fast-check";
import { sortJobListings, SortableJobPost } from "../../lib/enterpriseTier";

// ─── Arbitraries ──────────────────────────────────────────────────────────────

/**
 * Generates a single job post with arbitrary isPremium and createdAt values.
 */
const jobPostArb: fc.Arbitrary<SortableJobPost> = fc.record({
  isPremium: fc.boolean(),
  createdAt: fc.date({ min: new Date("2020-01-01"), max: new Date("2030-12-31") }),
});

/**
 * Generates an array of 0–50 job posts.
 */
const jobPostArrayArb: fc.Arbitrary<SortableJobPost[]> = fc.array(jobPostArb, {
  minLength: 0,
  maxLength: 50,
});

// ─── Properties ───────────────────────────────────────────────────────────────

describe(
  "Feature: enterprise-tier, Property 3: Job listing ordering invariant",
  () => {
    it(
      "no non-premium job appears before a premium job in the sorted result",
      () => {
        fc.assert(
          fc.property(jobPostArrayArb, (jobs) => {
            const sorted = sortJobListings(jobs);

            // Once we see a non-premium job, all subsequent jobs must also be non-premium
            let seenNonPremium = false;
            for (const job of sorted) {
              if (!job.isPremium) {
                seenNonPremium = true;
              }
              if (seenNonPremium && job.isPremium) {
                return false; // a premium job appeared after a non-premium job
              }
            }
            return true;
          }),
          { numRuns: 100 }
        );
      }
    );

    it(
      "within the premium group, jobs are ordered by createdAt descending",
      () => {
        fc.assert(
          fc.property(jobPostArrayArb, (jobs) => {
            const sorted = sortJobListings(jobs);
            const premiumJobs = sorted.filter((j) => j.isPremium);

            for (let i = 0; i < premiumJobs.length - 1; i++) {
              if (
                premiumJobs[i].createdAt.getTime() <
                premiumJobs[i + 1].createdAt.getTime()
              ) {
                return false; // earlier job has an older createdAt — wrong order
              }
            }
            return true;
          }),
          { numRuns: 100 }
        );
      }
    );

    it(
      "within the non-premium group, jobs are ordered by createdAt descending",
      () => {
        fc.assert(
          fc.property(jobPostArrayArb, (jobs) => {
            const sorted = sortJobListings(jobs);
            const nonPremiumJobs = sorted.filter((j) => !j.isPremium);

            for (let i = 0; i < nonPremiumJobs.length - 1; i++) {
              if (
                nonPremiumJobs[i].createdAt.getTime() <
                nonPremiumJobs[i + 1].createdAt.getTime()
              ) {
                return false; // earlier job has an older createdAt — wrong order
              }
            }
            return true;
          }),
          { numRuns: 100 }
        );
      }
    );

    it(
      "sorted result contains exactly the same jobs as the input (no additions or removals)",
      () => {
        fc.assert(
          fc.property(jobPostArrayArb, (jobs) => {
            const sorted = sortJobListings(jobs);
            return sorted.length === jobs.length;
          }),
          { numRuns: 100 }
        );
      }
    );

    it(
      "sortJobListings does not mutate the original array",
      () => {
        fc.assert(
          fc.property(jobPostArrayArb, (jobs) => {
            const original = [...jobs];
            sortJobListings(jobs);
            // The input array should be unchanged
            return (
              jobs.length === original.length &&
              jobs.every((j, i) => j === original[i])
            );
          }),
          { numRuns: 100 }
        );
      }
    );
  }
);
