"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ISSUES,
  JIRA_TASKS,
  JIRA_PROJECTS,
  MEMORY_LEAK_REFACTOR,
  NEW_FINDINGS_FROM_CHANNELS,
  SPLUNK_WORKFLOW,
  UCI_ISSUES,
} from "@/lib/data";

type Severity = "P0" | "P1" | "P2" | "P3";

interface TriageItem {
  id: string;
  severity: Severity;
  title: string;
  summary: string;
  action?: string;
  source: string;
  sourceTag:
    | "Fleet issue"
    | "UCI issue"
    | "Channel comb"
    | "Memory leak"
    | "Splunk inherited"
    | "Jira ticket";
  link: string; // internal link to detail
  permalink?: string; // external Slack permalink if available
}

const SEV_STYLE: Record<Severity, string> = {
  P0: "bg-red-100 text-zillow-red ring-2 ring-zillow-red",
  P1: "bg-orange-50 text-zillow-orange ring-1 ring-zillow-orange",
  P2: "bg-yellow-50 text-yellow-800 ring-1 ring-yellow-300",
  P3: "bg-zillow-gray-light text-zillow-slate ring-1 ring-zillow-gray-border",
};

const SEV_ORDER: Severity[] = ["P0", "P1", "P2", "P3"];

const SOURCE_STYLE: Record<TriageItem["sourceTag"], string> = {
  "Fleet issue": "bg-zillow-blue-light text-zillow-blue",
  "UCI issue": "bg-purple-50 text-purple-700",
  "Channel comb": "bg-cyan-50 text-cyan-700",
  "Memory leak": "bg-red-50 text-zillow-red",
  "Splunk inherited": "bg-orange-50 text-zillow-orange",
  "Jira ticket": "bg-emerald-50 text-emerald-700",
};

function buildAllItems(): TriageItem[] {
  const items: TriageItem[] = [];

  // 1) ISSUES — 15 fleet issues
  for (const i of ISSUES) {
    items.push({
      id: `issue-${i.id}`,
      severity: i.severity as Severity,
      title: i.title,
      summary: i.summary,
      action: i.cortneyAction,
      source: `Issue · ${i.category} · ${i.status}`,
      sourceTag: "Fleet issue",
      link: `/issues/${i.id}`,
    });
  }

  // 2) UCI_ISSUES
  for (const u of UCI_ISSUES) {
    items.push({
      id: `uci-${u.id}`,
      severity: u.severity as Severity,
      title: `UCI: ${u.title}`,
      summary: u.description,
      action: u.resolution,
      source: `UCI · ${u.date}`,
      sourceTag: "UCI issue",
      link: `/uci#${u.id}`,
    });
  }

  // 3) NEW_FINDINGS_FROM_CHANNELS — the 6 from channel comb
  for (const f of NEW_FINDINGS_FROM_CHANNELS) {
    items.push({
      id: `nf-${f.id}`,
      severity: f.severity as Severity,
      title: f.title,
      summary: f.description,
      action: f.cortneyAction,
      source: f.source,
      sourceTag: "Channel comb",
      link: "/channels",
      permalink: f.sourcePermalink,
    });
  }

  // 4) MEMORY_LEAK inherited tasks
  for (const m of MEMORY_LEAK_REFACTOR.inheritedTasks) {
    items.push({
      id: `mem-${m.task.slice(0, 30)}`,
      severity: m.severity as Severity,
      title: `Memory leak: ${m.task}`,
      summary: m.reason,
      source: "Memory-leak refactor (Patrick legacy)",
      sourceTag: "Memory leak",
      link: "/splunk#memory-leak",
    });
  }

  // 5) SPLUNK inherited work
  for (const s of SPLUNK_WORKFLOW.inheritedWork) {
    items.push({
      id: `splunk-${s.title.slice(0, 30)}`,
      severity: s.severity as Severity,
      title: `Splunk: ${s.title}`,
      summary: s.reason,
      source: "Splunk pipeline inheritance",
      sourceTag: "Splunk inherited",
      link: "/splunk",
    });
  }

  // 6) JIRA_TASKS — all 39
  const projMap = new Map(JIRA_PROJECTS.map((p) => [p.id, p]));
  for (const t of JIRA_TASKS) {
    const proj = projMap.get(t.projectId);
    items.push({
      id: `jira-${t.id}`,
      severity: t.priority as Severity,
      title: `${t.id} — ${t.title}`,
      summary: t.description,
      source: `Jira · ${proj?.name ?? t.projectId} · ${t.status}`,
      sourceTag: "Jira ticket",
      link: `/jira#${t.projectId}`,
    });
  }

  return items;
}

const ALL_SOURCE_TAGS: TriageItem["sourceTag"][] = [
  "Fleet issue",
  "UCI issue",
  "Channel comb",
  "Memory leak",
  "Splunk inherited",
  "Jira ticket",
];

export default function TriagePage() {
  const allItems = useMemo(() => buildAllItems(), []);
  const [activeSeverities, setActiveSeverities] = useState<Set<Severity>>(
    new Set(SEV_ORDER),
  );
  const [activeSources, setActiveSources] = useState<Set<TriageItem["sourceTag"]>>(
    new Set(ALL_SOURCE_TAGS),
  );
  const [search, setSearch] = useState("");

  const toggleSev = (s: Severity) => {
    setActiveSeverities((set) => {
      const next = new Set(set);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
  };

  const toggleSrc = (s: TriageItem["sourceTag"]) => {
    setActiveSources((set) => {
      const next = new Set(set);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allItems.filter((i) => {
      if (!activeSeverities.has(i.severity)) return false;
      if (!activeSources.has(i.sourceTag)) return false;
      if (q && !`${i.title} ${i.summary}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [allItems, activeSeverities, activeSources, search]);

  // Group by severity in P0-first order
  const grouped = useMemo(() => {
    const map = new Map<Severity, TriageItem[]>();
    for (const s of SEV_ORDER) map.set(s, []);
    for (const i of filtered) map.get(i.severity)?.push(i);
    return map;
  }, [filtered]);

  const stats = useMemo(() => {
    const byS: Record<Severity, number> = { P0: 0, P1: 0, P2: 0, P3: 0 };
    for (const i of allItems) byS[i.severity]++;
    return byS;
  }, [allItems]);

  return (
    <div className="space-y-8">
      <header>
        <p className="z-eyebrow">Triage view</p>
        <h1 className="z-h1 mt-2">All issues, sorted P0 first</h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-zillow-slate">
          Every severity-tagged item across the entire workspace — fleet issues, UCI
          problems, channel comb findings, memory-leak tasks, Splunk inherited work, and Jira
          tickets — merged into one list. Sorted strictly by severity, P0 (everything-on-fire)
          first, P3 (nice-to-have) last. Filter by source if you only want to see one slice.
        </p>
      </header>

      {/* TOP STATS */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {SEV_ORDER.map((s) => (
          <div key={s} className={`rounded-lg p-4 ${SEV_STYLE[s]}`}>
            <div className="text-3xl font-bold">{stats[s]}</div>
            <div className="text-xs font-semibold uppercase tracking-wider">{s}</div>
          </div>
        ))}
      </section>

      {/* FILTERS */}
      <section className="z-card space-y-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search title or summary…"
          className="w-full rounded-lg border border-zillow-gray-border px-3 py-2 text-sm focus:border-zillow-blue focus:outline-none"
        />

        <div className="flex flex-wrap items-center gap-2">
          <span className="w-20 shrink-0 text-xs font-semibold uppercase tracking-wide text-zillow-slate">
            Severity
          </span>
          {SEV_ORDER.map((s) => (
            <button
              key={s}
              onClick={() => toggleSev(s)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                activeSeverities.has(s)
                  ? SEV_STYLE[s]
                  : "bg-white text-zillow-slate ring-1 ring-zillow-gray-border"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="w-20 shrink-0 text-xs font-semibold uppercase tracking-wide text-zillow-slate">
            Source
          </span>
          {ALL_SOURCE_TAGS.map((s) => (
            <button
              key={s}
              onClick={() => toggleSrc(s)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                activeSources.has(s)
                  ? SOURCE_STYLE[s] + " ring-1 ring-current"
                  : "bg-white text-zillow-slate ring-1 ring-zillow-gray-border"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="text-xs text-zillow-slate">
          Showing <strong className="text-zillow-ink">{filtered.length}</strong> of{" "}
          {allItems.length} items.
        </div>
      </section>

      {/* GROUPED RESULTS */}
      <section className="space-y-10">
        {SEV_ORDER.map((sev) => {
          const items = grouped.get(sev) ?? [];
          if (items.length === 0) return null;
          return (
            <div key={sev}>
              <div className="mb-4 flex items-baseline justify-between">
                <h2 className="z-h2">
                  <span className={`z-chip text-base ${SEV_STYLE[sev]}`}>{sev}</span>
                  <span className="ml-3 text-zillow-slate text-base font-normal">
                    {items.length} item{items.length === 1 ? "" : "s"}
                  </span>
                </h2>
              </div>
              <div className="space-y-3">
                {items.map((i) => (
                  <article key={i.id} className="z-card">
                    <div className="flex flex-wrap items-baseline justify-between gap-3">
                      <h3 className="text-base font-semibold text-zillow-ink">{i.title}</h3>
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-semibold ${SOURCE_STYLE[i.sourceTag]}`}
                        >
                          {i.sourceTag}
                        </span>
                        <span className={`z-chip ${SEV_STYLE[i.severity]}`}>{i.severity}</span>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-zillow-slate">{i.source}</p>
                    <p className="mt-3 text-sm leading-relaxed text-zillow-ink">{i.summary}</p>
                    {i.action && (
                      <div className="mt-3 rounded-md bg-zillow-blue-light px-3 py-2 text-xs leading-relaxed text-zillow-ink">
                        <span className="font-semibold text-zillow-blue">Action: </span>
                        {i.action}
                      </div>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      <Link
                        href={i.link}
                        className="z-link inline-flex items-center gap-1 font-medium"
                      >
                        Open detail →
                      </Link>
                      {i.permalink && (
                        <a
                          href={i.permalink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="z-link inline-flex items-center gap-1"
                        >
                          View in Slack ↗
                        </a>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="z-card text-center text-sm text-zillow-slate">
            No items match the current filter. Re-enable a severity or source.
          </div>
        )}
      </section>

      <section className="text-xs text-zillow-slate border-t border-zillow-gray-border pt-4">
        Related:{" "}
        <Link href="/issues" className="z-link">
          Issues (detail pages)
        </Link>{" "}
        ·{" "}
        <Link href="/jira" className="z-link">
          Jira board (project view)
        </Link>{" "}
        ·{" "}
        <Link href="/tracker" className="z-link">
          Interactive tracker
        </Link>{" "}
        ·{" "}
        <Link href="/channels" className="z-link">
          Channels &amp; contacts
        </Link>
      </section>
    </div>
  );
}
