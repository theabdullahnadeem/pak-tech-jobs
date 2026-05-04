/**
 * Property-based tests for enterprise dashboard display.
 *
 * **Feature: enterprise-tier, Property 11: Enterprise dashboard display**
 * For any set of employer records, the Enterprise tab in the admin dashboard
 * SHALL display exactly those employers whose `tier = ENTERPRISE`, and for
 * each such employer the rendered row SHALL include their name, company name,
 * `subscriptionExpiry`, `maxRecruiterSeats`, `accountManagerName`, and
 * `hasCvAccess` status.
 *
 * **Validates: Requirements 7.1, 7.2**
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  filterEnterpriseEmployers,
  type EmployerRecord,
  type EmployerTier,
} from "@/lib/enterpriseTier";

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

const tierArb = fc.constantFrom<EmployerTier>("FREE", "PRO", "ENTERPRISE");

const employerRecordArb: fc.Arbitrary<EmployerRecord> = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 50 }),
  companyName: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: null }),
  tier: tierArb,
  subscriptionExpiry: fc.option(
    fc.date({ min: new Date("2020-01-01"), max: new Date("2030-12-31") }),
    { nil: null }
  ),
  maxRecruiterSeats: fc.integer({ min: 1, max: 50 }),
  accountManagerName: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: null }),
  hasCvAccess: fc.boolean(),
});

const employerArrayArb = fc.array(employerRecordArb, { minLength: 0, maxLength: 30 });

// ---------------------------------------------------------------------------
// Property 11: Enterprise dashboard display
// ---------------------------------------------------------------------------

describe("Feature: enterprise-tier, Property 11: Enterprise dashboard display", () => {

  it("11a — filterEnterpriseEmployers returns only ENTERPRISE-tier employers", () => {
    fc.assert(
      fc.property(employerArrayArb, (employers) => {
        const result = filterEnterpriseEmployers(employers);
        return result.every((e) => e.tier === "ENTERPRISE");
      }),
      { numRuns: 100 }
    );
  });

  it("11b — filterEnterpriseEmployers includes all ENTERPRISE-tier employers from the input", () => {
    fc.assert(
      fc.property(employerArrayArb, (employers) => {
        const result = filterEnterpriseEmployers(employers);
        const enterpriseIds = new Set(result.map((e) => e.id));
        const inputEnterpriseIds = employers
          .filter((e) => e.tier === "ENTERPRISE")
          .map((e) => e.id);
        return inputEnterpriseIds.every((id) => enterpriseIds.has(id));
      }),
      { numRuns: 100 }
    );
  });

  it("11c — filterEnterpriseEmployers count equals the number of ENTERPRISE employers in input", () => {
    fc.assert(
      fc.property(employerArrayArb, (employers) => {
        const result = filterEnterpriseEmployers(employers);
        const expectedCount = employers.filter((e) => e.tier === "ENTERPRISE").length;
        return result.length === expectedCount;
      }),
      { numRuns: 100 }
    );
  });

  it("11d — each filtered employer record retains all required fields", () => {
    fc.assert(
      fc.property(employerArrayArb, (employers) => {
        const result = filterEnterpriseEmployers(employers);
        return result.every((e) => {
          return (
            typeof e.id === "string" &&
            typeof e.name === "string" &&
            (e.companyName === null || typeof e.companyName === "string") &&
            e.tier === "ENTERPRISE" &&
            (e.subscriptionExpiry === null ||
              e.subscriptionExpiry instanceof Date ||
              typeof e.subscriptionExpiry === "string") &&
            typeof e.maxRecruiterSeats === "number" &&
            (e.accountManagerName === null || typeof e.accountManagerName === "string") &&
            typeof e.hasCvAccess === "boolean"
          );
        });
      }),
      { numRuns: 100 }
    );
  });

  it("11e — filterEnterpriseEmployers does not mutate the input array", () => {
    fc.assert(
      fc.property(employerArrayArb, (employers) => {
        const copy = [...employers];
        filterEnterpriseEmployers(employers);
        return employers.length === copy.length &&
          employers.every((e, i) => e.id === copy[i].id);
      }),
      { numRuns: 100 }
    );
  });

  it("11f — empty input produces empty output", () => {
    const result = filterEnterpriseEmployers([]);
    expect(result).toEqual([]);
  });

  it("11g — all FREE employers are excluded", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.uuid(),
            name: fc.string({ minLength: 1, maxLength: 50 }),
            companyName: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: null }),
            tier: fc.constant("FREE" as EmployerTier),
            subscriptionExpiry: fc.constant(null),
            maxRecruiterSeats: fc.integer({ min: 1, max: 50 }),
            accountManagerName: fc.constant(null),
            hasCvAccess: fc.constant(false),
          }),
          { minLength: 1, maxLength: 20 }
        ),
        (freeEmployers) => {
          const result = filterEnterpriseEmployers(freeEmployers);
          return result.length === 0;
        }
      ),
      { numRuns: 100 }
    );
  });

  it("11h — all ENTERPRISE employers are included", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.uuid(),
            name: fc.string({ minLength: 1, maxLength: 50 }),
            companyName: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: null }),
            tier: fc.constant("ENTERPRISE" as EmployerTier),
            subscriptionExpiry: fc.option(
              fc.date({ min: new Date("2020-01-01"), max: new Date("2030-12-31") }),
              { nil: null }
            ),
            maxRecruiterSeats: fc.integer({ min: 1, max: 50 }),
            accountManagerName: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: null }),
            hasCvAccess: fc.boolean(),
          }),
          { minLength: 1, maxLength: 20 }
        ),
        (enterpriseEmployers) => {
          const result = filterEnterpriseEmployers(enterpriseEmployers);
          return result.length === enterpriseEmployers.length;
        }
      ),
      { numRuns: 100 }
    );
  });

  it("11i — example: mixed tiers returns only ENTERPRISE records", () => {
    const employers: EmployerRecord[] = [
      { id: "1", name: "Alice", companyName: "Acme", tier: "FREE", subscriptionExpiry: null, maxRecruiterSeats: 1, accountManagerName: null, hasCvAccess: false },
      { id: "2", name: "Bob", companyName: "BigCorp", tier: "ENTERPRISE", subscriptionExpiry: new Date("2025-12-31"), maxRecruiterSeats: 10, accountManagerName: "Ali Hassan", hasCvAccess: true },
      { id: "3", name: "Carol", companyName: "StartupX", tier: "PRO", subscriptionExpiry: null, maxRecruiterSeats: 3, accountManagerName: null, hasCvAccess: false },
      { id: "4", name: "Dave", companyName: "MegaInc", tier: "ENTERPRISE", subscriptionExpiry: new Date("2026-06-30"), maxRecruiterSeats: 20, accountManagerName: "Sara Khan", hasCvAccess: true },
    ];
    const result = filterEnterpriseEmployers(employers);
    expect(result).toHaveLength(2);
    expect(result.map(e => e.id)).toEqual(["2", "4"]);
    expect(result.every(e => e.tier === "ENTERPRISE")).toBe(true);
  });

});
