import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { RejectionReason } from "@prisma/client";
import { recalculateRecruiterMetrics } from "@/lib/recruiterMetrics";
import { emitToUser } from "@/lib/socketio";

const REJECTION_REASON_LABELS: Record<RejectionReason, string> = {
  PORTFOLIO_GAP: "Portfolio Gap",
  SALARY_MISMATCH: "Salary Mismatch",
  SPECIFIC_SKILL_MISSING: "Specific Skill Missing",
  ROLE_FILLED: "Role Filled",
  OVERQUALIFIED: "Overqualified",
};

const VALID_REJECTION_REASONS = Object.values(RejectionReason);

/**
 * PATCH /api/applications/[id]/reject
 *
 * Reject an application with a mandatory structured reason.
 * - Requires authenticated RECRUITER who owns the job post.
 * - Body: { rejectionReason: RejectionReason, recruiterNotes?: string }
 * - Returns 400 if rejectionReason is missing or not a valid enum value.
 * - Sets stage = REJECTED, stores rejectionReason and optional recruiterNotes.
 * - Sets firstActionAt = now() if not already set.
 * - Creates a REJECTION_REASON notification for the applicant.
 * - Recalculates recruiter metrics after rejection.
 *
 * Requirements: 5.4, 5.5
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

  const application = await prisma.application.findUnique({
    where: { id },
    select: {
      id: true,
      stage: true,
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

  if (application.jobPost.recruiterId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { rejectionReason, recruiterNotes } = body as Record<string, unknown>;

  // Requirement 5.4: rejectionReason is required
  if (!rejectionReason || typeof rejectionReason !== "string") {
    return NextResponse.json(
      { error: "rejectionReason is required" },
      { status: 400 }
    );
  }

  // Requirement 5.4: must be a valid enum value
  if (!VALID_REJECTION_REASONS.includes(rejectionReason as RejectionReason)) {
    return NextResponse.json(
      {
        error: `rejectionReason must be one of: ${VALID_REJECTION_REASONS.join(", ")}`,
      },
      { status: 400 }
    );
  }

  const reason = rejectionReason as RejectionReason;
  const notes =
    recruiterNotes && typeof recruiterNotes === "string"
      ? recruiterNotes
      : undefined;
  const now = new Date();

  // Build notification body
  const reasonLabel = REJECTION_REASON_LABELS[reason];
  const notificationBody = notes
    ? `Your application for ${application.jobPost.title} was not progressed. Reason: ${reasonLabel}. Notes: ${notes}`
    : `Your application for ${application.jobPost.title} was not progressed. Reason: ${reasonLabel}.`;

  const updatedApplication = await prisma.$transaction(async (tx) => {
    const updated = await tx.application.update({
      where: { id },
      data: {
        stage: "REJECTED",
        rejectionReason: reason,
        ...(notes !== undefined && { recruiterNotes: notes }),
        // Set firstActionAt only if not already recorded
        ...(application.firstActionAt === null && { firstActionAt: now }),
      },
    });

    // Requirement 5.5: send REJECTION_REASON notification to applicant
    const notification = await tx.notification.create({
      data: {
        userId: application.applicantId,
        type: "REJECTION_REASON",
        title: "Application Update",
        body: notificationBody,
        data: {
          applicationId: id,
          jobPostId: application.jobPost.id,
          rejectionReason: reason,
          ...(notes !== undefined && { recruiterNotes: notes }),
        },
      },
    });

    return { updated, notification };
  });

  // Recalculate recruiter metrics after rejection
  await recalculateRecruiterMetrics(application.jobPost.recruiterId);

  // Requirement 7.2, 13.1: emit real-time events to the applicant (non-blocking)
  emitToUser(application.applicantId, "application:stage_changed", {
    applicationId: id,
    newStage: "REJECTED",
  });
  emitToUser(application.applicantId, "notification:new", updatedApplication.notification);

  return NextResponse.json(updatedApplication.updated);
}
