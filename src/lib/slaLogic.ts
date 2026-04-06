export type Stage =
  | "APPLIED"
  | "SEEN"
  | "SHORTLISTED"
  | "INTERVIEW"
  | "OFFER"
  | "REJECTED"
  | "EXPIRED";

// Stage ordering — higher number = further in pipeline
export const STAGE_ORDER: Record<Stage, number> = {
  APPLIED: 0,
  SEEN: 1,
  SHORTLISTED: 2,
  INTERVIEW: 3,
  OFFER: 4,
  REJECTED: 5,
  EXPIRED: 6,
};

// Returns true if the transition from `from` to `to` is valid (monotonic)
// An EXPIRED application can never go back to an earlier stage
export function isValidTransition(from: Stage, to: Stage): boolean {
  if (from === "EXPIRED") return false; // EXPIRED is terminal
  if (from === "REJECTED") return false; // REJECTED is terminal
  return STAGE_ORDER[to] > STAGE_ORDER[from];
}

// Simulates applying a sequence of stage transitions
// Returns the final stage after applying all valid transitions
export function applyTransitions(initial: Stage, transitions: Stage[]): Stage {
  let current = initial;
  for (const next of transitions) {
    if (isValidTransition(current, next)) {
      current = next;
    }
    // Invalid transitions are ignored (no-op)
  }
  return current;
}
