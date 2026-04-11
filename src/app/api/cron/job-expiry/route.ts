import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { broadcast } from "@/lib/socketio";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = req.headers.get("x-cron-secret");
  const isAuthorized =
    authHeader === `Bearer ${process.env.CRON_SECRET}` ||
    cronSecret === process.env.CRON_SECRET;

  if (!process.env.CRON_SECRET || !isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // Close jobs past their expiry date
  const expired = await prisma.jobPost.updateMany({
    where: {
      isActive: true,
      isClosed: false,
      expiresAt: { lte: now },
    },
    data: { isClosed: true, isActive: false },
  });

  // Warn about jobs expiring in the next 48 hours
  const expiringSoon = await prisma.jobPost.findMany({
    where: {
      isActive: true,
      isClosed: false,
      expiresAt: {
        gte: now,
        lte: new Date(now.getTime() + 48 * 60 * 60 * 1000),
      },
    },
    select: { id: true, title: true, recruiterId: true, expiresAt: true },
  });

  for (const job of expiringSoon) {
    await prisma.notification.create({
      data: {
        userId: job.recruiterId,
        type: "JOB_EXPIRING",
        title: "Job Post Expiring Soon",
        body: `Your job post "${job.title}" expires in less than 48 hours.`,
        data: { jobPostId: job.id },
      },
    });
  }

  if (expired.count > 0) {
    const activeCount = await prisma.jobPost.count({ where: { isActive: true, isClosed: false } });
    broadcast("jobs:count_updated", { activeCount });
  }

  return NextResponse.json({ expired: expired.count, expiringSoon: expiringSoon.length });
}
