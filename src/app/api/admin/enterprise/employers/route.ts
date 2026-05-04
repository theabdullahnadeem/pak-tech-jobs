import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  // 1. Authentication
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Authorization — admin only
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 3. Query enterprise employers
  const employers = await prisma.user.findMany({
    where: { role: "RECRUITER", tier: "ENTERPRISE" },
    select: {
      id: true,
      name: true,
      companyName: true,
      subscriptionExpiry: true,
      maxRecruiterSeats: true,
      accountManagerName: true,
      hasCvAccess: true,
    },
  });

  return NextResponse.json(employers, { status: 200 });
}
