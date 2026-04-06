import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      suspended: true,
      recruiterVerified: true,
      companyName: true,
      businessEmail: true,
      skills: true,
      experienceLevel: true,
      location: true,
      _count: { select: { jobPosts: true, applications: true } },
    },
  });

  return NextResponse.json(users);
}
