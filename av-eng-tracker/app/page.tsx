import Link from "next/link";
import { ISSUES, QUICK_WINS, TEAM } from "@/lib/data";
import SeverityBadge from "@/components/SeverityBadge";
import StatusPill from "@/components/StatusPill";

export default function DashboardPage() {
  const counts = {
    P0: ISSUES.filter((i) => i.severity === "P0").length,
    P1: ISSUES.filter((i) => i.severity === "P1").length,
    P2: ISSUES.filter((i) => i.severity === "P2").length,
    P3: ISSUES.filter((i) => i.severity === "P3").length,
  };
  const p0Issues = ISSUES.filter((i) => i.severity === "P0");
  const topWins = QUICK_WINS.slice(0, 5);

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section>
        <p className="z-eyebrow">AV Engineering · Zillow Group</p>
        <h1 className="z-h1 mt-2">Cortney&apos;s 90-Day Plan &amp; Issues Tracker</h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-zillow-slate">
          Living reference for recurring issues in the <span className="font-semibold text-zillow-ink">#av-team</span>{" "}
          channel, Patrick&apos;s handoff portfolio, the 90-day execution plan, and innovative paths
          for the HDMI share problem. All quotes are verbatim from Slack with attribution and
          timestamps.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/tracker" className="z-btn-primary">
            Open interactive tracker
          </Link>
          <Link href="/issues" className="z-btn-secondary">
            View all issues
          </Link>
          <Link href="/plan" className="z-btn-secondary">
            See 90-day plan
          </Link>
          <Link href="/handoff" className="z-btn-secondary">
            Patrick handoff
          </Link>
        </div>
      </section>

      {/* Counts */}
      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {(["P0", "P1", "P2", "P3"] as const).map((sev) => (
          <div key={sev} className="z-card text-center">
            <div className="mb-2 flex justify-center">
              <SeverityBadge severity={sev} />
            </div>
            <div className="text-3xl font-bold text-zillow-ink">{counts[sev]}</div>
            <div className="mt-1 text-xs text-zillow-slate">
              {sev === "P0" && "Critical — need owner this week"}
              {sev === "P1" && "High — workaround in place"}
              {sev === "P2" && "Medium — operational debt"}
              {sev === "P3" && "Deferred / cultural"}
            </div>
          </div>
        ))}
      </section>

      {/* P0 spotlight */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="z-h2">Critical right now</h2>
          <Link href="/issues" className="z-link text-sm">
            All issues →
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {p0Issues.map((issue) => (
            <Link
              key={issue.id}
              href={`/issues/${issue.id}`}
              className="z-card z-card-hover block"
            >
              <div className="mb-3 flex items-center gap-2">
                <SeverityBadge severity={issue.severity} />
                <StatusPill status={issue.status} />
              </div>
              <h3 className="z-h3">{issue.title}</h3>
              <p className="mt-2 line-clamp-3 text-sm text-zillow-slate">{issue.summary}</p>
              <div className="mt-4 text-xs text-zillow-slate">
                <span className="font-semibold text-zillow-ink">Owner:</span> {issue.owner}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick wins + Team */}
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="z-card lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="z-h3">Top quick wins (next 30 days)</h2>
            <Link href="/quick-wins" className="z-link text-sm">
              All wins →
            </Link>
          </div>
          <ul className="divide-y divide-zillow-gray-border">
            {topWins.map((win) => (
              <li key={win.id} className="flex items-start gap-4 py-3">
                <span className="mt-0.5 flex h-6 w-12 shrink-0 items-center justify-center rounded-full bg-zillow-blue-light text-xs font-bold text-zillow-blue">
                  {win.id.toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-zillow-ink">{win.title}</div>
                  <div className="mt-0.5 text-xs text-zillow-slate">{win.notes}</div>
                </div>
                <span className="shrink-0 rounded-md bg-zillow-gray-light px-2 py-1 text-xs font-medium text-zillow-slate">
                  {win.effort} · {win.visibility}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="z-card">
          <h2 className="z-h3 mb-4">The room</h2>
          <dl className="space-y-4 text-sm">
            {Object.entries(TEAM).map(([name, info]) => (
              <div key={name}>
                <dt className="font-semibold text-zillow-ink">{name}</dt>
                <dd className="text-xs text-zillow-slate">{info.role}</dd>
                <dd className="mt-1 text-xs leading-relaxed text-zillow-slate">{info.posture}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* How to use this */}
      <section className="z-card bg-zillow-gray-light">
        <h2 className="z-h3">How to use this</h2>
        <ul className="mt-4 grid gap-3 text-sm text-zillow-ink md:grid-cols-2">
          <li>
            <span className="font-semibold">Monday WAVE sync:</span> paste critical issues + quick
            wins into Stacey&apos;s agenda doc. Verbally claim Patrick handoff items.
          </li>
          <li>
            <span className="font-semibold">Tuesday meeting w/ Matt:</span> open with handoff
            questions, not architecture pitches.
          </li>
          <li>
            <span className="font-semibold">Friday wins/challenges email:</span> what you closed +
            what&apos;s blocked.
          </li>
          <li>
            <span className="font-semibold">Living document:</span> update as items move through P0
            → resolved. Keep quotes for receipts.
          </li>
        </ul>
      </section>
    </div>
  );
}
