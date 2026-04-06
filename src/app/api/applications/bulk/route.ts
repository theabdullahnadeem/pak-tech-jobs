import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { PipelineStage, RejectionReason } from "@prisma/client";
import { recalculateRecruiterMetrics } from "@/lib/recruiterMetrics";

// Stages allowed for bulk advance
const ALLOWED_ADVANCE_STAGES: PipelineStage[] = [
  PipelineStage.SHORTLISTED,
  PipelineStage.INTERVIEW,
  PipelineStage.OFFER,
];

const VALID_REJECTION_REASONS = Object.values(RejectionReason);

const REJECTION_REASON_LABELS: Record<RejectionReason, string> = {
  PORTFOLIO_GAP: "Portfolio Gap",
  SALARY_MISMATCH: "Salary Mismatch",
  SPECIFIC_SKILL_MISSING: "Specific Skill Missing",
  ROLE_FILLED: "Role Filled",
  OVERQUALIFIED: "Overqualified",
};

/**
 * POST /api/applications/bulk
 *
 * Advance or reject multiple applications simultaneously.
 * - Requires authenticated RECRUITER.
 * - Body: { applicationIds: string[], action: "advance" | "reject", stage?: PipelineStage,
 *           rejectionReason?: RejectionReason, recruiterNotes?: string }
 * - Validates all applicationIds belong to the recruiter's job posts (403 otherwise).
 * - For "advance": stage must be SHORTLISTED, INTERVIEW, or OFFER.
 * - For "reject": rejectionReason is required (Requirement 5.7).
 * - Sets firstActionAt = now() if not already set.
 * - Creates INTERVIEW notifications for advance to INTERVIEW stage.
 * - Creates REJECTION_REASON notifications for each rejected applicant.
 * - Recalculates recruiter metrics after all updates.
 * - Returns { updated: number, applicationIds: string[] }.
 *
 * Requirements: 5.7
 */
export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "RECRUITER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const {
    applicationIds,
    action,
    stage,
    rejectionReason,
    recruiterNotes,
  } = body as Record<string, unknown>;

  // Validate applicationIds
  if (
    !Array.isArray(applicationIds) ||
    applicationIds.length === 0 ||
    !applicationIds.every((id) => typeof id === "string")
  ) {
    return NextResponse.json(
      { error: "applicationIds must be a non-empty array of strings" },
      { status: 400 }
    );
  }

  // Validate action
  if (action !== "advance" && action !== "reject") {
    return NextResponse.json(
      { error: 'action must be "advance" or "reject"' },
      { status: 400 }
    );
  }

  // Validate stage for advance
  if (action === "advance") {
    if (!stage || typeof stage !== "string") {
      return NextResponse.json(
        { error: "stage is required for action=advance" },
        { status: 400 }
      );
    }
    if (!ALLOWED_ADVANCE_STAGES.includes(stage as PipelineStage)) {
      return NextResponse.json(
        {
          error: `stage must be one of: ${ALLOWED_ADVANCE_STAGES.join(", ")}`,
        },
        { status: 400 }
      );
    }
  }

  // Validate rejectionReason for reject (Requirement 5.7)
  if (action === "reject") {
    if (!rejectionReason || typeof rejectionReason !== "string") {
      return NextResponse.json(
        { error: "rejectionReason is required for action=reject" },
        { status: 400 }
      );
    }
    if (!VALID_REJECTION_REASONS.includes(rejectionReason as RejectionReason)) {
      return NextResponse.json(
        {
          error: `rejectionReason must be one of: ${VALID_REJECTION_REASONS.join(", ")}`,
        },
        { status: 400 }
      );
    }
  }

  // Fetch all requested applications with job post ownership info
  const applications = await prisma.application.findMany({
    where: { id: { in: applicationIds as string[] } },
    select: {
      id: true,
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

  // Verify all requested IDs were found and belong to this recruiter
  if (applications.length !== applicationIds.length) {
    const foundIds = new Set(applications.map((a) => a.id));
    const missing = (applicationIds as string[]).filter(
      (id) => !foundIds.has(id)
    );
    return NextResponse.json(
      { error: "Applications not found", missing },
      { status: 404 }
    );
  }

  const unauthorized = applications.filter(
    (a) => a.jobPost.recruiterId !== session.user!.id
  );
  if (unauthorized.length > 0) {
    return NextResponse.json(
      {
        error: "Forbidden: some applications do not belong to your job posts",
        applicationIds: unauthorized.map((a) => a.id),
      },
      { status: 403 }
    );
  }

  const now = new Date();
  const notes =
    recruiterNotes && typeof recruiterNotes === "string"
      ? recruiterNotes
      : undefined;

  // Execute all updates in a single transaction
  await prisma.$transaction(async (tx) => {
    if (action === "advance") {
      const targetStage = stage as PipelineStage;

      for (const app of applications) {
        await tx.application.update({
          where: { id: app.id },
          data: {
            stage: targetStage,
            ...(app.firstActionAt === null && { firstActionAt: now }),
          },
        });

        // Requirement 5.3: send INTERVIEW notification
        if (targetStage === PipelineStage.INTERVIEW) {
          await tx.notification.create({
            data: {
              userId: app.applicantId,
              type: "APPLICATION_STATUS_CHANGE",
              title: "Interview Invitation",
              body: `You've been invited to interview for ${app.jobPost.title}`,
              data: {
                applicationId: app.id,
                jobPostId: app.jobPost.id,
                stage: PipelineStage.INTERVIEW,
              },
            },
          });
        }
      }
    } else {
      // action === "reject"
      const reason = rejectionReason as RejectionReason;
      const reasonLabel = REJECTION_REASON_LABELS[reason];

      for (const app of applications) {
        await tx.application.update({
          where: { id: app.id },
          data: {
            stage: PipelineStage.REJECTED,
            rejectionReason: reason,
            ...(notes !== undefined && { recruiterNotes: notes }),
            ...(app.firstActionAt === null && { firstActionAt: now }),
          },
        });

        // Requirement 5.5: send REJECTION_REASON notification to each applicant
        const notificationBody = notes
          ? `Your application for ${app.jobPost.title} was not progressed. Reason: ${reasonLabel}. Notes: ${notes}`
          : `Your application for ${app.jobPost.title} was not progressed. Reason: ${reasonLabel}.`;

        await tx.notification.create({
          data: {
            userId: app.applicantId,
            type: "REJECTION_REASON",
            title: "Application Update",
            body: notificationBody,
            data: {
              applicationId: app.id,
              jobPostId: app.jobPost.id,
              rejectionReason: reason,
              ...(notes !== undefined && { recruiterNotes: notes }),
            },
          },
        });
      }
    }
  });

  // Recalculate recruiter metrics after all updates (Requirement 5.6)
  await recalculateRecruiterMetrics(session.user.id);

  return NextResponse.json({
    updated: applications.length,
    applicationIds: applications.map((a) => a.id),
  });
}
