import { redis } from "./redis";
import { NextRequest, NextResponse } from "next/server";

export interface RateLimitConfig {
  /** Redis key prefix */
  prefix: string;
  /** Max requests allowed in the window */
  limit: number;
  /** Window duration in seconds */
  windowSeconds: number;
  /** Optional: HTTP status message */
  message?: string;
}

/**
 * Sliding window rate limiter using Redis.
 * Returns null if allowed, or a NextResponse with 429 if rate limited.
 */
export async function rateLimit(
  req: NextRequest,
  config: RateLimitConfig
): Promise<NextResponse | null> {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const key = `rl:${config.prefix}:${ip}`;
  const now = Date.now();
  const windowStart = now - config.windowSeconds * 1000;

  try {
    // Remove old entries outside the window
    await redis.zremrangebyscore(key, "-inf", windowStart);
    // Count current requests in window
    const count = await redis.zcard(key);

    if (count >= config.limit) {
      const oldest = await redis.zrange(key, 0, 0, "WITHSCORES");
      const resetAt =
        oldest.length >= 2
          ? Math.ceil((Number(oldest[1]) + config.windowSeconds * 1000) / 1000)
          : Math.ceil((now + config.windowSeconds * 1000) / 1000);
      return NextResponse.json(
        { error: config.message || "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": String(config.limit),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(resetAt),
            "Retry-After": String(resetAt - Math.ceil(now / 1000)),
          },
        }
      );
    }

    // Add current request with score = timestamp
    await redis.zadd(key, now, `${now}-${Math.random()}`);
    // Set expiry on the key
    await redis.expire(key, config.windowSeconds * 2);

    return null; // allowed
  } catch {
    // If Redis is down, fail open (don't block requests)
    return null;
  }
}

/** Rate limit by authenticated user ID instead of IP */
export async function rateLimitByUser(
  userId: string,
  config: RateLimitConfig
): Promise<NextResponse | null> {
  const key = `rl:${config.prefix}:user:${userId}`;
  const now = Date.now();
  const windowStart = now - config.windowSeconds * 1000;

  try {
    await redis.zremrangebyscore(key, "-inf", windowStart);
    const count = await redis.zcard(key);

    if (count >= config.limit) {
      return NextResponse.json(
        { error: config.message || "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    await redis.zadd(key, now, `${now}-${Math.random()}`);
    await redis.expire(key, config.windowSeconds * 2);
    return null;
  } catch {
    return null;
  }
}

// ── Pre-configured rate limiters ──────────────────────────────────────────────

export const RATE_LIMITS = {
  /** Auth endpoints: 10 attempts per 15 minutes */
  auth: { prefix: "auth", limit: 10, windowSeconds: 900, message: "Too many login attempts. Try again in 15 minutes." },
  /** Job application: 20 per hour per user */
  apply: { prefix: "apply", limit: 20, windowSeconds: 3600, message: "Too many applications submitted. Try again later." },
  /** AI endpoints: 10 per hour per user */
  ai: { prefix: "ai", limit: 10, windowSeconds: 3600, message: "AI usage limit reached. Try again in an hour." },
  /** Messaging: 60 per minute per user */
  messaging: { prefix: "msg", limit: 60, windowSeconds: 60, message: "Sending too fast. Slow down." },
  /** Job posting: 10 per hour per recruiter */
  jobPost: { prefix: "jobpost", limit: 10, windowSeconds: 3600, message: "Too many job posts. Try again later." },
  /** General API: 100 per minute per IP */
  general: { prefix: "general", limit: 100, windowSeconds: 60 },
  /** Referral: 5 per day per user */
  referral: { prefix: "referral", limit: 5, windowSeconds: 86400, message: "Referral limit reached for today." },
  /** Interview scheduling: 20 per hour per user */
  interview: { prefix: "interview", limit: 20, windowSeconds: 3600 },
} as const;
