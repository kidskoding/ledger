/**
 * Rate limiting and run caching, both optional.
 *
 * A public URL holding watsonx credentials needs a throttle, so KV is used
 * when it is configured. But requiring it would mean the live run only works
 * on a fully provisioned deployment — it would fail locally, in CI, and on any
 * preview without a store attached. The throttle is a safeguard, not the
 * feature, so its absence degrades rather than blocks.
 */

const MAX_RUNS_PER_HOUR = 5;
const RESULT_TTL_SECONDS = 604_800;

const configured = Boolean(
  process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN,
);

/** Imported lazily: @vercel/kv throws on use when its env vars are absent. */
async function client() {
  const { kv } = await import("@vercel/kv");
  return kv;
}

/** True when the caller may proceed. Fails open — a broken store must not take the demo down. */
export async function allowRun(ip: string): Promise<boolean> {
  if (!configured) return true;
  try {
    const kv = await client();
    const key = `run:${ip}:${Math.floor(Date.now() / 3_600_000)}`;
    const count = await kv.incr(key);
    if (count === 1) await kv.expire(key, 3600);
    return count <= MAX_RUNS_PER_HOUR;
  } catch (error) {
    console.warn("[ratelimit] store unavailable, allowing run", error);
    return true;
  }
}

export async function getCachedRun<T>(repo: string): Promise<T | null> {
  if (!configured) return null;
  try {
    const kv = await client();
    return (await kv.get<T>(`result:${repo}`)) ?? null;
  } catch {
    return null;
  }
}

export async function putCachedRun(repo: string, result: unknown): Promise<void> {
  if (!configured) return;
  try {
    const kv = await client();
    await kv.set(`result:${repo}`, result, { ex: RESULT_TTL_SECONDS });
  } catch (error) {
    console.warn("[ratelimit] could not cache run", error);
  }
}
