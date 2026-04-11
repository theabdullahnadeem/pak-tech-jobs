import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { rateLimitByUser, RATE_LIMITS } from "@/lib/rateLimit";
import { emitToUser } from "@/lib/socketio";
import { sendEmail, interviewInviteEmail } from "@/lib/email";

// GET — list interviews for current user
export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const where = session.user.role === "RECRUITER"
    ? { recruiterId: session.user.id }
    : { applicantId: session.user.id };

  const interviews = await prisma.interviewSlot.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      recruiter: { select: { id: true, name: true, companyName: true } },
      applicant: { select: { id: true, name: true, email: true } },
    },
  });

  return NextResponse.json(interviews);
}

// POST — recruiter proposes interview slots
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "RECRUITER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const rl = await rateLimitByUser(session.user.id, RATE_LIMITS.interview);
  if (rl) return rl;

  const body = await req.json();
  const { applicationId, proposedSlots, meetingLink, notes } = body;

  if (!applicationId || !proposedSlots || !Array.isArray(proposedSlots) || proposedSlots.length === 0) {
    return NextResponse.json({ error: "applicationId and proposedSlots required" }, { status: 400 });
  }

  // Verify recruiter owns this application's job
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    select: { applicantId: true, jobPost: { select: { recruiterId: true, title: true } } },
  });

  if (!application) return NextResponse.json({ error: "Application not found" }, { status: 404 });
  if (application.jobPost.recruiterId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const interview = await prisma.interviewSlot.create({
    data: {
      applicationId,
      recruiterId: session.user.id,
      applicantId: application.applicantId,
      proposedSlots: proposedSlots.map((s: string) => new Date(s)),
      meetingLink: meetingLink || null,
      notes: notes || null,
    },
  });

  // Notify applicant
  const notification = await prisma.notification.create({
    data: {
      userId: application.applicantId,
      type: "INTERVIEW_SCHEDULED",
      title: "Interview Invitation",
      body: `You have been invited to interview for ${application.jobPost.title}. Please select a time slot.`,
      data: { interviewId: interview.id, applicationId },
    },
  });

  emitToUser(application.applicantId, "notification:new", notification);
  emitToUser(application.applicantId, "interview:invited", { interviewId: interview.id, applicationId });

  // Send interview invite email (non-blocking)
  const applicantUser = await prisma.user.findUnique({
    where: { id: application.applicantId },
    select: { email: true, name: true },
  });
  if (applicantUser) {
    sendEmail({
      to: applicantUser.email,
      subject: `Interview Invitation: ${application.jobPost.title}`,
      html: interviewInviteEmail({
        applicantName: applicantUser.name,
        jobTitle: application.jobPost.title,
        company: application.jobPost.title,
        slots: proposedSlots,
      }),
    }).catch(() => {});
  }

  return NextResponse.json(interview, { status: 201 });
}
