"use client";

import { useEffect, useMemo, useState } from "react";
import { QUESTIONS, type QuestionGroup } from "@/lib/data";

const STORAGE_KEY = "av-questions-asked-v1";

const AUDIENCE_STYLE: Record<QuestionGroup["audience"], string> = {
  Matt: "bg-zillow-blue-light text-zillow-blue ring-1 ring-inset ring-blue-200",
  Mark: "bg-orange-50 text-zillow-orange ring-1 ring-inset ring-orange-200",
  Stacey: "bg-green-50 text-zillow-green ring-1 ring-inset ring-green-200",
  "Team / WAVE sync": "bg-yellow-50 text-yellow-800 ring-1 ring-inset ring-yellow-200",
  Multiple: "bg-zillow-gray-light text-zillow-slate ring-1 ring-inset ring-zillow-gray-border",
};

type AskedMap = Record<string, Record<number, boolean>>;

function loadAsked(): AskedMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AskedMap) : {};
  } catch {
    return {};
  }
}

function saveAsked(state: AskedMap) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export default function QuestionsPage() {
  const [asked, setAsked] = useState<AskedMap>({});
  const [search, setSearch] = useState("");
  const [audienceFilter, setAudienceFilter] = useState<Set<QuestionGroup["audience"]>>(new Set());
  const [hideAsked, setHideAsked] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setAsked(loadAsked());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveAsked(asked);
  }, [asked, hydrated]);

  const toggle = (groupId: string, idx: number) => {
    setAsked((prev) => {
      const g = { ...(prev[groupId] ?? {}) };
      g[idx] = !g[idx];
      return { ...prev, [groupId]: g };
    });
  };

  const resetAsked = () => {
    if (typeof window === "undefined") return;
    if (window.confirm("Reset all 'asked' status? This cannot be undone.")) setAsked({});
  };

  const copy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1500);
    } catch {
      // ignore
    }
  };

  const toggleAudience = (a: QuestionGroup["audience"]) => {
    setAudienceFilter((prev) => {
      const next = new Set(prev);
      if (next.has(a)) next.delete(a);
      else next.add(a);
      return next;
    });
  };

  const audiences = useMemo(
    () => Array.from(new Set(QUESTIONS.map((g) => g.audience))) as QuestionGroup["audience"][],
    [],
  );

  const filtered = useMemo(() => {
    const lc = search.trim().toLowerCase();
    return QUESTIONS.map((group) => {
      const audienceMatch = audienceFilter.size === 0 || audienceFilter.has(group.audience);
      if (!audienceMatch) return { ...group, questions: [] };
      const matched = group.questions
        .map((q, idx) => ({ q, idx }))
        .filter(({ q }) => {
          if (hideAsked) {
            const done = (asked[group.id] ?? {})[0]; // recomputed below
          }
          if (!lc) return true;
          return (
            q.text.toLowerCase().includes(lc) ||
            (q.why ?? "").toLowerCase().includes(lc) ||
            (q.tags ?? []).some((t) => t.toLowerCase().includes(lc)) ||
            group.title.toLowerCase().includes(lc) ||
            group.context.toLowerCase().includes(lc)
          );
        })
        .filter(({ idx }) => {
          if (!hideAsked) return true;
          return !(asked[group.id] ?? {})[idx];
        });
      return { ...group, questions: matched.map(({ q, idx }) => ({ ...q, _idx: idx })) };
    }).filter((g) => g.questions.length > 0);
  }, [search, audienceFilter, hideAsked, asked]);

  const totals = useMemo(() => {
    let total = 0;
    let done = 0;
    for (const g of QUESTIONS) {
      total += g.questions.length;
      const map = asked[g.id] ?? {};
      done += g.questions.filter((_, i) => map[i]).length;
    }
    return { total, done, pct: total === 0 ? 0 : Math.round((done / total) * 100) };
  }, [asked]);

  return (
    <div className="space-y-8">
      <header>
        <p className="z-eyebrow">Meeting prep</p>
        <h1 className="z-h1 mt-2">Questions to ask</h1>
        <p className="mt-3 max-w-3xl text-base text-zillow-slate">
          Every question worth raising in the upcoming Tuesday meeting with Matt, the Monday WAVE
          sync, and the broader Patrick handoff. Grouped by audience and context. Check them off as
          you ask them; progress saves to your browser.
        </p>
      </header>

      {/* Progress */}
      <section className="z-card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="z-eyebrow">Questions asked</div>
            <div className="mt-1 text-3xl font-bold text-zillow-ink">
              {totals.done} / {totals.total}{" "}
              <span className="text-base font-normal text-zillow-slate">
                across {QUESTIONS.length} groups
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-zillow-blue">{totals.pct}%</div>
          </div>
        </div>
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-zillow-gray-light">
          <div
            className="h-full rounded-full bg-zillow-blue transition-all"
            style={{ width: `${totals.pct}%` }}
          />
        </div>
      </section>

      {/* Toolbar */}
      <section className="z-card space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Search questions, tags, context..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[200px] rounded-lg border border-zillow-gray-border bg-white px-4 py-2 text-sm text-zillow-ink placeholder:text-zillow-gray focus:border-zillow-blue focus:outline-none focus:ring-2 focus:ring-zillow-blue-light"
          />
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-zillow-gray-border bg-white px-4 py-2 text-sm font-medium text-zillow-ink hover:bg-zillow-gray-light">
            <input
              type="checkbox"
              checked={hideAsked}
              onChange={(e) => setHideAsked(e.target.checked)}
              className="h-4 w-4 rounded border-zillow-gray-border text-zillow-blue"
            />
            Hide asked
          </label>
          <button
            onClick={resetAsked}
            className="z-btn-secondary !border-red-200 !text-zillow-red hover:!bg-red-50"
          >
            Reset
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="w-20 shrink-0 text-xs font-semibold uppercase tracking-wide text-zillow-slate">
            Audience
          </span>
          {audiences.map((a) => {
            const selected = audienceFilter.has(a);
            return (
              <button
                key={a}
                onClick={() => toggleAudience(a)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                  selected
                    ? AUDIENCE_STYLE[a]
                    : "bg-zillow-gray-light text-zillow-slate hover:bg-zillow-blue-light hover:text-zillow-blue"
                }`}
              >
                {a}
              </button>
            );
          })}
          {(audienceFilter.size > 0 || search || hideAsked) && (
            <button
              onClick={() => {
                setAudienceFilter(new Set());
                setSearch("");
                setHideAsked(false);
              }}
              className="z-link ml-2 text-xs"
            >
              Clear all
            </button>
          )}
        </div>
      </section>

      {/* Groups */}
      <section className="space-y-6">
        {filtered.length === 0 && (
          <div className="z-card text-center text-sm text-zillow-slate">
            No questions match the current filters.
          </div>
        )}
        {filtered.map((group) => {
          const groupAsked = asked[group.id] ?? {};
          const groupDone = group.questions.filter((q) => groupAsked[(q as any)._idx ?? 0]).length;
          return (
            <article key={group.id} className="z-card">
              <header className="flex flex-wrap items-start justify-between gap-3 border-b border-zillow-gray-border pb-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`z-chip ${AUDIENCE_STYLE[group.audience]}`}>
                      {group.audience}
                    </span>
                    <span className="text-xs text-zillow-slate">{group.context}</span>
                  </div>
                  <h2 className="z-h3 mt-2">{group.title}</h2>
                  {group.description && (
                    <p className="mt-1 text-sm text-zillow-slate">{group.description}</p>
                  )}
                </div>
                <div className="shrink-0 text-right text-xs text-zillow-slate">
                  <div className="font-mono">
                    {groupDone}/{group.questions.length}
                  </div>
                </div>
              </header>

              <ol className="mt-4 space-y-3">
                {group.questions.map((q) => {
                  const idx = (q as any)._idx as number;
                  const done = !!groupAsked[idx];
                  const copyKey = `${group.id}:${idx}`;
                  return (
                    <li
                      key={idx}
                      className={`group rounded-lg border border-zillow-gray-border bg-white p-4 transition-colors ${
                        done ? "bg-zillow-gray-light/60" : "hover:bg-zillow-blue-light/30"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={done}
                          onChange={() => toggle(group.id, idx)}
                          className="mt-1 h-4 w-4 shrink-0 rounded border-zillow-gray-border text-zillow-blue focus:ring-zillow-blue"
                        />
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-sm leading-relaxed ${
                              done ? "text-zillow-gray line-through" : "text-zillow-ink"
                            }`}
                          >
                            {q.text}
                          </p>
                          {q.why && (
                            <p className="mt-1.5 text-xs italic text-zillow-slate">
                              Why: {q.why}
                            </p>
                          )}
                          {q.tags && q.tags.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {q.tags.map((t) => (
                                <span
                                  key={t}
                                  className="rounded bg-zillow-gray-light px-1.5 py-0.5 text-[10px] font-medium text-zillow-slate"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => copy(q.text, copyKey)}
                          className="shrink-0 rounded-md border border-zillow-gray-border bg-white px-2 py-1 text-xs font-medium text-zillow-slate opacity-0 transition-opacity hover:bg-zillow-gray-light hover:text-zillow-ink group-hover:opacity-100 focus:opacity-100"
                          title="Copy to clipboard"
                        >
                          {copiedKey === copyKey ? "Copied" : "Copy"}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </article>
          );
        })}
      </section>

      <p className="text-xs text-zillow-slate">
        Asked status is saved in your browser&apos;s local storage on this device.
      </p>
    </div>
  );
}
