/**
 * Unit tests for recalculateRecruiterMetrics.
 * Requirements: 9.2, 9.3, 9.7
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mocks
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

import { prisma } from "@/lib/prisma";
import { recalculateRecruiterMetrics } from "@/lib/recruiterMetrics";

const mockFindMany = prisma.application.findMany as ReturnType<typeof vi.fn>;
const mockFindUnique = prisma.user.findUnique as ReturnType<typeof vi.fn>;
const mockUserUpdate = prisma.user.update as ReturnType<typeof vi.fn>;

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("recalculateRecruiterMetrics (Req 9.2, 9.3, 9.7)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("no applications → responseRate=100, avgResponseTimeHours=null, suspended=false", async () => {
    mockFindMany.mockResolvedValue([]);
    mockUserUpdate.mockResolvedValue({});

    await recalculateRecruiterMetrics("recruiter-1");

    expect(mockUserUpdate).toHaveBeenCalledWith({
      where: { id: "recruiter-1" },
      data: { responseRate: 100, avgResponseTimeHours: null, suspended: false },
    });
  });

  it("all responded within 14 days → responseRate=100", async () => {
    const submittedAt = new Date("2024-01-01T00:00:00Z");
    const firstActionAt = new Date("2024-01-05T00:00:00Z"); // 4 days later
    mockFindMany.mockResolvedValue([
      { submittedAt, firstActionAt },
      { submittedAt, firstActionAt },
    ]);
    mockFindUnique.mockResolvedValue({ suspended: false });
    mockUserUpdate.mockResolvedValue({});

    await recalculateRecruiterMetrics("recruiter-1");

    const call = mockUserUpdate.mock.calls[0][0];
    expect(call.data.responseRate).toBe(100);
  });

  it("none responded → responseRate=0, avgResponseTimeHours=null", async () => {
    const submittedAt = new Date("2024-01-01T00:00:00Z");
    mockFindMany.mockResolvedValue([
      { submittedAt, firstActionAt: null },
      { submittedAt, firstActionAt: null },
    ]);
    mockFindUnique.mockResolvedValue({ suspended: false });
    mockUserUpdate.mockResolvedValue({});

    await recalculateRecruiterMetrics("recruiter-1");

    const call = mockUserUpdate.mock.calls[0][0];
    expect(call.data.responseRate).toBe(0);
    expect(call.data.avgResponseTimeHours).toBeNull();
  });

  it("response after 14 days does not count toward responseRate (Req 9.2)", async () => {
    const submittedAt = new Date("2024-01-01T00:00:00Z");
    const lateAction = new Date("2024-01-16T00:00:00Z"); // 15 days later
    mockFindMany.mockResolvedValue([{ submittedAt, firstActionAt: lateAction }]);
    mockFindUnique.mockResolvedValue({ suspended: false });
    mockUserUpdate.mockResolvedValue({});

    await recalculateRecruiterMetrics("recruiter-1");

    const call = mockUserUpdate.mock.calls[0][0];
    expect(call.data.responseRate).toBe(0);
    // avgResponseTimeHours still computed since firstActionAt exists
    expect(call.data.avgResponseTimeHours).toBeGreaterThan(0);
  });

  it("calculates avgResponseTimeHours correctly (Req 9.3)", async () => {
    const submittedAt = new Date("2024-01-01T00:00:00Z");
    const firstActionAt = new Date("2024-01-02T00:00:00Z"); // exactly 24 hours later
    mockFindMany.mockResolvedValue([{ submittedAt, firstActionAt }]);
    mockFindUnique.mockResolvedValue({ suspended: false });
    mockUserUpdate.mockResolvedValue({});

    await recalculateRecruiterMetrics("recruiter-1");

    const call = mockUserUpdate.mock.calls[0][0];
    expect(call.data.avgResponseTimeHours).toBeCloseTo(24, 5);
  });

  it("responseRate rounds to nearest whole number (Req 9.2)", async () => {
    const submittedAt = new Date("2024-01-01T00:00:00Z");
    const quickAction = new Date("2024-01-02T00:00:00Z");
    // 2 responded out of 3 = 66.67% → rounds to 67
    mockFindMany.mockResolvedValue([
      { submittedAt, firstActionAt: quickAction },
      { submittedAt, firstActionAt: quickAction },
      { submittedAt, firstActionAt: null },
    ]);
    mockFindUnique.mockResolvedValue({ suspended: false });
    mockUserUpdate.mockResolvedValue({});

    await recalculateRecruiterMetrics("recruiter-1");

    const call = mockUserUpdate.mock.calls[0][0];
    expect(call.data.responseRate).toBe(67);
  });

  it("mixed: some within 14 days, some not → correct responseRate", async () => {
    const submittedAt = new Date("2024-01-01T00:00:00Z");
    const withinSLA = new Date("2024-01-10T00:00:00Z"); // 9 days
    const outsideSLA = new Date("2024-01-20T00:00:00Z"); // 19 days
    mockFindMany.mockResolvedValue([
      { submittedAt, firstActionAt: withinSLA },
      { submittedAt, firstActionAt: withinSLA },
      { submittedAt, firstActionAt: outsideSLA },
      { submittedAt, firstActionAt: null },
    ]);
    mockFindUnique.mockResolvedValue({ suspended: false });
    mockUserUpdate.mockResolvedValue({});

    await recalculateRecruiterMetrics("recruiter-1");

    const call = mockUserUpdate.mock.calls[0][0];
    // 2 out of 4 responded within SLA = 50%
    expect(call.data.responseRate).toBe(50);
  });

  it("avgResponseTimeHours averages across all applications with firstActionAt", async () => {
    const submittedAt = new Date("2024-01-01T00:00:00Z");
    const action12h = new Date("2024-01-01T12:00:00Z"); // 12 hours
    const action36h = new Date("2024-01-02T12:00:00Z"); // 36 hours
    mockFindMany.mockResolvedValue([
      { submittedAt, firstActionAt: action12h },
      { submittedAt, firstActionAt: action36h },
      { submittedAt, firstActionAt: null }, // excluded from avg
    ]);
    mockFindUnique.mockResolvedValue({ suspended: false });
    mockUserUpdate.mockResolvedValue({});

    await recalculateRecruiterMetrics("recruiter-1");

    const call = mockUserUpdate.mock.calls[0][0];
    // avg of 12 and 36 = 24
    expect(call.data.avgResponseTimeHours).toBeCloseTo(24, 5);
  });

  it("queries applications scoped to the recruiter's job posts", async () => {
    mockFindMany.mockResolvedValue([]);
    mockUserUpdate.mockResolvedValue({});

    await recalculateRecruiterMetrics("recruiter-42");

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { jobPost: { recruiterId: "recruiter-42" } },
      })
    );
  });
});
