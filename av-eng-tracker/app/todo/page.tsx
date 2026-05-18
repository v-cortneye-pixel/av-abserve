"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  TODO_SECTIONS,
  type TodoItem,
  type TodoSection,
} from "@/lib/data";

const STORAGE_KEY = "av-todo-state-v1";

interface UserState {
  checked: Record<string, boolean>;
  notes: Record<string, string>;
}

function loadState(): UserState {
  if (typeof window === "undefined") return { checked: {}, notes: {} };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as UserState) : { checked: {}, notes: {} };
  } catch {
    return { checked: {}, notes: {} };
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

function CopyBlock({ title, body }: { title: string; body: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    if (typeof navigator === "undefined") return;
    navigator.clipboard.writeText(body).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <article className="z-card border-l-4 border-zillow-blue bg-zillow-blue-light">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div className="z-eyebrow text-zillow-blue">{title}</div>
        <button
          onClick={copy}
          className="rounded-md bg-zillow-blue px-3 py-1 text-xs font-semibold text-white hover:bg-zillow-blue-dark"
        >
          {copied ? "✓ Copied!" : "📋 Copy to clipboard"}
        </button>
      </div>
      <pre className="mt-3 overflow-x-auto rounded-md bg-white p-4 text-xs leading-relaxed text-zillow-ink ring-1 ring-zillow-gray-border whitespace-pre-wrap">
        {body}
      </pre>
    </article>
  );
}

function ItemRow({
  item,
  checked,
  onToggle,
  note,
  onNoteChange,
  blocked,
}: {
  item: TodoItem;
  checked: boolean;
  onToggle: () => void;
  note: string;
  onNoteChange: (n: string) => void;
  blocked?: boolean;
}) {
  return (
    <li
      className={`rounded-lg border bg-white p-4 transition-opacity ${
        checked ? "opacity-50 border-emerald-200 bg-emerald-50" : "border-zillow-gray-border"
      } ${blocked ? "opacity-40" : ""}`}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          id={`item-${item.id}`}
          checked={checked}
          disabled={blocked && !checked}
          onChange={onToggle}
          className="mt-1 h-5 w-5 flex-shrink-0 rounded border-zillow-gray-border text-zillow-blue focus:ring-zillow-blue disabled:cursor-not-allowed"
        />
        <div className="flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <label
              htmlFor={`item-${item.id}`}
              className={`cursor-pointer text-sm font-semibold ${
                checked
                  ? "text-zillow-gray line-through"
                  : "text-zillow-ink"
              }`}
            >
              {item.task}
            </label>
            <div className="flex items-center gap-2 text-[10px]">
              {item.doNow && !checked && (
                <span className="rounded bg-zillow-red px-2 py-0.5 font-bold text-white">
                  DO NOW
                </span>
              )}
              {item.estimateMinutes && (
                <span className="rounded bg-zillow-gray-light px-2 py-0.5 font-mono text-zillow-slate">
                  ~{item.estimateMinutes} min
                </span>
              )}
              {blocked && !checked && (
                <span className="rounded bg-amber-100 px-2 py-0.5 font-semibold text-amber-800">
                  ⏳ Blocked
                </span>
              )}
            </div>
          </div>
          {item.detail && (
            <p className="mt-2 text-xs leading-relaxed text-zillow-slate">{item.detail}</p>
          )}
          {item.links && item.links.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {item.links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  target={l.external || l.href.startsWith("http") ? "_blank" : undefined}
                  rel={l.external || l.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="inline-flex items-center gap-1 rounded-md bg-zillow-blue-light px-2 py-0.5 text-[11px] font-medium text-zillow-blue ring-1 ring-blue-200 hover:bg-zillow-blue hover:text-white"
                >
                  {l.label}
                  {(l.external || l.href.startsWith("http")) && (
                    <span aria-hidden>↗</span>
                  )}
                </a>
              ))}
            </div>
          )}
          {item.prerequisites && item.prerequisites.length > 0 && (
            <div className="mt-2 text-[10px] text-zillow-slate">
              Prerequisites: {item.prerequisites.length} item
              {item.prerequisites.length === 1 ? "" : "s"} (
              {item.prerequisites.join(", ")})
            </div>
          )}
          <textarea
            placeholder="Notes (saved locally)..."
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
            className="mt-2 w-full rounded-md border border-zillow-gray-border bg-white px-2 py-1 text-[11px] focus:border-zillow-blue focus:outline-none"
            rows={1}
          />
        </div>
      </div>
    </li>
  );
}

function SectionCard({
  section,
  state,
  setState,
}: {
  section: TodoSection;
  state: UserState;
  setState: (updater: (s: UserState) => UserState) => void;
}) {
  const checkedIds = useMemo(
    () => new Set(Object.entries(state.checked).filter(([, v]) => v).map(([k]) => k)),
    [state.checked],
  );

  const isBlocked = (item: TodoItem) =>
    !!(
      item.prerequisites &&
      item.prerequisites.length > 0 &&
      !item.prerequisites.every((p) => checkedIds.has(p))
    );

  const total = section.items.length;
  const done = section.items.filter((i) => checkedIds.has(i.id)).length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <section id={section.id} className="space-y-6 scroll-mt-24">
      <header className="z-card">
        <h2 className="z-h2">{section.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-zillow-slate">{section.context}</p>
        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1 h-2 overflow-hidden rounded-full bg-zillow-gray-light">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="text-sm font-semibold text-zillow-ink">
            {done}/{total} · {pct}%
          </div>
        </div>
      </header>

      {/* References */}
      {section.references && section.references.length > 0 && (
        <details className="z-card">
          <summary className="cursor-pointer text-sm font-semibold text-zillow-ink hover:text-zillow-blue">
            📇 References (people, channels, docs, URLs) — click to expand
          </summary>
          <div className="mt-4 space-y-4">
            {section.references.map((r) => (
              <div key={r.category}>
                <div className="text-xs font-semibold uppercase tracking-wider text-zillow-slate">
                  {r.category}
                </div>
                <ul className="mt-2 space-y-2 text-sm">
                  {r.items.map((it) => (
                    <li
                      key={it.label}
                      className="rounded-md border border-zillow-gray-border bg-white px-3 py-2"
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="font-semibold text-zillow-ink">{it.label}</span>
                        {it.href && (
                          <a
                            href={it.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="z-link text-xs"
                          >
                            Open ↗
                          </a>
                        )}
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-zillow-slate">{it.detail}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </details>
      )}

      {/* Copy-paste block */}
      {section.copyBlock && (
        <CopyBlock title={section.copyBlock.title} body={section.copyBlock.body} />
      )}

      {/* Items */}
      <div>
        <h3 className="z-h3 mb-3">Action items — top to bottom</h3>
        <ul className="space-y-2">
          {section.items.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              checked={!!state.checked[item.id]}
              onToggle={() =>
                setState((s) => ({
                  ...s,
                  checked: { ...s.checked, [item.id]: !s.checked[item.id] },
                }))
              }
              note={state.notes[item.id] ?? ""}
              onNoteChange={(n) =>
                setState((s) => ({ ...s, notes: { ...s.notes, [item.id]: n } }))
              }
              blocked={isBlocked(item)}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}

export default function TodoPage() {
  const [state, setState] = useState<UserState>({ checked: {}, notes: {} });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveState(state);
  }, [state, hydrated]);

  const stats = useMemo(() => {
    let total = 0;
    let done = 0;
    let doNow = 0;
    let doNowDone = 0;
    for (const s of TODO_SECTIONS) {
      for (const i of s.items) {
        total++;
        if (state.checked[i.id]) done++;
        if (i.doNow) {
          doNow++;
          if (state.checked[i.id]) doNowDone++;
        }
      }
    }
    return { total, done, doNow, doNowDone };
  }, [state]);

  return (
    <div className="space-y-10">
      <header>
        <p className="z-eyebrow">Active to-do</p>
        <h1 className="z-h1 mt-2">What to do, right now</h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-zillow-slate">
          Sequenced action items grouped by topic. Each item has an estimate, prerequisites,
          and reference links. Check items off as you complete them — state saves to your
          browser only. Items marked &ldquo;DO NOW&rdquo; are this-session actions. Items
          with prerequisites lock until their prereqs are checked.
        </p>
      </header>

      {/* Stats strip */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="z-card">
          <div className="text-xs uppercase tracking-wider text-zillow-slate">Total items</div>
          <div className="mt-1 text-3xl font-bold text-zillow-ink">{stats.total}</div>
        </div>
        <div className="z-card">
          <div className="text-xs uppercase tracking-wider text-emerald-700">Done</div>
          <div className="mt-1 text-3xl font-bold text-emerald-700">
            {stats.done}
            <span className="text-base font-normal text-zillow-slate">/{stats.total}</span>
          </div>
        </div>
        <div className="z-card">
          <div className="text-xs uppercase tracking-wider text-zillow-red">DO NOW</div>
          <div className="mt-1 text-3xl font-bold text-zillow-red">
            {stats.doNow - stats.doNowDone}
            <span className="text-base font-normal text-zillow-slate">/{stats.doNow}</span>
          </div>
        </div>
        <div className="z-card">
          <div className="text-xs uppercase tracking-wider text-zillow-blue">Sections</div>
          <div className="mt-1 text-3xl font-bold text-zillow-blue">{TODO_SECTIONS.length}</div>
        </div>
      </section>

      {/* Section nav (if more than one) */}
      {TODO_SECTIONS.length > 1 && (
        <nav className="z-card">
          <div className="text-xs font-semibold uppercase tracking-wider text-zillow-slate mb-2">
            Sections
          </div>
          <div className="flex flex-wrap gap-2">
            {TODO_SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="rounded-md bg-zillow-blue-light px-3 py-1 text-xs font-medium text-zillow-blue hover:bg-zillow-blue hover:text-white"
              >
                {s.title}
              </a>
            ))}
          </div>
        </nav>
      )}

      {/* Sections */}
      {TODO_SECTIONS.map((s) => (
        <SectionCard key={s.id} section={s} state={state} setState={setState} />
      ))}

      <section className="text-xs text-zillow-slate border-t border-zillow-gray-border pt-4">
        Related:{" "}
        <Link href="/splunk" className="z-link">
          Splunk runbook + memory-leak
        </Link>{" "}
        ·{" "}
        <Link href="/jira" className="z-link">
          Jira board
        </Link>{" "}
        ·{" "}
        <Link href="/triage" className="z-link">
          Triage (all P0 first)
        </Link>{" "}
        ·{" "}
        <Link href="/one-on-one" className="z-link">
          1:1 cheat sheet
        </Link>
      </section>

      <p className="text-xs text-zillow-slate">
        State saved locally on this device. Reset by clearing browser storage for this site.
      </p>
    </div>
  );
}
