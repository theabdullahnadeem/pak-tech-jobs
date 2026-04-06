/**
 * Unit tests for recruiter suspension thresholds and badge logic.
 * Requirements: 6.4, 6.5, 9.4, 9.5, 9.6
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mocks (must be hoisted before imports that use them)
// ---------------------------------------------------------------------------

vi.mock("@/lib/prisma", () => ({
  prisma: {
    application: {
      findMany: vi.fn(),
    },
    user: {
      update: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import { getRecruiterBadge, shouldSuspend } from "@/lib/recruiterBadge";
import { prisma } from "@/lib/prisma";
import { recalculateRecruiterMetrics } from "@/lib/recruiterMetrics";

const mockFindMany = prisma.application.findMany as ReturnType<typeof vi.fn>;
const mockFindUnique = prisma.user.findUnique as ReturnType<typeof vi.fn>;
const mockUserUpdate = prisma.user.update as ReturnType<typeof vi.fn>;

// ---------------------------------------------------------------------------
// shouldSuspend — Requirement 6.5
// ---------------------------------------------------------------------------

describe("shouldSuspend (Req 6.5)", () => {
  it("responseRate = 0 → suspended (true)", () => {
    expect(shouldSuspend(0)).toBe(true);
  });

  it("responseRate = 49 → suspended (true)", () => {
    expect(shouldSuspend(49)).toBe(true);
  });

  it("responseRate = 49.9 → suspended (true)", () => {
    expect(shouldSuspend(49.9)).toBe(true);
  });

  it("responseRate = 50 → not suspended (false)", () => {
    expect(shouldSuspend(50)).toBe(false);
  });

  it("responseRate = 51 → not suspended (false)", () => {
    expect(shouldSuspend(51)).toBe(false);
  });

  it("responseRate = 100 → not suspended (false)", () => {
    expect(shouldSuspend(100)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getRecruiterBadge — Requirements 6.4, 9.4, 9.5, 9.6
// ---------------------------------------------------------------------------

describe("getRecruiterBadge (Req 6.4, 9.4, 9.5, 9.6)", () => {
  it("responseRate = 0 → 'Low Responsiveness'", () => {
    expect(getRecruiterBadge(0)).toBe("Low Responsiveness");
  });

  it("responseRate = 69 → 'Low Responsiveness'", () => {
    expect(getRecruiterBadge(69)).toBe("Low Responsiveness");
  });

  it("responseRate = 69.9 → 'Low Responsiveness'", () => {
    expect(getRecruiterBadge(69.9)).toBe("Low Responsiveness");
  });

  it("responseRate = 70 → 'Responsive'", () => {
    expect(getRecruiterBadge(70)).toBe("Responsive");
  });

  it("responseRate = 89 → 'Responsive'", () => {
    expect(getRecruiterBadge(89)).toBe("Responsive");
  });

  it("responseRate = 89.9 → 'Responsive'", () => {
    expect(getRecruiterBadge(89.9)).toBe("Responsive");
  });

  it("responseRate = 90 → 'Highly Responsive'", () => {
    expect(getRecruiterBadge(90)).toBe("Highly Responsive");
  });

  it("responseRate = 100 → 'Highly Responsive'", () => {
    expect(getRecruiterBadge(100)).toBe("Highly Responsive");
  });
});

// ---------------------------------------------------------------------------
// recalculateRecruiterMetrics — suspension integration (Requirement 6.5)
// ---------------------------------------------------------------------------

describe("recalculateRecruiterMetrics suspension integration (Req 6.5)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("responseRate drops below 50% → suspended set to true", async () => {
    const submittedAt = new Date("2024-01-01T00:00:00Z");
    // 1 responded out of 3 = 33% → below 50%
    mockFindMany.mockResolvedValue([
      { submittedAt, firstActionAt: new Date("2024-01-03T00:00:00Z") },
      { submittedAt, firstActionAt: null },
      { submittedAt, firstActionAt: null },
    ]);
    mockFindUnique.mockResolvedValue({ suspended: false });
    mockUserUpdate.mockResolvedValue({});

    await recalculateRecruiterMetrics("recruiter-1");

    const call = mockUserUpdate.mock.calls[0][0];
    expect(call.data.responseRate).toBe(33);
    expect(call.data.suspended).toBe(true);
  });

  it("responseRate recovers to >= 50% → suspended set to false", async () => {
    const submittedAt = new Date("2024-01-01T00:00:00Z");
    // 2 responded out of 3 = 67% → above 50%
    mockFindMany.mockResolvedValue([
      { submittedAt, firstActionAt: new Date("2024-01-03T00:00:00Z") },
      { submittedAt, firstActionAt: new Date("2024-01-04T00:00:00Z") },
      { submittedAt, firstActionAt: null },
    ]);
    mockFindUnique.mockResolvedValue({ suspended: true });
    mockUserUpdate.mockResolvedValue({});

    await recalculateRecruiterMetrics("recruiter-1");

    const call = mockUserUpdate.mock.calls[0][0];
    expect(call.data.responseRate).toBe(67);
    expect(call.data.suspended).toBe(false);
  });

  it("responseRate exactly 50% → not suspended", async () => {
    const submittedAt = new Date("2024-01-01T00:00:00Z");
    // 1 responded out of 2 = 50%
    mockFindMany.mockResolvedValue([
      { submittedAt, firstActionAt: new Date("2024-01-03T00:00:00Z") },
      { submittedAt, firstActionAt: null },
    ]);
    mockFindUnique.mockResolvedValue({ suspended: true });
    mockUserUpdate.mockResolvedValue({});

    await recalculateRecruiterMetrics("recruiter-1");

    const call = mockUserUpdate.mock.calls[0][0];
    expect(call.data.responseRate).toBe(50);
    expect(call.data.suspended).toBe(false);
  });
});
