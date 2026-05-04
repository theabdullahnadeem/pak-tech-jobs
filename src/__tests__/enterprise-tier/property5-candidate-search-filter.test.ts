/**
 * Property-based tests for candidate search filter correctness.
 *
 * **Feature: enterprise-tier, Property 5: Candidate search filter correctness**
 * Every returned candidate satisfies the applied skill filter (case-insensitive)
 * and/or experience level filter (exact match). When only one filter is applied,
 * only that filter's constraint need hold.
 *
 * Tests the pure `filterCandidates` function from `src/lib/enterpriseTier.ts`.
 *
 * **Validates: Requirements 3.3, 3.4, 3.5**
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  filterCandidates,
  type CandidateSearchResult,
} from "@/lib/enterpriseTier";

// ─── Arbitraries ──────────────────────────────────────────────────────────────

const experienceLevelArb = fc.constantFrom(
  "JUNIOR",
  "MID",
  "SENIOR",
  "LEAD"
) as fc.Arbitrary<string>;

/** Generates a realistic skill name (alphanumeric, no spaces). */
const skillNameArb: fc.Arbitrary<string> = fc.string({
  minLength: 2,
  maxLength: 12,
}).filter((s) => /^[a-zA-Z0-9]+$/.test(s));

/** Generates a candidate with random skills and experience level. */
const candidateArb: fc.Arbitrary<CandidateSearchResult> = fc.record({
  id: fc.string({ minLength: 1, maxLength: 20 }),
  name: fc.string({ minLength: 1, maxLength: 40 }),
  skills: fc.array(skillNameArb, { minLength: 0, maxLength: 8 }),
  experienceLevel: fc.option(experienceLevelArb, { nil: null }),
  location: fc.option(fc.string({ minLength: 1, maxLength: 30 }), { nil: null }),
  bio: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: null }),
  portfolioUrl: fc.option(fc.string({ minLength: 1, maxLength: 60 }), { nil: null }),
  verifiedSkills: fc.array(skillNameArb, { minLength: 0, maxLength: 4 }),
});

/** Generates a pool of 0–30 candidates. */
const candidatePoolArb: fc.Arbitrary<CandidateSearchResult[]> = fc.array(
  candidateArb,
  { minLength: 0, maxLength: 30 }
);

// ─── Property 5: Candidate search filter correctness ─────────────────────────

describe(
  "Feature: enterprise-tier, Property 5: Candidate search filter correctness",
  () => {
    it(
      "5a — every returned candidate has ALL specified skills (case-insensitive) when skills filter is applied",
      () => {
        fc.assert(
          fc.property(
            candidatePoolArb,
            fc.array(skillNameArb, { minLength: 1, maxLength: 3 }),
            (candidates, filterSkills) => {
              const results = filterCandidates(candidates, {
                skills: filterSkills,
              });

              const normalizedFilter = filterSkills.map((s) => s.toLowerCase());

              return results.every((candidate) => {
                const candidateSkillsLower = candidate.skills.map((s) =>
                  s.toLowerCase()
                );
                return normalizedFilter.every((skill) =>
                  candidateSkillsLower.includes(skill)
                );
              });
            }
          ),
          { numRuns: 100 }
        );
      }
    );

    it(
      "5b — every returned candidate has the specified experienceLevel when experience filter is applied",
      () => {
        fc.assert(
          fc.property(
            candidatePoolArb,
            experienceLevelArb,
            (candidates, experienceLevel) => {
              const results = filterCandidates(candidates, { experienceLevel });

              return results.every(
                (candidate) => candidate.experienceLevel === experienceLevel
              );
            }
          ),
          { numRuns: 100 }
        );
      }
    );

    it(
      "5c — every returned candidate satisfies BOTH filters when both are applied",
      () => {
        fc.assert(
          fc.property(
            candidatePoolArb,
            fc.array(skillNameArb, { minLength: 1, maxLength: 3 }),
            experienceLevelArb,
            (candidates, filterSkills, experienceLevel) => {
              const results = filterCandidates(candidates, {
                skills: filterSkills,
                experienceLevel,
              });

              const normalizedFilter = filterSkills.map((s) => s.toLowerCase());

              return results.every((candidate) => {
                const candidateSkillsLower = candidate.skills.map((s) =>
                  s.toLowerCase()
                );
                const hasAllSkills = normalizedFilter.every((skill) =>
                  candidateSkillsLower.includes(skill)
                );
                const hasLevel = candidate.experienceLevel === experienceLevel;
                return hasAllSkills && hasLevel;
              });
            }
          ),
          { numRuns: 100 }
        );
      }
    );

    it(
      "5d — no filters applied returns all candidates unchanged",
      () => {
        fc.assert(
          fc.property(candidatePoolArb, (candidates) => {
            const results = filterCandidates(candidates, {});
            return results.length === candidates.length;
          }),
          { numRuns: 100 }
        );
      }
    );

    it(
      "5e — empty skills array is treated as no skills filter (returns all candidates)",
      () => {
        fc.assert(
          fc.property(candidatePoolArb, (candidates) => {
            const results = filterCandidates(candidates, { skills: [] });
            return results.length === candidates.length;
          }),
          { numRuns: 100 }
        );
      }
    );

    it(
      "5f — filterCandidates does not mutate the input array",
      () => {
        fc.assert(
          fc.property(
            candidatePoolArb,
            fc.array(skillNameArb, { minLength: 0, maxLength: 3 }),
            (candidates, filterSkills) => {
              const original = [...candidates];
              filterCandidates(candidates, { skills: filterSkills });
              return (
                candidates.length === original.length &&
                candidates.every((c, i) => c === original[i])
              );
            }
          ),
          { numRuns: 100 }
        );
      }
    );

    it(
      "5g — skill matching is case-insensitive (uppercase filter matches lowercase skill)",
      () => {
        const candidate: CandidateSearchResult = {
          id: "1",
          name: "Alice",
          skills: ["react", "typescript"],
          experienceLevel: "SENIOR",
          location: null,
          bio: null,
          portfolioUrl: null,
          verifiedSkills: [],
        };

        // Filter with uppercase — should still match
        const results = filterCandidates([candidate], {
          skills: ["REACT", "TYPESCRIPT"],
        });
        expect(results).toHaveLength(1);
      }
    );

    it(
      "5h — skill matching is case-insensitive (mixed-case filter matches stored skill)",
      () => {
        const candidate: CandidateSearchResult = {
          id: "2",
          name: "Bob",
          skills: ["React", "TypeScript"],
          experienceLevel: "MID",
          location: null,
          bio: null,
          portfolioUrl: null,
          verifiedSkills: [],
        };

        const results = filterCandidates([candidate], {
          skills: ["react", "typescript"],
        });
        expect(results).toHaveLength(1);
      }
    );

    it(
      "5i — candidate missing one required skill is excluded",
      () => {
        const candidate: CandidateSearchResult = {
          id: "3",
          name: "Carol",
          skills: ["react"],
          experienceLevel: "JUNIOR",
          location: null,
          bio: null,
          portfolioUrl: null,
          verifiedSkills: [],
        };

        const results = filterCandidates([candidate], {
          skills: ["react", "typescript"],
        });
        expect(results).toHaveLength(0);
      }
    );

    it(
      "5j — candidate with wrong experienceLevel is excluded",
      () => {
        const candidate: CandidateSearchResult = {
          id: "4",
          name: "Dave",
          skills: ["python"],
          experienceLevel: "JUNIOR",
          location: null,
          bio: null,
          portfolioUrl: null,
          verifiedSkills: [],
        };

        const results = filterCandidates([candidate], {
          experienceLevel: "SENIOR",
        });
        expect(results).toHaveLength(0);
      }
    );

    it(
      "5k — candidate with null experienceLevel is excluded when experience filter is applied",
      () => {
        const candidate: CandidateSearchResult = {
          id: "5",
          name: "Eve",
          skills: ["go"],
          experienceLevel: null,
          location: null,
          bio: null,
          portfolioUrl: null,
          verifiedSkills: [],
        };

        const results = filterCandidates([candidate], {
          experienceLevel: "MID",
        });
        expect(results).toHaveLength(0);
      }
    );
  }
);
