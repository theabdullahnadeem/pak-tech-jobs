export interface ApplicationMetric {
  submittedAt: Date;
  firstActionAt: Date | null;
}

const SLA_MS = 14 * 24 * 60 * 60 * 1000;

/**
 * Calculates the recruiter response rate as a percentage (0–100, rounded).
 * A response counts if firstActionAt is within 14 days of submittedAt.
 * Returns 100 when there are no applications (default/initial state).
 *
 * Requirements: 9.2, 5.6
 */
export function calculateResponseRate(applications: ApplicationMetric[]): number {
  if (applications.length === 0) return 100;
  const responded = applications.filter(app => {
    if (!app.firstActionAt) return false;
    const diff = app.firstActionAt.getTime() - app.submittedAt.getTime();
    return diff >= 0 && diff <= SLA_MS;
  });
  return Math.round((responded.length / applications.length) * 100);
}

/**
 * Calculates the average response time in hours across all applications
 * that have a firstActionAt timestamp. Returns null if none have acted.
 *
 * Requirements: 9.3
 */
export function calculateAvgResponseTimeHours(applications: ApplicationMetric[]): number | null {
  const withAction = applications.filter(a => a.firstActionAt != null);
  if (withAction.length === 0) return null;
  const totalHours = withAction.reduce((sum, a) => {
    return sum + (a.firstActionAt!.getTime() - a.submittedAt.getTime()) / (1000 * 60 * 60);
  }, 0);
  return totalHours / withAction.length;
}
