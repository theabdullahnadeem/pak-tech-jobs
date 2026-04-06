// Badge thresholds (Requirements 9.4, 9.5, 9.6, 6.4, 6.5)
export type RecruiterBadge =
  | "Highly Responsive"
  | "Responsive"
  | "Low Responsiveness";

/**
 * Returns the appropriate badge label for a recruiter based on their response rate.
 *
 * Requirement 9.4: >= 90% → "Highly Responsive"
 * Requirement 9.5: 70–89% → "Responsive"
 * Requirement 9.6 / 6.4: < 70% → "Low Responsiveness"
 */
export function getRecruiterBadge(responseRate: number): RecruiterBadge {
  if (responseRate >= 90) return "Highly Responsive";
  if (responseRate >= 70) return "Responsive";
  return "Low Responsiveness";
}

/**
 * Returns true when the recruiter's response rate is low enough to trigger
 * automatic suspension of job publishing.
 *
 * Requirement 6.5: suspend when responseRate < 50%
 */
export function shouldSuspend(responseRate: number): boolean {
  return responseRate < 50;
}
