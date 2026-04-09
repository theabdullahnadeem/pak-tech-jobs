import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { rateLimitByUser, RATE_LIMITS } from "@/lib/rateLimit";
import { VerificationMethod } from "@prisma/client";

export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const verifications = await prisma.skillVerification.findMany({
    where: { userId: session.user.id },
    orderBy: { verifiedAt: "desc" },
  });

  return NextResponse.json(verifications);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = await rateLimitByUser(session.user.id, RATE_LIMITS.ai);
  if (rl) return rl;

  const body = await req.json();
  const { skill, method, score, evidenceUrl } = body;

  if (!skill || !method) return NextResponse.json({ error: "skill and method required" }, { status: 400 });
  if (!Object.values(VerificationMethod).includes(method)) {
    return NextResponse.json({ error: "Invalid method" }, { status: 400 });
  }
  if (method === "QUIZ" && (score === undefined || score < 70)) {
    return NextResponse.json({ error: "Quiz score must be >= 70 to verify" }, { status: 400 });
  }

  const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year

  const verification = await prisma.skillVerification.upsert({
    where: { userId_skill: { userId: session.user.id, skill } },
    create: { userId: session.user.id, skill, method, score: score ?? null, evidenceUrl: evidenceUrl ?? null, expiresAt },
    update: { method, score: score ?? null, evidenceUrl: evidenceUrl ?? null, verifiedAt: new Date(), expiresAt },
  });

  // Add to user's verifiedSkills array (avoid duplicates)
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { verifiedSkills: true } });
  if (user && !user.verifiedSkills.includes(skill)) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { verifiedSkills: { push: skill } },
    });
  }

  return NextResponse.json(verification, { status: 201 });
}
