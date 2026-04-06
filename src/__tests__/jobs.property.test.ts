/**
 * Property-based tests for job post search and filter logic.
 *
 * **Property 1: Filter correctness — any job returned by a filter query satisfies all active filter predicates**
 * **Validates: Requirements 3.3, 3.4**
 */

import { describe, it } from "vitest";
import * as fc from "fast-check";
import { matchesFilters, type JobRecord, type JobFilterParams } from "@/lib/jobFilters";

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

const jobTypeValues = ["FULL_TIME", "REMOTE", "CONTRACT", "INTERNSHIP", "PART_TIME"] as const;
const experienceLevelValues = ["JUNIOR", "MID", "SENIOR", "LEAD"] as const;

/** Generates a non-empty lowercase word (safe for keyword matching) */
const wordArb = fc.stringMatching(/^[a-z]{3,10}$/);

/** Generates a valid JobRecord */
const jobArb: fc.Arbitrary<JobRecord> = fc.record({
  title: fc.string({ minLength: 1, maxLength: 80 }),
  description: fc.string({ minLength: 1, maxLength: 200 }),
  skills: fc.array(wordArb, { minLength: 1, maxLength: 5 }),
  city: fc.string({ minLength: 1, maxLength: 40 }),
  jobType: fc.constantFrom(...jobTypeValues),
  experienceLevel: fc.constantFrom(...experienceLevelValues),
  salaryMin: fc.integer({ min: 0, max: 500_000 }),
  salaryMax: fc.integer({ min: 0, max: 500_000 }).map((v, ctx) => v), // adjusted below
  category: fc.array(wordArb, { minLength: 1, maxLength: 3 }),
  isActive: fc.boolean(),
  isClosed: fc.boolean(),
  recruiterResponseRate: fc.float({ min: 0, max: 100, noNaN: true }),
}).map(job => ({
  ...job,
  // Ensure salaryMax >= salaryMin
  salaryMax: job.salaryMin + Math.abs(job.salaryMax - job.salaryMin),
}));

/** Generates a JobRecord that is always active and open */
const activeJobArb: fc.Arbitrary<JobRecord> = jobArb.map(job => ({
  ...job,
  isActive: true,
  isClosed: false,
}));

/** Generates filter params (all fields optional) */
const filtersArb: fc.Arbitrary<JobFilterParams> = fc.record({
  q: fc.option(wordArb, { nil: undefined }),
  category: fc.option(wordArb, { nil: undefined }),
  city: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: undefined }),
  jobType: fc.option(fc.constantFrom(...jobTypeValues), { nil: undefined }),
  experienceLevel: fc.option(fc.constantFrom(...experienceLevelValues), { nil: undefined }),
  salaryMin: fc.option(fc.integer({ min: 0, max: 500_000 }), { nil: undefined }),
  salaryMax: fc.option(fc.integer({ min: 0, max: 500_000 }), { nil: undefined }),
  responseRate: fc.option(fc.float({ min: 0, max: 100, noNaN: true }), { nil: undefined }),
});

// ---------------------------------------------------------------------------
// Property 1: Filter correctness
// ---------------------------------------------------------------------------

describe("Property 1: Filter correctness (Requirements 3.3, 3.4)", () => {

  it("1a — if matchesFilters returns true, job must be active and not closed", () => {
    fc.assert(
      fc.property(jobArb, filtersArb, (job, filters) => {
        if (matchesFilters(job, filters)) {
          return job.isActive === true && job.isClosed === false;
        }
        return true; // vacuously true when filter rejects
      }),
      { numRuns: 1000 }
    );
  });

  it("1b — if keyword filter is active and job passes, keyword appears in title, description, or skills", () => {
    fc.assert(
      fc.property(activeJobArb, filtersArb, (job, filters) => {
        if (!filters.q) return true; // no keyword filter active
        if (matchesFilters(job, filters)) {
          const q = filters.q.toLowerCase();
          const inTitle = job.title.toLowerCase().includes(q);
          const inDesc = job.description.toLowerCase().includes(q);
          const inSkills = job.skills.some(s => s.toLowerCase() === q);
          return inTitle || inDesc || inSkills;
        }
        return true;
      }),
      { numRuns: 1000 }
    );
  });

  it("1c — if category filter is active and job passes, job.category includes the filter value", () => {
    fc.assert(
      fc.property(activeJobArb, filtersArb, (job, filters) => {
        if (!filters.category) return true;
        if (matchesFilters(job, filters)) {
          return job.category.includes(filters.category);
        }
        return true;
      }),
      { numRuns: 1000 }
    );
  });

  it("1d — if city filter is active and job passes, job.city contains the filter value (case-insensitive)", () => {
    fc.assert(
      fc.property(activeJobArb, filtersArb, (job, filters) => {
        if (!filters.city) return true;
        if (matchesFilters(job, filters)) {
          return job.city.toLowerCase().includes(filters.city.toLowerCase());
        }
        return true;
      }),
      { numRuns: 1000 }
    );
  });

  it("1e — if jobType filter is active and job passes, job.jobType equals the filter value", () => {
    fc.assert(
      fc.property(activeJobArb, filtersArb, (job, filters) => {
        if (!filters.jobType) return true;
        if (matchesFilters(job, filters)) {
          return job.jobType === filters.jobType;
        }
        return true;
      }),
      { numRuns: 1000 }
    );
  });

  it("1f — if salaryMin filter is active and job passes, job.salaryMax >= salaryMin", () => {
    fc.assert(
      fc.property(activeJobArb, filtersArb, (job, filters) => {
        if (filters.salaryMin === undefined) return true;
        if (matchesFilters(job, filters)) {
          return job.salaryMax >= filters.salaryMin;
        }
        return true;
      }),
      { numRuns: 1000 }
    );
  });

  it("1g — if salaryMax filter is active and job passes, job.salaryMin <= salaryMax", () => {
    fc.assert(
      fc.property(activeJobArb, filtersArb, (job, filters) => {
        if (filters.salaryMax === undefined) return true;
        if (matchesFilters(job, filters)) {
          return job.salaryMin <= filters.salaryMax;
        }
        return true;
      }),
      { numRuns: 1000 }
    );
  });

  it("1h — if responseRate filter is active and job passes, recruiterResponseRate >= responseRate", () => {
    fc.assert(
      fc.property(activeJobArb, filtersArb, (job, filters) => {
        if (filters.responseRate === undefined) return true;
        if (matchesFilters(job, filters)) {
          return job.recruiterResponseRate >= filters.responseRate;
        }
        return true;
      }),
      { numRuns: 1000 }
    );
  });

});
