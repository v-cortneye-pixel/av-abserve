import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ISSUES,
  MEMORY_LEAK_REFACTOR,
  SITES,
  UCI_ISSUES,
  type Issue,
  type UciIssue,
} from "@/lib/data";

const SEV_STYLE: Record<string, string> = {
  P0: "bg-red-50 text-zillow-red ring-1 ring-inset ring-red-200",
  P1: "bg-orange-50 text-zillow-orange ring-1 ring-inset ring-orange-200",
  P2: "bg-yellow-50 text-yellow-800 ring-1 ring-inset ring-yellow-200",
  P3: "bg-zillow-gray-light text-zillow-slate ring-1 ring-inset ring-zillow-gray-border",
};

const STATUS_STYLE: Record<string, string> = {
  Open: "bg-red-50 text-zillow-red",
  Workaround: "bg-amber-50 text-amber-800",
  "In Progress": "bg-blue-50 text-zillow-blue",
  Resolved: "bg-emerald-50 text-emerald-700",
};

export async function generateStaticParams() {
  return SITES.map((s) => ({ id: s.id }));
}

function matchesPrefixes(rooms: string[], prefixes: string[]) {
  return rooms.some((r) =>
    prefixes.some((p) => r.toLowerCase().startsWith(p.toLowerCase())),
  );
}

export default async function SitePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const site = SITES.find((s) => s.id === id);
  if (!site) notFound();

  const issues: Issue[] = ISSUES.filter((i) => matchesPrefixes(i.rooms, site.matchesPrefixes));
  const uciIssues: UciIssue[] = UCI_ISSUES.filter((i) =>
    matchesPrefixes(i.rooms, site.matchesPrefixes),
  );
  const memMain = MEMORY_LEAK_REFACTOR.mainScriptFixed.filter((r) =>
    site.matchesPrefixes.some((p) => r.room.toLowerCase().startsWith(p.toLowerCase())),
  );
  const memRebuilt = MEMORY_LEAK_REFACTOR.rebuiltRooms.filter((r) =>
    site.matchesPrefixes.some((p) => r.room.toLowerCase().startsWith(p.toLowerCase())),
  );

  // Site-specific room mentions across all issue evidence (rooms that match
  // but aren't on the canonical roomList)
  const seenRooms = new Set<string>(site.roomList);
  for (const i of [...issues, ...uciIssues]) {
    for (const r of i.rooms) {
      if (site.matchesPrefixes.some((p) => r.toLowerCase().startsWith(p.toLowerCase()))) {
        seenRooms.add(r);
      }
    }
  }
  for (const r of [...memMain, ...memRebuilt]) {
    seenRooms.add(r.room);
  }

  // Open vs resolved split
  const openIssues = issues.filter((i) => i.status !== "Resolved");
  const resolvedIssues = issues.filter((i) => i.status === "Resolved");

  return (
    <div className="space-y-12">
      <header>
        <div className="flex items-baseline justify-between">
          <div>
            <p className="z-eyebrow">
              {site.code} · {site.region}
            </p>
            <h1 className="z-h1 mt-2">{site.name}</h1>
          </div>
          <Link href="/sites" className="z-link text-sm">
            ← All sites
          </Link>
        </div>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-zillow-slate">
          {site.description}
        </p>
        <div className="z-card mt-4 border-l-4 border-zillow-blue bg-zillow-blue-light">
          <div className="z-eyebrow">Site signature</div>
          <p className="mt-2 text-sm leading-relaxed text-zillow-ink">{site.signature}</p>
        </div>
      </header>

      {/* Stats */}
      <section>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="z-card">
            <div className="text-xs uppercase tracking-wider text-zillow-slate">Open issues</div>
            <div className="mt-1 text-3xl font-bold text-zillow-red">{openIssues.length}</div>
          </div>
          <div className="z-card">
            <div className="text-xs uppercase tracking-wider text-zillow-slate">Resolved</div>
            <div className="mt-1 text-3xl font-bold text-emerald-700">
              {resolvedIssues.length}
            </div>
          </div>
          <div className="z-card">
            <div className="text-xs uppercase tracking-wider text-zillow-slate">UCI issues</div>
            <div className="mt-1 text-3xl font-bold text-amber-700">{uciIssues.length}</div>
          </div>
          <div className="z-card">
            <div className="text-xs uppercase tracking-wider text-zillow-slate">Rooms tracked</div>
            <div className="mt-1 text-3xl font-bold text-zillow-ink">{seenRooms.size}</div>
          </div>
        </div>
      </section>

      {/* Rooms */}
      <section>
        <h2 className="z-h2 mb-3">Rooms on file at {site.name}</h2>
        <div className="z-card">
          <div className="flex flex-wrap gap-2">
            {[...seenRooms]
              .sort()
              .map((r) => (
                <span
                  key={r}
                  className="rounded-md bg-zillow-gray-light px-2 py-1 font-mono text-xs text-zillow-ink"
                >
                  {r}
                </span>
              ))}
          </div>
        </div>
      </section>

      {/* Open issues */}
      {openIssues.length > 0 && (
        <section>
          <h2 className="z-h2 mb-3">Open issues at {site.name}</h2>
          <div className="space-y-3">
            {openIssues.map((i) => (
              <article key={i.id} className="z-card">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`z-chip ${SEV_STYLE[i.severity] ?? ""}`}>{i.severity}</span>
                  <span className={`rounded px-2 py-0.5 text-xs ${STATUS_STYLE[i.status] ?? ""}`}>
                    {i.status}
                  </span>
                  <span className="text-xs font-mono text-zillow-slate">{i.category}</span>
                  <span className="ml-auto text-xs text-zillow-slate">Owner: {i.owner}</span>
                </div>
                <h3 className="z-h3 mt-2">
                  <Link href={`/issues/${i.id}`} className="hover:text-zillow-blue">
                    {i.title}
                  </Link>
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zillow-ink">{i.summary}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {i.rooms
                    .filter((r) =>
                      site.matchesPrefixes.some((p) =>
                        r.toLowerCase().startsWith(p.toLowerCase()),
                      ),
                    )
                    .map((r) => (
                      <span
                        key={r}
                        className="rounded bg-zillow-blue-light px-2 py-0.5 text-xs font-mono text-zillow-blue"
                      >
                        {r}
                      </span>
                    ))}
                </div>
                <div className="mt-3 rounded-md bg-zillow-blue-light px-3 py-2 text-xs leading-relaxed text-zillow-ink">
                  <span className="font-semibold text-zillow-blue">Cortney action: </span>
                  {i.cortneyAction}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* UCI issues */}
      {uciIssues.length > 0 && (
        <section>
          <h2 className="z-h2 mb-3">UCI / touch-panel issues at {site.name}</h2>
          <div className="space-y-3">
            {uciIssues.map((i) => (
              <article key={i.id} className="z-card">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`z-chip ${SEV_STYLE[i.severity] ?? ""}`}>{i.severity}</span>
                  <span className="font-mono text-xs text-zillow-slate">{i.date}</span>
                </div>
                <h3 className="z-h3 mt-2">
                  <Link href={`/uci#${i.id}`} className="hover:text-zillow-blue">
                    {i.title}
                  </Link>
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zillow-ink">{i.description}</p>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <div className="rounded-md bg-zillow-gray-light px-3 py-2 text-xs leading-relaxed">
                    <span className="font-semibold text-zillow-ink">Root cause: </span>
                    {i.rootCause}
                  </div>
                  <div className="rounded-md bg-zillow-gray-light px-3 py-2 text-xs leading-relaxed">
                    <span className="font-semibold text-zillow-ink">Resolution: </span>
                    {i.resolution}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Memory leak split */}
      {(memMain.length > 0 || memRebuilt.length > 0) && (
        <section>
          <h2 className="z-h2 mb-3">Memory-leak refactor status at {site.name}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {memMain.length > 0 && (
              <article className="z-card">
                <h3 className="z-h3">Main-script sweep</h3>
                <p className="mt-2 text-xs text-zillow-slate">
                  Patrick fixed Main scripts here; TP scripts NOT touched — same leak,
                  different file. See{" "}
                  <Link href="/splunk#memory-leak" className="z-link">
                    /splunk#memory-leak
                  </Link>
                  .
                </p>
                <ul className="mt-3 space-y-2 text-sm">
                  {memMain.map((r) => (
                    <li
                      key={r.room}
                      className="flex items-baseline justify-between rounded-md border border-zillow-gray-border px-3 py-2"
                    >
                      <span className="font-mono font-semibold text-zillow-ink">{r.room}</span>
                      <div className="flex gap-2 text-xs">
                        <span className="rounded bg-emerald-50 px-2 py-0.5 text-emerald-700">
                          Main: {r.mainScript}
                        </span>
                        <span className="rounded bg-red-50 px-2 py-0.5 text-zillow-red">
                          TP: {r.tpScripts}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </article>
            )}
            {memRebuilt.length > 0 && (
              <article className="z-card">
                <h3 className="z-h3">Full rebuilds (Patrick + Matt)</h3>
                <p className="mt-2 text-xs text-zillow-slate">
                  Rooms rebuilt from scratch. Generally clean; flag any &ldquo;still
                  leaking&rdquo; for diff investigation.
                </p>
                <ul className="mt-3 space-y-2 text-sm">
                  {memRebuilt.map((r) => (
                    <li
                      key={r.room}
                      className={`rounded-md px-3 py-2 ${
                        r.status.startsWith("STILL")
                          ? "border border-zillow-red bg-red-50"
                          : "border border-zillow-gray-border bg-white"
                      }`}
                    >
                      <span className="font-mono font-semibold text-zillow-ink">{r.room}</span>
                      <span className="ml-2 text-xs text-zillow-slate">— {r.status}</span>
                    </li>
                  ))}
                </ul>
              </article>
            )}
          </div>
        </section>
      )}

      {/* Resolved issues */}
      {resolvedIssues.length > 0 && (
        <section>
          <h2 className="z-h2 mb-3">Resolved (recent track record at {site.name})</h2>
          <div className="space-y-2">
            {resolvedIssues.map((i) => (
              <Link
                key={i.id}
                href={`/issues/${i.id}`}
                className="block rounded-md border border-zillow-gray-border bg-white px-4 py-3 text-sm hover:bg-zillow-gray-light"
              >
                <div className="flex items-baseline justify-between">
                  <span className="font-semibold text-zillow-ink">{i.title}</span>
                  <span className="rounded bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">
                    {i.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-zillow-slate">{i.summary}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Known projects */}
      <section>
        <h2 className="z-h2 mb-3">Known projects + open work at {site.name}</h2>
        <div className="space-y-3">
          {site.knownProjects.map((p) => (
            <article key={p.title} className="z-card">
              <h3 className="text-base font-semibold text-zillow-ink">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zillow-slate">{p.note}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Innovations / experiments */}
      {site.innovationsHere.length > 0 && (
        <section>
          <h2 className="z-h2 mb-3">Experiments &amp; innovations born here</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {site.innovationsHere.map((p) => (
              <article key={p.title} className="z-card border-l-4 border-zillow-blue">
                <h3 className="text-base font-semibold text-zillow-ink">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zillow-slate">{p.note}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="text-sm text-zillow-slate">
        Related:{" "}
        <Link href="/sites" className="z-link">
          All sites
        </Link>{" "}
        ·{" "}
        <Link href="/issues" className="z-link">
          Full issue catalog
        </Link>{" "}
        ·{" "}
        <Link href="/splunk#memory-leak" className="z-link">
          Memory-leak deep dive
        </Link>{" "}
        ·{" "}
        <Link href="/uci" className="z-link">
          UCI half-standards
        </Link>
      </section>
    </div>
  );
}
