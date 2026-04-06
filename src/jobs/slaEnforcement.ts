import { prisma } from "@/lib/prisma";
import { PipelineStage, NotificationType } from "@prisma/client";
import { recalculateRecruiterMetrics } from "@/lib/recruiterMetrics";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

// Stages that are still active (not yet resolved)
const ACTIVE_STAGES: PipelineStage[] = [
  PipelineStage.APPLIED,
  PipelineStage.SEEN,
  PipelineStage.SHORTLISTED,
  PipelineStage.INTERVIEW,
];

export interface SlaEnforcementResult {
  warned7: number;
  warned13: number;
  expired: number;
}

/**
 * Daily sweep that enforces SLA windows on applications.
 *
 * - 7-day warning: notifies recruiter, sets slaWarning7Sent = true
 * - 13-day warning: notifies recruiter, sets slaWarning13Sent = true
 * - 14-day breach: transitions application to EXPIRED, notifies applicant,
 *   and recalculates recruiter response rate
 *
 * Requirements: 6.1, 6.2, 6.3, 6.6
 */
export async function runSlaEnforcement(): Promise<SlaEnforcementResult> {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * MS_PER_DAY);

  // Query all active applications submitted at least 7 days ago with no recruiter action
  const applications = await prisma.application.findMany({
    where: {
      stage: { in: ACTIVE_STAGES },
      firstActionAt: null,
      submittedAt: { lte: sevenDaysAgo },
    },
    select: {
      id: true,
      submittedAt: true,
      applicantId: true,
      slaWarning7Sent: true,
      slaWarning13Sent: true,
      jobPost: {
        select: {
          id: true,
          title: true,
          recruiterId: true,
        },
      },
    },
  });

  let warned7 = 0;
  let warned13 = 0;
  let expired = 0;

  // Collect unique recruiter IDs that need metric recalculation after expiry
  const recruitersToRecalculate = new Set<string>();

  for (const app of applications) {
    const elapsedMs = now.getTime() - app.submittedAt.getTime();
    const elapsedDays = elapsedMs / MS_PER_DAY;

    if (elapsedDays >= 14) {
      // SLA breach — expire the application
      await prisma.$transaction(async (tx) => {
        await tx.application.update({
          where: { id: app.id },
          data: { stage: PipelineStage.EXPIRED },
        });

        // Requirement 6.2: notify applicant of expiry
        await tx.notification.create({
          data: {
            userId: app.applicantId,
            type: NotificationType.SLA_BREACH,
            title: "Application Expired",
            body: "Your application has expired (no response after 14 days)",
            data: {
              applicationId: app.id,
              jobPostId: app.jobPost.id,
              jobTitle: app.jobPost.title,
            },
          },
        });
      });

      // Requirement 6.3: recalculate recruiter response rate after expiry
      recruitersToRecalculate.add(app.jobPost.recruiterId);
      expired++;
    } else if (elapsedDays >= 13 && !app.slaWarning13Sent) {
      // 13-day warning to recruiter
      await prisma.$transaction(async (tx) => {
        await tx.application.update({
          where: { id: app.id },
          data: { slaWarning13Sent: true },
        });

        await tx.notification.create({
          data: {
            userId: app.jobPost.recruiterId,
            type: NotificationType.SLA_WARNING,
            title: "Application SLA Warning: 13 days",
            body: `Application SLA Warning: 13 days`,
            data: {
              applicationId: app.id,
              jobPostId: app.jobPost.id,
              jobTitle: app.jobPost.title,
              daysElapsed: Math.floor(elapsedDays),
            },
          },
        });
      });

      warned13++;
    } else if (elapsedDays >= 7 && !app.slaWarning7Sent) {
      // 7-day warning to recruiter
      await prisma.$transaction(async (tx) => {
        await tx.application.update({
          where: { id: app.id },
          data: { slaWarning7Sent: true },
        });

        await tx.notification.create({
          data: {
            userId: app.jobPost.recruiterId,
            type: NotificationType.SLA_WARNING,
            title: "Application SLA Warning: 7 days",
            body: `Application SLA Warning: 7 days`,
            data: {
              applicationId: app.id,
              jobPostId: app.jobPost.id,
              jobTitle: app.jobPost.title,
              daysElapsed: Math.floor(elapsedDays),
            },
          },
        });
      });

      warned7++;
    }
  }

  // Recalculate metrics for all affected recruiters after processing all expirations
  for (const recruiterId of recruitersToRecalculate) {
    await recalculateRecruiterMetrics(recruiterId);
  }

  return { warned7, warned13, expired };
}

export interface AutoInactiveResult {
  markedInactive: number;
}

/**
 * Daily sweep that marks job posts as inactive when no recruiter has acted
 * on any application within 14 days of the most recent application.
 *
 * Requirements: 2.6
 */
export async function runAutoInactiveCheck(): Promise<AutoInactiveResult> {
  const now = new Date();
  const fourteenDaysAgo = new Date(now.getTime() - 14 * MS_PER_DAY);

  // Find all active job posts that have at least one application
  const jobPosts = await prisma.jobPost.findMany({
    where: {
      isActive: true,
      isClosed: false,
      isInactiveLowResponse: false,
      applications: { some: {} },
    },
    select: {
      id: true,
      applications: {
        select: {
          submittedAt: true,
          firstActionAt: true,
        },
        orderBy: { submittedAt: "desc" },
      },
    },
  });

  let markedInactive = 0;

  for (const jobPost of jobPosts) {
    const mostRecentSubmittedAt = jobPost.applications[0]?.submittedAt;
    if (!mostRecentSubmittedAt) continue;

    // Check if most recent application is older than 14 days
    const isOlderThan14Days = mostRecentSubmittedAt <= fourteenDaysAgo;
    if (!isOlderThan14Days) continue;

    // Check that no application has had any recruiter action
    const anyActionTaken = jobPost.applications.some(
      (app) => app.firstActionAt !== null
    );
    if (anyActionTaken) continue;

    await prisma.jobPost.update({
      where: { id: jobPost.id },
      data: { isInactiveLowResponse: true },
    });

    markedInactive++;
  }

  return { markedInactive };
}
