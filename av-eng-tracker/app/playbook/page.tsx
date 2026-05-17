import Link from "next/link";
import {
  MATT_REBUTTAL_CARDS,
  MATT_REBUTTAL_GUIDE,
  PLAYBOOK_ANTIPATTERNS,
  PLAYBOOK_MOVES,
  PLAYBOOK_PHASES,
  PLAYBOOK_THESIS,
  type MattCard,
  type PlaybookMove,
} from "@/lib/data";

const AUDIENCE_STYLE: Record<string, string> = {
  Matt: "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200",
  Mark: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  Stacey: "bg-zillow-blue-light text-zillow-blue ring-1 ring-inset ring-blue-200",
  John: "bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-200",
};

const PHASE_STYLE: Record<string, string> = {
  "Week 1": "border-zillow-red",
  "Week 2": "border-zillow-orange",
  "Week 3-4": "border-amber-500",
  "Month 2": "border-emerald-500",
  "Month 3 (FTE ask)": "border-zillow-blue",
};

export default function PlaybookPage() {
  const movesById = new Map(PLAYBOOK_MOVES.map((m) => [m.id, m]));
  const audiences: PlaybookMove["audience"][number][] = ["Matt", "Stacey", "Mark", "John"];

  return (
    <div className="space-y-12">
      <header>
        <p className="z-eyebrow">Playbook</p>
        <h1 className="z-h1 mt-2">
          Friendly-prove-Matt-wrong &amp; earn the FTE conversion
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-zillow-slate">
          Tactical execution plan, not analysis. Every move is tied to a specific Slack quote
          from Matt, Mark, or Stacey so you know exactly which lever it pulls. The play is
          to close one Patrick-broken item per week, credit Matt every single time, and feed
          Stacey&apos;s Friday wins/challenges email until she proposes the FTE conversion
          herself.
        </p>
      </header>

      {/* Thesis */}
      <section className="z-card border-l-4 border-zillow-blue bg-zillow-blue-light">
        <div className="z-eyebrow">The thesis</div>
        <h2 className="z-h3 mt-2">{PLAYBOOK_THESIS.headline}</h2>
        <p className="mt-3 text-sm leading-relaxed text-zillow-ink">{PLAYBOOK_THESIS.text}</p>
        <div className="mt-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-zillow-blue">
            Three rules you never break
          </div>
          <ol className="mt-2 space-y-2 pl-5 text-sm leading-relaxed text-zillow-ink list-decimal">
            {PLAYBOOK_THESIS.threeRules.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ol>
        </div>
      </section>

      {/* Phased plan */}
      <section>
        <h2 className="z-h2 mb-1">Sequenced phases — what to ship, in order</h2>
        <p className="mb-5 max-w-3xl text-sm text-zillow-slate">
          Each phase has one theme and a set of moves. The &ldquo;FTE signal&rdquo; is the
          evidence accumulating in Stacey&apos;s head while you execute.
        </p>
        <div className="space-y-4">
          {PLAYBOOK_PHASES.map((p) => (
            <article
              key={p.phase}
              className={`z-card border-l-4 ${PHASE_STYLE[p.phase] ?? "border-zillow-gray-border"}`}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="z-h3">{p.phase}</h3>
                <span className="text-sm font-semibold text-zillow-ink">{p.theme}</span>
              </div>
              {p.moves.length > 0 && (
                <div className="mt-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-zillow-slate">
                    Moves this phase
                  </div>
                  <ul className="mt-2 space-y-1 pl-4 text-sm leading-relaxed text-zillow-ink">
                    {p.moves.map((id) => {
                      const m = movesById.get(id);
                      if (!m) return null;
                      return (
                        <li key={id} className="list-disc">
                          <a href={`#${id}`} className="z-link font-medium">
                            {m.title}
                          </a>{" "}
                          <span className="text-xs text-zillow-slate">
                            (
                            {m.audience.map((a, i) => (
                              <span key={a}>
                                {i > 0 ? ", " : ""}
                                {a}
                              </span>
                            ))}
                            )
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
              <div className="mt-4 rounded-md bg-zillow-blue-light px-3 py-2 text-xs leading-relaxed text-zillow-ink">
                <span className="font-semibold text-zillow-blue">FTE signal: </span>
                {p.fteSignal}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Moves by audience */}
      <section>
        <h2 className="z-h2 mb-1">Moves by audience</h2>
        <p className="mb-5 max-w-3xl text-sm text-zillow-slate">
          Each move is mapped to who it&apos;s for and grounded in something they actually
          said. Click a phase above to see which moves to run when.
        </p>
        {audiences.map((aud) => {
          const moves = PLAYBOOK_MOVES.filter((m) => m.audience.includes(aud));
          if (moves.length === 0) return null;
          return (
            <div key={aud} className="mb-8">
              <h3 className="z-h3 mb-3">
                <span className={`z-chip mr-2 ${AUDIENCE_STYLE[aud]}`}>{aud}</span>
                <span className="text-zillow-slate text-sm font-normal">
                  {moves.length} {moves.length === 1 ? "move" : "moves"}
                </span>
              </h3>
              <div className="space-y-3">
                {moves.map((m) => (
                  <article id={m.id} key={m.id} className="z-card scroll-mt-24">
                    <div className="flex flex-wrap items-center gap-2">
                      {m.audience.map((a) => (
                        <span key={a} className={`z-chip ${AUDIENCE_STYLE[a]}`}>
                          {a}
                        </span>
                      ))}
                    </div>
                    <h4 className="z-h3 mt-2">{m.title}</h4>
                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                      <div className="rounded-md bg-zillow-gray-light px-3 py-2">
                        <div className="text-xs font-semibold uppercase tracking-wider text-zillow-slate">
                          Why it works
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-zillow-ink">{m.why}</p>
                      </div>
                      <div className="rounded-md bg-white px-3 py-2 ring-1 ring-zillow-gray-border">
                        <div className="text-xs font-semibold uppercase tracking-wider text-zillow-ink">
                          How
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-zillow-ink">{m.how}</p>
                      </div>
                      <div className="rounded-md bg-zillow-blue-light px-3 py-2">
                        <div className="text-xs font-semibold uppercase tracking-wider text-zillow-blue">
                          Proof (how you surface it)
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-zillow-ink">{m.proof}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* MATT REBUTTAL CARDS — quick responses */}
      <section id="matt-rebuttals">
        <h2 className="z-h2 mb-1">Quick responses to Matt — territory-claim WITHOUT torching the relationship</h2>
        <p className="mb-5 max-w-3xl text-sm text-zillow-slate">
          Confident technical fluency + crediting Matt&apos;s craft in the same breath.
          Each card pairs a likely Matt objection with a response that signals capability
          AND keeps the door open. The goal is &ldquo;thank god Cortney is on this&rdquo; in
          his next 1:1 with Stacey — not &ldquo;Cortney&apos;s hard to work with.&rdquo;
        </p>

        {/* Golden rules */}
        <article className="z-card mb-5 border-l-4 border-zillow-blue bg-zillow-blue-light">
          <div className="z-eyebrow">Golden rules — how to deliver these</div>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-zillow-ink">
            {MATT_REBUTTAL_GUIDE.goldenRules.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ol>
        </article>

        {/* Red flags */}
        <article className="z-card mb-5 border-l-4 border-zillow-red bg-red-50">
          <div className="z-eyebrow">Red flags — you&apos;re becoming Patrick</div>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-zillow-ink">
            {MATT_REBUTTAL_GUIDE.redFlags.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </article>

        {/* Cards grouped by topic */}
        {(() => {
          const topics = Array.from(new Set(MATT_REBUTTAL_CARDS.map((c) => c.topic))) as MattCard["topic"][];
          return topics.map((topic) => {
            const cards = MATT_REBUTTAL_CARDS.filter((c) => c.topic === topic);
            return (
              <div key={topic} className="mb-8">
                <h3 className="z-h3 mb-3">{topic}</h3>
                <div className="space-y-3">
                  {cards.map((c, idx) => (
                    <article key={idx} className="z-card">
                      <div className="rounded-md bg-red-50 px-4 py-3">
                        <div className="text-xs font-semibold uppercase tracking-wider text-zillow-red">
                          Matt
                        </div>
                        <p className="mt-1 text-sm italic leading-relaxed text-zillow-ink">
                          &ldquo;{c.objection}&rdquo;
                        </p>
                      </div>
                      <div className="mt-3 rounded-md bg-zillow-blue-light px-4 py-3">
                        <div className="text-xs font-semibold uppercase tracking-wider text-zillow-blue">
                          You
                        </div>
                        <p className="mt-1 text-sm leading-relaxed text-zillow-ink">
                          &ldquo;{c.response}&rdquo;
                        </p>
                      </div>
                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        {c.fluencyTerms.length > 0 && (
                          <div className="rounded-md bg-zillow-gray-light px-3 py-2">
                            <div className="text-xs font-semibold uppercase tracking-wider text-zillow-slate">
                              Fluency terms used
                            </div>
                            <div className="mt-1.5 flex flex-wrap gap-1.5">
                              {c.fluencyTerms.map((t) => (
                                <span
                                  key={t}
                                  className="rounded bg-white px-2 py-0.5 font-mono text-[11px] text-zillow-ink ring-1 ring-zillow-gray-border"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="rounded-md bg-emerald-50 px-3 py-2">
                          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                            Credit-Matt line (close with this)
                          </div>
                          <p className="mt-1.5 text-xs leading-relaxed text-zillow-ink">
                            {c.creditMatt}
                          </p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            );
          });
        })()}

        {/* Fluency vocab cheat sheet */}
        <article className="z-card bg-zillow-gray-light">
          <h3 className="z-h3">Standing fluency vocab — confident, never gibberish</h3>
          <p className="mt-2 text-sm leading-relaxed text-zillow-slate">
            Terms you can drop in conversation that demonstrate capability without making
            anyone feel small. Every term here is real and useful — none of it is jargon
            for the sake of jargon.
          </p>
          <div className="mt-4 grid gap-2 md:grid-cols-2">
            {MATT_REBUTTAL_GUIDE.fluencyVocab.map((v) => (
              <div key={v.term} className="rounded-md bg-white p-3 ring-1 ring-zillow-gray-border">
                <div className="font-mono text-xs font-semibold text-zillow-blue">{v.term}</div>
                <div className="mt-1 text-xs leading-relaxed text-zillow-slate">{v.definition}</div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-zillow-slate">
            More definitions on{" "}
            <Link href="/glossary" className="z-link">
              /glossary
            </Link>
            .
          </p>
        </article>
      </section>

      {/* Anti-patterns */}
      <section>
        <h2 className="z-h2 mb-1">Anti-patterns — Patrick&apos;s traps to avoid</h2>
        <p className="mb-5 max-w-3xl text-sm text-zillow-slate">
          Every contractor-to-FTE conversion dies in roughly the same four ways. Patrick
          modeled each one publicly. Don&apos;t repeat them.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {PLAYBOOK_ANTIPATTERNS.map((a) => (
            <article key={a.trap} className="z-card border-l-4 border-zillow-red">
              <h3 className="z-h3 text-zillow-red">{a.trap}</h3>
              <blockquote className="mt-3 border-l-2 border-zillow-gray-border pl-3 text-xs italic leading-relaxed text-zillow-slate">
                &ldquo;{a.patrickEvidence}&rdquo;
              </blockquote>
              <div className="mt-3 rounded-md bg-emerald-50 px-3 py-2 text-sm leading-relaxed text-zillow-ink">
                <span className="font-semibold text-emerald-700">Avoid by: </span>
                {a.avoid}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* The FTE conversion ask itself */}
      <section className="z-card border-l-4 border-zillow-blue bg-zillow-blue-light">
        <div className="z-eyebrow">The FTE ask, when you make it</div>
        <h2 className="z-h3 mt-2">Don&apos;t ask. Make Stacey propose it.</h2>
        <p className="mt-3 text-sm leading-relaxed text-zillow-ink">
          Contractors who ask for FTE conversion get a budget cycle answer. Contractors who
          accumulate undeniable receipts get pulled forward. The receipts:
        </p>
        <ul className="mt-4 space-y-2 pl-5 text-sm leading-relaxed text-zillow-ink list-disc">
          <li>
            <strong>The monitoring runbook</strong> Patrick promised and never shipped — yours
            by day 30.
          </li>
          <li>
            <strong>Re-keyed Lambdas + audited notification routing</strong> closing Matt&apos;s
            day-1 pain.
          </li>
          <li>
            <strong>IRV-802</strong> hidden controls fixed — Matt and Mark&apos;s open frustration
            closed.
          </li>
          <li>
            <strong>The Mac-vs-Windows memo</strong> Patrick punted on for 4 years — forced to a
            decision.
          </li>
          <li>
            <strong>NYC-1250 memory leak</strong> — Patrick&apos;s open dragon — solved.
            <span className="text-zillow-slate"> See <Link href="/splunk#memory-leak" className="z-link">/splunk</Link>.</span>
          </li>
          <li>
            <strong>India buildout spec contribution</strong> — proves you&apos;re a buildout
            engineer, not just a maintenance contractor.
          </li>
          <li>
            <strong>10+ Friday wins emails</strong> Stacey has forwarded up the chain.
          </li>
        </ul>
        <p className="mt-4 text-sm leading-relaxed text-zillow-ink">
          At day 60, share the private impact log with Stacey:{" "}
          <em>
            &ldquo;Wanted you to have the receipts when we have the conversion
            conversation.&rdquo;
          </em>{" "}
          That&apos;s the only ask you ever make. Then keep shipping. By day 90 the budget
          conversation is already underway because <em>she</em> started it.
        </p>
      </section>

      <section className="text-sm text-zillow-slate">
        Related:{" "}
        <Link href="/patrick-audit" className="z-link">
          Patrick audit (incl. Mar 13 thread)
        </Link>{" "}
        ·{" "}
        <Link href="/splunk" className="z-link">
          Splunk runbook + memory-leak deep dive
        </Link>{" "}
        ·{" "}
        <Link href="/uci" className="z-link">
          UCI half-standards
        </Link>{" "}
        ·{" "}
        <Link href="/quick-wins" className="z-link">
          Quick wins backlog
        </Link>
      </section>
    </div>
  );
}
