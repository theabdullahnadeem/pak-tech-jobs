import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET — list saved jobs for the current user
export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const saved = await prisma.savedJob.findMany({
    where: { userId: session.user.id },
    orderBy: { savedAt: "desc" },
    include: {
      jobPost: {
        select: {
          id: true, title: true, city: true, jobType: true,
          experienceLevel: true, salaryMin: true, salaryMax: true,
          isActive: true, isClosed: true, skills: true,
          recruiter: { select: { id: true, name: true, companyName: true } },
        },
      },
    },
  });

  return NextResponse.json(saved);
}

// POST — save a job
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { jobPostId } = await req.json();
  if (!jobPostId) return NextResponse.json({ error: "jobPostId required" }, { status: 400 });

  const job = await prisma.jobPost.findUnique({ where: { id: jobPostId }, select: { id: true } });
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

  const saved = await prisma.savedJob.upsert({
    where: { userId_jobPostId: { userId: session.user.id, jobPostId } },
    create: { userId: session.user.id, jobPostId },
    update: {},
  });

  return NextResponse.json(saved, { status: 201 });
}

// DELETE — unsave a job
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const jobPostId = searchParams.get("jobPostId");
  if (!jobPostId) return NextResponse.json({ error: "jobPostId required" }, { status: 400 });

  await prisma.savedJob.deleteMany({
    where: { userId: session.user.id, jobPostId },
  });

  return NextResponse.json({ message: "Unsaved" });
}
