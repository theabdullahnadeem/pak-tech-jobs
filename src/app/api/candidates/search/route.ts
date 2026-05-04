import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  hasCandidateSearchAccess,
  filterCandidates,
  type CandidateSearchResult,
} from "@/lib/enterpriseTier";

/**
 * GET /api/candidates/search
 *
 * Searches candidate profiles. Requires the authenticated employer to have
 * `hasCvAccess = true` OR `tier = ENTERPRISE`.
 *
 * Query parameters:
 *   skills?:          comma-separated skill names (case-insensitive)
 *   experienceLevel?: JUNIOR | MID | SENIOR | LEAD
 *
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
 */
export async function GET(req: NextRequest) {
  // 1. Authentication
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Fetch the current user to get hasCvAccess and tier
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { hasCvAccess: true, tier: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 3. Access control: hasCvAccess OR tier = ENTERPRISE
  if (!hasCandidateSearchAccess(user)) {
    return NextResponse.json(
      { error: "Candidate search requires Enterprise tier or CV access" },
      { status: 403 }
    );
  }

  // 4. Parse query parameters
  const { searchParams } = new URL(req.url);

  const skillsParam = searchParams.get("skills");
  const skills =
    skillsParam && skillsParam.trim().length > 0
      ? skillsParam.split(",").map((s) => s.trim()).filter((s) => s.length > 0)
      : undefined;

  const experienceLevel = searchParams.get("experienceLevel") ?? undefined;

  // 5. Fetch all applicants (with optional experienceLevel filter at DB level)
  const whereClause: Record<string, unknown> = { role: "APPLICANT" };
  if (experienceLevel) {
    whereClause.experienceLevel = experienceLevel;
  }

  const applicants = await prisma.user.findMany({
    where: whereClause,
    select: {
      id: true,
      name: true,
      skills: true,
      experienceLevel: true,
      location: true,
      bio: true,
      portfolioUrl: true,
      verifiedSkills: true,
    },
  });

  // 6. Map to CandidateSearchResult shape
  const candidates: CandidateSearchResult[] = applicants.map((a) => ({
    id: a.id,
    name: a.name,
    skills: a.skills,
    experienceLevel: a.experienceLevel ?? null,
    location: a.location ?? null,
    bio: a.bio ?? null,
    portfolioUrl: a.portfolioUrl ?? null,
    verifiedSkills: a.verifiedSkills,
  }));

  // 7. Post-filter by skills (case-insensitive) using the pure filterCandidates function
  const results = filterCandidates(candidates, { skills, experienceLevel });

  return NextResponse.json(results, { status: 200 });
}
