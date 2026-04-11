import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/profile
 * Returns the current authenticated user's profile fields.
 * For Applicants: skills, experienceLevel, targetRoles, openToOpportunities (Req 7.5)
 * For Recruiters: companyName, businessEmail, responseRate, avgResponseTimeHours (Req 9.1, 9.4, 9.5, 9.6)
 */
export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      role: true,
      skills: true,
      experienceLevel: true,
      targetRoles: true,
      openToOpportunities: true,
      // Recruiter-specific fields
      companyName: true,
      businessEmail: true,
      recruiterVerified: true,
      responseRate: true,
      avgResponseTimeHours: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, bio, portfolioUrl, avatarPublicId, profileSlug, openToOpportunities, skills, experienceLevel, location, targetRoles, themePreference } = body;

  // Validate profileSlug uniqueness if provided
  if (profileSlug) {
    const existing = await prisma.user.findUnique({ where: { profileSlug }, select: { id: true } });
    if (existing && existing.id !== session.user.id) {
      return NextResponse.json({ error: "Profile slug already taken" }, { status: 409 });
    }
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(name !== undefined && { name }),
      ...(bio !== undefined && { bio }),
      ...(portfolioUrl !== undefined && { portfolioUrl }),
      ...(avatarPublicId !== undefined && { avatarPublicId }),
      ...(profileSlug !== undefined && { profileSlug }),
      ...(openToOpportunities !== undefined && { openToOpportunities }),
      ...(skills !== undefined && { skills }),
      ...(experienceLevel !== undefined && { experienceLevel }),
      ...(location !== undefined && { location }),
      ...(targetRoles !== undefined && { targetRoles }),
      ...(themePreference !== undefined && { themePreference }),
    },
    select: { id: true, name: true, bio: true, portfolioUrl: true, profileSlug: true, openToOpportunities: true, skills: true, experienceLevel: true, location: true, targetRoles: true, themePreference: true },
  });

  return NextResponse.json(updated);
}
