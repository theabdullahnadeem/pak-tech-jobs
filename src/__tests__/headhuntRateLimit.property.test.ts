/**
 * Property-based tests for headhunt rate limiting.
 *
 * **Property 4: Rate limit invariant — a recruiter cannot have more than 20 accepted headhunt outreach threads created within any 24-hour window**
 * **Validates: Requirements 14.4**
 */

import { describe, it } from "vitest";
import * as fc from "fast-check";
import {
  countRecentOutreach,
  isRateLimitAllowed,
  type OutreachRecord,
} from "@/lib/headhuntRateLimit";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours in ms
const RATE_LIMIT = 20;
const now = new Date("2024-06-01T12:00:00Z");

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/** A record with sentAt strictly within the 24-hour window (exclusive of boundary) */
const withinWindowRecordArb: fc.Arbitrary<OutreachRecord> = fc
  .integer({ min: 1, max: WINDOW_MS - 1 })
  .map(offsetMs => ({ sentAt: new Date(now.getTime() - offsetMs) }));

/** A record with sentAt exactly at the window boundary (24h ago) */
const boundaryRecordArb: fc.Arbitrary<OutreachRecord> = fc.constant({
  sentAt: new Date(now.getTime() - WINDOW_MS),
});

/** A record with sentAt strictly older than 24 hours */
const outsideWindowRecordArb: fc.Arbitrary<OutreachRecord> = fc
  .integer({ min: 1, max: WINDOW_MS * 10 })
  .map(offsetMs => ({ sentAt: new Date(now.getTime() - WINDOW_MS - offsetMs) }));

/** A record with sentAt in the future (after now) — should not be counted */
const futureRecordArb: fc.Arbitrary<OutreachRecord> = fc
  .integer({ min: 1, max: WINDOW_MS })
  .map(offsetMs => ({ sentAt: new Date(now.getTime() + offsetMs) }));

/** Any record (inside, outside, boundary, or future) */
const anyRecordArb: fc.Arbitrary<OutreachRecord> = fc.oneof(
  withinWindowRecordArb,
  boundaryRecordArb,
  outsideWindowRecordArb,
  futureRecordArb
);

// ---------------------------------------------------------------------------
// Property 4a: if countRecentOutreach >= 20, isRateLimitAllowed returns false
// ---------------------------------------------------------------------------

describe("Property 4: Rate limit invariant (Requirements 14.4)", () => {

  it("4a — if countRecentOutreach >= 20, isRateLimitAllowed returns false", () => {
    fc.assert(
      fc.property(
        fc.array(withinWindowRecordArb, { minLength: RATE_LIMIT, maxLength: 50 }),
        (records) => {
          const count = countRecentOutreach(records, now);
          if (count >= RATE_LIMIT) {
            return isRateLimitAllowed(records, now) === false;
          }
          return true; // skip if count < 20 (shouldn't happen with minLength: 20 all-within-window)
        }
      ),
      { numRuns: 500 }
    );
  });

  // ---------------------------------------------------------------------------
  // Property 4b: if countRecentOutreach < 20, isRateLimitAllowed returns true
  // ---------------------------------------------------------------------------

  it("4b — if countRecentOutreach < 20, isRateLimitAllowed returns true", () => {
    fc.assert(
      fc.property(
        fc.array(withinWindowRecordArb, { minLength: 0, maxLength: RATE_LIMIT - 1 }),
        (records) => {
          const count = countRecentOutreach(records, now);
          if (count < RATE_LIMIT) {
            return isRateLimitAllowed(records, now) === true;
          }
          return true;
        }
      ),
      { numRuns: 500 }
    );
  });

  // ---------------------------------------------------------------------------
  // Property 4c: records older than 24 hours are not counted
  // ---------------------------------------------------------------------------

  it("4c — records older than 24 hours are not counted", () => {
    fc.assert(
      fc.property(
        fc.array(outsideWindowRecordArb, { minLength: 0, maxLength: 50 }),
        (oldRecords) => {
          return countRecentOutreach(oldRecords, now) === 0;
        }
      ),
      { numRuns: 500 }
    );
  });

  // ---------------------------------------------------------------------------
  // Property 4d: records exactly at the window boundary (24h ago) are counted
  // ---------------------------------------------------------------------------

  it("4d — records exactly at the window boundary (24h ago) are counted", () => {
    fc.assert(
      fc.property(
        fc.array(boundaryRecordArb, { minLength: 1, maxLength: 10 }),
        (boundaryRecords) => {
          return countRecentOutreach(boundaryRecords, now) === boundaryRecords.length;
        }
      ),
      { numRuns: 200 }
    );
  });

  // ---------------------------------------------------------------------------
  // Property 4e: adding a record within the window increases the count by exactly 1
  // ---------------------------------------------------------------------------

  it("4e — adding a record within the window increases the count by exactly 1", () => {
    fc.assert(
      fc.property(
        fc.array(anyRecordArb, { minLength: 0, maxLength: 30 }),
        withinWindowRecordArb,
        (records, newRecord) => {
          const before = countRecentOutreach(records, now);
          const after = countRecentOutreach([...records, newRecord], now);
          return after === before + 1;
        }
      ),
      { numRuns: 1000 }
    );
  });

  // ---------------------------------------------------------------------------
  // Property 4f: countRecentOutreach is always in [0, total records]
  // ---------------------------------------------------------------------------

  it("4f — countRecentOutreach is always in [0, total records]", () => {
    fc.assert(
      fc.property(
        fc.array(anyRecordArb, { minLength: 0, maxLength: 50 }),
        (records) => {
          const count = countRecentOutreach(records, now);
          return count >= 0 && count <= records.length;
        }
      ),
      { numRuns: 1000 }
    );
  });

});
