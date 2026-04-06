import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { JobType, ExperienceLevel, Role } from "@prisma/client";
import { auth } from "@/lib/auth";
import { broadcast } from "@/lib/socketio";
import { invalidateCache } from "@/lib/cache";

// ── GET /api/jobs/[id] ───────────────────────────────────────────────────────
// Returns a single job post by ID with full details including recruiter info.
// Requirements: 15.1, 15.2, 15.3, 15.4
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const job = await prisma.jobPost.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        skills: true,
        city: true,
        location: true,
        salaryMin: true,
        salaryMax: true,
        experienceLevel: true,
        jobType: true,
        category: true,
        isActive: true,
        isClosed: true,
        isInactiveLowResponse: true,
        requiredFields: true,
        createdAt: true,
        updatedAt: true,
        recruiter: {
          select: {
            id: true,
            name: true,
            companyName: true,
            responseRate: true,
            avgResponseTimeHours: true,
            recruiterVerified: true,
          },
        },
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error("[GET /api/jobs/[id]] error:", error);
    return NextResponse.json({ error: "Failed to fetch job" }, { status: 500 });
  }
}

// ── PATCH /api/jobs/[id] ─────────────────────────────────────────────────────
// Requirement 2.4: preserve all existing Applications and their Pipeline_Stage
// values — we only update JobPost fields, never touch Application records.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== Role.RECRUITER) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const job = await prisma.jobPost.findUnique({
    where: { id },
    select: { id: true, recruiterId: true },
  });

  if (!job) {
    return NextResponse.json({ error: "Job post not found" }, { status: 404 });
  }
  if (job.recruiterId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const {
    title,
    description,
    skills,
    location,
    city,
    salaryMin,
    salaryMax,
    experienceLevel,
    jobType,
    category,
    requiredFields,
  } = body as Record<string, unknown>;

  // Build partial update — only include fields that were provided
  const data: Record<string, unknown> = {};
  if (title !== undefined) data.title = title;
  if (description !== undefined) data.description = description;
  if (location !== undefined) data.location = location;
  if (city !== undefined) data.city = city;
  if (category !== undefined) data.category = category;
  if (requiredFields !== undefined) {
    data.requiredFields = Array.isArray(requiredFields) ? requiredFields : ["name", "email"];
  }

  if (skills !== undefined) {
    if (!Array.isArray(skills) || skills.length === 0) {
      return NextResponse.json(
        { error: "skills must be a non-empty array" },
        { status: 400 }
      );
    }
    data.skills = skills;
  }

  if (experienceLevel !== undefined) {
    if (!Object.values(ExperienceLevel).includes(experienceLevel as ExperienceLevel)) {
      return NextResponse.json({ error: "Invalid experienceLevel" }, { status: 400 });
    }
    data.experienceLevel = experienceLevel;
  }

  if (jobType !== undefined) {
    if (!Object.values(JobType).includes(jobType as JobType)) {
      return NextResponse.json({ error: "Invalid jobType" }, { status: 400 });
    }
    data.jobType = jobType;
  }

  if (salaryMin !== undefined || salaryMax !== undefined) {
    const min = salaryMin !== undefined ? Number(salaryMin) : undefined;
    const max = salaryMax !== undefined ? Number(salaryMax) : undefined;
    if (min !== undefined) {
      if (isNaN(min) || min < 0) {
        return NextResponse.json({ error: "Invalid salaryMin" }, { status: 400 });
      }
      data.salaryMin = min;
    }
    if (max !== undefined) {
      if (isNaN(max) || max < 0) {
        return NextResponse.json({ error: "Invalid salaryMax" }, { status: 400 });
      }
      data.salaryMax = max;
    }
    // If both provided, ensure min <= max
    if (min !== undefined && max !== undefined && min > max) {
      return NextResponse.json(
        { error: "salaryMin must be <= salaryMax" },
        { status: 400 }
      );
    }
  }

  try {
    const updated = await prisma.jobPost.update({
      where: { id },
      data,
    });
    await invalidateCache("jobs:*");
    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PATCH /api/jobs/[id]] error:", error);
    return NextResponse.json({ error: "Failed to update job post" }, { status: 500 });
  }
}

// ── DELETE /api/jobs/[id] ────────────────────────────────────────────────────
// Requirement 2.5: soft-delete — set isClosed = true and isActive = false.
// New applications are blocked at the application submission endpoint.
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== Role.RECRUITER) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const job = await prisma.jobPost.findUnique({
    where: { id },
    select: { id: true, recruiterId: true },
  });

  if (!job) {
    return NextResponse.json({ error: "Job post not found" }, { status: 404 });
  }
  if (job.recruiterId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await prisma.jobPost.update({
      where: { id },
      data: { isClosed: true, isActive: false },
    });

    // Requirement 13.4: broadcast updated active job count to all clients (non-blocking)
    const activeCount = await prisma.jobPost.count({ where: { isActive: true, isClosed: false } });
    broadcast("jobs:count_updated", { activeCount });
    await invalidateCache("jobs:*");

    return NextResponse.json({ message: "Job post closed" });
  } catch (error) {
    console.error("[DELETE /api/jobs/[id]] error:", error);
    return NextResponse.json({ error: "Failed to close job post" }, { status: 500 });
  }
}
