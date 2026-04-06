/**
 * Unit tests for salary submission validation and aggregation.
 * Requirements: 10.2, 10.6
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mocks — declared before imports
// ---------------------------------------------------------------------------

vi.mock("@/lib/prisma", () => ({
  prisma: {
    salaryEntry: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { POST, GET } from "@/app/api/salaries/route";

// ---------------------------------------------------------------------------
// Typed mock helpers
// ---------------------------------------------------------------------------

const mockAuth = auth as ReturnType<typeof vi.fn>;
const mockSalaryCreate = prisma.salaryEntry.create as ReturnType<typeof vi.fn>;
const mockSalaryFindMany = prisma.salaryEntry.findMany as ReturnType<typeof vi.fn>;

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const AUTHED_SESSION = {
  user: { id: "user-1", role: "APPLICANT" as const },
  expires: "",
};

const VALID_SALARY_BODY = {
  roleTitle: "Software Engineer",
  experienceLevel: "MID",
  city: "Karachi",
  salaryAmount: 150_000,
  employmentType: "FULL_TIME",
};

function makePostRequest(body: unknown) {
  return new NextRequest("http://localhost/api/salaries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function makeGetRequest(params: Record<string, string> = {}) {
  const url = new URL("http://localhost/api/salaries");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new NextRequest(url.toString());
}

// ---------------------------------------------------------------------------
// POST /api/salaries — required field validation (Requirement 10.2)
// ---------------------------------------------------------------------------

describe("POST /api/salaries — required field validation (Requirement 10.2)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue(AUTHED_SESSION);
  });

  it("missing roleTitle → 400", async () => {
    const { roleTitle: _, ...body } = VALID_SALARY_BODY;
    const res = await POST(makePostRequest(body));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.fields).toContain("roleTitle");
  });

  it("missing experienceLevel → 400", async () => {
    const { experienceLevel: _, ...body } = VALID_SALARY_BODY;
    const res = await POST(makePostRequest(body));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.fields).toContain("experienceLevel");
  });

  it("missing city → 400", async () => {
    const { city: _, ...body } = VALID_SALARY_BODY;
    const res = await POST(makePostRequest(body));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.fields).toContain("city");
  });

  it("missing salaryAmount → 400", async () => {
    const { salaryAmount: _, ...body } = VALID_SALARY_BODY;
    const res = await POST(makePostRequest(body));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.fields).toContain("salaryAmount");
  });

  it("missing employmentType → 400", async () => {
    const { employmentType: _, ...body } = VALID_SALARY_BODY;
    const res = await POST(makePostRequest(body));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.fields).toContain("employmentType");
  });

  it("salaryAmount = 0 → 400 (must be positive)", async () => {
    const res = await POST(makePostRequest({ ...VALID_SALARY_BODY, salaryAmount: 0 }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/positive/i);
  });

  it("salaryAmount = -100 → 400", async () => {
    const res = await POST(makePostRequest({ ...VALID_SALARY_BODY, salaryAmount: -100 }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/positive/i);
  });

  it("valid submission without evidenceUrl → 201, verificationStatus=UNVERIFIED", async () => {
    const created = {
      id: "entry-1",
      ...VALID_SALARY_BODY,
      verificationStatus: "UNVERIFIED",
      submittedById: "user-1",
    };
    mockSalaryCreate.mockResolvedValue(created);

    const res = await POST(makePostRequest(VALID_SALARY_BODY));
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.verificationStatus).toBe("UNVERIFIED");
  });

  it("valid submission with evidenceUrl → 201, verificationStatus=PENDING", async () => {
    const body = { ...VALID_SALARY_BODY, evidenceUrl: "https://example.com/payslip.pdf" };
    const created = {
      id: "entry-2",
      ...body,
      verificationStatus: "PENDING",
      submittedById: "user-1",
    };
    mockSalaryCreate.mockResolvedValue(created);

    const res = await POST(makePostRequest(body));
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.verificationStatus).toBe("PENDING");
  });
});

// ---------------------------------------------------------------------------
// GET /api/salaries — aggregation and verification filtering (Requirement 10.6)
// ---------------------------------------------------------------------------

describe("GET /api/salaries — aggregation threshold and verification (Requirement 10.6)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns insufficientData when fewer than 3 verified entries exist", async () => {
    // Only 2 verified entries for this combination
    mockSalaryFindMany.mockResolvedValue([
      { roleTitle: "Engineer", experienceLevel: "MID", city: "Lahore", salaryAmount: 100_000 },
      { roleTitle: "Engineer", experienceLevel: "MID", city: "Lahore", salaryAmount: 120_000 },
    ]);

    const res = await GET(makeGetRequest({ role: "Engineer" }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveLength(1);
    expect(json[0].insufficientData).toBe(true);
    expect(json[0].min).toBeUndefined();
    expect(json[0].median).toBeUndefined();
    expect(json[0].max).toBeUndefined();
  });

  it("returns aggregated stats when 3+ verified entries exist", async () => {
    mockSalaryFindMany.mockResolvedValue([
      { roleTitle: "Engineer", experienceLevel: "MID", city: "Lahore", salaryAmount: 100_000 },
      { roleTitle: "Engineer", experienceLevel: "MID", city: "Lahore", salaryAmount: 150_000 },
      { roleTitle: "Engineer", experienceLevel: "MID", city: "Lahore", salaryAmount: 200_000 },
    ]);

    const res = await GET(makeGetRequest({ role: "Engineer" }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveLength(1);
    expect(json[0].insufficientData).toBeUndefined();
    expect(json[0].min).toBe(100_000);
    expect(json[0].median).toBe(150_000);
    expect(json[0].max).toBe(200_000);
    expect(json[0].count).toBe(3);
  });

  it("unverified entries are excluded — only VERIFIED status is queried", async () => {
    // The mock returns empty (simulating that the DB query filtered to VERIFIED only)
    mockSalaryFindMany.mockResolvedValue([]);

    await GET(makeGetRequest({ role: "Designer" }));

    // Verify the prisma call used verificationStatus: VERIFIED
    expect(mockSalaryFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          verificationStatus: "VERIFIED",
        }),
      })
    );
  });
});
