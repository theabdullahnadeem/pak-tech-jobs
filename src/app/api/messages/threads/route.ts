import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/messages/threads — List all MessageThreads for the current user
// Returns threads where the user is either the applicant or recruiter,
// with the latest message preview.
// Requirements: 8.1
export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const threads = await prisma.messageThread.findMany({
    where: {
      OR: [{ applicantId: userId }, { recruiterId: userId }],
    },
    include: {
      applicant: { select: { id: true, name: true } },
      recruiter: { select: { id: true, name: true, companyName: true } },
      messages: {
        orderBy: { sentAt: "desc" },
        take: 1,
        select: {
          id: true,
          content: true,
          sentAt: true,
          senderId: true,
          deliveredAt: true,
          readAt: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const result = threads.map((t) => ({
    id: t.id,
    applicationId: t.applicationId,
    isHeadhunt: t.isHeadhunt,
    applicantAccepted: t.applicantAccepted,
    applicant: t.applicant,
    recruiter: t.recruiter,
    latestMessage: t.messages[0] ?? null,
  }));

  return NextResponse.json(result);
}
