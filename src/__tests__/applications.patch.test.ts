/**
 * Unit tests for PATCH /api/applications/[id] and recalculateRecruiterMetrics.
 * Requirements: 5.2, 5.3, 5.6, 9.2, 9.3, 9.7
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("@/lib/prisma", () => ({
  prisma: {
    application: {
      findUnique: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
    },
    notification: {
      create: vi.fn(),
    },
    user: {
      update: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/recruiterMetrics", () => ({
  recalculateRecruiterMetrics: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { recalculateRecruiterMetrics } from "@/lib/recruiterMetrics";
import { PATCH } from "@/app/api/applications/[id]/route";

// ---------------------------------------------------------------------------
// Typed mock helpers
// ---------------------------------------------------------------------------

const mockAuth = auth as ReturnType<typeof vi.fn>;
const mockApplicationFindUnique = prisma.application.findUnique as ReturnType<typeof vi.fn>;
const mockTransaction = prisma.$transaction as ReturnType<typeof vi.fn>;
const mockRecalculate = recalculateRecruiterMetrics as ReturnType<typeof vi.fn>;

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const RECRUITER_SESSION = {
  user: { id: "recruiter-1", role: "RECRUITER" as const },
  expires: "",
};

const BASE_APPLICATION = {
  id: "app-1",
  stage: "APPLIED",
  firstSeenAt: null,
  firstActionAt: null,
  applicantId: "applicant-1",
  jobPost: {
    id: "job-1",
    title: "Senior Engineer",
    recruiterId: "recruiter-1",
  },
};

function makePatchRequest(id: string, body: unknown) {
  return new NextRequest(`http://localhost/api/applications/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ---------------------------------------------------------------------------
// Auth / ownership guards
// ---------------------------------------------------------------------------

describe("PATCH /api/applications/[id] — auth guards", () => {
  beforeEach(() => vi.clearAllMocks());

  it("unauthenticated → 401", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await PATCH(makePatchRequest("app-1", { stage: "SHORTLISTED" }), {
      params: { id: "app-1" },
    });
    expect(res.status).toBe(401);
  });

  it("non-RECRUITER role → 403", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-1", role: "APPLICANT" },
      expires: "",
    });
    const res = await PATCH(makePatchRequest("app-1", { stage: "SHORTLISTED" }), {
      params: { id: "app-1" },
    });
    expect(res.status).toBe(403);
  });

  it("application not found → 404", async () => {
    mockAuth.mockResolvedValue(RECRUITER_SESSION);
    mockApplicationFindUnique.mockResolvedValue(null);
    const res = await PATCH(makePatchRequest("ghost", { stage: "SHORTLISTED" }), {
      params: { id: "ghost" },
    });
    expect(res.status).toBe(404);
  });

  it("recruiter does not own the job post → 403", async () => {
    mockAuth.mockResolvedValue(RECRUITER_SESSION);
    mockApplicationFindUnique.mockResolvedValue({
      ...BASE_APPLICATION,
      jobPost: { ...BASE_APPLICATION.jobPost, recruiterId: "other-recruiter" },
    });
    const res = await PATCH(makePatchRequest("app-1", { stage: "SHORTLISTED" }), {
      params: { id: "app-1" },
    });
    expect(res.status).toBe(403);
  });
});

// ---------------------------------------------------------------------------
// Input validation
// ---------------------------------------------------------------------------

describe("PATCH /api/applications/[id] — input validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue(RECRUITER_SESSION);
    mockApplicationFindUnique.mockResolvedValue(BASE_APPLICATION);
  });

  it("missing stage → 400", async () => {
    const res = await PATCH(makePatchRequest("app-1", {}), {
      params: { id: "app-1" },
    });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/stage/i);
  });

  it("REJECTED stage → 400 (use separate endpoint)", async () => {
    const res = await PATCH(makePatchRequest("app-1", { stage: "REJECTED" }), {
      params: { id: "app-1" },
    });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/reject/i);
  });

  it("APPLIED stage → 400 (not an allowed advancement)", async () => {
    const res = await PATCH(makePatchRequest("app-1", { stage: "APPLIED" }), {
      params: { id: "app-1" },
    });
    expect(res.status).toBe(400);
  });

  it("invalid stage value → 400", async () => {
    const res = await PATCH(makePatchRequest("app-1", { stage: "HIRED" }), {
      params: { id: "app-1" },
    });
    expect(res.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// Auto-SEEN logic (Requirement 5.2)
// ---------------------------------------------------------------------------

describe("PATCH /api/applications/[id] — auto-SEEN on first view (Req 5.2)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue(RECRUITER_SESSION);
    mockRecalculate.mockResolvedValue(undefined);
  });

  it("APPLIED + firstSeenAt=null → sets firstSeenAt and firstActionAt", async () => {
    mockApplicationFindUnique.mockResolvedValue(BASE_APPLICATION);

    let capturedData: Record<string, unknown> = {};
    mockTransaction.mockImplementation(async (fn: (tx: typeof prisma) => Promise<unknown>) => {
      const fakeTx = {
        application: {
          update: vi.fn().mockImplementation(({ data }: { data: Record<string, unknown> }) => {
            capturedData = data;
            return { ...BASE_APPLICATION, ...data };
          }),
        },
        notification: { create: vi.fn() },
      };
      return fn(fakeTx as unknown as typeof prisma);
    });

    const res = await PATCH(makePatchRequest("app-1", { stage: "SHORTLISTED" }), {
      params: { id: "app-1" },
    });

    expect(res.status).toBe(200);
    expect(capturedData.firstSeenAt).toBeInstanceOf(Date);
    expect(capturedData.firstActionAt).toBeInstanceOf(Date);
  });

  it("already SEEN (firstSeenAt set) → does not overwrite firstSeenAt", async () => {
    const seenAt = new Date("2024-01-01T10:00:00Z");
    mockApplicationFindUnique.mockResolvedValue({
      ...BASE_APPLICATION,
      stage: "SEEN",
      firstSeenAt: seenAt,
      firstActionAt: seenAt,
    });

    let capturedData: Record<string, unknown> = {};
    mockTransaction.mockImplementation(async (fn: (tx: typeof prisma) => Promise<unknown>) => {
      const fakeTx = {
        application: {
          update: vi.fn().mockImplementation(({ data }: { data: Record<string, unknown> }) => {
            capturedData = data;
            return { ...BASE_APPLICATION, ...data };
          }),
        },
        notification: { create: vi.fn() },
      };
      return fn(fakeTx as unknown as typeof prisma);
    });

    await PATCH(makePatchRequest("app-1", { stage: "SHORTLISTED" }), {
      params: { id: "app-1" },
    });

    expect(capturedData.firstSeenAt).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// INTERVIEW notification (Requirement 5.3)
// ---------------------------------------------------------------------------

describe("PATCH /api/applications/[id] — INTERVIEW notification (Req 5.3)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue(RECRUITER_SESSION);
    mockRecalculate.mockResolvedValue(undefined);
  });

  it("advancing to INTERVIEW creates a notification for the applicant", async () => {
    mockApplicationFindUnique.mockResolvedValue({
      ...BASE_APPLICATION,
      stage: "SHORTLISTED",
      firstSeenAt: new Date(),
      firstActionAt: new Date(),
    });

    const notificationCreate = vi.fn().mockResolvedValue({});
    mockTransaction.mockImplementation(async (fn: (tx: typeof prisma) => Promise<unknown>) => {
      const fakeTx = {
        application: {
          update: vi.fn().mockResolvedValue({ id: "app-1", stage: "INTERVIEW" }),
        },
        notification: { create: notificationCreate },
      };
      return fn(fakeTx as unknown as typeof prisma);
    });

    const res = await PATCH(makePatchRequest("app-1", { stage: "INTERVIEW" }), {
      params: { id: "app-1" },
    });

    expect(res.status).toBe(200);
    expect(notificationCreate).toHaveBeenCalledOnce();
    const notifArg = notificationCreate.mock.calls[0][0];
    expect(notifArg.data.userId).toBe("applicant-1");
    expect(notifArg.data.type).toBe("APPLICATION_STATUS_CHANGE");
    expect(notifArg.data.title).toBe("Interview Invitation");
    expect(notifArg.data.body).toContain("Senior Engineer");
  });

  it("advancing to SHORTLISTED does NOT create a notification", async () => {
    mockApplicationFindUnique.mockResolvedValue({
      ...BASE_APPLICATION,
      stage: "SEEN",
      firstSeenAt: new Date(),
      firstActionAt: new Date(),
    });

    const notificationCreate = vi.fn().mockResolvedValue({});
    mockTransaction.mockImplementation(async (fn: (tx: typeof prisma) => Promise<unknown>) => {
      const fakeTx = {
        application: {
          update: vi.fn().mockResolvedValue({ id: "app-1", stage: "SHORTLISTED" }),
        },
        notification: { create: notificationCreate },
      };
      return fn(fakeTx as unknown as typeof prisma);
    });

    await PATCH(makePatchRequest("app-1", { stage: "SHORTLISTED" }), {
      params: { id: "app-1" },
    });

    expect(notificationCreate).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Metrics recalculation (Requirements 5.6, 9.7)
// ---------------------------------------------------------------------------

describe("PATCH /api/applications/[id] — metrics recalculation (Req 5.6, 9.7)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue(RECRUITER_SESSION);
    mockRecalculate.mockResolvedValue(undefined);
  });

  it("calls recalculateRecruiterMetrics with the recruiter's id after every change", async () => {
    mockApplicationFindUnique.mockResolvedValue({
      ...BASE_APPLICATION,
      stage: "SEEN",
      firstSeenAt: new Date(),
      firstActionAt: new Date(),
    });

    mockTransaction.mockImplementation(async (fn: (tx: typeof prisma) => Promise<unknown>) => {
      const fakeTx = {
        application: {
          update: vi.fn().mockResolvedValue({ id: "app-1", stage: "SHORTLISTED" }),
        },
        notification: { create: vi.fn() },
      };
      return fn(fakeTx as unknown as typeof prisma);
    });

    await PATCH(makePatchRequest("app-1", { stage: "SHORTLISTED" }), {
      params: { id: "app-1" },
    });

    expect(mockRecalculate).toHaveBeenCalledOnce();
    expect(mockRecalculate).toHaveBeenCalledWith("recruiter-1");
  });
});


