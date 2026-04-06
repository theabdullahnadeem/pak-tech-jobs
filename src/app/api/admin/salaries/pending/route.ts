import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/admin/salaries/pending — Admin only
// Returns all SalaryEntry records with verificationStatus=PENDING
// Requirements: 12.5
export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const pending = await prisma.salaryEntry.findMany({
      where: { verificationStatus: "PENDING" },
      include: {
        submittedBy: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(pending);
  } catch (error) {
    console.error("[GET /api/admin/salaries/pending] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch pending salary entries" },
      { status: 500 }
    );
  }
}
