import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireVerifiedRecruiter } from "@/lib/requireVerifiedRecruiter";
import { emitToUser } from "@/lib/socketio";

// POST /api/headhunt — Recruiter initiates headhunt outreach to an applicant
// Requirements: 8.5, 14.3, 14.4, 14.5
export async function POST(req: NextRequest) {
  const session = await auth();

  // Require verified recruiter (handles 401/403 for unauth, wrong role, suspended, unverified)
  const guard = await requireVerifiedRecruiter(session);
  if (guard) return guard;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { applicantId, message } = body as Record<string, unknown>;

  if (!applicantId || typeof applicantId !== "string") {
    return NextResponse.json({ error: "applicantId is required" }, { status: 400 });
  }

  if (!message || typeof message !== "string" || message.trim() === "") {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  const recruiterId = session!.user.id;

  // Verify the target applicant exists
  const applicant = await prisma.user.findUnique({
    where: { id: applicantId },
    select: { id: true, role: true },
  });

  if (!applicant || applicant.role !== "APPLICANT") {
    return NextResponse.json({ error: "Applicant not found" }, { status: 404 });
  }

  // Requirement 14.5: 30-day cooldown after decline
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const existingOutreach = await prisma.headhuntOutreach.findUnique({
    where: { recruiterId_applicantId: { recruiterId, applicantId } },
    select: { declinedAt: true },
  });

  if (existingOutreach?.declinedAt && existingOutreach.declinedAt > thirtyDaysAgo) {
    return NextResponse.json(
      {
        error:
          "You cannot send another outreach to this applicant for 30 days after they declined.",
      },
      { status: 429 }
    );
  }

  // Requirement 14.4: max 20 outreach messages per 24 hours per recruiter
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentOutreachCount = await prisma.headhuntOutreach.count({
    where: {
      recruiterId,
      sentAt: { gte: twentyFourHoursAgo },
    },
  });

  if (recentOutreachCount >= 20) {
    return NextResponse.json(
      { error: "Rate limit exceeded: maximum 20 headhunt outreach messages per 24 hours." },
      { status: 429 }
    );
  }

  // Create or update the HeadhuntOutreach record, MessageThread, and initial Message
  // in a transaction to keep everything consistent
  const result = await prisma.$transaction(async (tx) => {
    // Upsert HeadhuntOutreach (reset declinedAt if re-reaching after cooldown expired)
    await tx.headhuntOutreach.upsert({
      where: { recruiterId_applicantId: { recruiterId, applicantId } },
      create: { recruiterId, applicantId },
      update: { sentAt: new Date(), declinedAt: null },
    });

    // Create a new MessageThread for this outreach
    const thread = await tx.messageThread.create({
      data: {
        applicantId,
        recruiterId,
        isHeadhunt: true,
        applicantAccepted: null, // pending acceptance
      },
    });

    // Create the initial outreach message
    const msg = await tx.message.create({
      data: {
        threadId: thread.id,
        senderId: recruiterId,
        content: message.trim(),
      },
    });

    return { thread, msg };
  });

  // Requirement 8.5 / 14.3: emit message:new to applicant labelled as "Headhunt Outreach"
  emitToUser(applicantId, "message:new", {
    threadId: result.thread.id,
    message: result.msg,
    label: "Headhunt Outreach",
  });

  return NextResponse.json(
    { threadId: result.thread.id, messageId: result.msg.id },
    { status: 201 }
  );
}
