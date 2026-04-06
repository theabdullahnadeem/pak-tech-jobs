/**
 * Unit tests for admin moderation actions
 * Requirements: 12.1, 12.8
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mocks — must be declared before any imports that use them
// ---------------------------------------------------------------------------

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
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

vi.mock("@/lib/socketio", () => ({
  emitToUser: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";

import { GET as getPendingRecruiters } from "@/app/api/admin/recruiters/pending/route";
import { PATCH as patchRecruiter } from "@/app/api/admin/recruiters/[id]/route";
import { PATCH as patchSuspension } from "@/app/api/admin/suspension/[id]/route";

// ---------------------------------------------------------------------------
// Typed mock helpers
// ---------------------------------------------------------------------------

const mockAuth = auth as ReturnType<typeof vi.fn>;
const mockFindUnique = prisma.user.findUnique as ReturnType<typeof vi.fn>;
const mockFindMany = prisma.user.findMany as ReturnType<typeof vi.fn>;
const mockUpdate = prisma.user.update as ReturnType<typeof vi.fn>;
const mockTransaction = prisma.$transaction as ReturnType<typeof vi.fn>;

// ---------------------------------------------------------------------------
// Request builders
// ---------------------------------------------------------------------------

function makeRequest(body: unknown, id = "recruiter-1") {
  return new NextRequest(`http://localhost/api/admin/recruiters/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function makeSuspensionRequest(body: unknown, id = "recruiter-1") {
  return new NextRequest(`http://localhost/api/admin/suspension/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ---------------------------------------------------------------------------
// Session factories
// ---------------------------------------------------------------------------

const adminSession = { user: { id: "admin-1", role: "ADMIN" } };
const applicantSession = { user: { id: "user-1", role: "APPLICANT" } };
const recruiterSession = { user: { id: "rec-1", role: "RECRUITER" } };

// ---------------------------------------------------------------------------
// 1. Role guard — GET /api/admin/recruiters/pending (Requirement 12.1)
// ---------------------------------------------------------------------------

describe("GET /api/admin/recruiters/pending — role guard", () => {
  beforeEach(() => vi.clearAllMocks());

  it("unauthenticated → 401", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await getPendingRecruiters();
    expect(res.status).toBe(401);
  });

  it("APPLICANT role → 403", async () => {
    mockAuth.mockResolvedValue(applicantSession);
    const res = await getPendingRecruiters();
    expect(res.status).toBe(403);
  });

  it("RECRUITER role → 403", async () => {
    mockAuth.mockResolvedValue(recruiterSession);
    const res = await getPendingRecruiters();
    expect(res.status).toBe(403);
  });

  it("ADMIN role → 200 with pending list", async () => {
    mockAuth.mockResolvedValue(adminSession);
    mockFindMany.mockResolvedValue([]);
    const res = await getPendingRecruiters();
    expect(res.status).toBe(200);
  });
});

// ---------------------------------------------------------------------------
// 2. Role guard — PATCH /api/admin/recruiters/[id] (Requirement 12.1)
// ---------------------------------------------------------------------------

describe("PATCH /api/admin/recruiters/[id] — role guard", () => {
  beforeEach(() => vi.clearAllMocks());

  it("unauthenticated → 401", async () => {
    mockAuth.mockResolvedValue(null);
    const req = makeRequest({ action: "approve" });
    const res = await patchRecruiter(req, { params: { id: "recruiter-1" } });
    expect(res.status).toBe(401);
  });

  it("APPLICANT role → 403", async () => {
    mockAuth.mockResolvedValue(applicantSession);
    const req = makeRequest({ action: "approve" });
    const res = await patchRecruiter(req, { params: { id: "recruiter-1" } });
    expect(res.status).toBe(403);
  });

  it("RECRUITER role → 403", async () => {
    mockAuth.mockResolvedValue(recruiterSession);
    const req = makeRequest({ action: "approve" });
    const res = await patchRecruiter(req, { params: { id: "recruiter-1" } });
    expect(res.status).toBe(403);
  });

  it("ADMIN role → passes through (not 401/403)", async () => {
    mockAuth.mockResolvedValue(adminSession);
    mockFindUnique.mockResolvedValue({
      id: "recruiter-1",
      email: "hr@company.com",
      name: "HR",
      role: "RECRUITER",
      recruiterVerified: false,
    });
    const approvedUser = {
      id: "recruiter-1",
      email: "hr@company.com",
      name: "HR",
      companyName: "Acme",
      businessEmail: "hr@acme.com",
      recruiterVerified: true,
    };
    const notification = { id: "notif-1", type: "RECRUITER_APPROVED" };
    mockTransaction.mockResolvedValue([approvedUser, notification]);

    const req = makeRequest({ action: "approve" });
    const res = await patchRecruiter(req, { params: { id: "recruiter-1" } });
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(403);
  });
});

// ---------------------------------------------------------------------------
// 3. Role guard — PATCH /api/admin/suspension/[id] (Requirement 12.1)
// ---------------------------------------------------------------------------

describe("PATCH /api/admin/suspension/[id] — role guard", () => {
  beforeEach(() => vi.clearAllMocks());

  it("unauthenticated → 401", async () => {
    mockAuth.mockResolvedValue(null);
    const req = makeSuspensionRequest({ action: "lift", reason: "resolved" });
    const res = await patchSuspension(req, { params: { id: "recruiter-1" } });
    expect(res.status).toBe(401);
  });

  it("APPLICANT role → 403", async () => {
    mockAuth.mockResolvedValue(applicantSession);
    const req = makeSuspensionRequest({ action: "lift", reason: "resolved" });
    const res = await patchSuspension(req, { params: { id: "recruiter-1" } });
    expect(res.status).toBe(403);
  });

  it("RECRUITER role → 403", async () => {
    mockAuth.mockResolvedValue(recruiterSession);
    const req = makeSuspensionRequest({ action: "lift", reason: "resolved" });
    const res = await patchSuspension(req, { params: { id: "recruiter-1" } });
    expect(res.status).toBe(403);
  });

  it("ADMIN role → passes through (not 401/403)", async () => {
    mockAuth.mockResolvedValue(adminSession);
    mockFindUnique.mockResolvedValue({
      id: "recruiter-1",
      email: "hr@company.com",
      role: "RECRUITER",
    });
    mockUpdate.mockResolvedValue({});

    const req = makeSuspensionRequest({ action: "lift", reason: "resolved" });
    const res = await patchSuspension(req, { params: { id: "recruiter-1" } });
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(403);
  });
});

// ---------------------------------------------------------------------------
// 4. Recruiter approve/reject logic
// ---------------------------------------------------------------------------

describe("PATCH /api/admin/recruiters/[id] — approve/reject logic", () => {
  beforeEach(() => vi.clearAllMocks());

  const recruiterRecord = {
    id: "recruiter-1",
    email: "hr@company.com",
    name: "HR",
    role: "RECRUITER",
    recruiterVerified: false,
  };

  it("approve: sets recruiterVerified=true, creates notification → 200", async () => {
    mockAuth.mockResolvedValue(adminSession);
    mockFindUnique.mockResolvedValue(recruiterRecord);

    const approvedUser = { ...recruiterRecord, recruiterVerified: true };
    const notification = { id: "notif-1", type: "RECRUITER_APPROVED" };
    mockTransaction.mockResolvedValue([approvedUser, notification]);

    const req = makeRequest({ action: "approve" });
    const res = await patchRecruiter(req, { params: { id: "recruiter-1" } });

    expect(res.status).toBe(200);
    expect(mockTransaction).toHaveBeenCalledOnce();
  });

  it("reject without reason → 400", async () => {
    mockAuth.mockResolvedValue(adminSession);

    const req = makeRequest({ action: "reject" });
    const res = await patchRecruiter(req, { params: { id: "recruiter-1" } });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/reason/i);
  });

  it("reject with reason → 200", async () => {
    mockAuth.mockResolvedValue(adminSession);
    mockFindUnique.mockResolvedValue(recruiterRecord);

    const notification = { id: "notif-2", type: "RECRUITER_REJECTED" };
    mockTransaction.mockResolvedValue(notification);

    const req = makeRequest({ action: "reject", reason: "Invalid domain" });
    const res = await patchRecruiter(req, { params: { id: "recruiter-1" } });

    expect(res.status).toBe(200);
  });

  it("non-existent recruiter → 404", async () => {
    mockAuth.mockResolvedValue(adminSession);
    mockFindUnique.mockResolvedValue(null);

    const req = makeRequest({ action: "approve" });
    const res = await patchRecruiter(req, { params: { id: "nonexistent" } });

    expect(res.status).toBe(404);
  });
});

// ---------------------------------------------------------------------------
// 5. Suspension override — audit log (Requirement 12.8)
// ---------------------------------------------------------------------------

describe("PATCH /api/admin/suspension/[id] — suspension override", () => {
  beforeEach(() => vi.clearAllMocks());

  const recruiterRecord = {
    id: "recruiter-1",
    email: "hr@company.com",
    role: "RECRUITER",
  };

  it("missing reason → 400", async () => {
    mockAuth.mockResolvedValue(adminSession);

    const req = makeSuspensionRequest({ action: "lift" });
    const res = await patchSuspension(req, { params: { id: "recruiter-1" } });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/reason/i);
  });

  it("invalid action → 400", async () => {
    mockAuth.mockResolvedValue(adminSession);

    const req = makeSuspensionRequest({ action: "ban", reason: "some reason" });
    const res = await patchSuspension(req, { params: { id: "recruiter-1" } });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/action/i);
  });

  it("valid 'lift' action → 200, suspended=false, [AUDIT] logged", async () => {
    mockAuth.mockResolvedValue(adminSession);
    mockFindUnique.mockResolvedValue(recruiterRecord);
    mockUpdate.mockResolvedValue({});

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const req = makeSuspensionRequest({ action: "lift", reason: "Rate improved" });
    const res = await patchSuspension(req, { params: { id: "recruiter-1" } });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.suspended).toBe(false);

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("[AUDIT]")
    );

    consoleSpy.mockRestore();
  });

  it("valid 'suspend' action → 200, suspended=true, [AUDIT] logged", async () => {
    mockAuth.mockResolvedValue(adminSession);
    mockFindUnique.mockResolvedValue(recruiterRecord);
    mockUpdate.mockResolvedValue({});

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const req = makeSuspensionRequest({ action: "suspend", reason: "Rate dropped below 50%" });
    const res = await patchSuspension(req, { params: { id: "recruiter-1" } });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.suspended).toBe(true);

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("[AUDIT]")
    );

    consoleSpy.mockRestore();
  });

  it("non-recruiter user → 404", async () => {
    mockAuth.mockResolvedValue(adminSession);
    mockFindUnique.mockResolvedValue({
      id: "user-2",
      email: "applicant@example.com",
      role: "APPLICANT",
    });

    const req = makeSuspensionRequest({ action: "lift", reason: "resolved" });
    const res = await patchSuspension(req, { params: { id: "user-2" } });

    expect(res.status).toBe(404);
  });
});
