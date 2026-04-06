import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireVerifiedRecruiter } from "@/lib/requireVerifiedRecruiter";
import { ExperienceLevel } from "@prisma/client";

// GET /api/talent — verified Recruiters only
// Returns applicant profiles where openToOpportunities = true
// Filterable by skills (any match), experienceLevel, and location (case-insensitive contains)
// Requirements: 14.1, 14.2
export async function GET(req: NextRequest) {
  const session = await auth();
  const guard = await requireVerifiedRecruiter(session);
  if (guard) return guard;

  const { searchParams } = req.nextUrl;

  const skillsParam = searchParams.get("skills");
  const experienceLevelParam = searchParams.get("experienceLevel");
  const locationParam = searchParams.get("location");

  // Parse skills: comma-separated list
  const skills = skillsParam
    ? skillsParam.split(",").map((s) => s.trim()).filter(Boolean)
    : undefined;

  // Validate experienceLevel enum
  const experienceLevel =
    experienceLevelParam &&
    Object.values(ExperienceLevel).includes(experienceLevelParam as ExperienceLevel)
      ? (experienceLevelParam as ExperienceLevel)
      : undefined;

  try {
    const profiles = await prisma.user.findMany({
      where: {
        role: "APPLICANT",
        openToOpportunities: true,
        ...(skills && skills.length > 0
          ? { skills: { hasSome: skills } }
          : {}),
        ...(experienceLevel ? { experienceLevel } : {}),
        ...(locationParam
          ? { location: { contains: locationParam, mode: "insensitive" } }
          : {}),
      },
      select: {
        id: true,
        name: true,
        skills: true,
        experienceLevel: true,
        location: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(profiles);
  } catch (error) {
    console.error("[GET /api/talent] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch talent pool" },
      { status: 500 }
    );
  }
}
