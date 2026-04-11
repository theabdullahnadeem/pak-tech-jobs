import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const user = await prisma.user.findUnique({
    where: { profileSlug: slug },
    select: {
      id: true,
      name: true,
      bio: true,
      avatarPublicId: true,
      portfolioUrl: true,
      skills: true,
      verifiedSkills: true,
      experienceLevel: true,
      location: true,
      openToOpportunities: true,
      targetRoles: true,
      role: true,
      createdAt: true,
      skillVerifications: {
        select: { skill: true, method: true, verifiedAt: true },
        orderBy: { verifiedAt: "desc" },
      },
    },
  });

  if (!user || user.role !== "APPLICANT") {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}
