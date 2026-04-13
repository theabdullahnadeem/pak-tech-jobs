import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCached, setCached } from "@/lib/cache";

// GET /api/stats — public endpoint returning platform counts
export async function GET() {
  const cacheKey = "platform:stats";
  const cached = await getCached<{ jobs: number; companies: number; developers: number }>(cacheKey);
  if (cached) return NextResponse.json(cached);

  const [jobs, companies, developers] = await Promise.all([
    prisma.jobPost.count({ where: { isActive: true, isClosed: false } }),
    prisma.user.count({ where: { role: "RECRUITER", recruiterVerified: true } }),
    prisma.user.count({ where: { role: "APPLICANT" } }),
  ]);

  const result = { jobs, companies, developers };
  await setCached(cacheKey, result, 300); // 5 min cache

  return NextResponse.json(result);
}
