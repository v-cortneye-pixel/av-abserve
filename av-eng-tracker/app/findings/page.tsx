import type { Metadata } from "next";
import {
  ISSUES,
  NEW_FINDINGS_FROM_CHANNELS,
  UCI_ISSUES,
} from "@/lib/data";

export const metadata: Metadata = {
  title: "AV Findings — for team review",
  description:
    "Open AV issues observed across the team's Slack channel record. Categorized by severity. Each item linked to its source thread.",
};

type Severity = "P0" | "P1" | "P2" | "P3";

interface PresentationItem {
  id: string;
  severity: Severity;
  title: string;
  summary: string;
  category: string;
  rooms?: string[];
  status?: string;
  sourceChannel: string;
  sourceWhen?: string;
  sourceLabel: string;
  permalink?: string;
  quoteCount?: number;
}

const SEV_STYLE: Record<Severity, string> = {
  P0: "bg-red-50 text-zillow-red ring-2 ring-zillow-red",
  P1: "bg-orange-50 text-zillow-orange ring-1 ring-zillow-orange",
  P2: "bg-yellow-50 text-yellow-800 ring-1 ring-yellow-300",
  P3: "bg-zillow-gray-light text-zillow-slate ring-1 ring-zillow-gray-border",
};

const SEV_HEADER: Record<Severity, string> = {
  P0: "Severity P0 — Highest priority",
  P1: "Severity P1 — High priority",
  P2: "Severity P2 — Medium priority",
  P3: "Severity P3 — Low / nice-to-have",
};

const SEV_DESCRIPTION: Record<Severity, string> = {
  P0: "Production rooms degraded, pipelines failing, exec-tier impact, or compliance violations.",
  P1: "Recurring user impact, architectural decisions pending, or hardware in unhealthy state.",
  P2: "Annoying but not blocking — fix when capacity allows.",
  P3: "Backlog items and process improvements — pick up opportunistically.",
};

function buildItems(): PresentationItem[] {
  const items: PresentationItem[] = [];

  // 1. Main ISSUES
  for (const i of ISSUES) {
    const firstQuote = i.quotes[0];
    items.push({
      id: `issue-${i.id}`,
      severity: i.severity as Severity,
      title: i.title,
      summary: i.summary,
      category: i.category,
      rooms: i.rooms,
      status: i.status,
      sourceChannel: "#av-team",
      sourceWhen: firstQuote?.when,
      sourceLabel: firstQuote
        ? `First observed in #av-team — ${firstQuote.when}`
        : "Source: #av-team",
      permalink: firstQuote?.permalink,
      quoteCount: i.quotes.length,
    });
  }

  // 2. UCI_ISSUES
  for (const u of UCI_ISSUES) {
    const firstEvidence = u.evidence?.[0];
    items.push({
      id: `uci-${u.id}`,
      severity: u.severity as Severity,
      title: `UCI: ${u.title}`,
      summary: u.description,
      category: "UCI / Touch Panels",
      rooms: u.rooms,
      sourceChannel: "#av-team",
      sourceWhen: u.date,
      sourceLabel: `First observed — ${u.date}`,
      permalink: firstEvidence?.permalink,
      quoteCount: u.evidence?.length,
    });
  }

  // 3. NEW_FINDINGS_FROM_CHANNELS
  for (const f of NEW_FINDINGS_FROM_CHANNELS) {
    items.push({
      id: `nf-${f.id}`,
      severity: f.severity as Severity,
      title: f.title,
      summary: f.description,
      category: "Channel comb",
      sourceChannel: f.source.replace(/^#?/, "#"),
      sourceLabel: f.source,
      permalink: f.sourcePermalink,
    });
  }

  return items;
}

const SEV_ORDER: Severity[] = ["P0", "P1", "P2", "P3"];

export default function FindingsPage() {
  const items = buildItems();

  // Group by severity
  const grouped = new Map<Severity, PresentationItem[]>();
  for (const s of SEV_ORDER) grouped.set(s, []);
  for (const it of items) grouped.get(it.severity)?.push(it);

  // Sort within each severity by category alphabetically
  for (const arr of grouped.values()) {
    arr.sort((a, b) => a.category.localeCompare(b.category) || a.title.localeCompare(b.title));
  }

  const counts: Record<Severity, number> = {
    P0: grouped.get("P0")!.length,
    P1: grouped.get("P1")!.length,
    P2: grouped.get("P2")!.length,
    P3: grouped.get("P3")!.length,
  };

  return (
    <div className="space-y-12">
      {/* Header — neutral framing */}
      <header>
        <p className="z-eyebrow">AV findings · for team review</p>
        <h1 className="z-h1 mt-2">Open AV issues observed in the channel record</h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-zillow-slate">
          Findings sourced from #av-team and adjacent AV channels (#av-alerts, #sea-av,
          #irvine-av, #nyc-av, #av_networking, #founders-suite-av-support,{" "}
          #fs_zeus_ex-sup-team_and_av-team, #av-workplace, #av-comms-zall-hall-group,{" "}
          #org-channel-cloud-hq-experience). Each item links to the originating Slack
          thread. Sorted by severity. Owner assignments intentionally omitted — this is a
          shared findings document for team review and prioritization.
        </p>
        <p className="mt-3 max-w-3xl text-xs italic leading-relaxed text-zillow-slate">
          Generated {new Date().toISOString().slice(0, 10)} · {items.length} items total.
        </p>
      </header>

      {/* Stat strip */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {SEV_ORDER.map((s) => (
          <div key={s} className={`rounded-lg p-4 ${SEV_STYLE[s]}`}>
            <div className="text-3xl font-bold">{counts[s]}</div>
            <div className="mt-1 text-xs font-semibold uppercase tracking-wider">{s}</div>
          </div>
        ))}
      </section>

      {/* Methodology */}
      <section className="z-card bg-zillow-gray-light">
        <div className="z-eyebrow">Methodology</div>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-relaxed text-zillow-ink">
          <li>
            Channels combed: #av-team (back to Jan 2024), #av-alerts (daily bot digest),
            site-specific channels (#sea-av, #irvine-av, #nyc-av), joint channels with
            Workplace / Networking / Exec Support / Comms.
          </li>
          <li>
            Severity assignment is observational, not prescriptive — based on stated user
            impact and frequency in the channel record.
          </li>
          <li>
            Items grouped first by severity, then by category. No assigned ownership.
          </li>
          <li>
            Each item links to the originating Slack thread for full context and
            verification.
          </li>
        </ul>
      </section>

      {/* Grouped findings */}
      {SEV_ORDER.map((sev) => {
        const arr = grouped.get(sev) ?? [];
        if (arr.length === 0) return null;
        return (
          <section key={sev}>
            <header className="mb-5">
              <div className="flex flex-wrap items-baseline gap-3">
                <span className={`z-chip text-base ${SEV_STYLE[sev]}`}>{sev}</span>
                <h2 className="z-h2">{SEV_HEADER[sev]}</h2>
                <span className="ml-auto text-sm text-zillow-slate">
                  {arr.length} item{arr.length === 1 ? "" : "s"}
                </span>
              </div>
              <p className="mt-2 max-w-3xl text-sm text-zillow-slate">{SEV_DESCRIPTION[sev]}</p>
            </header>

            <div className="space-y-3">
              {arr.map((item) => (
                <article key={item.id} className="z-card">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`z-chip ${SEV_STYLE[item.severity]}`}>
                          {item.severity}
                        </span>
                        <span className="rounded-md bg-zillow-blue-light px-2 py-0.5 text-xs font-medium text-zillow-blue">
                          {item.category}
                        </span>
                        {item.status && (
                          <span className="rounded-md bg-zillow-gray-light px-2 py-0.5 text-xs text-zillow-slate">
                            {item.status}
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-zillow-ink">{item.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-zillow-ink">
                        {item.summary}
                      </p>

                      {/* Rooms */}
                      {item.rooms && item.rooms.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {item.rooms.slice(0, 6).map((r) => (
                            <span
                              key={r}
                              className="rounded bg-zillow-gray-light px-1.5 py-0.5 text-[10px] font-mono text-zillow-slate"
                            >
                              {r}
                            </span>
                          ))}
                          {item.rooms.length > 6 && (
                            <span className="rounded bg-zillow-gray-light px-1.5 py-0.5 text-[10px] font-mono text-zillow-slate">
                              +{item.rooms.length - 6} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Source + quote count */}
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-zillow-slate">
                        <span>
                          <span className="font-semibold text-zillow-ink">Source: </span>
                          {item.sourceLabel}
                        </span>
                        {item.quoteCount !== undefined && item.quoteCount > 0 && (
                          <span>
                            <span className="font-semibold text-zillow-ink">Evidence: </span>
                            {item.quoteCount} quote{item.quoteCount === 1 ? "" : "s"} captured
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Permalink button */}
                  {item.permalink && (
                    <div className="mt-3 pt-3 border-t border-zillow-gray-border">
                      <a
                        href={item.permalink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="z-link inline-flex items-center gap-1.5 text-sm font-medium"
                      >
                        View source thread in Slack ↗
                      </a>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>
        );
      })}

      {/* Footer */}
      <footer className="border-t border-zillow-gray-border pt-6 text-xs text-zillow-slate">
        <p className="mb-2">
          <strong>Note:</strong> This is a findings document for team review. It does not
          assign ownership or prescribe action. Severity reflects observed user impact and
          frequency in the channel record, not formal triage. The team may wish to revise
          severity, scope, or grouping during review.
        </p>
        <p>Last regenerated {new Date().toISOString().slice(0, 10)}.</p>
      </footer>
    </div>
  );
}
