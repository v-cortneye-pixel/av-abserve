import Link from "next/link";
import { notFound } from "next/navigation";
import { ISSUES } from "@/lib/data";
import SeverityBadge from "@/components/SeverityBadge";
import StatusPill from "@/components/StatusPill";
import QuoteCard from "@/components/QuoteCard";

export function generateStaticParams() {
  return ISSUES.map((i) => ({ id: i.id }));
}

export default async function IssueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const issue = ISSUES.find((i) => i.id === id);
  if (!issue) notFound();

  return (
    <div className="space-y-10">
      <Link href="/issues" className="z-link text-sm">
        ← All issues
      </Link>

      <header>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <SeverityBadge severity={issue.severity} />
          <StatusPill status={issue.status} />
          <span className="z-chip bg-zillow-blue-light text-zillow-blue">{issue.category}</span>
        </div>
        <h1 className="z-h1">{issue.title}</h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-zillow-slate">{issue.summary}</p>
      </header>

      <section className="grid gap-6 md:grid-cols-3">
        <div className="z-card">
          <div className="z-eyebrow">Owner</div>
          <div className="mt-2 text-sm font-semibold text-zillow-ink">{issue.owner}</div>
        </div>
        <div className="z-card">
          <div className="z-eyebrow">Rooms affected</div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {issue.rooms.map((r) => (
              <span
                key={r}
                className="rounded-md bg-zillow-gray-light px-2 py-1 text-xs font-medium text-zillow-slate"
              >
                {r}
              </span>
            ))}
          </div>
        </div>
        <div className="z-card">
          <div className="z-eyebrow">Quotes captured</div>
          <div className="mt-2 text-2xl font-bold text-zillow-ink">{issue.quotes.length}</div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="z-card">
          <h2 className="z-h3">Root cause</h2>
          <p className="mt-3 text-sm leading-relaxed text-zillow-slate">{issue.rootCause}</p>
        </div>
        {issue.workaround && (
          <div className="z-card">
            <h2 className="z-h3">Workaround</h2>
            <p className="mt-3 text-sm leading-relaxed text-zillow-slate">{issue.workaround}</p>
          </div>
        )}
      </section>

      <section className="z-card">
        <h2 className="z-h3">Current state</h2>
        <p className="mt-3 text-sm leading-relaxed text-zillow-slate">{issue.currentState}</p>
      </section>

      <section className="z-card border-l-4 border-zillow-blue bg-zillow-blue-light">
        <div className="z-eyebrow">Cortney&apos;s next action</div>
        <p className="mt-2 text-sm font-medium leading-relaxed text-zillow-ink">{issue.cortneyAction}</p>
      </section>

      <section>
        <h2 className="z-h2 mb-4">Evidence from Slack</h2>
        <div className="space-y-3">
          {issue.quotes.map((q, idx) => (
            <QuoteCard key={idx} quote={q} />
          ))}
        </div>
      </section>
    </div>
  );
}
