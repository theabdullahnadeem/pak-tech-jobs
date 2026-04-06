/**
 * Unit tests for job post validation and status transitions.
 * Requirements: 2.2, 2.5
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mocks — must be declared before any imports that pull in these modules
// ---------------------------------------------------------------------------

vi.mock("@/lib/prisma", () => ({
  prisma: {
    jobPost: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
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
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireVerifiedRecruiter } from "@/lib/requireVerifiedRecruiter";
import { POST } from "@/app/api/jobs/route";
import { DELETE } from "@/app/api/jobs/[id]/route";

// ---------------------------------------------------------------------------
// Typed mock helpers
// ---------------------------------------------------------------------------

const mockAuth = auth as ReturnType<typeof vi.fn>;
const mockRequireVerifiedRecruiter = requireVerifiedRecruiter as ReturnType<typeof vi.fn>;
const mockJobPostCreate = prisma.jobPost.create as ReturnType<typeof vi.fn>;
const mockJobPostFindUnique = prisma.jobPost.findUnique as ReturnType<typeof vi.fn>;
const mockJobPostUpdate = prisma.jobPost.update as ReturnType<typeof vi.fn>;

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

const RECRUITER_SESSION = {
  user: { id: "recruiter-1", role: "RECRUITER" as const },
  expires: "",
};

const VALID_JOB_BODY = {
  title: "Senior Backend Engineer",
  description: "Build scalable APIs",
  skills: ["Node.js", "TypeScript"],
  location: "Lahore, Pakistan",
  city: "Lahore",
  salaryMin: 100_000,
  salaryMax: 200_000,
  experienceLevel: "SENIOR",
  jobType: "FULL_TIME",
  category: ["Engineering"],
};

function makePostRequest(body: unknown) {
  return new NextRequest("http://localhost/api/jobs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function makeDeleteRequest(id: string) {
  return new NextRequest(`http://localhost/api/jobs/${id}`, {
    method: "DELETE",
  });
}

// ---------------------------------------------------------------------------
// POST /api/jobs — validation (Requirement 2.2)
// ---------------------------------------------------------------------------

describe("POST /api/jobs — required field validation (Requirement 2.2)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: auth passes, recruiter guard passes
    mockAuth.mockResolvedValue(RECRUITER_SESSION);
    mockRequireVerifiedRecruiter.mockResolvedValue(null);
  });

  it("missing title → 400", async () => {
    const { title: _, ...body } = VALID_JOB_BODY;
    const res = await POST(makePostRequest(body));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.fields).toContain("title");
  });

  it("missing description → 400", async () => {
    const { description: _, ...body } = VALID_JOB_BODY;
    const res = await POST(makePostRequest(body));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.fields).toContain("description");
  });

  it("missing skills → 400", async () => {
    const { skills: _, ...body } = VALID_JOB_BODY;
    const res = await POST(makePostRequest(body));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.fields.some((f: string) => f.startsWith("skills"))).toBe(true);
  });

  it("empty skills array → 400", async () => {
    const res = await POST(makePostRequest({ ...VALID_JOB_BODY, skills: [] }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.fields.some((f: string) => f.startsWith("skills"))).toBe(true);
  });

  it("missing salaryMin → 400", async () => {
    const { salaryMin: _, ...body } = VALID_JOB_BODY;
    const res = await POST(makePostRequest(body));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.fields).toContain("salaryMin");
  });

  it("missing salaryMax → 400", async () => {
    const { salaryMax: _, ...body } = VALID_JOB_BODY;
    const res = await POST(makePostRequest(body));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.fields).toContain("salaryMax");
  });

  it("missing experienceLevel → 400", async () => {
    const { experienceLevel: _, ...body } = VALID_JOB_BODY;
    const res = await POST(makePostRequest(body));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.fields).toContain("experienceLevel");
  });

  it("missing jobType → 400", async () => {
    const { jobType: _, ...body } = VALID_JOB_BODY;
    const res = await POST(makePostRequest(body));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.fields).toContain("jobType");
  });

  it("missing city → 400", async () => {
    const { city: _, ...body } = VALID_JOB_BODY;
    const res = await POST(makePostRequest(body));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.fields).toContain("city");
  });

  it("missing location → 400", async () => {
    const { location: _, ...body } = VALID_JOB_BODY;
    const res = await POST(makePostRequest(body));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.fields).toContain("location");
  });

  it("salaryMin > salaryMax → 400", async () => {
    const res = await POST(
      makePostRequest({ ...VALID_JOB_BODY, salaryMin: 300_000, salaryMax: 100_000 })
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/salaryMin/i);
  });

  it("invalid experienceLevel enum → 400", async () => {
    const res = await POST(
      makePostRequest({ ...VALID_JOB_BODY, experienceLevel: "EXPERT" })
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/experienceLevel/i);
  });

  it("invalid jobType enum → 400", async () => {
    const res = await POST(
      makePostRequest({ ...VALID_JOB_BODY, jobType: "FREELANCE" })
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/jobType/i);
  });

  it("valid job post → 201", async () => {
    const createdJob = { id: "job-1", ...VALID_JOB_BODY, recruiterId: "recruiter-1" };
    mockJobPostCreate.mockResolvedValue(createdJob);

    const res = await POST(makePostRequest(VALID_JOB_BODY));
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.id).toBe("job-1");
  });
});

// ---------------------------------------------------------------------------
// DELETE /api/jobs/[id] — status transitions (Requirement 2.5)
// ---------------------------------------------------------------------------

describe("DELETE /api/jobs/[id] — close job post (Requirement 2.5)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue(RECRUITER_SESSION);
  });

  it("closing a job sets isClosed=true and isActive=false", async () => {
    mockJobPostFindUnique.mockResolvedValue({
      id: "job-1",
      recruiterId: "recruiter-1",
    });
    mockJobPostUpdate.mockResolvedValue({
      id: "job-1",
      isClosed: true,
      isActive: false,
    });

    const res = await DELETE(makeDeleteRequest("job-1"), {
      params: { id: "job-1" },
    });

    expect(res.status).toBe(200);
    expect(mockJobPostUpdate).toHaveBeenCalledWith({
      where: { id: "job-1" },
      data: { isClosed: true, isActive: false },
    });
  });

  it('returns { message: "Job post closed" }', async () => {
    mockJobPostFindUnique.mockResolvedValue({
      id: "job-1",
      recruiterId: "recruiter-1",
    });
    mockJobPostUpdate.mockResolvedValue({});

    const res = await DELETE(makeDeleteRequest("job-1"), {
      params: { id: "job-1" },
    });

    const json = await res.json();
    expect(json.message).toBe("Job post closed");
  });

  it("non-owner cannot close → 403", async () => {
    mockJobPostFindUnique.mockResolvedValue({
      id: "job-1",
      recruiterId: "other-recruiter",
    });

    const res = await DELETE(makeDeleteRequest("job-1"), {
      params: { id: "job-1" },
    });

    expect(res.status).toBe(403);
  });

  it("non-existent job → 404", async () => {
    mockJobPostFindUnique.mockResolvedValue(null);

    const res = await DELETE(makeDeleteRequest("ghost-job"), {
      params: { id: "ghost-job" },
    });

    expect(res.status).toBe(404);
  });
});
