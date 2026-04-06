import { prisma } from "@/lib/prisma";
import { shouldSuspend } from "@/lib/recruiterBadge";

const RESPONSE_WINDOW_DAYS = 14;
const MS_PER_HOUR = 1000 * 60 * 60;
const MS_PER_DAY = MS_PER_HOUR * 24;

/**
 * Recalculates and updates a recruiter's responseRate and avgResponseTimeHours
 * based on all their applications.
 *
 * responseRate = (applications with firstActionAt within 14 days of submittedAt) / total * 100
 * avgResponseTimeHours = mean of (firstActionAt - submittedAt) in hours for responded applications
 *
 * Requirements: 9.2, 9.3, 9.7
 */
export async function recalculateRecruiterMetrics(
  recruiterId: string
): Promise<void> {
  // Fetch all applications for the recruiter's job posts
  const applications = await prisma.application.findMany({
    where: { jobPost: { recruiterId } },
    select: {
      submittedAt: true,
      firstActionAt: true,
    },
  });

  const total = applications.length;

  if (total === 0) {
    // No applications — reset to defaults; 100% rate lifts any suspension
    await prisma.user.update({
      where: { id: recruiterId },
      data: { responseRate: 100, avgResponseTimeHours: null, suspended: false },
    });
    return;
  }

  // Responded = firstActionAt is not null AND within 14 days of submittedAt
  const responded = applications.filter((app) => {
    if (!app.firstActionAt) return false;
    const diffMs =
      app.firstActionAt.getTime() - app.submittedAt.getTime();
    return diffMs >= 0 && diffMs <= RESPONSE_WINDOW_DAYS * MS_PER_DAY;
  });

  // Requirement 9.2: responseRate rounded to nearest whole number
  const responseRate = Math.round((responded.length / total) * 100);

  // Requirement 9.3: avgResponseTimeHours — mean over all applications with firstActionAt
  const withAction = applications.filter((app) => app.firstActionAt != null);
  let avgResponseTimeHours: number | null = null;
  if (withAction.length > 0) {
    const totalHours = withAction.reduce((sum, app) => {
      const diffMs =
        app.firstActionAt!.getTime() - app.submittedAt.getTime();
      return sum + diffMs / MS_PER_HOUR;
    }, 0);
    avgResponseTimeHours = totalHours / withAction.length;
  }

  // Requirement 9.7: update within 60 seconds of any status change
  // Requirement 6.5: auto-suspend when responseRate < 50%; restore when >= 50%
  const currentRecruiter = await prisma.user.findUnique({
    where: { id: recruiterId },
    select: { suspended: true },
  });

  const suspend = shouldSuspend(responseRate);
  // Only toggle suspension when it's driven by response rate:
  // - suspend if rate dropped below 50%
  // - restore if rate recovered to >= 50% and recruiter is currently suspended
  const suspendedUpdate =
    suspend || currentRecruiter?.suspended === true
      ? { suspended: suspend }
      : {};

  await prisma.user.update({
    where: { id: recruiterId },
    data: { responseRate, avgResponseTimeHours, ...suspendedUpdate },
  });
}
