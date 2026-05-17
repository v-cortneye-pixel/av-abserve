"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  DRIP_PRINCIPLES,
  FRIDAY_EMAIL_TEMPLATE,
  NEVER_SAY_TO_STACEY,
  ONE_ON_ONE_PLAN,
  STACEY_CARDS,
  type OneOnOneMeeting,
  type ScriptedQuestion,
} from "@/lib/data";

const STORAGE_KEY = "av-stacey-cards-v1";

type CardState = "held" | "played" | "archived";

interface UserState {
  startDate?: string;
  cardStates: Record<string, { state: CardState; playedOn?: string }>;
  notes: Record<string, string>;
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

function isScriptedQuestion(q: unknown): q is ScriptedQuestion {
  return !!q && typeof q === "object" && "question" in (q as Record<string, unknown>);
}

type Tab = "this-week" | "deck" | "never-say" | "friday" | "principles";

const TAB_LABELS: Record<Tab, string> = {
  "this-week": "📅 This week's meetings",
  deck: "🃏 Card deck",
  "never-say": "🚫 Never say",
  friday: "📧 Friday email",
  principles: "🎯 Drip principles",
};

function MeetingScript({ meeting }: { meeting: OneOnOneMeeting }) {
  return (
    <div
      className={`z-card border-l-4 ${
        meeting.type === "1:1" ? "border-zillow-blue" : "border-zillow-orange"
      }`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <div className="z-eyebrow text-base">
            {meeting.type === "1:1" ? "🤝 1:1 with Stacey" : "👥 Team meeting"}
          </div>
          <h3 className="z-h3 mt-1">Theme: {meeting.theme}</h3>
        </div>
        <span className="text-xs font-mono text-zillow-slate">{meeting.duration}</span>
      </div>

      {/* STEP 1 — OPEN */}
      {meeting.opening && (
        <div className="mt-6 rounded-lg border-2 border-zillow-blue bg-zillow-blue-light p-4">
          <div className="text-xs font-bold uppercase tracking-wider text-zillow-blue">
            🎬 Step 1 — Open the meeting (first 30 seconds)
          </div>
          <p className="mt-3 text-base font-medium leading-relaxed text-zillow-ink">
            <span className="text-xs font-semibold uppercase tracking-wider text-zillow-blue">
              Say verbatim:
            </span>
            <br />
            {meeting.opening.verbatim}
          </p>
          <div className="mt-3 rounded-md bg-white px-3 py-2 text-xs leading-relaxed text-zillow-slate">
            <span className="font-semibold text-zillow-ink">Why this works: </span>
            {meeting.opening.rationale}
          </div>
        </div>
      )}

      {/* STEP 2 — TALKING POINTS */}
      {meeting.talkingPoints && meeting.talkingPoints.length > 0 && (
        <div className="mt-4">
          <div className="text-xs font-bold uppercase tracking-wider text-zillow-ink">
            🗣️ Step 2 — Talking points (in this order)
          </div>
          <div className="mt-3 space-y-3">
            {meeting.talkingPoints.map((tp, i) => (
              <div key={i} className="rounded-lg border border-zillow-gray-border bg-white p-4">
                <div className="text-sm font-bold text-zillow-ink">{tp.title}</div>
                <p className="mt-2 text-sm leading-relaxed text-zillow-ink">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zillow-blue">
                    Say:
                  </span>
                  <br />
                  {tp.verbatim}
                </p>
                <div className="mt-3 rounded-md bg-zillow-gray-light px-3 py-2 text-xs leading-relaxed text-zillow-slate">
                  <span className="font-semibold text-zillow-ink">Why this works: </span>
                  {tp.rationale}
                </div>
                {tp.branches && tp.branches.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {tp.branches.map((b, j) => (
                      <div
                        key={j}
                        className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed"
                      >
                        <div className="font-semibold text-amber-800">
                          ↳ If Stacey says: {b.ifSheSays}
                        </div>
                        <div className="mt-1 text-zillow-ink">
                          <span className="font-semibold">Then you say: </span>
                          {b.thenYouSay}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 3 — QUESTIONS TO ASK */}
      {meeting.questionsToAsk && meeting.questionsToAsk.length > 0 && (
        <div className="mt-6 rounded-lg border-2 border-purple-300 bg-purple-50 p-4">
          <div className="text-xs font-bold uppercase tracking-wider text-purple-700">
            ❓ Step 3 — Questions to ask her (pick 2-3, in this order)
          </div>
          <div className="mt-3 space-y-3">
            {meeting.questionsToAsk.map((q, i) => {
              if (typeof q === "string") {
                return (
                  <div
                    key={i}
                    className="rounded-md bg-white px-3 py-2 text-sm font-medium text-zillow-ink"
                  >
                    {q}
                  </div>
                );
              }
              if (!isScriptedQuestion(q)) return null;
              return (
                <div key={i} className="rounded-md bg-white p-3 ring-1 ring-purple-200">
                  <div className="text-sm font-bold text-zillow-ink">
                    Q{i + 1}: {q.question}
                  </div>
                  <div className="mt-2 text-xs italic text-zillow-slate">
                    <span className="font-semibold not-italic text-zillow-ink">Why ask: </span>
                    {q.whyAsk}
                  </div>
                  {q.likelyAnswers.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      {q.likelyAnswers.map((a, j) => (
                        <div
                          key={j}
                          className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed"
                        >
                          <div className="font-semibold text-amber-800">
                            ↳ If she says: {a.ifSheSays}
                          </div>
                          <div className="mt-1 text-zillow-ink">
                            <span className="font-semibold">Then you say: </span>
                            {a.thenYouSay}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 4 — CLOSE */}
      {meeting.closing && (
        <div className="mt-4 rounded-lg border-2 border-emerald-300 bg-emerald-50 p-4">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            🎬 Step 4 — Close the meeting (last 30 seconds)
          </div>
          <p className="mt-3 text-base font-medium leading-relaxed text-zillow-ink">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Say verbatim:
            </span>
            <br />
            {meeting.closing.verbatim}
          </p>
          <div className="mt-3 rounded-md bg-white px-3 py-2 text-xs leading-relaxed text-zillow-slate">
            <span className="font-semibold text-zillow-ink">Why this works: </span>
            {meeting.closing.rationale}
          </div>
        </div>
      )}

      {/* BRING / DON'T BRING */}
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <div className="rounded-md bg-emerald-50 px-3 py-3">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            ✅ Have these open in tabs
          </div>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-relaxed text-zillow-ink">
            {meeting.whatToBring.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-md bg-red-50 px-3 py-3">
          <div className="text-xs font-bold uppercase tracking-wider text-zillow-red">
            🚫 Do NOT bring up
          </div>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-relaxed text-zillow-ink">
            {meeting.whatNotToBring.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* SUCCESS SIGNALS / RED FLAGS */}
      {(meeting.successSignals?.length || meeting.redFlags?.length) && (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {meeting.successSignals && meeting.successSignals.length > 0 && (
            <div className="rounded-md bg-zillow-blue-light px-3 py-3">
              <div className="text-xs font-bold uppercase tracking-wider text-zillow-blue">
                👍 If she does this, you nailed it
              </div>
              <ul className="mt-2 space-y-2 pl-1 text-xs leading-relaxed">
                {meeting.successSignals.map((s, i) => (
                  <li key={i}>
                    <div className="font-semibold text-zillow-ink">→ {s.sheDoes}</div>
                    <div className="ml-3 text-zillow-slate">{s.meaning}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {meeting.redFlags && meeting.redFlags.length > 0 && (
            <div className="rounded-md bg-amber-50 px-3 py-3">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-800">
                ⚠️ If she does this, pivot
              </div>
              <ul className="mt-2 space-y-2 pl-1 text-xs leading-relaxed">
                {meeting.redFlags.map((r, i) => (
                  <li key={i}>
                    <div className="font-semibold text-zillow-ink">→ {r.sheDoes}</div>
                    <div className="ml-3 text-zillow-slate">{r.pivot}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* legacy fallback for non-scripted weeks */}
      {!meeting.opening && meeting.agendaScript && (
        <div className="mt-4 rounded-md bg-zillow-gray-light p-3">
          <div className="text-xs font-bold uppercase tracking-wider text-zillow-slate">
            Agenda outline (not yet fully scripted)
          </div>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm leading-relaxed text-zillow-ink">
            {meeting.agendaScript.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

export default function OneOnOnePage() {
  const [state, setState] = useState<UserState>({ cardStates: {}, notes: {} });
  const [hydrated, setHydrated] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [tab, setTab] = useState<Tab>("this-week");

  useEffect(() => {
    const s = loadState();
    setState(s);
    setSelectedWeek(getWeekFromStart(s.startDate));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveState(state);
  }, [state, hydrated]);

  const setStartDate = (d: string) => {
    setState((s) => ({ ...s, startDate: d }));
    setSelectedWeek(getWeekFromStart(d));
  };

  const meetingsForWeek = ONE_ON_ONE_PLAN.filter((m) => m.weekNumber === selectedWeek);

  const cardState = (id: string): CardState => state.cardStates[id]?.state ?? "held";
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

  const stats = useMemo(() => {
    let played = 0;
    for (const c of STACEY_CARDS) if (cardState(c.id) === "played") played++;
    return { played, total: STACEY_CARDS.length };
  }, [state]);

  return (
    <div className="space-y-8">
      {/* HEADER + HOW TO USE */}
      <header>
        <p className="z-eyebrow">Private — Cortney's notebook · saved to this browser only</p>
        <h1 className="z-h1 mt-2">Stacey 1:1 cheat sheet</h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-zillow-slate">
          Open this page right before each Stacey meeting. The current week&apos;s 1:1 + team
          meeting are scripted top-to-bottom — exact words to open with, talking points in order,
          questions to ask, and how to close. Read it like a recipe.
        </p>

        {/* How to use */}
        <div className="z-card mt-4 bg-zillow-blue-light">
          <div className="z-eyebrow">📖 How to use this page (60 seconds)</div>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-zillow-ink">
            <li>
              <strong>Set your role start date</strong> below (just once) — the page jumps to
              your current week automatically.
            </li>
            <li>
              <strong>Read the meeting script top to bottom</strong> — Step 1 Open, Step 2
              Talking Points, Step 3 Questions, Step 4 Close. Each step shows the EXACT words
              to say + the rationale.
            </li>
            <li>
              <strong>If a card has &ldquo;If she says X then you say Y&rdquo; branches</strong>,
              skim those before the meeting. You won&apos;t get blindsided.
            </li>
            <li>
              <strong>After the meeting</strong>, switch to the &ldquo;Card deck&rdquo; tab and
              mark which cards you played. Updates your strategy for next week automatically.
            </li>
          </ol>
        </div>
      </header>

      {/* WEEK CONTROLS */}
      <section className="z-card">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="z-eyebrow">📅 Your role start date</label>
            <input
              type="date"
              value={state.startDate ?? ""}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-2 rounded-lg border-2 border-zillow-blue px-3 py-2 text-sm focus:outline-none"
            />
          </div>
          <div>
            <label className="z-eyebrow">Currently showing</label>
            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={() => setSelectedWeek(Math.max(1, selectedWeek - 1))}
                className="z-btn-secondary"
              >
                ←
              </button>
              <div className="rounded-lg border-2 border-zillow-blue bg-zillow-blue px-4 py-2 text-sm font-bold text-white">
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
          <div className="ml-auto rounded-md bg-emerald-50 px-4 py-2 text-sm">
            <span className="text-zillow-slate">Cards played: </span>
            <span className="font-bold text-emerald-700">
              {stats.played} / {stats.total}
            </span>
          </div>
        </div>
      </section>

      {/* TAB SWITCHER */}
      <nav className="flex flex-wrap gap-2 border-b border-zillow-gray-border pb-2">
        {(Object.keys(TAB_LABELS) as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-t-lg px-4 py-2 text-sm font-semibold transition-colors ${
              tab === t
                ? "bg-zillow-blue text-white"
                : "bg-white text-zillow-slate hover:bg-zillow-gray-light"
            }`}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </nav>

      {/* TAB: THIS WEEK */}
      {tab === "this-week" && (
        <section className="space-y-6">
          {meetingsForWeek.length === 0 && (
            <div className="z-card text-center">
              <p className="text-sm text-zillow-slate">
                No scripted meeting for week {selectedWeek}. Detailed scripts exist for weeks
                1-4; weeks 5-12 have outline-level plans. Use the closest theme as a template.
              </p>
            </div>
          )}
          {meetingsForWeek.map((m, i) => (
            <MeetingScript key={i} meeting={m} />
          ))}
        </section>
      )}

      {/* TAB: CARD DECK (simplified) */}
      {tab === "deck" && (
        <section className="space-y-3">
          <div className="z-card bg-zillow-gray-light">
            <p className="text-sm text-zillow-ink">
              <strong>Card deck</strong> — every finding, win, or ask you might play across
              meetings. The "This week" tab tells you WHICH cards belong in which meeting; this
              tab is the master list for marking what's been played.
            </p>
          </div>
          {STACEY_CARDS.map((c) => {
            const st = cardState(c.id);
            return (
              <article
                key={c.id}
                className={`z-card ${st === "played" ? "opacity-60" : ""}`}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <div className="text-xs text-zillow-slate">
                      Week {c.weekIdeal} · {c.category} · {c.playability}
                    </div>
                    <h3 className="text-base font-bold text-zillow-ink mt-1">{c.headline}</h3>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setCardState(c.id, "held")}
                      className={`rounded px-2 py-1 text-xs ${
                        st === "held"
                          ? "bg-zillow-gray-light font-semibold text-zillow-ink"
                          : "text-zillow-slate hover:bg-zillow-gray-light"
                      }`}
                    >
                      Held
                    </button>
                    <button
                      onClick={() => setCardState(c.id, "played")}
                      className={`rounded px-2 py-1 text-xs ${
                        st === "played"
                          ? "bg-emerald-600 font-semibold text-white"
                          : "text-zillow-slate hover:bg-emerald-50"
                      }`}
                    >
                      ✓ Played
                    </button>
                    <button
                      onClick={() => setCardState(c.id, "archived")}
                      className={`rounded px-2 py-1 text-xs ${
                        st === "archived"
                          ? "bg-zillow-red font-semibold text-white"
                          : "text-zillow-slate hover:bg-red-50"
                      }`}
                    >
                      Archive
                    </button>
                  </div>
                </div>
                {state.cardStates[c.id]?.playedOn && (
                  <div className="mt-1 text-[10px] text-emerald-700">
                    ✓ Played on {state.cardStates[c.id]!.playedOn}
                  </div>
                )}
              </article>
            );
          })}
        </section>
      )}

      {/* TAB: NEVER SAY */}
      {tab === "never-say" && (
        <section className="space-y-3">
          <div className="z-card bg-red-50">
            <p className="text-sm text-zillow-ink">
              <strong>The 9 sentences that torch the FTE conversion.</strong> Each one has a
              reason. Read these before EVERY Stacey meeting.
            </p>
          </div>
          {NEVER_SAY_TO_STACEY.map((n, i) => (
            <article key={i} className="z-card border-l-4 border-zillow-red">
              <p className="text-sm font-semibold text-zillow-ink">{n.line}</p>
              <p className="mt-2 text-xs leading-relaxed text-zillow-slate">{n.why}</p>
            </article>
          ))}
        </section>
      )}

      {/* TAB: FRIDAY EMAIL */}
      {tab === "friday" && (
        <section className="space-y-4">
          <div className="z-card bg-zillow-blue-light">
            <div className="z-eyebrow">📧 Friday wins/challenges email</div>
            <p className="mt-2 text-sm leading-relaxed text-zillow-ink">
              Send Friday by 4pm PT so Stacey sees it before her own write-up. Closed
              deliverables only — never &ldquo;working on&rdquo; or &ldquo;almost done.&rdquo;
            </p>
          </div>
          <div className="z-card">
            <div className="text-xs font-semibold uppercase tracking-wider text-zillow-slate">
              Subject line
            </div>
            <p className="mt-2 font-mono text-sm text-zillow-ink">
              {FRIDAY_EMAIL_TEMPLATE.subject}
            </p>
          </div>
          <div className="z-card">
            <div className="text-xs font-semibold uppercase tracking-wider text-zillow-slate">
              Body template
            </div>
            <pre className="mt-3 overflow-x-auto rounded-md bg-zillow-gray-light p-4 text-xs leading-relaxed text-zillow-ink whitespace-pre-wrap">
              {FRIDAY_EMAIL_TEMPLATE.body.join("\n")}
            </pre>
          </div>
          <div className="z-card">
            <div className="text-xs font-semibold uppercase tracking-wider text-zillow-slate">
              Rules of the format
            </div>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-zillow-ink">
              {FRIDAY_EMAIL_TEMPLATE.rules.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* TAB: PRINCIPLES */}
      {tab === "principles" && (
        <section className="space-y-3">
          <div className="z-card bg-zillow-blue-light">
            <div className="z-eyebrow">🎯 Drip principles</div>
            <p className="mt-2 text-sm leading-relaxed text-zillow-ink">
              The strategic rules for using this deck without burning it. Read once when you
              start; re-read when you feel tempted to play a card early.
            </p>
          </div>
          {DRIP_PRINCIPLES.map((p, i) => (
            <article key={i} className="z-card border-l-4 border-zillow-blue">
              <p className="text-sm leading-relaxed text-zillow-ink">
                <strong className="text-zillow-blue">#{i + 1}: </strong>
                {p}
              </p>
            </article>
          ))}
        </section>
      )}

      <section className="text-xs text-zillow-slate border-t border-zillow-gray-border pt-4">
        Related:{" "}
        <Link href="/playbook" className="z-link">
          Playbook (FTE strategy)
        </Link>{" "}
        ·{" "}
        <Link href="/jira" className="z-link">
          Jira board
        </Link>{" "}
        ·{" "}
        <Link href="/channels" className="z-link">
          Channels &amp; contacts
        </Link>
      </section>

      <p className="text-xs text-zillow-slate">
        Private notebook. State is saved in your browser&apos;s local storage on this device.
        Nothing on this page is visible to Stacey, Matt, or Mark.
      </p>
    </div>
  );
}
