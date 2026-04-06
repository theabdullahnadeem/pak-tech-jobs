import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Role } from "@prisma/client";

// PATCH /api/headhunt/[threadId]/accept — Applicant accepts or declines headhunt outreach
// Requirements: 8.5, 14.3, 14.5
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== Role.APPLICANT) {
    return NextResponse.json({ error: "Forbidden: applicants only" }, { status: 403 });
  }

  const { threadId } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { accept } = body as Record<string, unknown>;

  if (typeof accept !== "boolean") {
    return NextResponse.json({ error: "accept (boolean) is required" }, { status: 400 });
  }

  const applicantId = session.user.id;

  // Fetch the thread and verify ownership
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

  if (thread.applicantId !== applicantId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (thread.applicantAccepted !== null) {
    return NextResponse.json(
      { error: "Outreach has already been responded to" },
      { status: 409 }
    );
  }

  if (accept) {
    // Requirement 14.3: applicant accepts — allow further messages
    const updatedThread = await prisma.messageThread.update({
      where: { id: threadId },
      data: { applicantAccepted: true },
    });

    return NextResponse.json(updatedThread, { status: 200 });
  } else {
    // Requirement 14.5: applicant declines — set declinedAt on HeadhuntOutreach
    const [updatedThread] = await prisma.$transaction([
      prisma.messageThread.update({
        where: { id: threadId },
        data: { applicantAccepted: false },
      }),
      prisma.headhuntOutreach.update({
        where: {
          recruiterId_applicantId: {
            recruiterId: thread.recruiterId,
            applicantId,
          },
        },
        data: { declinedAt: new Date() },
      }),
    ]);

    return NextResponse.json(updatedThread, { status: 200 });
  }
}
