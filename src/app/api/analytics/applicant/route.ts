import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getCached, setCached } from "@/lib/cache";

export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "APPLICANT") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const cacheKey = `analytics:applicant:${session.user.id}`;
  const cached = await getCached(cacheKey);
  if (cached) return NextResponse.json(cached);

  const applicantId = session.user.id;

  const applications = await prisma.application.findMany({
    where: { applicantId },
    select: {
      id: true,
      stage: true,
      submittedAt: true,
      jobPost: {
        select: {
          id: true,
          title: true,
          skills: true,
          city: true,
          jobType: true,
          experienceLevel: true,
          recruiter: { select: { companyName: true } },
        },
      },
    },
    orderBy: { submittedAt: "desc" },
  });

  // Stage distribution
  const stageCounts: Record<string, number> = {};
  for (const app of applications) {
    stageCounts[app.stage] = (stageCounts[app.stage] || 0) + 1;
  }

  // Skills in demand (from jobs applied to)
  const skillFreq: Record<string, number> = {};
  for (const app of applications) {
    for (const skill of app.jobPost.skills) {
      skillFreq[skill] = (skillFreq[skill] || 0) + 1;
    }
  }
  const topSkillsInDemand = Object.entries(skillFreq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([skill, count]) => ({ skill, count }));

  // Application timeline (last 60 days)
  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
  const recentApps = applications.filter(a => new Date(a.submittedAt) >= sixtyDaysAgo);
  const appsByDay: Record<string, number> = {};
  for (const app of recentApps) {
    const day = new Date(app.submittedAt).toISOString().split("T")[0];
    appsByDay[day] = (appsByDay[day] || 0) + 1;
  }
  const applicationTimeline = Object.entries(appsByDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));

  // Success rate (offers / total)
  const offers = applications.filter(a => a.stage === "OFFER").length;
  const successRate = applications.length > 0 ? Math.round((offers / applications.length) * 100) : 0;

  const result = {
    totalApplications: applications.length,
    stageCounts,
    topSkillsInDemand,
    applicationTimeline,
    successRate,
    offersReceived: offers,
    recentApplications: applications.slice(0, 5).map(a => ({
      id: a.id,
      jobTitle: a.jobPost.title,
      company: a.jobPost.recruiter.companyName,
      stage: a.stage,
      submittedAt: a.submittedAt,
    })),
  };

  await setCached(cacheKey, result, 300);
  return NextResponse.json(result);
}
