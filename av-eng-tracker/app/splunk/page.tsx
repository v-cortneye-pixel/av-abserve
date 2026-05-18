import Link from "next/link";
import { MEMORY_LEAK_REFACTOR, SPLUNK_WORKFLOW } from "@/lib/data";

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

      {/* Memory leak refactor — the deep dive */}
      <section id="memory-leak" className="space-y-6">
        <header>
          <h2 className="z-h2">7. The memory-leak refactor — what it actually is</h2>
          <p className="mt-2 max-w-3xl text-sm text-zillow-slate">
            One of Patrick&apos;s biggest engineering projects, half-finished. The Splunk
            memory-examination dashboard is how he found it. Here&apos;s the full picture.
          </p>
        </header>

        <article className="z-card">
          <h3 className="z-h3">What a Q-Sys memory leak actually is</h3>
          <p className="mt-2 text-sm leading-relaxed text-zillow-ink">
            {MEMORY_LEAK_REFACTOR.whatItIs}
          </p>
          <div className="mt-3 rounded-md border-l-4 border-zillow-red bg-red-50 px-3 py-2 text-sm leading-relaxed text-zillow-ink">
            <span className="font-semibold text-zillow-red">Why it matters: </span>
            {MEMORY_LEAK_REFACTOR.whyItMatters}
          </div>
        </article>

        {/* Root cause patterns */}
        <article className="z-card">
          <h3 className="z-h3">The Lua patterns that leak (Patrick learned these from QSC)</h3>
          <p className="mt-2 text-xs text-zillow-slate">
            Source: {MEMORY_LEAK_REFACTOR.rootCausePatterns.source}
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-zillow-red">
                Bad patterns
              </div>
              <ul className="mt-2 space-y-1 pl-4 text-sm leading-relaxed text-zillow-ink">
                {MEMORY_LEAK_REFACTOR.rootCausePatterns.badPatterns.map((p) => (
                  <li key={p} className="list-disc">
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                The fix
              </div>
              <p className="mt-2 text-sm leading-relaxed text-zillow-ink">
                {MEMORY_LEAK_REFACTOR.rootCausePatterns.fix}
              </p>
            </div>
          </div>
        </article>

        {/* Room status table */}
        <article className="z-card">
          <h3 className="z-h3">Where Patrick swept (and where he didn&apos;t)</h3>
          <p className="mt-2 text-sm leading-relaxed text-zillow-slate">
            Patrick fixed the Main script in 8 rooms but explicitly never touched the
            touch-panel (TP) scripts. The TP scripts have the same Lua patterns — same leak,
            different file.
          </p>
          <div className="mt-4 overflow-x-auto rounded-xl border border-zillow-gray-border bg-white">
            <table className="w-full text-sm">
              <thead className="bg-zillow-gray-light text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold text-zillow-ink">Room</th>
                  <th className="px-4 py-3 font-semibold text-zillow-ink">Main script</th>
                  <th className="px-4 py-3 font-semibold text-zillow-ink">TP scripts</th>
                  <th className="px-4 py-3 font-semibold text-zillow-ink">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zillow-gray-border">
                {MEMORY_LEAK_REFACTOR.mainScriptFixed.map((r) => (
                  <tr key={r.room} className="align-top">
                    <td className="px-4 py-3 font-mono text-xs text-zillow-ink">{r.room}</td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">
                        {r.mainScript}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-red-50 px-2 py-0.5 text-xs text-zillow-red">
                        {r.tpScripts}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-zillow-slate">{r.notes ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        {/* Rebuilt rooms */}
        <article className="z-card">
          <h3 className="z-h3">Rooms Patrick + Matt rebuilt from scratch</h3>
          <p className="mt-2 text-sm leading-relaxed text-zillow-slate">
            Of all the systems they re-did, only one still leaks — and Patrick never figured
            out why.
          </p>
          <div className="mt-4 grid gap-2 md:grid-cols-2">
            {MEMORY_LEAK_REFACTOR.rebuiltRooms.map((r) => (
              <div
                key={r.room}
                className={`rounded-md border px-3 py-2 text-sm ${
                  r.status.startsWith("STILL")
                    ? "border-zillow-red bg-red-50 text-zillow-ink"
                    : "border-zillow-gray-border bg-white text-zillow-slate"
                }`}
              >
                <span className="font-mono font-semibold text-zillow-ink">{r.room}</span>
                <span className="ml-2 text-xs">— {r.status}</span>
              </div>
            ))}
          </div>
        </article>

        {/* NYC-1250 mystery */}
        <article className="z-card border-l-4 border-zillow-red">
          <div className="z-eyebrow">Open investigation</div>
          <h3 className="z-h3 mt-2">The NYC-1250 mystery</h3>
          <p className="mt-2 text-sm leading-relaxed text-zillow-ink">
            {MEMORY_LEAK_REFACTOR.nyc1250Investigation.summary}
          </p>
          <div className="mt-3 space-y-2">
            {MEMORY_LEAK_REFACTOR.nyc1250Investigation.quotes.map((q, idx) => (
              <blockquote
                key={idx}
                className="border-l-2 border-zillow-gray-border pl-3 text-xs italic leading-relaxed text-zillow-slate"
              >
                &ldquo;{q}&rdquo;
              </blockquote>
            ))}
          </div>
          <div className="mt-3 rounded-md bg-zillow-blue-light px-3 py-2 text-sm leading-relaxed text-zillow-ink">
            <span className="font-semibold text-zillow-blue">Cortney&apos;s next step: </span>
            {MEMORY_LEAK_REFACTOR.nyc1250Investigation.cortneyNextStep}
          </div>
        </article>

        {/* SFO All Hands */}
        <article className="z-card">
          <h3 className="z-h3">SFO All Hands — Patrick&apos;s stated next priority</h3>
          <p className="mt-2 text-sm leading-relaxed text-zillow-ink">
            {MEMORY_LEAK_REFACTOR.sfoAllHands.summary}
          </p>
          <blockquote className="mt-3 border-l-2 border-zillow-gray-border pl-3 text-xs italic leading-relaxed text-zillow-slate">
            &ldquo;{MEMORY_LEAK_REFACTOR.sfoAllHands.quote}&rdquo;
          </blockquote>
          <div className="mt-3 rounded-md bg-zillow-blue-light px-3 py-2 text-sm leading-relaxed text-zillow-ink">
            <span className="font-semibold text-zillow-blue">Cortney&apos;s next step: </span>
            {MEMORY_LEAK_REFACTOR.sfoAllHands.cortneyNextStep}
          </div>
        </article>

        {/* Memory dashboard */}
        <article className="z-card">
          <h3 className="z-h3">The memory-examination Splunk dashboard</h3>
          <p className="mt-2 text-sm leading-relaxed text-zillow-ink">
            {MEMORY_LEAK_REFACTOR.memoryDashboard.summary}
          </p>
          <blockquote className="mt-3 border-l-2 border-zillow-gray-border pl-3 text-xs italic leading-relaxed text-zillow-slate">
            &ldquo;{MEMORY_LEAK_REFACTOR.memoryDashboard.quote}&rdquo;
          </blockquote>
          <p className="mt-2 text-xs text-zillow-slate">
            <span className="font-semibold text-zillow-ink">Where it lives: </span>
            {MEMORY_LEAK_REFACTOR.memoryDashboard.location}
          </p>
          <div className="mt-3 rounded-md border-l-4 border-zillow-red bg-red-50 px-3 py-2 text-sm leading-relaxed text-zillow-ink">
            <span className="font-semibold text-zillow-red">Cortney&apos;s next step: </span>
            {MEMORY_LEAK_REFACTOR.memoryDashboard.cortneyNextStep}
          </div>
        </article>

        {/* Inherited memory-leak tasks */}
        <article className="z-card bg-zillow-gray-light">
          <h3 className="z-h3">Inherited memory-leak work</h3>
          <div className="mt-4 overflow-x-auto rounded-xl border border-zillow-gray-border bg-white">
            <table className="w-full text-sm">
              <thead className="bg-zillow-gray-light text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold text-zillow-ink">Sev</th>
                  <th className="px-4 py-3 font-semibold text-zillow-ink">Task</th>
                  <th className="px-4 py-3 font-semibold text-zillow-ink">Why</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zillow-gray-border">
                {MEMORY_LEAK_REFACTOR.inheritedTasks.map((t, idx) => (
                  <tr key={idx} className="align-top">
                    <td className="px-4 py-3">
                      <span className={`z-chip ${SEV_STYLE[t.severity] ?? ""}`}>
                        {t.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-zillow-ink">{t.task}</td>
                    <td className="px-4 py-3 text-zillow-slate">{t.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
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
