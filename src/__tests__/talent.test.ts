/**
 * Unit tests for talent pool visibility.
 * Requirements: 14.1
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mocks — declared before imports
// ---------------------------------------------------------------------------

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/requireVerifiedRecruiter", () => ({
  requireVerifiedRecruiter: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireVerifiedRecruiter } from "@/lib/requireVerifiedRecruiter";
import { GET } from "@/app/api/talent/route";

// ---------------------------------------------------------------------------
// Typed mock helpers
// ---------------------------------------------------------------------------

const mockAuth = auth as ReturnType<typeof vi.fn>;
const mockRequireVerifiedRecruiter = requireVerifiedRecruiter as ReturnType<typeof vi.fn>;
const mockUserFindMany = prisma.user.findMany as ReturnType<typeof vi.fn>;

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const VERIFIED_RECRUITER_SESSION = {
  user: { id: "recruiter-1", role: "RECRUITER" as const },
  expires: "",
};

const SAMPLE_PROFILES = [
  {
    id: "applicant-1",
    name: "Alice",
    skills: ["React", "TypeScript"],
    experienceLevel: "MID",
    location: "Lahore",
  },
  {
    id: "applicant-2",
    name: "Bob",
    skills: ["Node.js", "Python"],
    experienceLevel: "SENIOR",
    location: "Karachi",
  },
];

function makeGetRequest(params: Record<string, string> = {}) {
  const url = new URL("http://localhost/api/talent");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return new NextRequest(url);
}

// ---------------------------------------------------------------------------
// Access control (Requirement 14.1)
// ---------------------------------------------------------------------------

describe("GET /api/talent — access control (Requirement 14.1)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: verified recruiter session, guard passes
    mockAuth.mockResolvedValue(VERIFIED_RECRUITER_SESSION);
    mockRequireVerifiedRecruiter.mockResolvedValue(null);
    mockUserFindMany.mockResolvedValue(SAMPLE_PROFILES);
  });

  it("unauthenticated request → 401", async () => {
    mockRequireVerifiedRecruiter.mockResolvedValue(
      NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    );

    const res = await GET(makeGetRequest());
    expect(res.status).toBe(401);
  });

  it("non-RECRUITER role → 403", async () => {
    mockRequireVerifiedRecruiter.mockResolvedValue(
      NextResponse.json({ error: "Forbidden" }, { status: 403 })
    );

    const res = await GET(makeGetRequest());
    expect(res.status).toBe(403);
  });

  it("unverified recruiter → 403 with 'Account pending verification'", async () => {
    mockRequireVerifiedRecruiter.mockResolvedValue(
      NextResponse.json({ error: "Account pending verification" }, { status: 403 })
    );

    const res = await GET(makeGetRequest());
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toBe("Account pending verification");
  });

  it("verified recruiter → 200", async () => {
    const res = await GET(makeGetRequest());
    expect(res.status).toBe(200);
  });
});

// ---------------------------------------------------------------------------
// Talent pool filtering (Requirement 14.1)
// ---------------------------------------------------------------------------

describe("GET /api/talent — talent pool filtering (Requirement 14.1)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue(VERIFIED_RECRUITER_SESSION);
    mockRequireVerifiedRecruiter.mockResolvedValue(null);
    mockUserFindMany.mockResolvedValue(SAMPLE_PROFILES);
  });

  it("only returns profiles where openToOpportunities=true", async () => {
    await GET(makeGetRequest());

    const callArgs = mockUserFindMany.mock.calls[0][0];
    expect(callArgs.where.openToOpportunities).toBe(true);
  });

  it("only returns profiles where role=APPLICANT", async () => {
    await GET(makeGetRequest());

    const callArgs = mockUserFindMany.mock.calls[0][0];
    expect(callArgs.where.role).toBe("APPLICANT");
  });

  it("skills filter: passes hasSome to prisma when skills param provided", async () => {
    await GET(makeGetRequest({ skills: "React,TypeScript" }));

    const callArgs = mockUserFindMany.mock.calls[0][0];
    expect(callArgs.where.skills).toEqual({ hasSome: ["React", "TypeScript"] });
  });

  it("experienceLevel filter: passes experienceLevel to prisma when valid enum provided", async () => {
    await GET(makeGetRequest({ experienceLevel: "SENIOR" }));

    const callArgs = mockUserFindMany.mock.calls[0][0];
    expect(callArgs.where.experienceLevel).toBe("SENIOR");
  });

  it("invalid experienceLevel param is ignored (no filter applied)", async () => {
    await GET(makeGetRequest({ experienceLevel: "EXPERT" }));

    const callArgs = mockUserFindMany.mock.calls[0][0];
    expect(callArgs.where.experienceLevel).toBeUndefined();
  });

  it("location filter: passes case-insensitive contains when location param provided", async () => {
    await GET(makeGetRequest({ location: "lahore" }));

    const callArgs = mockUserFindMany.mock.calls[0][0];
    expect(callArgs.where.location).toEqual({
      contains: "lahore",
      mode: "insensitive",
    });
  });

  it("returns only safe fields (id, name, skills, experienceLevel, location)", async () => {
    const res = await GET(makeGetRequest());
    const json = await res.json();

    // Verify the select clause excludes sensitive fields
    const callArgs = mockUserFindMany.mock.calls[0][0];
    expect(callArgs.select).toEqual({
      id: true,
      name: true,
      skills: true,
      experienceLevel: true,
      location: true,
    });
    expect(callArgs.select.email).toBeUndefined();
    expect(callArgs.select.passwordHash).toBeUndefined();

    // Verify response shape matches safe fields only
    expect(json[0]).toHaveProperty("id");
    expect(json[0]).toHaveProperty("name");
    expect(json[0]).toHaveProperty("skills");
    expect(json[0]).not.toHaveProperty("email");
    expect(json[0]).not.toHaveProperty("passwordHash");
  });

  it("no filters → returns all open-to-opportunities applicants", async () => {
    const res = await GET(makeGetRequest());
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveLength(2);
  });
});
