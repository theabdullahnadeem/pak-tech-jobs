import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { JobType, ExperienceLevel } from "@prisma/client";

export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const alerts = await prisma.jobAlert.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(alerts);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { keywords, city, jobType, experienceLevel, salaryMin } = body;

  if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
    return NextResponse.json({ error: "At least one keyword required" }, { status: 400 });
  }

  const alert = await prisma.jobAlert.create({
    data: {
      userId: session.user.id,
      keywords,
      city: city || null,
      jobType: jobType && Object.values(JobType).includes(jobType) ? jobType : null,
      experienceLevel: experienceLevel && Object.values(ExperienceLevel).includes(experienceLevel) ? experienceLevel : null,
      salaryMin: salaryMin ? Number(salaryMin) : null,
    },
  });

  return NextResponse.json(alert, { status: 201 });
}
