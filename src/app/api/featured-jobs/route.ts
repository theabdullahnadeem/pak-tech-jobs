import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireVerifiedRecruiter } from "@/lib/requireVerifiedRecruiter";

// GET — public: returns featured jobs
export async function GET() {
  const jobs = await prisma.jobPost.findMany({
    where: { isActive: true, isClosed: false, isFeatured: true },
    orderBy: { featuredUntil: "desc" },
    select: {
      id: true, title: true, city: true, jobType: true,
      experienceLevel: true, salaryMin: true, salaryMax: true,
      skills: true, featuredUntil: true,
      recruiter: { select: { id: true, name: true, companyName: true, recruiterVerified: true } },
    },
    take: 6,
  });
  return NextResponse.json(jobs);
}

// POST — recruiter marks their job as featured
export async function POST(req: NextRequest) {
  const session = await auth();
  const guard = await requireVerifiedRecruiter(session);
  if (guard) return guard;

  const { jobPostId, days = 7 } = await req.json();
  if (!jobPostId) return NextResponse.json({ error: "jobPostId required" }, { status: 400 });

  const job = await prisma.jobPost.findUnique({
    where: { id: jobPostId },
    select: { id: true, recruiterId: true },
  });

  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });
  if (job.recruiterId !== session!.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const featuredUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  const updated = await prisma.jobPost.update({
    where: { id: jobPostId },
    data: { isFeatured: true, featuredUntil },
  });

  return NextResponse.json(updated);
}
