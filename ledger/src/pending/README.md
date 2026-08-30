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

Two things must be added before this route is deployed publicly, both decided
during design and deferred only for sequencing:

- **Rate limiting** — 5 runs per IP per hour. Without it, a public URL holding
  our watsonx credentials will spend them.
- **Per-repository result caching** — so a repeated run costs no model calls.
