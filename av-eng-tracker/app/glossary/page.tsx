"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { GLOSSARY, type GlossaryTerm } from "@/lib/data";

const CATEGORIES: GlossaryTerm["category"][] = [
  "Finance",
  "AV hardware",
  "AV software",
  "Audio",
  "Video",
  "Network",
  "Process",
];

const CAT_STYLE: Record<GlossaryTerm["category"], string> = {
  Finance: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  "AV hardware": "bg-zillow-blue-light text-zillow-blue ring-1 ring-inset ring-blue-200",
  "AV software": "bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-200",
  Audio: "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200",
  Video: "bg-pink-50 text-pink-700 ring-1 ring-inset ring-pink-200",
  Network: "bg-cyan-50 text-cyan-700 ring-1 ring-inset ring-cyan-200",
  Process: "bg-zillow-gray-light text-zillow-slate ring-1 ring-inset ring-zillow-gray-border",
};

export default function GlossaryPage() {
  const [q, setQ] = useState("");
  const [active, setActive] = useState<Set<GlossaryTerm["category"]>>(new Set(CATEGORIES));

  const sorted = useMemo(
    () => [...GLOSSARY].sort((a, b) => a.term.localeCompare(b.term)),
    [],
  );

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return sorted.filter((t) => {
      if (!active.has(t.category)) return false;
      if (!needle) return true;
      return (
        t.term.toLowerCase().includes(needle) ||
        t.short.toLowerCase().includes(needle) ||
        t.long.toLowerCase().includes(needle)
      );
    });
  }, [q, active, sorted]);

  const toggle = (c: GlossaryTerm["category"]) => {
    const next = new Set(active);
    if (next.has(c)) next.delete(c);
    else next.add(c);
    setActive(next);
  };

  return (
    <div className="space-y-10">
      <header>
        <p className="z-eyebrow">Reference</p>
        <h1 className="z-h1 mt-2">Glossary — every term Cortney might get asked mid-meeting</h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-zillow-slate">
          Finance, hardware, software, audio, video, network, and process. Every term that
          shows up in #av-team or anywhere in this site. So you can pull up a definition on
          your phone mid-conversation without ever saying &ldquo;wait, what&apos;s CapEx?&rdquo;
        </p>
      </header>

      <section className="z-card sticky top-20 z-30">
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search term, definition, or why-it-matters…"
            className="flex-1 min-w-[240px] rounded-md border border-zillow-gray-border px-3 py-2 text-sm focus:border-zillow-blue focus:outline-none"
          />
          <div className="text-xs text-zillow-slate">
            {filtered.length} / {GLOSSARY.length}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => toggle(c)}
              className={`z-chip cursor-pointer ${
                active.has(c)
                  ? CAT_STYLE[c]
                  : "bg-white text-zillow-slate ring-1 ring-inset ring-zillow-gray-border"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        {filtered.map((t) => (
          <article
            id={t.term.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}
            key={t.term}
            className="z-card scroll-mt-24"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-lg font-bold text-zillow-ink">{t.term}</h2>
              <span className={`z-chip ${CAT_STYLE[t.category]}`}>{t.category}</span>
            </div>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-zillow-ink">{t.short}</p>
            <p className="mt-2 text-sm leading-relaxed text-zillow-slate">{t.long}</p>
            {t.whyItMattersToCortney && (
              <div className="mt-3 rounded-md border-l-4 border-zillow-blue bg-zillow-blue-light px-3 py-2 text-xs leading-relaxed text-zillow-ink">
                <span className="font-semibold text-zillow-blue">
                  Why it matters to Cortney:{" "}
                </span>
                {t.whyItMattersToCortney}
              </div>
            )}
          </article>
        ))}
        {filtered.length === 0 && (
          <div className="z-card text-center text-sm text-zillow-slate">
            No terms match. Try clearing the search or re-enabling a category.
          </div>
        )}
      </section>

      <section className="text-sm text-zillow-slate">
        Related:{" "}
        <Link href="/hdmi#lab-proposal" className="z-link">
          HDMI lab proposal (where the CapEx framing lands)
        </Link>{" "}
        ·{" "}
        <Link href="/quick-wins" className="z-link">
          Quick wins
        </Link>{" "}
        ·{" "}
        <Link href="/splunk" className="z-link">
          Splunk runbook
        </Link>
      </section>
    </div>
  );
}
