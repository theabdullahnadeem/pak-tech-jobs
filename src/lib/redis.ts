import Redis from "ioredis";

// Lazy singleton — only connect when actually used, not at import time
let _redis: Redis | null = null;

function getRedis(): Redis {
  if (_redis) return _redis;

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    throw new Error("REDIS_URL environment variable is not set");
  }

  _redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    lazyConnect: false,
    tls: redisUrl.startsWith("rediss://") ? {} : undefined,
  });

  return _redis;
}

// Proxy object — accessing any property triggers lazy init
export const redis = new Proxy({} as Redis, {
  get(_target, prop) {
    return (getRedis() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

// Create a duplicate connection for pub/sub (required by Socket.io adapter)
export function createRedisClient(): Redis {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    throw new Error("REDIS_URL environment variable is not set");
  }
  return new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    tls: redisUrl.startsWith("rediss://") ? {} : undefined,
  });
}
