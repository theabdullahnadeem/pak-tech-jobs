/**
 * Unit tests for auth middleware and registration validation
 * Requirements: 1.2, 1.3, 1.4, 1.6
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mock @/lib/prisma before any module that imports it is loaded
// ---------------------------------------------------------------------------
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

// ---------------------------------------------------------------------------
// Mock next-auth so `auth` is a plain wrapper we can control in middleware tests
// ---------------------------------------------------------------------------
vi.mock("@/lib/auth", () => ({
  auth: vi.fn((handler: (req: unknown) => unknown) => handler),
}));

// ---------------------------------------------------------------------------
// Imports (after mocks are registered)
// ---------------------------------------------------------------------------
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { POST as registerPOST } from "@/app/api/auth/register/route";
import { requireVerifiedRecruiter } from "@/lib/requireVerifiedRecruiter";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a minimal NextRequest-like object for middleware tests */
function makeRequest(
  pathname: string,
  sessionUser: { role?: string } | null = null
) {
  const url = `http://localhost${pathname}`;
  const req = new NextRequest(url) as NextRequest & {
    auth: { user?: { role?: string } } | null;
  };
  req.auth = sessionUser ? { user: sessionUser } : null;
  return req;
}

/** Build a NextRequest with a JSON body for registration tests */
async function makeRegisterRequest(body: unknown) {
  return new NextRequest("http://localhost/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ---------------------------------------------------------------------------
// Import middleware default export (the inner handler, since auth is mocked
// to be a pass-through wrapper)
// ---------------------------------------------------------------------------
// We import after mocks so the module picks up the mocked `auth`.
const middlewareModule = await import("../../middleware");
const middlewareHandler = middlewareModule.default as unknown as (
  req: ReturnType<typeof makeRequest>
) => NextResponse;

// ---------------------------------------------------------------------------
// 1. Middleware — role-based redirect logic (Requirement 1.4)
// ---------------------------------------------------------------------------

describe("middleware — role-based redirect logic", () => {
  it("unauthenticated request to /dashboard → redirects to /login", () => {
    const req = makeRequest("/dashboard", null);
    const res = middlewareHandler(req);
    expect(res).toBeInstanceOf(NextResponse);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/login");
    expect(res.headers.get("location")).not.toContain("error=Unauthorized");
  });

  it("unauthenticated request to /recruiter/dashboard → redirects to /login", () => {
    const req = makeRequest("/recruiter/dashboard", null);
    const res = middlewareHandler(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/login");
    expect(res.headers.get("location")).not.toContain("error=Unauthorized");
  });

  it("APPLICANT accessing /recruiter/dashboard → redirects to /login?error=Unauthorized", () => {
    const req = makeRequest("/recruiter/dashboard", { role: "APPLICANT" });
    const res = middlewareHandler(req);
    expect(res.status).toBe(307);
    const location = res.headers.get("location") ?? "";
    expect(location).toContain("/login");
    expect(location).toContain("error=Unauthorized");
  });

  it("RECRUITER accessing /admin → redirects to /login?error=Unauthorized", () => {
    const req = makeRequest("/admin", { role: "RECRUITER" });
    const res = middlewareHandler(req);
    expect(res.status).toBe(307);
    const location = res.headers.get("location") ?? "";
    expect(location).toContain("/login");
    expect(location).toContain("error=Unauthorized");
  });

  it("ADMIN accessing /admin → passes through (NextResponse.next)", () => {
    const req = makeRequest("/admin", { role: "ADMIN" });
    const res = middlewareHandler(req);
    // NextResponse.next() has status 200 and no Location header
    expect(res.headers.get("location")).toBeNull();
  });

  it("RECRUITER accessing /recruiter/dashboard → passes through", () => {
    const req = makeRequest("/recruiter/dashboard", { role: "RECRUITER" });
    const res = middlewareHandler(req);
    expect(res.headers.get("location")).toBeNull();
  });

  it("APPLICANT accessing /dashboard → passes through", () => {
    const req = makeRequest("/dashboard", { role: "APPLICANT" });
    const res = middlewareHandler(req);
    expect(res.headers.get("location")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// 2. Registration endpoint (Requirements 1.2, 1.3, 1.6)
// ---------------------------------------------------------------------------

const mockFindUnique = prisma.user.findUnique as ReturnType<typeof vi.fn>;
const mockCreate = prisma.user.create as ReturnType<typeof vi.fn>;

describe("POST /api/auth/register — field validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFindUnique.mockResolvedValue(null); // no existing user by default
    mockCreate.mockResolvedValue({
      id: "user-1",
      email: "test@example.com",
      name: "Test User",
      role: "APPLICANT",
    });
  });

  it("missing required fields → 400", async () => {
    const req = await makeRegisterRequest({ email: "a@b.com" }); // no password/name
    const res = await registerPOST(req);
    expect(res.status).toBe(400);
  });

  it("duplicate email → 409 (Requirement 1.6)", async () => {
    mockFindUnique.mockResolvedValue({ id: "existing" });
    const req = await makeRegisterRequest({
      email: "taken@example.com",
      password: "password123",
      name: "Existing User",
    });
    const res = await registerPOST(req);
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error).toMatch(/already exists/i);
  });

  it("RECRUITER without companyName → 400 (Requirement 1.3)", async () => {
    const req = await makeRegisterRequest({
      email: "recruiter@company.com",
      password: "password123",
      name: "Recruiter",
      role: "RECRUITER",
      businessEmail: "recruiter@company.com",
      // companyName intentionally omitted
    });
    const res = await registerPOST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/company name/i);
  });

  it("RECRUITER without businessEmail → 400 (Requirement 1.3)", async () => {
    const req = await makeRegisterRequest({
      email: "recruiter@company.com",
      password: "password123",
      name: "Recruiter",
      role: "RECRUITER",
      companyName: "Acme Corp",
      // businessEmail intentionally omitted
    });
    const res = await registerPOST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/business email/i);
  });

  it("valid APPLICANT registration → 201 (Requirement 1.2)", async () => {
    const req = await makeRegisterRequest({
      email: "applicant@example.com",
      password: "password123",
      name: "Job Seeker",
    });
    const res = await registerPOST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.user).toBeDefined();
    expect(body.message).toMatch(/verify/i);
  });

  it("valid RECRUITER registration → 201 (Requirements 1.2, 1.3)", async () => {
    mockCreate.mockResolvedValue({
      id: "rec-1",
      email: "hr@company.com",
      name: "HR Manager",
      role: "RECRUITER",
    });
    const req = await makeRegisterRequest({
      email: "hr@company.com",
      password: "password123",
      name: "HR Manager",
      role: "RECRUITER",
      companyName: "Acme Corp",
      businessEmail: "hr@acme.com",
    });
    const res = await registerPOST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.user.role).toBe("RECRUITER");
  });
});

// ---------------------------------------------------------------------------
// 3. requireVerifiedRecruiter guard (Requirements 1.3, 1.5)
// ---------------------------------------------------------------------------

const mockUserFindUnique = prisma.user.findUnique as ReturnType<typeof vi.fn>;

describe("requireVerifiedRecruiter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("no session → 401", async () => {
    const res = await requireVerifiedRecruiter(null);
    expect(res).not.toBeNull();
    expect(res!.status).toBe(401);
  });

  it("non-RECRUITER role → 403", async () => {
    const session = {
      user: { id: "user-1", role: "APPLICANT" as const },
      expires: "",
    };
    // Cast to satisfy Session type
    const res = await requireVerifiedRecruiter(session as never);
    expect(res).not.toBeNull();
    expect(res!.status).toBe(403);
  });

  it("suspended recruiter → 403", async () => {
    mockUserFindUnique.mockResolvedValue({
      recruiterVerified: true,
      suspended: true,
    });
    const session = {
      user: { id: "rec-1", role: "RECRUITER" as const },
      expires: "",
    };
    const res = await requireVerifiedRecruiter(session as never);
    expect(res).not.toBeNull();
    expect(res!.status).toBe(403);
    const body = await res!.json();
    expect(body.error).toMatch(/suspended/i);
  });

  it("unverified recruiter → 403", async () => {
    mockUserFindUnique.mockResolvedValue({
      recruiterVerified: false,
      suspended: false,
    });
    const session = {
      user: { id: "rec-1", role: "RECRUITER" as const },
      expires: "",
    };
    const res = await requireVerifiedRecruiter(session as never);
    expect(res).not.toBeNull();
    expect(res!.status).toBe(403);
    const body = await res!.json();
    expect(body.error).toMatch(/pending verification/i);
  });

  it("verified, non-suspended recruiter → null (proceed)", async () => {
    mockUserFindUnique.mockResolvedValue({
      recruiterVerified: true,
      suspended: false,
    });
    const session = {
      user: { id: "rec-1", role: "RECRUITER" as const },
      expires: "",
    };
    const res = await requireVerifiedRecruiter(session as never);
    expect(res).toBeNull();
  });
});
