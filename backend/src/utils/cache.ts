import { redis } from "../config/redis";

export async function getOrSetCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds = 300
): Promise<T> {

  // 1. Check Redis
  const cached = await redis.get(key);

  // 2. Cache hit
  if (cached !== null) {
    return JSON.parse(cached) as T;
  }

  // 3. Cache miss → fetch from PostgreSQL
  const freshData = await fetcher();

  // 4. Don't cache null/undefined
  if (freshData !== null && freshData !== undefined) {
    await redis.set(
      key,
      JSON.stringify(freshData),
      "EX",
      ttlSeconds
    );
  }

  // 5. Return fresh data
  return freshData;
}