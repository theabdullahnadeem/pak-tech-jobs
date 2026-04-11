import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { PipelineStage } from "@prisma/client";
import { recalculateRecruiterMetrics } from "@/lib/recruiterMetrics";
import { emitToUser } from "@/lib/socketio";
import { sendEmail, stageChangeEmail, offerEmail } from "@/lib/email";

// Stages that can be set via this endpoint (REJECTED uses a separate endpoint)
const ALLOWED_STAGES: PipelineStage[] = [
  PipelineStage.SEEN,
  PipelineStage.SHORTLISTED,
  PipelineStage.INTERVIEW,
  PipelineStage.OFFER,
];

/**
 * GET /api/applications/[id]
 *
 * Returns full application details.
 * - RECRUITER: must own the job post.
 * - APPLICANT: must be the applicant who submitted the application.
 *
 * Requirements: 4.1, 4.3
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const application = await prisma.application.findUnique({
    where: { id },
    select: {
      id: true,
      stage: true,
      submittedAt: true,
      updatedAt: true,
      recruiterNotes: true,
      rejectionReason: true,
      applicantName: true,
      applicantEmail: true,
      applicantPhone: true,
      yearsOfExperience: true,
      coverLetter: true,
      cvPublicId: true,
      cvFileName: true,
      jobPost: {
        select: {
          id: true,
          title: true,
          recruiterId: true,
          city: true,
          jobType: true,
          experienceLevel: true,
          salaryMin: true,
          salaryMax: true,
          recruiter: {
            select: { id: true, name: true, companyName: true },
          },
        },
      },
      applicant: {
        select: {
          id: true,
          name: true,
          email: true,
          skills: true,
          experienceLevel: true,
          location: true,
        },
      },
    },
  });

  if (!application) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  if (session.user.role === "RECRUITER") {
    if (application.jobPost.recruiterId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json(application);
  }

  if (session.user.role === "APPLICANT") {
    if (application.applicant.id !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json(application);
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

/**
 * PATCH /api/applications/[id]
 *
 * Advance an application's pipeline stage.
 * - Requires authenticated RECRUITER who owns the job post.
 * - Body: { stage: PipelineStage } — only SHORTLISTED, INTERVIEW, OFFER allowed here.
 * - Auto-advances APPLIED → SEEN on first view (records firstSeenAt + firstActionAt).
 * - Sends APPLICATION_STATUS_CHANGE notification when stage reaches INTERVIEW.
 * - Recalculates recruiter responseRate and avgResponseTimeHours after every change.
 *
 * Requirements: 5.2, 5.3, 5.6, 9.2, 9.3, 9.7
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "RECRUITER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Fetch the application with job post and applicant info
  const application = await prisma.application.findUnique({
    where: { id },
    select: {
      id: true,
      stage: true,
      firstSeenAt: true,
      firstActionAt: true,
      applicantId: true,
      jobPost: {
        select: {
          id: true,
          title: true,
          recruiterId: true,
        },
      },
    },
  });

  if (!application) {
    return NextResponse.json(
      { error: "Application not found" },
      { status: 404 }
    );
  }

  // Verify the recruiter owns this job post
  if (application.jobPost.recruiterId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { stage } = body as Record<string, unknown>;

  if (!stage || typeof stage !== "string") {
    return NextResponse.json(
      { error: "stage is required" },
      { status: 400 }
    );
  }

  if (!ALLOWED_STAGES.includes(stage as PipelineStage)) {
    return NextResponse.json(
      {
        error: `stage must be one of: ${ALLOWED_STAGES.join(", ")}. Use the reject endpoint for REJECTED.`,
      },
      { status: 400 }
    );
  }

  const targetStage = stage as PipelineStage;
  const now = new Date();

  // Build the update data
  const updateData: {
    stage: PipelineStage;
    firstSeenAt?: Date;
    firstActionAt?: Date;
  } = { stage: targetStage };

  // Requirement 5.2: auto-advance APPLIED → SEEN on first view
  if (
    application.stage === PipelineStage.APPLIED &&
    application.firstSeenAt === null
  ) {
    updateData.firstSeenAt = now;
    if (application.firstActionAt === null) {
      updateData.firstActionAt = now;
    }
  }

  if (application.firstActionAt === null && !updateData.firstActionAt) {
    updateData.firstActionAt = now;
  }

  let interviewNotification: { id: string; userId: string; type: string; title: string; body: string; data: unknown } | null = null;

  const updatedApplication = await prisma.$transaction(async (tx) => {
    const updated = await tx.application.update({
      where: { id },
      data: updateData,
    });

    // Requirement 5.3: send notification when advancing to INTERVIEW
    if (targetStage === PipelineStage.INTERVIEW) {
      interviewNotification = await tx.notification.create({
        data: {
          userId: application.applicantId,
          type: "APPLICATION_STATUS_CHANGE",
          title: "Interview Invitation",
          body: `You've been invited to interview for ${application.jobPost.title}`,
          data: {
            applicationId: id,
            jobPostId: application.jobPost.id,
            stage: PipelineStage.INTERVIEW,
          },
        },
      });
    }

    return updated;
  });

  // Recalculate recruiter metrics after every stage change
  await recalculateRecruiterMetrics(application.jobPost.recruiterId);

  // Emit real-time events to the applicant — include jobTitle in payload (Requirement 5.4)
  emitToUser(application.applicantId, "application:stage_changed", {
    applicationId: id,
    newStage: targetStage,
    jobTitle: application.jobPost.title,
  });

  if (interviewNotification) {
    emitToUser(application.applicantId, "notification:new", interviewNotification);
  }

  // Send email notification for significant stage changes
  if (["SHORTLISTED", "INTERVIEW", "OFFER"].includes(targetStage)) {
    const applicantUser = await prisma.user.findUnique({
      where: { id: application.applicantId },
      select: { email: true, name: true },
    });
    if (applicantUser) {
      const html = targetStage === "OFFER"
        ? offerEmail({ applicantName: applicantUser.name, jobTitle: application.jobPost.title, company: application.jobPost.title })
        : stageChangeEmail({ applicantName: applicantUser.name, jobTitle: application.jobPost.title, company: application.jobPost.title, newStage: targetStage, applicationId: id });
      sendEmail({ to: applicantUser.email, subject: `Application Update: ${application.jobPost.title}`, html }).catch(() => {});
    }
  }

  return NextResponse.json(updatedApplication);
}
