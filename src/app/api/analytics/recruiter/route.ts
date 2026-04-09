import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getCached, setCached } from "@/lib/cache";

export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "RECRUITER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const cacheKey = `analytics:recruiter:${session.user.id}`;
  const cached = await getCached(cacheKey);
  if (cached) return NextResponse.json(cached);

  const recruiterId = session.user.id;

  // Get all applications for this recruiter's jobs
  const applications = await prisma.application.findMany({
    where: { jobPost: { recruiterId } },
    select: {
      id: true,
      stage: true,
      submittedAt: true,
      firstSeenAt: true,
      firstActionAt: true,
      updatedAt: true,
      jobPost: { select: { id: true, title: true } },
    },
  });

  // Stage funnel counts
  const stageCounts: Record<string, number> = {
    APPLIED: 0, SEEN: 0, SHORTLISTED: 0, INTERVIEW: 0, OFFER: 0, REJECTED: 0,
  };
  for (const app of applications) {
    if (app.stage in stageCounts) stageCounts[app.stage]++;
  }

  const funnelData = Object.entries(stageCounts).map(([stage, count]) => ({ stage, count }));

  // Conversion rates between stages
  const conversionRates = [
    { from: "APPLIED", to: "SEEN", rate: stageCounts.APPLIED > 0 ? Math.round((stageCounts.SEEN / stageCounts.APPLIED) * 100) : 0 },
    { from: "SEEN", to: "SHORTLISTED", rate: stageCounts.SEEN > 0 ? Math.round((stageCounts.SHORTLISTED / stageCounts.SEEN) * 100) : 0 },
    { from: "SHORTLISTED", to: "INTERVIEW", rate: stageCounts.SHORTLISTED > 0 ? Math.round((stageCounts.INTERVIEW / stageCounts.SHORTLISTED) * 100) : 0 },
    { from: "INTERVIEW", to: "OFFER", rate: stageCounts.INTERVIEW > 0 ? Math.round((stageCounts.OFFER / stageCounts.INTERVIEW) * 100) : 0 },
  ];

  // Applications per day (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentApps = applications.filter(a => new Date(a.submittedAt) >= thirtyDaysAgo);
  const appsByDay: Record<string, number> = {};
  for (const app of recentApps) {
    const day = new Date(app.submittedAt).toISOString().split("T")[0];
    appsByDay[day] = (appsByDay[day] || 0) + 1;
  }
  const applicationTrend = Object.entries(appsByDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));

  // Avg time to first action (response time)
  const responded = applications.filter(a => a.firstActionAt);
  const avgResponseHours = responded.length > 0
    ? Math.round(responded.reduce((sum, a) => {
        const diff = new Date(a.firstActionAt!).getTime() - new Date(a.submittedAt).getTime();
        return sum + diff / (1000 * 60 * 60);
      }, 0) / responded.length)
    : null;

  // Top jobs by application count
  const jobCounts: Record<string, { title: string; count: number }> = {};
  for (const app of applications) {
    const jid = app.jobPost.id;
    if (!jobCounts[jid]) jobCounts[jid] = { title: app.jobPost.title, count: 0 };
    jobCounts[jid].count++;
  }
  const topJobs = Object.values(jobCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const result = {
    totalApplications: applications.length,
    funnelData,
    conversionRates,
    applicationTrend,
    avgResponseHours,
    topJobs,
    responseRate: session.user.role === "RECRUITER" ? undefined : null,
  };

  await setCached(cacheKey, result, 300); // 5 min cache
  return NextResponse.json(result);
}
