import Link from "next/link";
import {
  CONTACTS,
  NEW_FINDINGS_FROM_CHANNELS,
  SLACK_CHANNELS,
  type SlackChannelEntry,
} from "@/lib/data";

const VALUE_STYLE: Record<SlackChannelEntry["watchValue"], string> = {
  Critical: "bg-red-50 text-zillow-red ring-1 ring-inset ring-red-200",
  High: "bg-orange-50 text-zillow-orange ring-1 ring-inset ring-orange-200",
  Medium: "bg-yellow-50 text-yellow-800 ring-1 ring-inset ring-yellow-200",
  Low: "bg-zillow-gray-light text-zillow-slate ring-1 ring-inset ring-zillow-gray-border",
};

const SEV_STYLE: Record<string, string> = {
  P0: "bg-red-50 text-zillow-red ring-1 ring-inset ring-red-200",
  P1: "bg-orange-50 text-zillow-orange ring-1 ring-inset ring-orange-200",
  P2: "bg-yellow-50 text-yellow-800 ring-1 ring-inset ring-yellow-200",
  P3: "bg-zillow-gray-light text-zillow-slate ring-1 ring-inset ring-zillow-gray-border",
};

export default function ChannelsPage() {
  // Group contacts by team for the directory
  const byTeam: Record<string, typeof CONTACTS> = {};
  for (const c of CONTACTS) {
    if (!byTeam[c.team]) byTeam[c.team] = [];
    byTeam[c.team].push(c);
  }
  const teamOrder = Object.keys(byTeam);

  return (
    <div className="space-y-12">
      <header>
        <p className="z-eyebrow">Slack map · {SLACK_CHANNELS.length} channels · {CONTACTS.length} contacts</p>
        <h1 className="z-h1 mt-2">AV Slack channel map &amp; contacts directory</h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-zillow-slate">
          Every AV-adjacent Slack channel Cortney has visibility into, what each one is for,
          the key people, and findings pulled out of recent activity. Plus the full contacts
          directory — who lives in which channel, what their role is, and how they intersect
          your work. Use this when a new escalation lands and you need to figure out which
          channel to route it to (or who to DM).
        </p>
      </header>

      {/* NEW URGENT FINDINGS — pulled forward */}
      <section className="space-y-4">
        <div>
          <h2 className="z-h2 mb-1">New findings from the channel comb</h2>
          <p className="max-w-3xl text-sm text-zillow-slate">
            Items pulled out of the AV-adjacent channels that aren&apos;t yet on the issues /
            wins / Jira boards. Triage these first. Click &ldquo;View in Slack&rdquo; for full
            thread context.
          </p>
        </div>
        <div className="space-y-3">
          {NEW_FINDINGS_FROM_CHANNELS.map((f) => (
            <article key={f.id} className="z-card">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`z-chip ${SEV_STYLE[f.severity]}`}>{f.severity}</span>
                <span className="text-xs text-zillow-slate">{f.source}</span>
                {f.sourcePermalink && (
                  <a
                    href={f.sourcePermalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="z-link inline-flex items-center gap-1 text-xs"
                  >
                    View full thread in Slack ↗
                  </a>
                )}
              </div>
              <h3 className="z-h3 mt-2">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zillow-ink">{f.description}</p>
              <div className="mt-3 rounded-md bg-zillow-blue-light px-3 py-2 text-sm leading-relaxed text-zillow-ink">
                <span className="font-semibold text-zillow-blue">Cortney action: </span>
                {f.cortneyAction}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* CHANNELS */}
      <section className="space-y-4">
        <div>
          <h2 className="z-h2 mb-1">Channel map ({SLACK_CHANNELS.length})</h2>
          <p className="max-w-3xl text-sm text-zillow-slate">
            Sorted roughly by watch value. Cortney should be in (and posting in) the Critical +
            High ones; subscribe to the Medium + Low.
          </p>
        </div>
        <div className="space-y-4">
          {SLACK_CHANNELS.map((c) => (
            <article key={c.name} className="z-card">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h3 className="z-h3">{c.name}</h3>
                <span className={`z-chip ${VALUE_STYLE[c.watchValue]}`}>
                  {c.watchValue} watch value
                </span>
              </div>
              <p className="mt-2 text-sm font-semibold leading-relaxed text-zillow-ink">
                {c.purpose}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-zillow-slate">{c.whatItIs}</p>

              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-zillow-slate">
                    Key people
                  </div>
                  <ul className="mt-2 space-y-1 text-xs leading-relaxed text-zillow-ink">
                    {c.keyPeople.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </div>
                <div className="md:col-span-2">
                  <div className="text-xs font-semibold uppercase tracking-wider text-zillow-slate">
                    Findings (click &ldquo;View in Slack&rdquo; for full thread context)
                  </div>
                  <ul className="mt-2 space-y-2 text-xs leading-relaxed text-zillow-ink">
                    {c.findings.map((f, i) => (
                      <li
                        key={i}
                        className="rounded-md border border-zillow-gray-border bg-white px-3 py-2"
                      >
                        <p>{f.text}</p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[10px] text-zillow-slate">
                          {f.who && <span className="font-semibold text-zillow-ink">— {f.who}</span>}
                          {f.when && <span className="font-mono">{f.when}</span>}
                          {f.permalink && (
                            <a
                              href={f.permalink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="z-link inline-flex items-center gap-1 font-medium"
                            >
                              View full thread in Slack ↗
                            </a>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-4 rounded-md bg-zillow-blue-light px-3 py-2 text-sm leading-relaxed text-zillow-ink">
                <span className="font-semibold text-zillow-blue">Cortney action: </span>
                {c.cortneyAction}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* CONTACTS */}
      <section className="space-y-4">
        <div>
          <h2 className="z-h2 mb-1">Contacts directory ({CONTACTS.length})</h2>
          <p className="max-w-3xl text-sm text-zillow-slate">
            Phone book of every person mentioned in the channels above. Grouped by team. When
            an escalation lands, find the right person here first.
          </p>
        </div>
        {teamOrder.map((team) => (
          <div key={team} className="z-card">
            <h3 className="z-h3 mb-3">{team}</h3>
            <div className="grid gap-3 md:grid-cols-2">
              {byTeam[team].map((p) => (
                <article
                  key={p.name}
                  className="rounded-md border border-zillow-gray-border bg-white p-3"
                >
                  <div className="flex items-baseline justify-between">
                    <div className="font-semibold text-zillow-ink">{p.name}</div>
                  </div>
                  <div className="text-xs text-zillow-slate">{p.role}</div>
                  <p className="mt-2 text-xs leading-relaxed text-zillow-ink">{p.intersects}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {p.channels.map((ch) => (
                      <span
                        key={ch}
                        className="rounded bg-zillow-gray-light px-1.5 py-0.5 font-mono text-[10px] text-zillow-slate"
                      >
                        {ch}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="text-sm text-zillow-slate">
        Related:{" "}
        <Link href="/jira" className="z-link">
          Jira board
        </Link>{" "}
        ·{" "}
        <Link href="/sites" className="z-link">
          Per-site breakdowns
        </Link>{" "}
        ·{" "}
        <Link href="/playbook" className="z-link">
          Playbook (FTE)
        </Link>{" "}
        ·{" "}
        <Link href="/quick-wins" className="z-link">
          Quick wins
        </Link>
      </section>
    </div>
  );
}
