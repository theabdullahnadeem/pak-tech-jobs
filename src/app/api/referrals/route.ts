import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { rateLimitByUser, RATE_LIMITS } from "@/lib/rateLimit";
import { nanoid } from "nanoid";

export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const referrals = await prisma.referral.findMany({
    where: { senderId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { jobPost: { select: { id: true, title: true } } },
  });

  return NextResponse.json(referrals);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = await rateLimitByUser(session.user.id, RATE_LIMITS.referral);
  if (rl) return rl;

  const { jobPostId } = await req.json();
  if (!jobPostId) return NextResponse.json({ error: "jobPostId required" }, { status: 400 });

  const job = await prisma.jobPost.findUnique({ where: { id: jobPostId }, select: { id: true } });
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

  // Return existing referral if already created for this user+job
  const existing = await prisma.referral.findFirst({
    where: { senderId: session.user.id, jobPostId },
  });
  if (existing) return NextResponse.json(existing);

  const code = nanoid(10);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  const referral = await prisma.referral.create({
    data: { senderId: session.user.id, jobPostId, code, expiresAt },
  });

  return NextResponse.json(referral, { status: 201 });
}
