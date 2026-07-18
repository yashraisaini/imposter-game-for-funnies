import { Redis } from "@upstash/redis";

const hasRedis =
  !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = hasRedis
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

const memoryStore = globalThis.__imposterMemoryStore || new Map();
globalThis.__imposterMemoryStore = memoryStore;

export async function kvGet(key) {
  if (hasRedis) return (await redis.get(key)) ?? null;
  return memoryStore.has(key) ? memoryStore.get(key) : null;
}

export async function kvSet(key, value, ttlSeconds) {
  if (hasRedis) {
    if (ttlSeconds) await redis.set(key, value, { ex: ttlSeconds });
    else await redis.set(key, value);
  } else {
    memoryStore.set(key, value);
  }
  return value;
}

export async function kvDelete(key) {
  if (hasRedis) await redis.del(key);
  else memoryStore.delete(key);
}

export const usingPersistentStore = hasRedis;
