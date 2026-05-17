import Link from "next/link";
import { ISSUES, type Severity } from "@/lib/data";
import SeverityBadge from "@/components/SeverityBadge";
import StatusPill from "@/components/StatusPill";

const ORDER: Severity[] = ["P0", "P1", "P2", "P3"];

export default function IssuesPage() {
  return (
    <div className="space-y-10">
      <header>
        <p className="z-eyebrow">Issues catalog</p>
        <h1 className="z-h1 mt-2">All recurring issues</h1>
        <p className="mt-3 max-w-3xl text-base text-zillow-slate">
          Every issue tracked in #av-team over the past ~20 months, sorted by severity. Click any
          card for full Slack quotes, current state, and your proposed action.
        </p>
      </header>

      {ORDER.map((sev) => {
        const items = ISSUES.filter((i) => i.severity === sev);
        if (items.length === 0) return null;
        return (
          <section key={sev}>
            <div className="mb-4 flex items-center gap-3">
              <SeverityBadge severity={sev} />
              <span className="text-sm text-zillow-slate">
                {items.length} {items.length === 1 ? "issue" : "issues"}
              </span>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {items.map((issue) => (
                <Link
                  key={issue.id}
                  href={`/issues/${issue.id}`}
                  className="z-card z-card-hover block"
                >
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="z-chip bg-zillow-blue-light text-zillow-blue">
                      {issue.category}
                    </span>
                    <StatusPill status={issue.status} />
                  </div>
                  <h3 className="z-h3">{issue.title}</h3>
                  <p className="mt-2 line-clamp-3 text-sm text-zillow-slate">{issue.summary}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {issue.rooms.slice(0, 4).map((r) => (
                      <span
                        key={r}
                        className="rounded-md bg-zillow-gray-light px-2 py-0.5 text-xs font-medium text-zillow-slate"
                      >
                        {r}
                      </span>
                    ))}
                    {issue.rooms.length > 4 && (
                      <span className="rounded-md bg-zillow-gray-light px-2 py-0.5 text-xs font-medium text-zillow-slate">
                        +{issue.rooms.length - 4} more
                      </span>
                    )}
                  </div>
                  <div className="mt-4 text-xs text-zillow-slate">
                    <span className="font-semibold text-zillow-ink">Owner:</span> {issue.owner}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
