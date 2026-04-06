/**
 * Unit tests for application submission constraints
 * Requirements: 4.2, 4.5, 5.4
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("@/lib/prisma", () => ({
  prisma: {
    application: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    jobPost: {
      findUnique: vi.fn(),
    },
    notification: {
      create: vi.fn(),
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
import { POST } from "@/app/api/applications/route";
import { PATCH } from "@/app/api/applications/[id]/reject/route";

// ---------------------------------------------------------------------------
// Typed mock helpers
// ---------------------------------------------------------------------------

const mockAuth = auth as ReturnType<typeof vi.fn>;
const mockJobPostFindUnique = prisma.jobPost.findUnique as ReturnType<typeof vi.fn>;
const mockApplicationFindUnique = prisma.application.findUnique as ReturnType<typeof vi.fn>;
const mockTransaction = prisma.$transaction as ReturnType<typeof vi.fn>;

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const APPLICANT_SESSION = {
  user: { id: "applicant-1", role: "APPLICANT" as const },
  expires: "",
};

const RECRUITER_SESSION = {
  user: { id: "recruiter-1", role: "RECRUITER" as const },
  expires: "",
};

const ACTIVE_JOB = {
  id: "job-1",
  isActive: true,
  isClosed: false,
  recruiter: { id: "recruiter-1", avgResponseTimeHours: 24 },
};

const BASE_APPLICATION = {
  id: "app-1",
  stage: "APPLIED",
  firstActionAt: null,
  applicantId: "applicant-1",
  jobPost: {
    id: "job-1",
    title: "Senior Engineer",
    recruiterId: "recruiter-1",
  },
};

function makePostRequest(body: unknown) {
  return new NextRequest("http://localhost/api/applications", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function makePatchRejectRequest(id: string, body: unknown) {
  return new NextRequest(`http://localhost/api/applications/${id}/reject`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ---------------------------------------------------------------------------
// POST /api/applications — auth guards
// ---------------------------------------------------------------------------

describe("POST /api/applications — auth guards", () => {
  beforeEach(() => vi.clearAllMocks());

  it("unauthenticated → 401", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await POST(makePostRequest({ jobPostId: "job-1" }));
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toMatch(/unauthorized/i);
  });

  it("non-APPLICANT role (RECRUITER) → 403", async () => {
    mockAuth.mockResolvedValue(RECRUITER_SESSION);
    const res = await POST(makePostRequest({ jobPostId: "job-1" }));
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toMatch(/applicant/i);
  });
});

// ---------------------------------------------------------------------------
// POST /api/applications — job post validation (Requirement 4.5)
// ---------------------------------------------------------------------------

describe("POST /api/applications — job post validation (Req 4.5)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue(APPLICANT_SESSION);
  });

  it("job not found → 404", async () => {
    mockJobPostFindUnique.mockResolvedValue(null);
    const res = await POST(makePostRequest({ jobPostId: "nonexistent" }));
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toMatch(/not found/i);
  });

  it("inactive job (isActive=false) → 400 with inactive message (Req 4.5)", async () => {
    mockJobPostFindUnique.mockResolvedValue({
      ...ACTIVE_JOB,
      isActive: false,
    });
    const res = await POST(makePostRequest({ jobPostId: "job-1" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/inactive/i);
  });

  it("closed job (isClosed=true) → 400 with closed message (Req 4.5)", async () => {
    mockJobPostFindUnique.mockResolvedValue({
      ...ACTIVE_JOB,
      isClosed: true,
    });
    const res = await POST(makePostRequest({ jobPostId: "job-1" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/closed/i);
  });
});

// ---------------------------------------------------------------------------
// POST /api/applications — duplicate application constraint (Requirement 4.2)
// ---------------------------------------------------------------------------

describe("POST /api/applications — duplicate application constraint (Req 4.2)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue(APPLICANT_SESSION);
    mockJobPostFindUnique.mockResolvedValue(ACTIVE_JOB);
  });

  it("duplicate application (same jobPostId + applicantId) → 409", async () => {
    mockApplicationFindUnique.mockResolvedValue({ id: "existing-app" });
    const res = await POST(makePostRequest({ jobPostId: "job-1" }));
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error).toMatch(/already applied/i);
  });
});

// ---------------------------------------------------------------------------
// POST /api/applications — valid submission
// ---------------------------------------------------------------------------

describe("POST /api/applications — valid submission", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue(APPLICANT_SESSION);
    mockJobPostFindUnique.mockResolvedValue(ACTIVE_JOB);
    mockApplicationFindUnique.mockResolvedValue(null);
  });

  it("valid submission → 201 with application data", async () => {
    const createdApp = { id: "new-app-1", jobPostId: "job-1", applicantId: "applicant-1", stage: "APPLIED" };
    mockTransaction.mockImplementation(async (fn: (tx: typeof prisma) => Promise<unknown>) => {
      const fakeTx = {
        application: {
          create: vi.fn().mockResolvedValue(createdApp),
        },
        notification: { create: vi.fn().mockResolvedValue({}) },
      };
      const result = await fn(fakeTx as unknown as typeof prisma);
      return result;
    });

    const res = await POST(makePostRequest({ jobPostId: "job-1" }));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.id).toBe("new-app-1");
    expect(body.stage).toBe("APPLIED");
  });
});

// ---------------------------------------------------------------------------
// PATCH /api/applications/[id]/reject — auth guards
// ---------------------------------------------------------------------------

describe("PATCH /api/applications/[id]/reject — auth guards", () => {
  beforeEach(() => vi.clearAllMocks());

  it("unauthenticated → 401", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await PATCH(
      makePatchRejectRequest("app-1", { rejectionReason: "ROLE_FILLED" }),
      { params: { id: "app-1" } }
    );
    expect(res.status).toBe(401);
  });
});

// ---------------------------------------------------------------------------
// PATCH /api/applications/[id]/reject — rejection reason validation (Req 5.4)
// ---------------------------------------------------------------------------

describe("PATCH /api/applications/[id]/reject — rejection reason validation (Req 5.4)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue(RECRUITER_SESSION);
    mockApplicationFindUnique.mockResolvedValue(BASE_APPLICATION);
  });

  it("missing rejectionReason → 400 (Req 5.4)", async () => {
    const res = await PATCH(
      makePatchRejectRequest("app-1", {}),
      { params: { id: "app-1" } }
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/rejectionReason/i);
  });

  it("invalid rejectionReason enum value → 400 (Req 5.4)", async () => {
    const res = await PATCH(
      makePatchRejectRequest("app-1", { rejectionReason: "NOT_A_VALID_REASON" }),
      { params: { id: "app-1" } }
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/rejectionReason must be one of/i);
  });

  it("valid rejection with reason → 200", async () => {
    const updatedApp = { ...BASE_APPLICATION, stage: "REJECTED", rejectionReason: "ROLE_FILLED" };
    mockTransaction.mockImplementation(async (fn: (tx: typeof prisma) => Promise<unknown>) => {
      const fakeTx = {
        application: {
          update: vi.fn().mockResolvedValue(updatedApp),
        },
        notification: { create: vi.fn().mockResolvedValue({}) },
      };
      return fn(fakeTx as unknown as typeof prisma);
    });

    const res = await PATCH(
      makePatchRejectRequest("app-1", { rejectionReason: "ROLE_FILLED" }),
      { params: { id: "app-1" } }
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.stage).toBe("REJECTED");
    expect(body.rejectionReason).toBe("ROLE_FILLED");
  });

  it("valid rejection with reason and optional notes → 200", async () => {
    const updatedApp = {
      ...BASE_APPLICATION,
      stage: "REJECTED",
      rejectionReason: "SALARY_MISMATCH",
      recruiterNotes: "Budget constraints this quarter",
    };
    mockTransaction.mockImplementation(async (fn: (tx: typeof prisma) => Promise<unknown>) => {
      const fakeTx = {
        application: {
          update: vi.fn().mockResolvedValue(updatedApp),
        },
        notification: { create: vi.fn().mockResolvedValue({}) },
      };
      return fn(fakeTx as unknown as typeof prisma);
    });

    const res = await PATCH(
      makePatchRejectRequest("app-1", {
        rejectionReason: "SALARY_MISMATCH",
        recruiterNotes: "Budget constraints this quarter",
      }),
      { params: { id: "app-1" } }
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.stage).toBe("REJECTED");
    expect(body.rejectionReason).toBe("SALARY_MISMATCH");
    expect(body.recruiterNotes).toBe("Budget constraints this quarter");
  });
});
