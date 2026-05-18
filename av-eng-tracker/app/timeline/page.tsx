import Link from "next/link";
import {
  AV_CHANNEL_HISTORY,
  TEAM_TENURE,
  TEAM_TIMELINE_INSIGHTS,
  type TeammateTenure,
} from "@/lib/data";

const STATUS_STYLE: Record<TeammateTenure["status"], string> = {
  Active: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  Departed: "bg-red-50 text-zillow-red ring-1 ring-inset ring-red-200",
  "On Leave": "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200",
  New: "bg-zillow-blue-light text-zillow-blue ring-1 ring-inset ring-blue-200",
};

export default function TimelinePage() {
  return (
    <div className="space-y-12">
      <header>
        <p className="z-eyebrow">Team & channel history</p>
        <h1 className="z-h1 mt-2">Who started when · who created what</h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-zillow-slate">
          Reconstructed from Slack user IDs (issued chronologically — older = lower number),
          channel IDs (same), explicit hire announcements, and Patrick&apos;s own
          self-references. Every claim links back to the Slack message that supports it.
        </p>
      </header>

      {/* KEY INSIGHTS */}
      <section className="z-card border-l-4 border-zillow-blue bg-zillow-blue-light">
        <div className="z-eyebrow">The 7 things to know</div>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-zillow-ink">
          {TEAM_TIMELINE_INSIGHTS.map((insight, i) => (
            <li
              key={i}
              dangerouslySetInnerHTML={{
                __html: insight.replace(
                  /\*\*(.*?)\*\*/g,
                  '<strong class="text-zillow-blue">$1</strong>',
                ),
              }}
            />
          ))}
        </ul>
      </section>

      {/* CRITICAL CALLOUT — Matt's precedent */}
      <section className="z-card border-l-4 border-emerald-500 bg-emerald-50">
        <div className="z-eyebrow text-emerald-700">
          ⭐ Critical precedent for you
        </div>
        <p className="mt-2 text-base font-bold text-zillow-ink">
          Matt did exactly your path: contractor first, then FTE.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-zillow-ink">
          Matt&apos;s first #av-team post was Feb 21, 2024. Stacey announced his FTE
          conversion Oct 8, 2024. Official start date Dec 16, 2024.{" "}
          <strong>That&apos;s a 10-month contractor-to-FTE arc under the same manager.</strong>{" "}
          Your contractor-to-FTE conversion has a literal one-employee precedent inside the
          team, with the same person (Stacey) writing the announcement. The path is paved.
        </p>
      </section>

      {/* TEAMMATE TENURE */}
      <section>
        <h2 className="z-h2 mb-4">Teammate tenure (oldest → newest)</h2>
        <div className="space-y-4">
          {TEAM_TENURE.map((t) => (
            <article key={t.userId} className="z-card">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <div>
                  <h3 className="z-h3">{t.name}</h3>
                  <div className="mt-1 text-sm text-zillow-slate">{t.role}</div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`z-chip ${STATUS_STYLE[t.status]}`}>{t.status}</span>
                  <span className="rounded bg-zillow-gray-light px-2 py-0.5 font-mono text-[10px] text-zillow-slate">
                    {t.userId}
                  </span>
                  <span className="rounded bg-zillow-gray-light px-2 py-0.5 font-mono text-[10px] text-zillow-slate">
                    {t.timezone}
                  </span>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-md bg-zillow-blue-light px-3 py-2 text-xs leading-relaxed">
                  <span className="font-semibold text-zillow-blue">AV team start: </span>
                  {t.avTeamStart}
                </div>
                <div className="rounded-md bg-zillow-gray-light px-3 py-2 text-xs leading-relaxed">
                  <span className="font-semibold text-zillow-ink">Zillow tenure: </span>
                  {t.zillowTenureEstimate}
                </div>
              </div>

              <div className="mt-3 rounded-md border border-zillow-gray-border bg-white px-3 py-2 text-xs leading-relaxed text-zillow-slate">
                <span className="font-semibold text-zillow-ink">Evidence: </span>
                {t.startContext}
              </div>

              {t.keyMilestones.length > 0 && (
                <div className="mt-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-zillow-slate">
                    Key milestones
                  </div>
                  <ul className="mt-2 space-y-2">
                    {t.keyMilestones.map((m, i) => (
                      <li
                        key={i}
                        className="rounded-md border border-zillow-gray-border bg-white p-3 text-xs"
                      >
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <span className="font-mono font-semibold text-zillow-ink">
                            {m.date}
                          </span>
                          {m.permalink && (
                            <a
                              href={m.permalink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="z-link"
                            >
                              View in Slack ↗
                            </a>
                          )}
                        </div>
                        <p className="mt-1 leading-relaxed text-zillow-ink">{m.what}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* CHANNEL HISTORY */}
      <section>
        <h2 className="z-h2 mb-4">Channel creation order — who built what, when</h2>
        <p className="mb-5 max-w-3xl text-sm text-zillow-slate">
          Slack channel IDs are issued chronologically — lower prefix = older channel. The
          order below reflects the actual creation order based on channel IDs + the explicit
          Patrick references where available.
        </p>
        <div className="space-y-3">
          {AV_CHANNEL_HISTORY.map((c, i) => (
            <article key={c.name} className="z-card">
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-zillow-blue text-xs font-bold text-white">
                  {i + 1}
                </span>
                <div>
                  <h3 className="z-h3">{c.name}</h3>
                  <div className="mt-0.5 text-xs text-zillow-slate">
                    <span className="font-mono">{c.channelId}</span> · {c.approxCreated}
                  </div>
                </div>
              </div>
              {c.creator && (
                <p className="mt-3 text-sm leading-relaxed text-zillow-ink">
                  <span className="font-semibold">Creator: </span>
                  {c.creator}
                </p>
              )}
              <p className="mt-2 text-sm leading-relaxed text-zillow-slate">{c.purpose}</p>
              <div className="mt-3 rounded-md bg-zillow-blue-light px-3 py-2 text-xs leading-relaxed text-zillow-ink">
                <span className="font-semibold text-zillow-blue">For you: </span>
                {c.notableForCortney}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="text-xs text-zillow-slate border-t border-zillow-gray-border pt-4">
        Related:{" "}
        <Link href="/channels" className="z-link">
          Channels &amp; contacts
        </Link>{" "}
        ·{" "}
        <Link href="/patrick-audit" className="z-link">
          Patrick audit
        </Link>{" "}
        ·{" "}
        <Link href="/playbook" className="z-link">
          Playbook (FTE)
        </Link>{" "}
        ·{" "}
        <Link href="/one-on-one" className="z-link">
          1:1 cheat sheet
        </Link>
      </section>
    </div>
  );
}
