"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ACTIVE_HANDOFFS,
  PATRICK_PATTERNS,
  PATRICK_PORTFOLIO,
  PATRICK_SUMMARY,
  type PatrickCategory,
  type PatrickContribution,
} from "@/lib/data";

const CATEGORIES: PatrickCategory[] = ["Analytics", "Support", "Direction", "Fluff"];

const CAT_STYLE: Record<PatrickCategory, { chip: string; bar: string; label: string }> = {
  Analytics: {
    chip: "bg-blue-50 text-zillow-blue ring-1 ring-inset ring-blue-200",
    bar: "bg-zillow-blue",
    label: "Real infra — monitoring, dashboards, alerts.",
  },
  Support: {
    chip: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
    bar: "bg-emerald-500",
    label: "Tickets fixed, rooms unstuck, hands-on engineering.",
  },
  Direction: {
    chip: "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200",
    bar: "bg-amber-500",
    label: "Architectural calls he made — keep, debate, or reverse.",
  },
  Fluff: {
    chip: "bg-red-50 text-zillow-red ring-1 ring-inset ring-red-200",
    bar: "bg-zillow-red",
    label: "Open, unanswered, abandoned, or broke when he was offboarded.",
  },
};

const STATUS_STYLE: Record<PatrickContribution["status"], string> = {
  Delivered: "bg-emerald-50 text-emerald-700",
  Partial: "bg-amber-50 text-amber-800",
  Open: "bg-red-50 text-zillow-red",
  "Broken since departure": "bg-red-100 text-zillow-red font-semibold",
};

export default function PatrickAuditPage() {
  const [cats, setCats] = useState<Set<PatrickCategory>>(new Set(CATEGORIES));
  const [owner, setOwner] = useState<"All" | "Matt" | "Mark" | "Stacey" | "Cortney">("All");
  const [search, setSearch] = useState("");

  const total = PATRICK_SUMMARY.total;
  const pct = (n: number) => Math.round((n / total) * 100);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return PATRICK_PORTFOLIO.filter((c) => {
      if (!cats.has(c.category)) return false;
      if (owner !== "All" && !(c.pickedUpBy ?? []).includes(owner)) return false;
      if (q) {
        const blob = `${c.title} ${c.description} ${c.quote ?? ""}`.toLowerCase();
        if (!blob.includes(q)) return false;
      }
      return true;
    });
  }, [cats, owner, search]);

  const toggleCat = (c: PatrickCategory) => {
    const next = new Set(cats);
    if (next.has(c)) next.delete(c);
    else next.add(c);
    setCats(next);
  };

  return (
    <div className="space-y-12">
      <header>
        <p className="z-eyebrow">Patrick audit</p>
        <h1 className="z-h1 mt-2">Patrick&apos;s portfolio — analytics, support, direction, or fluff?</h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-zillow-slate">
          Every Patrick contribution categorized so we can quantify what was real vs. what
          was unanswered. Patrick is{" "}
          <strong className="text-zillow-ink">officially gone</strong> — Matt confirmed AV
          alerts failed the morning he was deactivated. So the question{" "}
          <em>&ldquo;what is he working on with Matt / Mark / Stacey?&rdquo;</em> is reframed:{" "}
          <strong className="text-zillow-ink">
            what items are Matt, Mark, Stacey, and Cortney inheriting from him?
          </strong>
        </p>
      </header>

      {/* Headline reality check */}
      <section className="z-card border-l-4 border-zillow-red bg-red-50">
        <div className="z-eyebrow">Reality check</div>
        <p className="mt-2 text-sm leading-relaxed text-zillow-ink">
          Patrick was a strong programmer, not an AV engineer. He produced genuinely useful
          analytics + tooling — but he was the only one who could read it, and several
          architectural calls were &ldquo;half standards.&rdquo; The morning he was deactivated,
          the alerting Lambdas stopped running. That&apos;s the single best summary of his
          legacy: when the human left, the system left with him.
        </p>
        <blockquote className="mt-3 border-l-4 border-zillow-red pl-4 text-sm italic leading-relaxed text-zillow-ink">
          &ldquo;AV Alerts: I just noticed that it looks like the alerts failed to run this
          morning. I&apos;m guessing this has to do with Patrick officially being gone. Probably
          something he overlooked that would fail once he was de-activated. I&apos;m poking around
          now to see what, if anything, I can do.&rdquo;
        </blockquote>
        <div className="mt-2 text-xs text-zillow-slate">— Matt Cornick, day 1 post-departure</div>
      </section>

      {/* Percentages */}
      <section>
        <h2 className="z-h2 mb-4">Category breakdown — {total} contributions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((c) => {
            const n = PATRICK_SUMMARY.byCat[c];
            return (
              <div key={c} className="z-card">
                <div className="flex items-baseline justify-between">
                  <span className={`z-chip ${CAT_STYLE[c].chip}`}>{c}</span>
                  <span className="text-2xl font-bold text-zillow-ink">{pct(n)}%</span>
                </div>
                <div className="mt-2 text-xs text-zillow-slate">
                  {n} of {total} contributions
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-zillow-gray-light">
                  <div
                    className={`h-full ${CAT_STYLE[c].bar}`}
                    style={{ width: `${pct(n)}%` }}
                  />
                </div>
                <p className="mt-3 text-xs leading-relaxed text-zillow-slate">
                  {CAT_STYLE[c].label}
                </p>
              </div>
            );
          })}
        </div>

        {/* Status breakdown */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(["Delivered", "Partial", "Open", "Broken since departure"] as PatrickContribution["status"][]).map(
            (s) => {
              const n = PATRICK_SUMMARY.byStatus[s];
              return (
                <div key={s} className="rounded-xl border border-zillow-gray-border bg-white p-4">
                  <div className="text-xs uppercase tracking-wider text-zillow-slate">{s}</div>
                  <div className="mt-1 text-xl font-bold text-zillow-ink">
                    {n} <span className="text-sm font-normal text-zillow-slate">({pct(n)}%)</span>
                  </div>
                </div>
              );
            },
          )}
        </div>

        {/* One-line summary verdict */}
        <div className="z-card mt-6 bg-zillow-gray-light">
          <p className="text-sm leading-relaxed text-zillow-ink">
            <strong>The summary verdict:</strong>{" "}
            <span className="text-zillow-blue font-semibold">
              {pct(PATRICK_SUMMARY.byCat.Analytics + PATRICK_SUMMARY.byCat.Support)}%
            </span>{" "}
            of Patrick&apos;s portfolio is genuinely useful infra and hands-on engineering
            worth inheriting wholesale.{" "}
            <span className="text-amber-700 font-semibold">
              {pct(PATRICK_SUMMARY.byCat.Direction)}%
            </span>{" "}
            is architectural direction worth keeping, debating, or reversing on a case-by-case
            basis.{" "}
            <span className="text-zillow-red font-semibold">
              {pct(PATRICK_SUMMARY.byCat.Fluff)}%
            </span>{" "}
            is fluff — open questions, abandoned scripts, or things that broke when he was
            offboarded. That&apos;s the cleanup queue for Cortney&apos;s first 90 days.
          </p>
        </div>
      </section>

      {/* Patrick's patterns — strengths & weaknesses */}
      <section>
        <h2 className="z-h2 mb-1">Patrick&apos;s patterns — what to inherit, where to fill in</h2>
        <p className="mb-5 max-w-3xl text-sm text-zillow-slate">
          Behavioral patterns observed across 4+ years of #av-team Slack. Each one is backed by
          a direct quote. The strengths are the operating habits Cortney should adopt wholesale;
          the weaknesses are the foundation gaps that need to be filled to lift the team back up.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {/* Strengths */}
          <div>
            <h3 className="z-h3 mb-3 text-emerald-700">Strengths — inherit &amp; amplify</h3>
            <div className="space-y-3">
              {PATRICK_PATTERNS.filter((p) => p.kind === "Strength").map((p) => (
                <article key={p.id} className="z-card border-l-4 border-emerald-500">
                  <h4 className="text-sm font-bold text-zillow-ink">{p.pattern}</h4>
                  <blockquote className="mt-2 border-l-2 border-zillow-gray-border pl-3 text-xs italic leading-relaxed text-zillow-slate">
                    &ldquo;{p.evidence}&rdquo;
                    {p.who && (
                      <div className="not-italic mt-1 text-[10px] text-zillow-slate">
                        — {p.who}
                        {p.when ? `, ${p.when}` : ""}
                      </div>
                    )}
                  </blockquote>
                  <div className="mt-3 rounded-md bg-emerald-50 px-3 py-2 text-xs leading-relaxed text-zillow-ink">
                    <span className="font-semibold text-emerald-700">Cortney&apos;s move: </span>
                    {p.cortneyMove}
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Weaknesses */}
          <div>
            <h3 className="z-h3 mb-3 text-zillow-red">
              Weaknesses — foundation gaps to fill
            </h3>
            <div className="space-y-3">
              {PATRICK_PATTERNS.filter((p) => p.kind === "Weakness").map((p) => (
                <article key={p.id} className="z-card border-l-4 border-zillow-red">
                  <h4 className="text-sm font-bold text-zillow-ink">{p.pattern}</h4>
                  <blockquote className="mt-2 border-l-2 border-zillow-gray-border pl-3 text-xs italic leading-relaxed text-zillow-slate">
                    &ldquo;{p.evidence}&rdquo;
                    {p.who && (
                      <div className="not-italic mt-1 text-[10px] text-zillow-slate">
                        — {p.who}
                        {p.when ? `, ${p.when}` : ""}
                      </div>
                    )}
                  </blockquote>
                  <div className="mt-3 rounded-md bg-red-50 px-3 py-2 text-xs leading-relaxed text-zillow-ink">
                    <span className="font-semibold text-zillow-red">Cortney&apos;s move: </span>
                    {p.cortneyMove}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Foundation lift — explicit gaps */}
      <section className="z-card bg-zillow-gray-light">
        <div className="z-eyebrow">Foundation lift — your first-90-days mandate</div>
        <h2 className="z-h3 mt-2">Where Patrick was weak supporting the team</h2>
        <p className="mt-2 text-sm leading-relaxed text-zillow-ink">
          Four gaps come up over and over in the Slack record — and they&apos;re the same four
          gaps every &ldquo;solo programmer&rdquo; predecessor leaves behind. Fill these and the
          team foundation lifts immediately:
        </p>
        <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-zillow-ink">
          <li>
            <strong>Documentation gap.</strong> Patrick&apos;s own words:{" "}
            <em>&ldquo;I am not sure how to document how to troubleshoot it.&rdquo;</em> Fix:
            one-page README per Lambda / dashboard / GitLab repo. What it does, where it runs,
            how to silence, how to debug, owner. Stop calling code &ldquo;self-documenting.&rdquo;
          </li>
          <li>
            <strong>Authentication / blast-radius gap.</strong> Every Patrick Lambda + cron ran
            under his identity. Day 1 alerts failed. Fix: service accounts / team IAM roles for
            every scheduled job. Inventory before you touch anything.
          </li>
          <li>
            <strong>Code legibility gap.</strong> Mark and Matt can&apos;t read the custom
            plugins. Fix: code reviews on every Q-Sys MR. Use Cursor to add comments + diagrams
            to existing Lua. Every plugin gets a license + source + support contact line.
          </li>
          <li>
            <strong>Escalation gap.</strong> Patrick avoided IT politics (Mac vs Windows, swim
            lanes when uncomfortable). Fix: bring open architectural decisions to Matt + Mark
            + Stacey on a cadence. Patrick&apos;s biggest disservice was not forcing the
            Mac-Mini-vs-Windows-Q-Sys-Connect decision — you can.
          </li>
        </ol>
        <div className="mt-5 rounded-md border-l-4 border-zillow-blue bg-zillow-blue-light px-4 py-3 text-sm leading-relaxed text-zillow-ink">
          The Splunk pipeline is the single highest-leverage thing to fix first — it&apos;s the
          team&apos;s eyes. See{" "}
          <Link href="/splunk" className="z-link font-semibold">
            /splunk
          </Link>{" "}
          for the full pipeline, dashboards, access, and inherited work.
        </div>
      </section>

      {/* Active handoff matrix */}
      <section>
        <h2 className="z-h2 mb-1">Active handoff — who is picking up what</h2>
        <p className="mb-5 max-w-3xl text-sm text-zillow-slate">
          Patrick isn&apos;t working on anything with anyone anymore. These are the items each
          teammate is currently carrying or owns going forward.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {ACTIVE_HANDOFFS.map((h) => {
            const items = h.contributionIds
              .map((id) => PATRICK_PORTFOLIO.find((p) => p.id === id))
              .filter((x): x is PatrickContribution => !!x);
            return (
              <article key={h.owner} className="z-card">
                <div className="flex items-baseline justify-between">
                  <h3 className="z-h3">{h.owner}</h3>
                  <span className="text-xs font-mono text-zillow-slate">
                    {items.length} items
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-zillow-slate">{h.note}</p>
                <ul className="mt-4 space-y-2 text-sm">
                  {items.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-start gap-2 rounded-md border border-zillow-gray-border px-3 py-2"
                    >
                      <span className={`z-chip flex-shrink-0 ${CAT_STYLE[item.category].chip}`}>
                        {item.category[0]}
                      </span>
                      <div className="min-w-0 flex-1">
                        <a
                          href={`#${item.id}`}
                          className="text-sm font-medium text-zillow-ink hover:text-zillow-blue"
                        >
                          {item.title}
                        </a>
                        <div className="mt-0.5 text-xs">
                          <span className={`rounded px-1.5 py-0.5 ${STATUS_STYLE[item.status]}`}>
                            {item.status}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </section>

      {/* Filter controls */}
      <section>
        <h2 className="z-h2 mb-4">Full inventory</h2>
        <div className="z-card mb-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-zillow-slate">
              Category
            </div>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => toggleCat(c)}
                className={`z-chip ${
                  cats.has(c) ? CAT_STYLE[c].chip : "bg-white text-zillow-slate ring-1 ring-zillow-gray-border"
                } cursor-pointer transition-opacity`}
              >
                {c} ({PATRICK_SUMMARY.byCat[c]})
              </button>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-zillow-slate">
              Picked up by
            </div>
            {(["All", "Matt", "Mark", "Stacey", "Cortney"] as const).map((o) => (
              <button
                key={o}
                onClick={() => setOwner(o)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  owner === o
                    ? "bg-zillow-blue text-white"
                    : "bg-white text-zillow-slate ring-1 ring-zillow-gray-border hover:bg-zillow-gray-light"
                }`}
              >
                {o}
              </button>
            ))}
            <input
              type="text"
              placeholder="Search title / description / quote…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ml-auto w-full max-w-xs rounded-md border border-zillow-gray-border px-3 py-1.5 text-sm focus:border-zillow-blue focus:outline-none"
            />
          </div>
          <div className="mt-3 text-xs text-zillow-slate">
            Showing <strong className="text-zillow-ink">{filtered.length}</strong> of {total}{" "}
            contributions.
          </div>
        </div>

        <div className="space-y-3">
          {filtered.map((c) => (
            <article id={c.id} key={c.id} className="z-card scroll-mt-24">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`z-chip ${CAT_STYLE[c.category].chip}`}>{c.category}</span>
                <span className={`rounded px-2 py-0.5 text-xs ${STATUS_STYLE[c.status]}`}>
                  {c.status}
                </span>
                {(c.pickedUpBy ?? []).map((p) => (
                  <span
                    key={p}
                    className="rounded-md bg-zillow-gray-light px-2 py-0.5 text-xs font-medium text-zillow-slate"
                  >
                    → {p}
                  </span>
                ))}
              </div>
              <h3 className="z-h3 mt-2">{c.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zillow-ink">{c.description}</p>

              {c.quote && (
                <div className="mt-3 rounded-md border-l-4 border-zillow-gray-border bg-zillow-gray-light px-3 py-2">
                  <div className="flex items-baseline justify-between text-xs text-zillow-slate">
                    <span className="font-semibold text-zillow-ink">
                      {c.who}
                      {c.when ? ` — ${c.when}` : ""}
                    </span>
                    {c.permalink && (
                      <a
                        href={c.permalink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="z-link"
                      >
                        View in Slack ↗
                      </a>
                    )}
                  </div>
                  <p className="mt-1 text-xs italic leading-relaxed text-zillow-ink">
                    &ldquo;{c.quote}&rdquo;
                  </p>
                </div>
              )}
            </article>
          ))}
          {filtered.length === 0 && (
            <div className="z-card text-center text-sm text-zillow-slate">
              No contributions match this filter.
            </div>
          )}
        </div>
      </section>

      <section className="text-sm text-zillow-slate">
        Related:{" "}
        <Link href="/uci" className="z-link">
          UCI — Cortney&apos;s counter-thesis &amp; Patrick&apos;s half-standards
        </Link>{" "}
        ·{" "}
        <Link href="/handoff" className="z-link">
          Patrick handoff inventory
        </Link>{" "}
        ·{" "}
        <Link href="/tracker" className="z-link">
          Issue tracker
        </Link>
      </section>
    </div>
  );
}
