const STUDY_REPOS = [
  "pandas-dev/pandas",
  "astral-sh/ruff",
  "vercel/next.js",
] as const;

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

      <section className="ruled stack" style={{ gap: "1rem", marginBottom: "3rem" }}>
        <p className="caption">Open a repository</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem" }}>
          {STUDY_REPOS.map((repo) => (
            <span key={repo} className="mono" style={{ fontSize: "0.85rem" }}>
              {repo}
            </span>
          ))}
        </div>
      </section>

      <div className="stack" style={{ gap: "3rem" }}>
        <Section
          n="I"
          title="Prevented events"
          note="Review comments anchored to lines that a later commit changed, classified by IBM Granite as a substantive catch rather than a style nit."
        />
        <Section
          n="II"
          title="Output against prevention"
          note="Conventional productivity metrics per contributor, against prevented events. The rank correlation is reported at whatever value it comes out to."
        />
        <Section
          n="III"
          title="Review cycles"
          note="Review rounds per pull request over time. Counted, never estimated."
        />
      </div>
    </main>
  );
}

function Section({ n, title, note }: { n: string; title: string; note: string }) {
  return (
    <section className="ruled stack" style={{ gap: "0.65rem" }}>
      <div style={{ display: "flex", gap: "1rem", alignItems: "baseline" }}>
        <span className="caption">{n}</span>
        <h2>{title}</h2>
      </div>
      <p style={{ color: "var(--ink-muted)", fontSize: "0.95rem" }}>{note}</p>
      <p className="mono" style={{ color: "var(--ink-faint)", fontSize: "0.85rem" }}>
        No repository opened.
      </p>
    </section>
  );
}
