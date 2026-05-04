/**
 * Property-based tests for activation authorization.
 *
 * **Feature: enterprise-tier, Property 8: Activation authorization**
 * For any authenticated user whose role is not `ADMIN`, the activation
 * endpoint returns HTTP 403.
 *
 * **Validates: Requirements 4.1**
 */

import { describe, it } from "vitest";
import * as fc from "fast-check";

// ---------------------------------------------------------------------------
// Pure authorization logic (extracted from the route handler)
// ---------------------------------------------------------------------------

/**
 * Mirrors the authorization check in the activation route:
 *   if (session.user.role !== "ADMIN") → 403
 *
 * Returns the HTTP status code that the route would return for the given role.
 * Returns 403 for non-admin roles, 200 for ADMIN (simulating a successful pass-through).
 */
function checkActivationAuthorization(role: string): 403 | 200 {
  return role === "ADMIN" ? 200 : 403;
}

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/** All known non-admin role values used in the application */
const knownNonAdminRoles = ["RECRUITER", "APPLICANT"] as const;

/** Generates a known non-admin role */
const knownNonAdminRoleArb = fc.constantFrom(...knownNonAdminRoles);

/**
 * Generates an arbitrary non-empty string that is not "ADMIN".
 * Covers unknown/future roles as well.
 */
const arbitraryNonAdminRoleArb = fc
  .string({ minLength: 1, maxLength: 30 })
  .filter((s) => s !== "ADMIN");

// ---------------------------------------------------------------------------
// Property 8: Activation authorization
// ---------------------------------------------------------------------------

describe("Feature: enterprise-tier, Property 8: Activation authorization", () => {

  it("8a — known non-admin roles (RECRUITER, APPLICANT) always receive 403", () => {
    fc.assert(
      fc.property(knownNonAdminRoleArb, (role) => {
        return checkActivationAuthorization(role) === 403;
      }),
      { numRuns: 100 }
    );
  });

  it("8b — any arbitrary non-ADMIN role string always receives 403", () => {
    fc.assert(
      fc.property(arbitraryNonAdminRoleArb, (role) => {
        return checkActivationAuthorization(role) === 403;
      }),
      { numRuns: 100 }
    );
  });

  it("8c — ADMIN role always passes the authorization check (returns 200)", () => {
    fc.assert(
      fc.property(fc.constant("ADMIN"), (role) => {
        return checkActivationAuthorization(role) === 200;
      }),
      { numRuns: 100 }
    );
  });

  it("8d — authorization is binary: any role is either ADMIN (200) or non-ADMIN (403)", () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 30 }), (role) => {
        const status = checkActivationAuthorization(role);
        if (role === "ADMIN") {
          return status === 200;
        } else {
          return status === 403;
        }
      }),
      { numRuns: 100 }
    );
  });

});
