import Link from "next/link";
import { UCI_ISSUES, UCI_THESIS, UCI_TOOLKIT, type UciToolkitItem } from "@/lib/data";
import QuoteCard from "@/components/QuoteCard";

const SEV_STYLE: Record<string, string> = {
  P0: "bg-red-50 text-zillow-red ring-1 ring-inset ring-red-200",
  P1: "bg-orange-50 text-zillow-orange ring-1 ring-inset ring-orange-200",
  P2: "bg-yellow-50 text-yellow-800 ring-1 ring-inset ring-yellow-200",
};

export default function UciPage() {
  return (
    <div className="space-y-12">
      <header>
        <p className="z-eyebrow">UCI &amp; Q-Sys touch panels</p>
        <h1 className="z-h1 mt-2">UCI / Q-Sys touch panel issues</h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-zillow-slate">
          Every documented complaint, design flaw, memory leak, hidden control, and strategic
          uncertainty around Zillow&apos;s Q-Sys touch panels and UCIs (Universal Control
          Interfaces). Patrick called these &ldquo;one of the least modern parts of the stack&rdquo;
          — and the CTO of Zillow personally walked up to John about an unusable touch panel in
          March 2025.
        </p>
      </header>

      {/* Patrick's thesis */}
      <section className="z-card border-l-4 border-zillow-blue bg-zillow-blue-light">
        <div className="z-eyebrow">Patrick&apos;s thesis (post CTO incident)</div>
        <blockquote className="mt-3 border-l-4 border-zillow-blue pl-4 text-base italic leading-relaxed text-zillow-ink">
          &ldquo;{UCI_THESIS.text}&rdquo;
        </blockquote>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-zillow-slate">
          <span className="font-semibold text-zillow-ink">{UCI_THESIS.who}</span>
          <span className="font-mono">{UCI_THESIS.when}</span>
          <a
            href={UCI_THESIS.permalink}
            target="_blank"
            rel="noopener noreferrer"
            className="z-link inline-flex items-center gap-1"
          >
            <span>View in Slack</span>
            <span aria-hidden>↗</span>
          </a>
        </div>
      </section>

      {/* Development toolkit */}
      <section>
        <h2 className="z-h2 mb-2">UCI development toolkit (Patrick&apos;s stack)</h2>
        <p className="mb-5 max-w-3xl text-sm text-zillow-slate">
          Everything Patrick used to build the SEA-3647 single-page UCI with AI assistance, plus
          the path forward as Q-Sys 10.x opens to HTML/JS. Tools grouped by layer.
        </p>

        {(["AI / Editor", "Q-Sys core", "Knowledge", "Source control", "Future (10.x)"] as UciToolkitItem["category"][]).map(
          (cat) => {
            const items = UCI_TOOLKIT.filter((t) => t.category === cat);
            if (items.length === 0) return null;
            return (
              <div key={cat} className="mb-6">
                <h3 className="z-h3">{cat}</h3>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  {items.map((tool) => (
                    <article key={tool.name} className="z-card">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h4 className="text-base font-bold text-zillow-ink">{tool.name}</h4>
                        {tool.url && (
                          <a
                            href={tool.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="z-link inline-flex items-center gap-1 text-xs"
                          >
                            Open ↗
                          </a>
                        )}
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-zillow-slate">
                        {tool.what}
                      </p>
                      <div className="mt-3 rounded-md bg-zillow-gray-light px-3 py-2 text-xs">
                        <span className="font-semibold text-zillow-ink">Zillow status: </span>
                        <span className="text-zillow-slate">{tool.zillowStatus}</span>
                      </div>
                      {tool.patrickReference && (
                        <div className="mt-3 rounded-md border-l-4 border-zillow-blue bg-zillow-blue-light px-3 py-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-zillow-ink">
                              Patrick — {tool.patrickReference.when}
                            </span>
                            <a
                              href={tool.patrickReference.permalink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="z-link"
                            >
                              View in Slack ↗
                            </a>
                          </div>
                          <p className="mt-1 text-xs italic leading-relaxed text-zillow-ink">
                            &ldquo;{tool.patrickReference.quote}&rdquo;
                          </p>
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              </div>
            );
          },
        )}
      </section>

      {/* Workflow */}
      <section className="z-card bg-zillow-gray-light">
        <h2 className="z-h3">Patrick&apos;s actual workflow</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-zillow-ink">
          <li>Open <strong>Cursor</strong> against the cloned regional Q-Sys repo</li>
          <li>
            <code className="rounded bg-white px-1.5 py-0.5 font-mono text-xs">@</code>-reference
            the Q-Sys help PDFs into Cursor context
          </li>
          <li>Describe behavior in plain English (e.g. &ldquo;when <code className="rounded bg-white px-1.5 py-0.5 font-mono text-xs">meeting.started</code> fires, route source X to destination Y&rdquo;)</li>
          <li>AI generates Lua → paste into the Q-Sys Designer Lua block</li>
          <li>Test against the Sandbox Core (or a dev Core, or a real room in a low-traffic window)</li>
          <li>Commit to GitLab → bot posts to #av-team automatically</li>
          <li>Update Jira ticket reference</li>
        </ol>
      </section>

      {/* Week 1 order of operations */}
      <section className="z-card border-l-4 border-zillow-blue bg-zillow-blue-light">
        <div className="z-eyebrow">Week 1 order of operations</div>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-zillow-ink">
          <li>Install <strong>Cursor</strong> on your laptop (free tier or Zillow license)</li>
          <li>Get access to the <strong>Q-Sys Designer AWS VM</strong> (Matt or Mark)</li>
          <li>Clone all 4 regional Q-Sys repos from GitLab</li>
          <li>Get added to the <strong>Q-Sys Discord</strong> (via Scott at QSC, or Mark/Matt&apos;s invite)</li>
          <li>
            Download <code className="rounded bg-white px-1.5 py-0.5 font-mono text-xs">help.qsys.com</code>{" "}
            content as PDFs into a <code className="rounded bg-white px-1.5 py-0.5 font-mono text-xs">/docs</code> folder
          </li>
          <li>Open the SEA-3647 single-page UCI in Designer. Ask Cursor to walk you through it.</li>
          <li>Start with <Link href="/quick-wins" className="z-link">QW21 — Max Concurrent Session audit</Link> as your first AI-assisted Q-Sys script</li>
        </ol>
      </section>

      {/* Summary table */}
      <section>
        <h2 className="z-h2 mb-4">Issue summary</h2>
        <div className="overflow-x-auto rounded-xl border border-zillow-gray-border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-zillow-gray-light text-left">
              <tr>
                <th className="px-4 py-3 font-semibold text-zillow-ink">Severity</th>
                <th className="px-4 py-3 font-semibold text-zillow-ink">Issue</th>
                <th className="px-4 py-3 font-semibold text-zillow-ink">Rooms</th>
                <th className="px-4 py-3 font-semibold text-zillow-ink">First seen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zillow-gray-border">
              {UCI_ISSUES.map((i) => (
                <tr key={i.id}>
                  <td className="px-4 py-3">
                    <span className={`z-chip ${SEV_STYLE[i.severity]}`}>{i.severity}</span>
                  </td>
                  <td className="px-4 py-3">
                    <a href={`#${i.id}`} className="z-link font-medium">
                      {i.title}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-zillow-slate">
                    {i.rooms.slice(0, 3).join(", ")}
                    {i.rooms.length > 3 ? ` +${i.rooms.length - 3}` : ""}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-zillow-slate">{i.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Detail cards */}
      <section className="space-y-6">
        <h2 className="z-h2">Detail</h2>
        {UCI_ISSUES.map((issue) => (
          <article id={issue.id} key={issue.id} className="z-card scroll-mt-24">
            <header className="flex flex-wrap items-center gap-2">
              <span className={`z-chip ${SEV_STYLE[issue.severity]}`}>{issue.severity}</span>
              <span className="font-mono text-xs text-zillow-slate">{issue.date}</span>
              {issue.rooms.map((r) => (
                <span
                  key={r}
                  className="rounded-md bg-zillow-gray-light px-2 py-0.5 text-xs font-medium text-zillow-slate"
                >
                  {r}
                </span>
              ))}
            </header>
            <h3 className="z-h3 mt-3">{issue.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-zillow-ink">{issue.description}</p>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-zillow-slate">
                  Root cause
                </div>
                <p className="mt-1 text-sm leading-relaxed text-zillow-ink">{issue.rootCause}</p>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-zillow-slate">
                  Resolution / status
                </div>
                <p className="mt-1 text-sm leading-relaxed text-zillow-ink">{issue.resolution}</p>
              </div>
            </div>

            <details className="mt-5">
              <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wider text-zillow-blue">
                Evidence ({issue.evidence.length})
              </summary>
              <div className="mt-3 space-y-3">
                {issue.evidence.map((q, idx) => (
                  <QuoteCard key={idx} quote={q} />
                ))}
              </div>
            </details>
          </article>
        ))}
      </section>

      {/* Cortney's action plan */}
      <section className="z-card bg-zillow-gray-light">
        <h2 className="z-h3">Cortney&apos;s action plan for the UCI portfolio</h2>
        <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-zillow-ink">
          <li>
            <strong>Inherit Patrick&apos;s single-page UCI source.</strong> Find it in GitLab, run
            it locally, understand the Main script + config file pattern.
          </li>
          <li>
            <strong>Tier 1/2/3 UCI standards strawman.</strong> Honor Patrick&apos;s
            &ldquo;no operator → no touch panel&rdquo; thesis. Define which rooms get raw Zoom
            controls, which get the single-page UCI, which need full UCIs.
          </li>
          <li>
            <strong>Fix IRV-802 hidden controls.</strong> Eliminate the &ldquo;No source
            selected&rdquo; gating. Expose projector + screen controls under a settings tab.
          </li>
          <li>
            <strong>Memory-leak sweep on TP scripts.</strong> Patrick fixed Main scripts but flagged
            TP scripts as untouched. Audit and refactor recursion.
          </li>
          <li>
            <strong>Max-concurrent-sessions audit fleet-wide.</strong> Matt only checked 2 cores.
            Bump default to 5 everywhere; track in Q-Sys 10.2 upgrade plan.
          </li>
          <li>
            <strong>Automate the ZRC Plugin &ldquo;kick&rdquo;.</strong> NYC-1202 manual fix is a
            scripting opportunity.
          </li>
          <li>
            <strong>Lab-test the Q-Sys TSC-101-G3 + Q-Sys Connect on Windows.</strong> Decide
            architecturally whether to lobby IT for Windows AV appliance exception.
          </li>
          <li>
            <strong>Document the custom Q-Sys plugins.</strong> Mark didn&apos;t recognize the
            projector-control plugin. Catalog source (community vs Patrick-authored) and license/support
            implications.
          </li>
        </ol>
      </section>

      <section className="text-sm text-zillow-slate">
        Related:{" "}
        <Link href="/issues/ui-standardization" className="z-link">
          UI Standardization issue
        </Link>{" "}
        ·{" "}
        <Link href="/mac-mini" className="z-link">
          Mac Mini architectural review
        </Link>{" "}
        ·{" "}
        <Link href="/handoff" className="z-link">
          Patrick handoff (claim the UCI source)
        </Link>
      </section>
    </div>
  );
}
