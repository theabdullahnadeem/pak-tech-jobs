import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  if (!code) return NextResponse.json({ error: "code required" }, { status: 400 });

  const referral = await prisma.referral.findUnique({
    where: { code },
    include: { jobPost: { select: { id: true, title: true } } },
  });

  if (!referral) return NextResponse.json({ error: "Invalid referral code" }, { status: 404 });
  if (referral.expiresAt && referral.expiresAt < new Date()) {
    return NextResponse.json({ error: "Referral link expired" }, { status: 410 });
  }

  // Increment click count
  await prisma.referral.update({ where: { code }, data: { clicks: { increment: 1 } } });

  // Redirect to the job post
  return NextResponse.redirect(new URL(`/jobs/${referral.jobPost.id}?ref=${code}`, req.url));
}
