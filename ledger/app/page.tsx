import { RunClient } from "@/components/run-client";

export default function Home() {
  return (
    <main className="wrap" style={{ paddingBlock: "5rem 6rem" }}>
      <header className="stack" style={{ gap: "1.4rem", marginBottom: "3.5rem" }}>
        <p className="caption">The ledger nobody kept</p>
        <h1 style={{ maxWidth: "20ch" }}>
          Your most careful engineer looks like your least productive one.
        </h1>
        <p style={{ color: "var(--ink-muted)" }}>
          Reviewing, correcting, and rejecting is real labor, it takes your most
          experienced people, and it appears in no metric anywhere. LEDGER reads a
          repository&rsquo;s review history and counts it. Every figure here traces
          to a review comment and the diff it changed.
        </p>
      </header>

      <RunClient />
    </main>
  );
}
