"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  DRIP_PRINCIPLES,
  FRIDAY_EMAIL_TEMPLATE,
  NEVER_SAY_TO_STACEY,
  ONE_ON_ONE_PLAN,
  STACEY_CARDS,
  type CardCategory,
  type StaceyCard,
} from "@/lib/data";

const STORAGE_KEY = "av-stacey-cards-v1";

type CardState = "held" | "played" | "archived";

const CATEGORY_STYLE: Record<CardCategory, string> = {
  "Closed win": "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  "Issue found": "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200",
  "Action taken": "bg-blue-50 text-zillow-blue ring-1 ring-inset ring-blue-200",
  "Question to ask": "bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-200",
  "Operational excellence": "bg-zillow-blue-light text-zillow-blue ring-1 ring-inset ring-blue-200",
  Architectural: "bg-orange-50 text-zillow-orange ring-1 ring-inset ring-orange-200",
  Relationship: "bg-pink-50 text-pink-700 ring-1 ring-inset ring-pink-200",
  "Bangalore / India": "bg-cyan-50 text-cyan-700 ring-1 ring-inset ring-cyan-200",
  "FTE setup": "bg-red-50 text-zillow-red ring-1 ring-inset ring-red-200",
};

const PLAYABILITY_STYLE: Record<StaceyCard["playability"], string> = {
  "1:1 only": "bg-red-50 text-zillow-red ring-red-200",
  "Team meeting safe": "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Either: "bg-zillow-gray-light text-zillow-slate ring-zillow-gray-border",
  "Never publicly": "bg-zillow-ink text-white ring-zillow-ink",
};

interface UserState {
  startDate?: string; // ISO date when role started
  cardStates: Record<string, { state: CardState; playedOn?: string }>;
  notes: Record<string, string>; // per-card private notes
}

function loadState(): UserState {
  if (typeof window === "undefined") return { cardStates: {}, notes: {} };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as UserState) : { cardStates: {}, notes: {} };
  } catch {
    return { cardStates: {}, notes: {} };
  }
}

function saveState(state: UserState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

function getWeekFromStart(startDate: string | undefined): number {
  if (!startDate) return 1;
  const start = new Date(startDate);
  const now = new Date();
  const diff = now.getTime() - start.getTime();
  return Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24 * 7)) + 1);
}

export default function OneOnOnePage() {
  const [state, setState] = useState<UserState>({ cardStates: {}, notes: {} });
  const [hydrated, setHydrated] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [filter, setFilter] = useState<CardState | "all">("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const s = loadState();
    setState(s);
    setSelectedWeek(getWeekFromStart(s.startDate));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveState(state);
  }, [state, hydrated]);

  const cardState = (id: string): CardState =>
    state.cardStates[id]?.state ?? "held";

  const setCardState = (id: string, st: CardState) => {
    setState((s) => ({
      ...s,
      cardStates: {
        ...s.cardStates,
        [id]: {
          state: st,
          playedOn: st === "played" ? new Date().toISOString().slice(0, 10) : undefined,
        },
      },
    }));
  };

  const setNote = (id: string, note: string) => {
    setState((s) => ({ ...s, notes: { ...s.notes, [id]: note } }));
  };

  const setStartDate = (d: string) => {
    setState((s) => ({ ...s, startDate: d }));
    setSelectedWeek(getWeekFromStart(d));
  };

  const meetingsForWeek = ONE_ON_ONE_PLAN.filter((m) => m.weekNumber === selectedWeek);
  const cardsById = new Map(STACEY_CARDS.map((c) => [c.id, c]));

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return STACEY_CARDS.filter((c) => {
      const st = cardState(c.id);
      if (filter !== "all" && st !== filter) return false;
      if (q) {
        const blob = `${c.headline} ${c.framing} ${c.staceyAngle} ${c.category}`.toLowerCase();
        if (!blob.includes(q)) return false;
      }
      return true;
    });
  }, [filter, search, state]);

  const stats = useMemo(() => {
    let held = 0;
    let played = 0;
    let archived = 0;
    for (const c of STACEY_CARDS) {
      const st = cardState(c.id);
      if (st === "played") played++;
      else if (st === "archived") archived++;
      else held++;
    }
    return { held, played, archived, total: STACEY_CARDS.length };
  }, [state]);

  return (
    <div className="space-y-12">
      <header>
        <p className="z-eyebrow">Private — Cortney's notebook</p>
        <h1 className="z-h1 mt-2">Stacey 1:1 strategy &amp; card deck</h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-zillow-slate">
          Drip-fed deck of findings, wins, and asks for your twice-weekly Stacey meetings.
          Each card maps to a specific meeting; each meeting has its own agenda script.
          Never lead with your strongest card. Pre-brief 1:1 before anything surfaces in
          team meeting. State (held / played / archived) saves to this browser only — never
          syncs to Slack or anywhere visible.
        </p>
      </header>

      {/* Start-date setup + week tracker */}
      <section className="z-card">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="z-eyebrow">Role start date</label>
            <input
              type="date"
              value={state.startDate ?? ""}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-2 rounded-lg border border-zillow-gray-border px-3 py-2 text-sm focus:border-zillow-blue focus:outline-none"
            />
            <p className="mt-1 text-xs text-zillow-slate">
              Used to compute current week. Saved to your browser.
            </p>
          </div>
          <div>
            <label className="z-eyebrow">Meeting week</label>
            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={() => setSelectedWeek(Math.max(1, selectedWeek - 1))}
                className="z-btn-secondary"
              >
                ←
              </button>
              <div className="rounded-lg border border-zillow-gray-border bg-white px-4 py-2 text-sm font-semibold text-zillow-ink">
                Week {selectedWeek}
              </div>
              <button
                onClick={() => setSelectedWeek(selectedWeek + 1)}
                className="z-btn-secondary"
              >
                →
              </button>
            </div>
          </div>
          <div className="ml-auto grid grid-cols-3 gap-3 text-center">
            <div className="rounded-md bg-zillow-gray-light px-3 py-2">
              <div className="text-2xl font-bold text-zillow-ink">{stats.held}</div>
              <div className="text-[10px] uppercase tracking-wider text-zillow-slate">Held</div>
            </div>
            <div className="rounded-md bg-emerald-50 px-3 py-2">
              <div className="text-2xl font-bold text-emerald-700">{stats.played}</div>
              <div className="text-[10px] uppercase tracking-wider text-emerald-700">Played</div>
            </div>
            <div className="rounded-md bg-red-50 px-3 py-2">
              <div className="text-2xl font-bold text-zillow-red">{stats.archived}</div>
              <div className="text-[10px] uppercase tracking-wider text-zillow-red">Archived</div>
            </div>
          </div>
        </div>
      </section>

      {/* This week's meetings */}
      <section>
        <h2 className="z-h2 mb-4">Week {selectedWeek} — meeting prep</h2>
        {meetingsForWeek.length === 0 && (
          <div className="z-card text-sm text-zillow-slate">
            No scripted meeting for week {selectedWeek}. Cadence is mapped for weeks 1-12; after that, reuse
            the closest theme.
          </div>
        )}
        <div className="space-y-4">
          {meetingsForWeek.map((m, idx) => (
            <article
              key={idx}
              className={`z-card border-l-4 ${
                m.type === "1:1" ? "border-zillow-blue" : "border-zillow-orange"
              }`}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <div>
                  <div className="z-eyebrow">{m.type}</div>
                  <h3 className="z-h3 mt-1">{m.theme}</h3>
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-zillow-slate">
                    Agenda script
                  </div>
                  <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm leading-relaxed text-zillow-ink">
                    {m.agendaScript.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ol>
                </div>
                <div>
                  {m.questionsToAsk.length > 0 && (
                    <>
                      <div className="text-xs font-semibold uppercase tracking-wider text-zillow-slate">
                        Questions to ask
                      </div>
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-zillow-ink">
                        {m.questionsToAsk.map((q, i) => (
                          <li key={i}>{q}</li>
                        ))}
                      </ul>
                    </>
                  )}
                  <div className="mt-3 grid gap-2 md:grid-cols-2">
                    <div className="rounded-md bg-emerald-50 px-3 py-2">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
                        Bring
                      </div>
                      <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs leading-relaxed text-zillow-ink">
                        {m.whatToBring.map((w, i) => (
                          <li key={i}>{w}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-md bg-red-50 px-3 py-2">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-zillow-red">
                        Don&apos;t bring
                      </div>
                      <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs leading-relaxed text-zillow-ink">
                        {m.whatNotToBring.map((w, i) => (
                          <li key={i}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {m.cards.length > 0 && (
                <div className="mt-5">
                  <div className="text-xs font-semibold uppercase tracking-wider text-zillow-slate">
                    Cards to play this meeting
                  </div>
                  <div className="mt-2 space-y-2">
                    {m.cards.map((cid) => {
                      const c = cardsById.get(cid);
                      if (!c) return null;
                      const st = cardState(c.id);
                      return (
                        <div
                          key={cid}
                          className="rounded-md border border-zillow-gray-border bg-white p-3"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`z-chip ${CATEGORY_STYLE[c.category]}`}>
                              {c.category}
                            </span>
                            <span
                              className={`rounded px-2 py-0.5 text-[10px] font-semibold ring-1 ${PLAYABILITY_STYLE[c.playability]}`}
                            >
                              {c.playability}
                            </span>
                            {c.staceyKeyword && (
                              <span className="rounded bg-zillow-gray-light px-1.5 py-0.5 text-[10px] font-mono text-zillow-slate">
                                echo: &ldquo;{c.staceyKeyword}&rdquo;
                              </span>
                            )}
                            <button
                              onClick={() =>
                                setCardState(c.id, st === "played" ? "held" : "played")
                              }
                              className={`ml-auto rounded-md px-2 py-1 text-xs font-semibold ${
                                st === "played"
                                  ? "bg-emerald-600 text-white"
                                  : "bg-zillow-blue text-white hover:bg-zillow-blue-dark"
                              }`}
                            >
                              {st === "played" ? "✓ Played" : "Mark played"}
                            </button>
                          </div>
                          <p className="mt-2 text-sm font-medium leading-relaxed text-zillow-ink">
                            {c.headline}
                          </p>
                          <details className="mt-2">
                            <summary className="cursor-pointer text-xs text-zillow-blue hover:underline">
                              How to frame it
                            </summary>
                            <div className="mt-2 space-y-2 text-xs">
                              <p className="text-zillow-slate">
                                <strong className="text-zillow-ink">Framing: </strong>
                                {c.framing}
                              </p>
                              <p className="text-zillow-slate">
                                <strong className="text-zillow-ink">Why Stacey cares: </strong>
                                {c.staceyAngle}
                              </p>
                              {c.dontSay.length > 0 && (
                                <div className="rounded bg-red-50 px-2 py-1.5 text-zillow-ink">
                                  <span className="font-semibold text-zillow-red">
                                    DON&apos;T SAY:{" "}
                                  </span>
                                  {c.dontSay.join(" · ")}
                                </div>
                              )}
                              {(c.jiraRef || c.quickWinRef) && (
                                <div className="text-zillow-slate">
                                  <strong className="text-zillow-ink">Reference: </strong>
                                  {c.jiraRef && (
                                    <span className="font-mono">{c.jiraRef}</span>
                                  )}
                                  {c.jiraRef && c.quickWinRef && " · "}
                                  {c.quickWinRef && (
                                    <span className="font-mono">{c.quickWinRef}</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </details>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* Card deck library */}
      <section>
        <h2 className="z-h2 mb-3">Full card deck — {STACEY_CARDS.length} cards</h2>
        <div className="z-card mb-4 flex flex-wrap items-center gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search cards..."
            className="flex-1 min-w-[200px] rounded-lg border border-zillow-gray-border px-3 py-2 text-sm focus:border-zillow-blue focus:outline-none"
          />
          {(["all", "held", "played", "archived"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                filter === f
                  ? "bg-zillow-blue text-white"
                  : "bg-white text-zillow-slate ring-1 ring-zillow-gray-border hover:bg-zillow-gray-light"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          {filtered.map((c) => {
            const st = cardState(c.id);
            return (
              <article
                key={c.id}
                className={`z-card ${st === "played" ? "opacity-60" : ""}`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`z-chip ${CATEGORY_STYLE[c.category]}`}>
                    {c.category}
                  </span>
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-semibold ring-1 ${PLAYABILITY_STYLE[c.playability]}`}
                  >
                    {c.playability}
                  </span>
                  <span className="rounded bg-zillow-gray-light px-2 py-0.5 text-[10px] text-zillow-slate">
                    Ideal: Week {c.weekIdeal}
                  </span>
                  {c.prerequisites && c.prerequisites.length > 0 && (
                    <span className="rounded bg-amber-50 px-2 py-0.5 text-[10px] text-amber-800">
                      Prereqs: {c.prerequisites.length}
                    </span>
                  )}
                  <div className="ml-auto flex items-center gap-1">
                    <button
                      onClick={() => setCardState(c.id, "held")}
                      className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                        st === "held"
                          ? "bg-zillow-gray-light text-zillow-ink"
                          : "text-zillow-slate hover:bg-zillow-gray-light"
                      }`}
                    >
                      Held
                    </button>
                    <button
                      onClick={() => setCardState(c.id, "played")}
                      className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                        st === "played"
                          ? "bg-emerald-600 text-white"
                          : "text-zillow-slate hover:bg-emerald-50"
                      }`}
                    >
                      Played
                    </button>
                    <button
                      onClick={() => setCardState(c.id, "archived")}
                      className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                        st === "archived"
                          ? "bg-zillow-red text-white"
                          : "text-zillow-slate hover:bg-red-50"
                      }`}
                    >
                      Archive
                    </button>
                  </div>
                </div>
                <h3 className="z-h3 mt-3">{c.headline}</h3>
                <div className="mt-3 grid gap-3 md:grid-cols-3">
                  <div className="rounded-md bg-zillow-gray-light px-3 py-2 text-xs leading-relaxed text-zillow-ink">
                    <span className="font-semibold">Framing: </span>
                    {c.framing}
                  </div>
                  <div className="rounded-md bg-zillow-blue-light px-3 py-2 text-xs leading-relaxed text-zillow-ink">
                    <span className="font-semibold text-zillow-blue">Why Stacey cares: </span>
                    {c.staceyAngle}
                  </div>
                  <div className="rounded-md bg-red-50 px-3 py-2 text-xs leading-relaxed text-zillow-ink">
                    <span className="font-semibold text-zillow-red">Don&apos;t say: </span>
                    {c.dontSay.join(" · ")}
                  </div>
                </div>
                <textarea
                  placeholder="Private notes (saved locally)..."
                  value={state.notes[c.id] ?? ""}
                  onChange={(e) => setNote(c.id, e.target.value)}
                  className="mt-3 w-full rounded-md border border-zillow-gray-border bg-white px-3 py-2 text-xs focus:border-zillow-blue focus:outline-none"
                  rows={2}
                />
                {state.cardStates[c.id]?.playedOn && (
                  <div className="mt-2 text-[10px] text-zillow-slate">
                    Played on {state.cardStates[c.id]!.playedOn}
                  </div>
                )}
              </article>
            );
          })}
          {filtered.length === 0 && (
            <div className="z-card text-center text-sm text-zillow-slate">
              No cards match this filter.
            </div>
          )}
        </div>
      </section>

      {/* Drip principles */}
      <section className="z-card border-l-4 border-zillow-blue bg-zillow-blue-light">
        <div className="z-eyebrow">Drip principles</div>
        <h2 className="z-h3 mt-2">How to play this deck without burning it</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-zillow-ink">
          {DRIP_PRINCIPLES.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
      </section>

      {/* Never-say list */}
      <section>
        <h2 className="z-h2 mb-3">Things to NEVER say to Stacey</h2>
        <p className="mb-4 max-w-3xl text-sm text-zillow-slate">
          Each one of these has a reason. Patrick's career-limiter quotes, Mark&apos;s
          sacred-ground items, and the FTE-killing moves to never make.
        </p>
        <div className="space-y-2">
          {NEVER_SAY_TO_STACEY.map((n, i) => (
            <article key={i} className="z-card border-l-4 border-zillow-red">
              <p className="text-sm font-semibold text-zillow-ink">{n.line}</p>
              <p className="mt-1 text-xs text-zillow-slate">{n.why}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Friday email template */}
      <section className="z-card bg-zillow-gray-light">
        <div className="z-eyebrow">Friday wins/challenges email — Stacey&apos;s scoreboard</div>
        <h2 className="z-h3 mt-2">Template + rules</h2>
        <p className="mt-2 text-xs text-zillow-slate">
          <strong>Subject:</strong> {FRIDAY_EMAIL_TEMPLATE.subject}
        </p>
        <pre className="mt-3 overflow-x-auto rounded-md bg-white p-4 text-xs leading-relaxed text-zillow-ink ring-1 ring-zillow-gray-border whitespace-pre-wrap">
          {FRIDAY_EMAIL_TEMPLATE.body.join("\n")}
        </pre>
        <div className="mt-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-zillow-slate">
            Rules of the format
          </div>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-zillow-ink">
            {FRIDAY_EMAIL_TEMPLATE.rules.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="text-sm text-zillow-slate">
        Related:{" "}
        <Link href="/playbook" className="z-link">
          Playbook (FTE)
        </Link>{" "}
        ·{" "}
        <Link href="/jira" className="z-link">
          Jira board
        </Link>{" "}
        ·{" "}
        <Link href="/channels" className="z-link">
          Channels &amp; contacts
        </Link>{" "}
        ·{" "}
        <Link href="/quick-wins" className="z-link">
          Quick wins
        </Link>
      </section>

      <p className="text-xs text-zillow-slate">
        This page is your private notebook. State is saved in your browser&apos;s local
        storage on this device. Nothing on this page is visible to Stacey, Matt, or Mark.
      </p>
    </div>
  );
}
