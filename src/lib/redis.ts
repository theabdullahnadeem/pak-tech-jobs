import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  throw new Error("REDIS_URL environment variable is not set");
}

// Singleton pattern — reuse connection across hot reloads in dev
const globalForRedis = globalThis as unknown as { redis?: Redis };

export const redis = globalForRedis.redis ?? new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  lazyConnect: false,
  tls: redisUrl.startsWith("rediss://") ? {} : undefined,
});

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}

// Create a duplicate connection for pub/sub (required by Socket.io adapter)
export function createRedisClient() {
  return new Redis(redisUrl!, {
    maxRetriesPerRequest: 3,
    tls: redisUrl!.startsWith("rediss://") ? {} : undefined,
  });
}
