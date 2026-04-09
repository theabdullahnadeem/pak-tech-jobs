import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { emitToUser, getSocketIO } from "@/lib/socketio";
import { rateLimitByUser, RATE_LIMITS } from "@/lib/rateLimit";

// POST /api/messages — Send a message in a thread
// Requirements: 8.1, 8.2, 8.3, 8.4
export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = await rateLimitByUser(session.user.id, RATE_LIMITS.messaging);
  if (rl) return rl;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { threadId, content } = body as Record<string, unknown>;

  if (!threadId || typeof threadId !== "string") {
    return NextResponse.json({ error: "threadId is required" }, { status: 400 });
  }

  if (!content || typeof content !== "string" || content.trim() === "") {
    return NextResponse.json({ error: "content is required" }, { status: 400 });
  }

  const senderId = session.user.id;

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

  // Requirement 8.1: only participants can send messages
  const isApplicant = thread.applicantId === senderId;
  const isRecruiter = thread.recruiterId === senderId;

  if (!isApplicant && !isRecruiter) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Headhunt thread restrictions:
  // Block sending if applicantAccepted is null (pending) or false (declined)
  // unless the sender is the recruiter sending the initial outreach
  if (thread.isHeadhunt && thread.applicantAccepted !== true) {
    // Count existing messages to determine if this is the initial outreach
    const existingCount = await prisma.message.count({ where: { threadId } });

    // Recruiter can only send the first message (initial outreach)
    if (isRecruiter && existingCount === 0) {
      // Allow — this is the initial headhunt outreach message
    } else if (thread.applicantAccepted === false) {
      return NextResponse.json(
        { error: "Applicant has declined this outreach" },
        { status: 403 }
      );
    } else {
      // applicantAccepted is null (pending) and not the initial outreach
      return NextResponse.json(
        { error: "Applicant has not yet accepted this outreach" },
        { status: 403 }
      );
    }
  }

  // Persist the message
  const message = await prisma.message.create({
    data: {
      threadId,
      senderId,
      content: content.trim(),
      // sentAt defaults to now() via schema
    },
  });

  // Determine the recipient (the other participant)
  const recipientId = isApplicant ? thread.recruiterId : thread.applicantId;

  // Requirement 8.2: emit message:new to recipient in real time
  emitToUser(recipientId, "message:new", { threadId, message });

  // Requirement 8.2 / 8.4: check if recipient is online and set deliveredAt
  const socketIO = getSocketIO();
  const recipientRoom = `user:${recipientId}`;
  const isRecipientOnline =
    socketIO?.sockets.adapter.rooms.has(recipientRoom) ?? false;

  if (isRecipientOnline) {
    const deliveredAt = new Date();

    const deliveredMessage = await prisma.message.update({
      where: { id: message.id },
      data: { deliveredAt },
    });

    // Emit message:delivered to the sender
    emitToUser(senderId, "message:delivered", { messageId: message.id });

    return NextResponse.json(deliveredMessage, { status: 201 });
  }

  return NextResponse.json(message, { status: 201 });
}
