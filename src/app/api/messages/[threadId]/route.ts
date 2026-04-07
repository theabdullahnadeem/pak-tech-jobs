import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/messages/[threadId] — Fetch message history for a thread
// Requirements: 8.1, 8.2, 8.3, 8.4
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { threadId } = await params;
  const userId = session.user.id;

  // Fetch thread and verify participant
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

  // Requirement 8.1: only participants can access the thread
  const isParticipant =
    thread.applicantId === userId || thread.recruiterId === userId;

  if (!isParticipant) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // For headhunt threads where applicantAccepted is null or false,
  // only return the initial message (block further messages until accepted)
  const messages = await prisma.message.findMany({
    where: { threadId },
    orderBy: { sentAt: "asc" as const },
    ...(thread.isHeadhunt && thread.applicantAccepted !== true ? { take: 1 } : {}),
  });

  return NextResponse.json(messages);
}
