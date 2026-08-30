# Pending

`run-route.ts` is the live-analysis SSE endpoint. It belongs at
`src/pages/api/run.ts`, and it is parked here because Astro resolves imports at
build time: the engine modules it imports (`lib/ledger/fetch`, `detect`,
`granite`, `severity`, `cycles`) are built separately with IBM Bob and have not
landed yet, so routing this file would break the build.

Move it into place the moment those exist:

```
mv src/pending/run-route.ts src/pages/api/run.ts
```

Rate limiting (5 runs per IP per hour) and per-repository result caching are
already wired in, via `src/lib/ratelimit.ts` and `@vercel/kv`. Both fail open:
if KV is unreachable the run still proceeds, because a broken cache should not
take the demo down with it.

**One deployment step remains:** provision a KV store. On Vercel that is
Storage -> Upstash Redis, which injects `KV_REST_API_URL` and
`KV_REST_API_TOKEN` automatically. Without it the route works but is
unthrottled, which on a public URL holding watsonx credentials means anyone can
spend them.
