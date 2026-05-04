/**
 * Enterprise Tier — pure domain logic
 *
 * This module contains the default-value logic for the enterprise tier feature.
 * It is intentionally free of database or framework dependencies so it can be
 * tested with property-based tests without a live database connection.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type EmployerTier = "FREE" | "PRO" | "ENTERPRISE";

/**
 * The subset of User fields introduced by the enterprise tier feature.
 * Mirrors the Prisma schema additions.
 */
export interface EmployerTierFields {
  tier: EmployerTier;
  maxRecruiterSeats: number;
  subscriptionExpiry: Date | null;
  accountManagerName: string | null;
  hasCvAccess: boolean;
}

/**
 * The subset of JobPost fields introduced by the enterprise tier feature.
 */
export interface JobPostTierFields {
  isPremium: boolean;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

/**
 * Returns the default enterprise-tier fields for a newly created employer.
 * Mirrors the Prisma schema defaults:
 *   tier                 EmployerTier @default(FREE)
 *   maxRecruiterSeats    Int          @default(1)
 *   subscriptionExpiry   DateTime?    (nullable, no default → null)
 *   accountManagerName   String?      (nullable, no default → null)
 *   hasCvAccess          Boolean      @default(false)
 */
export function applyEmployerDefaults(
  overrides: Partial<EmployerTierFields> = {}
): EmployerTierFields {
  return {
    tier: "FREE",
    maxRecruiterSeats: 1,
    subscriptionExpiry: null,
    accountManagerName: null,
    hasCvAccess: false,
    ...overrides,
  };
}

/**
 * Returns the default enterprise-tier fields for a newly created job post.
 * Mirrors the Prisma schema default:
 *   isPremium  Boolean  @default(false)
 */
export function applyJobPostDefaults(
  overrides: Partial<JobPostTierFields> = {}
): JobPostTierFields {
  return {
    isPremium: false,
    ...overrides,
  };
}

// ─── Job listing ordering ─────────────────────────────────────────────────────

/**
 * The subset of JobPost fields needed for sorting job listings.
 */
export interface SortableJobPost {
  isPremium: boolean;
  createdAt: Date;
}

/**
 * Sorts an array of job posts by [isPremium DESC, createdAt DESC].
 * Premium jobs always appear before non-premium jobs.
 * Within each group, jobs are ordered newest-first.
 * Returns a new array — does not mutate the input.
 * Validates: Requirements 2.2
 */
export function sortJobListings<T extends SortableJobPost>(jobs: T[]): T[] {
  return [...jobs].sort((a, b) => {
    // Primary sort: isPremium descending (true before false)
    if (a.isPremium !== b.isPremium) {
      return a.isPremium ? -1 : 1;
    }
    // Secondary sort: createdAt descending (newer first)
    return b.createdAt.getTime() - a.createdAt.getTime();
  });
}

// ─── Access control ───────────────────────────────────────────────────────────

/**
 * Returns true if the employer is allowed to access candidate search.
 * Access is granted when hasCvAccess = true OR tier = ENTERPRISE.
 * Validates: Requirements 3.1, 3.2
 */
export function hasCandidateSearchAccess(employer: Pick<EmployerTierFields, "hasCvAccess" | "tier">): boolean {
  return employer.hasCvAccess || employer.tier === "ENTERPRISE";
}

// ─── Activation ───────────────────────────────────────────────────────────────

export interface ActivateEnterprisePayload {
  durationMonths: number; // 1–60
  seats: number;          // 1–50
  accountManagerName?: string;
}

export interface ActivateEnterpriseResult extends EmployerTierFields {
  // All fields are set by the activation
}

/**
 * Computes the resulting employer fields after an enterprise activation.
 * Pure function — does not touch the database.
 * Validates: Requirements 4.2, 4.3, 4.4, 4.5
 */
export function computeEnterpriseActivation(
  now: Date,
  payload: ActivateEnterprisePayload
): ActivateEnterpriseResult {
  const expiry = new Date(now);
  expiry.setMonth(expiry.getMonth() + payload.durationMonths);

  return {
    tier: "ENTERPRISE",
    hasCvAccess: true,
    maxRecruiterSeats: payload.seats,
    subscriptionExpiry: expiry,
    accountManagerName: payload.accountManagerName ?? null,
  };
}

/**
 * Validates the activation payload.
 * Returns null if valid, or an error message string if invalid.
 * Validates: Requirements 4.7, 4.8
 */
export function validateActivationPayload(payload: ActivateEnterprisePayload): string | null {
  if (payload.durationMonths < 1 || payload.durationMonths > 60) {
    return "durationMonths must be between 1 and 60";
  }
  if (payload.seats < 1 || payload.seats > 50) {
    return "seats must be between 1 and 50";
  }
  return null;
}

// ─── Candidate search ─────────────────────────────────────────────────────────

/**
 * The shape of a candidate returned by the search endpoint.
 */
export interface CandidateSearchResult {
  id: string;
  name: string;
  skills: string[];
  experienceLevel: string | null;
  location: string | null;
  bio: string | null;
  portfolioUrl: string | null;
  verifiedSkills: string[];
}

/**
 * Filter options for candidate search.
 */
export interface CandidateSearchFilters {
  /** Case-insensitive skill names that the candidate must ALL possess. */
  skills?: string[];
  /** Exact match on experienceLevel. */
  experienceLevel?: string;
}

// ─── Premium listing toggle ───────────────────────────────────────────────────

/**
 * Returns the UI state for the Premium Listing toggle based on the employer's tier.
 *
 * - FREE tier: toggle is disabled with a tooltip "Contact Sales to Unlock"
 * - PRO or ENTERPRISE tier: toggle is enabled with no tooltip
 *
 * Validates: Requirements 6.2, 6.3, 6.4
 */
export function getPremiumToggleState(tier: EmployerTier): {
  disabled: boolean;
  tooltip: string | null;
} {
  if (tier === "FREE") {
    return { disabled: true, tooltip: "Contact Sales to Unlock" };
  }
  return { disabled: false, tooltip: null };
}

/**
 * Returns true if the employer is allowed to set isPremium = true on a job post.
 * Only PRO and ENTERPRISE employers can create premium listings.
 *
 * Validates: Requirements 6.5
 */
export function canSetPremiumListing(tier: EmployerTier): boolean {
  return tier === "PRO" || tier === "ENTERPRISE";
}

// ─── Dedicated support widget ─────────────────────────────────────────────────

/**
 * Returns the UI state for the Dedicated Support widget based on the employer's
 * tier and account manager name.
 *
 * - Non-ENTERPRISE tier: widget is not visible
 * - ENTERPRISE tier + non-null, non-empty accountManagerName: visible with the name as message
 * - ENTERPRISE tier + null or empty accountManagerName: visible with null message (component shows fallback)
 *
 * Validates: Requirements 5.1, 5.2, 5.3
 */
export function getDedicatedSupportWidgetState(
  tier: EmployerTier,
  accountManagerName: string | null
): { visible: boolean; message: string | null } {
  if (tier !== "ENTERPRISE") {
    return { visible: false, message: null };
  }
  if (accountManagerName && accountManagerName.trim().length > 0) {
    return { visible: true, message: accountManagerName };
  }
  return { visible: true, message: null };
}

// ─── Candidate search ─────────────────────────────────────────────────────────

/**
 * Filters an array of candidates by the supplied criteria.
 *
 * - Skills filter: every specified skill must appear in the candidate's
 *   `skills` array (case-insensitive comparison).
 * - Experience level filter: the candidate's `experienceLevel` must equal
 *   the specified value (exact match).
 *
 * When a filter is absent (undefined / empty array) it is not applied.
 * Returns a new array — does not mutate the input.
 *
 * Validates: Requirements 3.3, 3.4, 3.5
 */
export function filterCandidates<T extends CandidateSearchResult>(
  candidates: T[],
  filters: CandidateSearchFilters
): T[] {
  const { skills, experienceLevel } = filters;

  // Normalise the skill filter to lowercase for case-insensitive comparison
  const normalizedSkills =
    skills && skills.length > 0
      ? skills.map((s) => s.toLowerCase())
      : null;

  return candidates.filter((candidate) => {
    // Skills filter: candidate must have ALL specified skills (case-insensitive)
    if (normalizedSkills !== null) {
      const candidateSkillsLower = candidate.skills.map((s) => s.toLowerCase());
      const hasAllSkills = normalizedSkills.every((skill) =>
        candidateSkillsLower.includes(skill)
      );
      if (!hasAllSkills) return false;
    }

    // Experience level filter: exact match
    if (experienceLevel !== undefined) {
      if (candidate.experienceLevel !== experienceLevel) return false;
    }

    return true;
  });
}

// ─── Enterprise dashboard filter ─────────────────────────────────────────────

/**
 * The shape of an employer record as returned by the admin enterprise employers
 * endpoint. Used by the Enterprise tab in the admin dashboard.
 */
export interface EmployerRecord {
  id: string;
  name: string;
  companyName: string | null;
  tier: EmployerTier;
  subscriptionExpiry: Date | string | null;
  maxRecruiterSeats: number;
  accountManagerName: string | null;
  hasCvAccess: boolean;
}

/**
 * Filters an array of employer records to only those with `tier = ENTERPRISE`.
 * Pure function — does not mutate the input array.
 *
 * Validates: Requirements 7.1, 7.2
 */
export function filterEnterpriseEmployers<T extends Pick<EmployerRecord, "tier">>(
  employers: T[]
): T[] {
  return employers.filter((e) => e.tier === "ENTERPRISE");
}
