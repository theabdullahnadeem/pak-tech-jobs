import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// PATCH /api/messages/threads/[threadId]/decline
// Applicant declines a headhunt outreach — sets applicantAccepted = false
// and records declinedAt in HeadhuntOutreach (enforces 30-day cooldown)
// Requirements: 8.5, 14.5
export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { threadId } = await params;
  const userId = session.user.id;

  const thread = await prisma.messageThread.findUnique({
    where: { id: threadId },
    select: {
      id: true,
      applicantId: true,
      recruiterId: true,
      isHeadhunt: true,
      applicantAccepted: true,
    },
  });

  if (!thread) {
    return NextResponse.json({ error: "Thread not found" }, { status: 404 });
  }

  if (!thread.isHeadhunt) {
    return NextResponse.json({ error: "Not a headhunt thread" }, { status: 400 });
  }

  if (thread.applicantId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (thread.applicantAccepted !== null) {
    return NextResponse.json(
      { error: "Outreach already responded to" },
      { status: 409 }
    );
  }

  const now = new Date();

  // Update thread and record declinedAt in HeadhuntOutreach in a transaction
  const [updated] = await prisma.$transaction([
    prisma.messageThread.update({
      where: { id: threadId },
      data: { applicantAccepted: false },
      select: { id: true, applicantAccepted: true },
    }),
    prisma.headhuntOutreach.updateMany({
      where: {
        recruiterId: thread.recruiterId,
        applicantId: thread.applicantId,
        declinedAt: null,
      },
      data: { declinedAt: now },
    }),
  ]);

  return NextResponse.json(updated);
}
