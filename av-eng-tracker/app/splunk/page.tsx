import Link from "next/link";
import { SPLUNK_WORKFLOW } from "@/lib/data";

const SEV_STYLE: Record<string, string> = {
  P0: "bg-red-50 text-zillow-red ring-1 ring-inset ring-red-200",
  P1: "bg-orange-50 text-zillow-orange ring-1 ring-inset ring-orange-200",
  P2: "bg-yellow-50 text-yellow-800 ring-1 ring-inset ring-yellow-200",
  P3: "bg-zillow-gray-light text-zillow-slate ring-1 ring-inset ring-zillow-gray-border",
};

export default function SplunkPage() {
  const w = SPLUNK_WORKFLOW;
  return (
    <div className="space-y-12">
      <header>
        <p className="z-eyebrow">Cortney&apos;s runbook</p>
        <h1 className="z-h1 mt-2">Splunk workflow</h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-zillow-slate">
          The end-to-end Splunk pipeline Patrick built — reconstructed from the #av-team
          record. Access path, full Reflect → Lambda → Splunk → Slack pipeline, current
          dashboards, inherited in-flight work, and a step-by-step for adding a new alert
          without re-creating the noise Patrick spent years killing.
        </p>
      </header>

      {/* Access */}
      <section>
        <h2 className="z-h2 mb-4">1. Access</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <article className="z-card">
            <div className="z-eyebrow">Splunk Cloud</div>
            <h3 className="z-h3 mt-2">{w.access.appName}</h3>
            <p className="mt-2 text-xs font-mono text-zillow-slate break-all">
              {w.access.appUrl}
            </p>
            <a
              href={w.access.appUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="z-link mt-3 inline-flex items-center gap-1 text-sm font-semibold"
            >
              Open dashboard ↗
            </a>
            <div className="mt-4 text-xs leading-relaxed text-zillow-slate">
              View: <code className="rounded bg-zillow-gray-light px-1.5 py-0.5 font-mono">
                {w.access.nonProdView}
              </code>
            </div>
          </article>

          <article className="z-card">
            <div className="z-eyebrow">If you don&apos;t have access yet</div>
            <h3 className="z-h3 mt-2">ServiceNow tile</h3>
            <a
              href={w.access.requestAccessUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="z-link mt-3 inline-flex items-center gap-1 text-sm font-semibold"
            >
              Request Splunk access ↗
            </a>
            <p className="mt-3 text-xs leading-relaxed text-zillow-slate">
              {w.access.requestAccessNote}
            </p>
            <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900">
              <strong>Also request AWS console access the same day.</strong> {w.access.awsConsoleNote}
            </p>
          </article>
        </div>

        <div className="z-card mt-4 bg-zillow-gray-light">
          <div className="text-xs font-semibold uppercase tracking-wider text-zillow-slate">
            Who already has access
          </div>
          <ul className="mt-2 space-y-1 text-sm">
            {w.access.confirmedAccess.map((a) => (
              <li key={a.who} className="text-zillow-ink">
                <span className="font-semibold">{a.who}</span>
                <span className="text-zillow-slate"> — &ldquo;{a.quote}&rdquo;</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Pipeline */}
      <section>
        <h2 className="z-h2 mb-2">2. The pipeline Patrick built</h2>
        <p className="mb-5 max-w-3xl text-sm text-zillow-slate">
          Reflect → Lambda → <strong className="text-zillow-ink">re-poll</strong> → Splunk →
          (only if reaction expected) → #av-alerts. The re-poll step is the difference between
          a useful alert channel and the noisy mess Patrick inherited.
        </p>
        <div className="space-y-3">
          {w.pipeline.map((s) => (
            <article key={s.step} className="z-card">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-zillow-blue text-base font-bold text-white">
                  {s.step}
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-zillow-ink">{s.name}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-zillow-slate">{s.detail}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Dashboards */}
      <section>
        <h2 className="z-h2 mb-4">3. Dashboards</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {w.dashboards.map((d) => (
            <article key={d.name} className="z-card">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-base font-bold text-zillow-ink">{d.name}</h3>
                <span className="text-xs font-mono text-zillow-slate">{d.status}</span>
              </div>
              {d.url && (
                <a
                  href={d.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="z-link mt-1 inline-flex items-center gap-1 text-xs"
                >
                  Open ↗
                </a>
              )}
              {d.contains && (
                <ul className="mt-3 space-y-1 pl-4 text-xs leading-relaxed text-zillow-ink">
                  {d.contains.map((c) => (
                    <li key={c} className="list-disc">
                      {c}
                    </li>
                  ))}
                </ul>
              )}
              {d.cortneyAction && (
                <div className="mt-3 rounded-md border-l-4 border-zillow-red bg-red-50 px-3 py-2 text-xs leading-relaxed text-zillow-ink">
                  <span className="font-semibold text-zillow-red">Cortney&apos;s call: </span>
                  {d.cortneyAction}
                </div>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* Inherited work */}
      <section>
        <h2 className="z-h2 mb-2">4. Inherited Splunk + monitoring work</h2>
        <p className="mb-5 max-w-3xl text-sm text-zillow-slate">
          P0&apos;s first. The alerting pipeline is currently one outage away from going dark
          because everything ran under Patrick&apos;s now-deactivated identity.
        </p>
        <div className="overflow-x-auto rounded-xl border border-zillow-gray-border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-zillow-gray-light text-left">
              <tr>
                <th className="px-4 py-3 font-semibold text-zillow-ink">Sev</th>
                <th className="px-4 py-3 font-semibold text-zillow-ink">Task</th>
                <th className="px-4 py-3 font-semibold text-zillow-ink">Why</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zillow-gray-border">
              {w.inheritedWork.map((t, idx) => (
                <tr key={idx} className="align-top">
                  <td className="px-4 py-3">
                    <span className={`z-chip ${SEV_STYLE[t.severity]}`}>{t.severity}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-zillow-ink">{t.title}</td>
                  <td className="px-4 py-3 text-zillow-slate">{t.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* How to add an alert */}
      <section className="z-card bg-zillow-gray-light">
        <h2 className="z-h3">5. How to add a new alert (without breaking Patrick&apos;s discipline)</h2>
        <p className="mt-2 text-sm leading-relaxed text-zillow-slate">
          Patrick&apos;s rule was simple — <em>Splunk first, Slack only if a reaction is
          expected.</em> Follow this checklist and you&apos;ll preserve the noise-vs-signal
          discipline that made the alert channel actually trusted.
        </p>
        <ol className="mt-4 space-y-2 text-sm leading-relaxed text-zillow-ink">
          {w.howToAddAlert.map((step) => (
            <li key={step} className="rounded-md bg-white px-3 py-2">
              {step}
            </li>
          ))}
        </ol>
      </section>

      {/* Patrick's docs */}
      <section>
        <h2 className="z-h2 mb-2">6. Patrick&apos;s docs to claim</h2>
        <p className="mb-5 max-w-3xl text-sm text-zillow-slate">
          Google Docs Patrick linked in #av-team that are now ownerless. Claim, review, and
          either adopt or replace each one.
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          {w.patrickDocs.map((d) => (
            <article key={d.url} className="z-card">
              <h3 className="text-sm font-bold text-zillow-ink">{d.label}</h3>
              <a
                href={d.url}
                target="_blank"
                rel="noopener noreferrer"
                className="z-link mt-2 inline-flex items-center gap-1 text-xs"
              >
                Open Google Doc ↗
              </a>
              <p className="mt-2 text-xs leading-relaxed text-zillow-slate">{d.why}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="text-sm text-zillow-slate">
        Related:{" "}
        <Link href="/patrick-audit" className="z-link">
          Patrick audit (patterns + portfolio)
        </Link>{" "}
        ·{" "}
        <Link href="/handoff" className="z-link">
          Patrick handoff inventory
        </Link>{" "}
        ·{" "}
        <Link href="/uci" className="z-link">
          UCI half-standards
        </Link>
      </section>
    </div>
  );
}
