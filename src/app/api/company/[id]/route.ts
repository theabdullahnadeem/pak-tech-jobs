import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET — public company profile
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const company = await prisma.user.findUnique({
    where: { id, role: "RECRUITER" },
    select: {
      id: true,
      name: true,
      companyName: true,
      companyDescription: true,
      companyWebsite: true,
      companyLogoPublicId: true,
      companySize: true,
      companyIndustry: true,
      companyLocation: true,
      recruiterVerified: true,
      responseRate: true,
      avgResponseTimeHours: true,
      jobPosts: {
        where: { isActive: true, isClosed: false },
        select: { id: true, title: true, city: true, jobType: true, experienceLevel: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      reviewsReceived: {
        select: { rating: true, comment: true, createdAt: true, giver: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!company) return NextResponse.json({ error: "Company not found" }, { status: 404 });

  const avgRating = company.reviewsReceived.length > 0
    ? company.reviewsReceived.reduce((sum, r) => sum + r.rating, 0) / company.reviewsReceived.length
    : null;

  return NextResponse.json({ ...company, avgRating });
}

// PATCH — recruiter updates their own company profile
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (session.user.id !== id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { companyDescription, companyWebsite, companyLogoPublicId, companySize, companyIndustry, companyLocation } = body;

  const updated = await prisma.user.update({
    where: { id },
    data: {
      ...(companyDescription !== undefined && { companyDescription }),
      ...(companyWebsite !== undefined && { companyWebsite }),
      ...(companyLogoPublicId !== undefined && { companyLogoPublicId }),
      ...(companySize !== undefined && { companySize }),
      ...(companyIndustry !== undefined && { companyIndustry }),
      ...(companyLocation !== undefined && { companyLocation }),
    },
    select: { id: true, companyName: true, companyDescription: true, companyWebsite: true, companySize: true, companyIndustry: true, companyLocation: true },
  });

  return NextResponse.json(updated);
}
