import { kv } from "@vercel/kv";

const MAX_RUNS_PER_HOUR = 5;

/**
 * A public URL holding our watsonx credentials will otherwise spend them.
 * Fails open: if KV is unreachable the run proceeds, because a broken cache
 * should not take the whole demo down.
 */
export async function allowRun(ip: string): Promise<boolean> {
  const key = `run:${ip}:${Math.floor(Date.now() / 3_600_000)}`;
  try {
    const count = await kv.incr(key);
    if (count === 1) await kv.expire(key, 3600);
    return count <= MAX_RUNS_PER_HOUR;
  } catch (error) {
    console.warn("rate limit unavailable, allowing run", error);
    return true;
  }
}
