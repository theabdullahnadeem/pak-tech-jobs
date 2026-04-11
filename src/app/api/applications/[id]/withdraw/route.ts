import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "APPLICANT") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const application = await prisma.application.findUnique({
    where: { id },
    select: { id: true, applicantId: true, stage: true, isWithdrawn: true },
  });

  if (!application) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (application.applicantId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (application.isWithdrawn) return NextResponse.json({ error: "Already withdrawn" }, { status: 400 });
  if (["OFFER", "REJECTED", "EXPIRED"].includes(application.stage)) {
    return NextResponse.json({ error: "Cannot withdraw at this stage" }, { status: 400 });
  }

  const updated = await prisma.application.update({
    where: { id },
    data: { isWithdrawn: true, withdrawnAt: new Date() },
  });

  return NextResponse.json(updated);
}
