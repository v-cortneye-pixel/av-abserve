import Link from "next/link";
import { notFound } from "next/navigation";
import { ISSUES, ISSUE_TEAM_SCRIPTS } from "@/lib/data";
import SeverityBadge from "@/components/SeverityBadge";
import StatusPill from "@/components/StatusPill";
import QuoteCard from "@/components/QuoteCard";

const BRANCH_AUDIENCE_STYLE: Record<string, string> = {
  Matt: "bg-amber-50 text-amber-800 ring-amber-200",
  Mark: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Stacey: "bg-zillow-blue-light text-zillow-blue ring-blue-200",
  Anyone: "bg-zillow-gray-light text-zillow-slate ring-zillow-gray-border",
};

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
  const script = ISSUE_TEAM_SCRIPTS[id];

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

      {script && (
        <section className="space-y-5">
          <header>
            <h2 className="z-h2">🗣️ What to say to the team about this</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zillow-slate">
              Verbatim language for raising this in a team meeting (Mark + Matt + Stacey).
              Read top-to-bottom like a recipe. Different from <Link href="/one-on-one" className="z-link">/one-on-one</Link>{" "}
              which is Stacey-solo, and different from <Link href="/playbook" className="z-link">/playbook</Link>{" "}
              which is the FTE strategy.
            </p>
          </header>

          {/* Context — when + who */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="z-card border-l-4 border-zillow-blue">
              <div className="z-eyebrow text-zillow-blue">When to raise</div>
              <p className="mt-2 text-sm leading-relaxed text-zillow-ink">{script.whenToRaise}</p>
            </div>
            <div className="z-card border-l-4 border-purple-500">
              <div className="z-eyebrow text-purple-700">Audience focus</div>
              <p className="mt-2 text-sm leading-relaxed text-zillow-ink">{script.audienceFocus}</p>
            </div>
          </div>

          {/* Step 1 — Open */}
          <div className="rounded-lg border-2 border-zillow-blue bg-zillow-blue-light p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-zillow-blue">
              🎬 Step 1 — Open the conversation
            </div>
            <p className="mt-3 text-base font-medium leading-relaxed text-zillow-ink">
              <span className="text-xs font-semibold uppercase tracking-wider text-zillow-blue">
                Say verbatim:
              </span>
              <br />
              {script.opening.verbatim}
            </p>
            <div className="mt-3 rounded-md bg-white px-3 py-2 text-xs leading-relaxed text-zillow-slate">
              <span className="font-semibold text-zillow-ink">Why this works: </span>
              {script.opening.rationale}
            </div>
          </div>

          {/* Step 2 — Key points */}
          {script.keyPoints.length > 0 && (
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-zillow-ink mb-3">
                🗣️ Step 2 — Key points (in order)
              </div>
              <div className="space-y-3">
                {script.keyPoints.map((kp, i) => (
                  <div key={i} className="z-card">
                    <div className="text-sm font-bold text-zillow-ink">{kp.title}</div>
                    <p className="mt-2 text-sm leading-relaxed text-zillow-ink">
                      <span className="text-xs font-semibold uppercase tracking-wider text-zillow-blue">
                        Say:
                      </span>
                      <br />
                      {kp.verbatim}
                    </p>
                    <div className="mt-2 rounded-md bg-zillow-gray-light px-3 py-2 text-xs leading-relaxed text-zillow-slate">
                      <span className="font-semibold text-zillow-ink">Why this works: </span>
                      {kp.rationale}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3 — Questions to ask */}
          {script.questionsToTeam && script.questionsToTeam.length > 0 && (
            <div className="rounded-lg border-2 border-purple-300 bg-purple-50 p-4">
              <div className="text-xs font-bold uppercase tracking-wider text-purple-700">
                ❓ Step 3 — Questions to ask the team
              </div>
              <div className="mt-3 space-y-3">
                {script.questionsToTeam.map((q, i) => (
                  <div key={i} className="rounded-md bg-white p-3 ring-1 ring-purple-200">
                    <div className="text-sm font-bold text-zillow-ink">Q{i + 1}: {q.question}</div>
                    <div className="mt-2 text-xs italic text-zillow-slate">
                      <span className="font-semibold not-italic text-zillow-ink">Why ask: </span>
                      {q.whyAsk}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4 — Branches */}
          {script.branches.length > 0 && (
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-zillow-ink mb-3">
                🔀 Step 4 — If they push back (response branches)
              </div>
              <div className="space-y-2">
                {script.branches.map((b, i) => (
                  <div key={i} className="rounded-md border border-amber-200 bg-amber-50 px-3 py-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${BRANCH_AUDIENCE_STYLE[b.audience]}`}>
                        {b.audience}
                      </span>
                      <span className="text-xs font-semibold text-zillow-red">says:</span>
                    </div>
                    <p className="text-sm italic leading-relaxed text-zillow-ink">&ldquo;{b.theySay}&rdquo;</p>
                    <div className="mt-2 rounded-md bg-zillow-blue-light px-3 py-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-zillow-blue">
                        You say:
                      </span>
                      <p className="mt-1 text-sm leading-relaxed text-zillow-ink">{b.youSay}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 5 — Close */}
          <div className="rounded-lg border-2 border-emerald-300 bg-emerald-50 p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              🎬 Step 5 — Close with a commitment
            </div>
            <p className="mt-3 text-base font-medium leading-relaxed text-zillow-ink">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                Say verbatim:
              </span>
              <br />
              {script.closing.verbatim}
            </p>
            <div className="mt-3 rounded-md bg-white px-3 py-2 text-xs leading-relaxed text-zillow-slate">
              <span className="font-semibold text-zillow-ink">Why this works: </span>
              {script.closing.rationale}
            </div>
          </div>

          {/* Don't say */}
          {script.dontSay.length > 0 && (
            <div className="z-card border-l-4 border-zillow-red bg-red-50">
              <div className="z-eyebrow text-zillow-red">🚫 Things to NEVER say about this issue</div>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-relaxed text-zillow-ink">
                {script.dontSay.map((s, i) => (
                  <li key={i} className="font-medium">{s}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

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
