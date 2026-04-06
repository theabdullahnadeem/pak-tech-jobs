import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/admin/recruiters/pending — Admin only
// Returns all recruiters pending verification (role=RECRUITER, recruiterVerified=false)
// Requirements: 12.1, 12.2
export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const pending = await prisma.user.findMany({
      where: {
        role: "RECRUITER",
        recruiterVerified: false,
      },
      select: {
        id: true,
        email: true,
        name: true,
        companyName: true,
        businessEmail: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(pending);
  } catch (error) {
    console.error("[GET /api/admin/recruiters/pending] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch pending recruiters" },
      { status: 500 }
    );
  }
}
