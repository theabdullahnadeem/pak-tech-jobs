import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Role } from "@prisma/client";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== Role.RECRUITER) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const jobs = await prisma.jobPost.findMany({
    where: { recruiterId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      city: true,
      location: true,
      jobType: true,
      experienceLevel: true,
      salaryMin: true,
      salaryMax: true,
      isActive: true,
      isClosed: true,
      createdAt: true,
      category: true,
      skills: true,
    },
  });

  return NextResponse.json(jobs);
}
