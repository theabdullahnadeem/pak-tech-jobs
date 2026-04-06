export interface OutreachRecord {
  sentAt: Date;
}

const RATE_LIMIT = 20;
const WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

// Returns the count of outreach records within the last 24 hours from `now`
export function countRecentOutreach(records: OutreachRecord[], now: Date): number {
  const windowStart = new Date(now.getTime() - WINDOW_MS);
  return records.filter(r => r.sentAt >= windowStart && r.sentAt <= now).length;
}

// Returns true if the recruiter is allowed to send another outreach
export function isRateLimitAllowed(records: OutreachRecord[], now: Date): boolean {
  return countRecentOutreach(records, now) < RATE_LIMIT;
}
