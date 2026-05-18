"use client";

import Link from "next/link";
import { Fragment, useEffect, useMemo, useState } from "react";
import {
  JIRA_PROJECTS,
  JIRA_STATS,
  JIRA_TASKS,
  JIRA_TICKET_TEMPLATE,
  type JiraStatus,
  type JiraTask,
} from "@/lib/data";

const STORAGE_KEY = "av-jira-state-v1";

const STATUS_ORDER: JiraStatus[] = ["Backlog", "Ready", "In Progress", "In Review", "Done"];
const PRIORITIES = ["P0", "P1", "P2", "P3"] as const;

const STATUS_STYLE: Record<JiraStatus, string> = {
  Backlog: "bg-zillow-gray-light text-zillow-slate ring-1 ring-inset ring-zillow-gray-border",
  Ready: "bg-blue-50 text-zillow-blue ring-1 ring-inset ring-blue-200",
  "In Progress": "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200",
  "In Review": "bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-200",
  Done: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
};

const PRIORITY_STYLE: Record<string, string> = {
  P0: "bg-red-50 text-zillow-red ring-1 ring-inset ring-red-200",
  P1: "bg-orange-50 text-zillow-orange ring-1 ring-inset ring-orange-200",
  P2: "bg-yellow-50 text-yellow-800 ring-1 ring-inset ring-yellow-200",
  P3: "bg-zillow-gray-light text-zillow-slate ring-1 ring-inset ring-zillow-gray-border",
};

const SOURCE_KIND_STYLE: Record<string, string> = {
  "Site issue": "bg-zillow-blue-light text-zillow-blue ring-blue-200",
  "Site page": "bg-zillow-blue-light text-zillow-blue ring-blue-200",
  "Quick Win": "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Slack: "bg-purple-50 text-purple-700 ring-purple-200",
  "Google Doc": "bg-amber-50 text-amber-800 ring-amber-200",
  GitLab: "bg-rose-50 text-rose-700 ring-rose-200",
  Vendor: "bg-cyan-50 text-cyan-700 ring-cyan-200",
  "Splunk dashboard": "bg-orange-50 text-zillow-orange ring-orange-200",
};

interface UserState {
  status: Record<string, JiraStatus>; // overrides
}

function loadState(): UserState {
  if (typeof window === "undefined") return { status: {} };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as UserState) : { status: {} };
  } catch {
    return { status: {} };
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

export default function JiraPage() {
  const [state, setState] = useState<UserState>({ status: {} });
  const [hydrated, setHydrated] = useState(false);
  const [search, setSearch] = useState("");
  const [activeProjects, setActiveProjects] = useState<Set<string>>(
    new Set(JIRA_PROJECTS.map((p) => p.id)),
  );
  const [activeStatuses, setActiveStatuses] = useState<Set<JiraStatus>>(
    new Set(STATUS_ORDER),
  );
  const [activePriorities, setActivePriorities] = useState<Set<string>>(new Set(PRIORITIES));
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveState(state);
  }, [state, hydrated]);

  const taskStatus = (t: JiraTask): JiraStatus => state.status[t.id] ?? t.status;

  const setTaskStatus = (id: string, status: JiraStatus) => {
    setState((s) => ({ ...s, status: { ...s.status, [id]: status } }));
  };

  const toggleProject = (id: string) => {
    setActiveProjects((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleStatus = (s: JiraStatus) => {
    setActiveStatuses((set) => {
      const next = new Set(set);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
  };

  const togglePriority = (p: string) => {
    setActivePriorities((set) => {
      const next = new Set(set);
      if (next.has(p)) next.delete(p);
      else next.add(p);
      return next;
    });
  };

  const toggleExpand = (id: string) => {
    setExpanded((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return JIRA_TASKS.filter((t) => {
      if (!activeProjects.has(t.projectId)) return false;
      if (!activeStatuses.has(taskStatus(t))) return false;
      if (!activePriorities.has(t.priority)) return false;
      if (q) {
        const blob = `${t.id} ${t.title} ${t.description}`.toLowerCase();
        if (!blob.includes(q)) return false;
      }
      return true;
    });
  }, [search, activeProjects, activeStatuses, activePriorities, state]);

  const stats = useMemo(() => {
    const byStatus: Record<JiraStatus, number> = {
      Backlog: 0,
      Ready: 0,
      "In Progress": 0,
      "In Review": 0,
      Done: 0,
    };
    for (const t of filtered) byStatus[taskStatus(t)]++;
    return byStatus;
  }, [filtered, state]);

  const projectMap = new Map(JIRA_PROJECTS.map((p) => [p.id, p]));

  const grouped = useMemo(() => {
    const map = new Map<string, JiraTask[]>();
    for (const t of filtered) {
      if (!map.has(t.projectId)) map.set(t.projectId, []);
      map.get(t.projectId)!.push(t);
    }
    return map;
  }, [filtered]);

  const exportCsv = () => {
    const rows: string[] = [
      ["ID", "Project", "Title", "Status", "Priority", "Estimate", "Assignee", "Description"]
        .map((c) => `"${c}"`)
        .join(","),
    ];
    for (const t of filtered) {
      const p = projectMap.get(t.projectId);
      rows.push(
        [
          t.id,
          p?.name ?? t.projectId,
          t.title,
          taskStatus(t),
          t.priority,
          t.estimate,
          t.assignee ?? "",
          t.description,
        ]
          .map((c) => `"${String(c).replace(/"/g, '""')}"`)
          .join(","),
      );
    }
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `av-jira-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-10">
      <header>
        <p className="z-eyebrow">Jira plan · {JIRA_STATS.total} tasks across {JIRA_PROJECTS.length} epics</p>
        <h1 className="z-h1 mt-2">Cortney&apos;s Jira project board</h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-zillow-slate">
          Every concrete task Cortney intends to create (or has created) on the WAVE Jira
          board, organized by epic. Each task links back to its source — the issue on this
          site, the Slack quote that birthed it, the QW# win it satisfies, or the
          internal page where the rationale lives. Status is saved to your browser; export
          to CSV to share or to bulk-import into Jira.
        </p>
      </header>

      {/* Stat strip */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {STATUS_ORDER.map((s) => (
          <div key={s} className="z-card">
            <div className="text-xs uppercase tracking-wider text-zillow-slate">{s}</div>
            <div className="mt-1 text-2xl font-bold text-zillow-ink">{stats[s]}</div>
          </div>
        ))}
      </section>

      {/* Toolbar */}
      <section className="z-card space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Search by ID, title, description…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[220px] rounded-lg border border-zillow-gray-border bg-white px-4 py-2 text-sm focus:border-zillow-blue focus:outline-none focus:ring-2 focus:ring-zillow-blue-light"
          />
          <button onClick={exportCsv} className="z-btn-secondary">
            Export CSV
          </button>
          <button
            onClick={() => setState({ status: {} })}
            className="z-btn-secondary !border-red-200 !text-zillow-red hover:!bg-red-50"
          >
            Reset status overrides
          </button>
        </div>

        {/* Status filter */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-20 shrink-0 text-xs font-semibold uppercase tracking-wide text-zillow-slate">
            Status
          </span>
          {STATUS_ORDER.map((s) => (
            <button
              key={s}
              onClick={() => toggleStatus(s)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                activeStatuses.has(s)
                  ? STATUS_STYLE[s]
                  : "bg-white text-zillow-slate ring-1 ring-inset ring-zillow-gray-border"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Priority filter */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-20 shrink-0 text-xs font-semibold uppercase tracking-wide text-zillow-slate">
            Priority
          </span>
          {PRIORITIES.map((p) => (
            <button
              key={p}
              onClick={() => togglePriority(p)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                activePriorities.has(p)
                  ? PRIORITY_STYLE[p]
                  : "bg-white text-zillow-slate ring-1 ring-inset ring-zillow-gray-border"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Project filter */}
        <div>
          <span className="text-xs font-semibold uppercase tracking-wide text-zillow-slate">
            Epics ({activeProjects.size}/{JIRA_PROJECTS.length})
          </span>
          <div className="mt-2 flex flex-wrap gap-2">
            {JIRA_PROJECTS.map((p) => (
              <button
                key={p.id}
                onClick={() => toggleProject(p.id)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  activeProjects.has(p.id)
                    ? "bg-zillow-blue text-white"
                    : "bg-white text-zillow-slate ring-1 ring-inset ring-zillow-gray-border hover:bg-zillow-gray-light"
                }`}
              >
                {p.code} · {p.name}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-zillow-slate">
          Showing <strong className="text-zillow-ink">{filtered.length}</strong> of {JIRA_TASKS.length} tasks.
        </div>
      </section>

      {/* Tasks grouped by project */}
      <section className="space-y-8">
        {JIRA_PROJECTS.filter((p) => grouped.has(p.id)).map((p) => {
          const tasks = grouped.get(p.id)!;
          return (
            <article key={p.id} id={p.id} className="space-y-3">
              <header className="z-card border-l-4 border-zillow-blue bg-zillow-blue-light">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <div>
                    <div className="z-eyebrow">{p.code}</div>
                    <h2 className="z-h2 mt-1">{p.name}</h2>
                  </div>
                  <span className="text-sm text-zillow-slate">
                    {tasks.length} task{tasks.length === 1 ? "" : "s"} · owner {p.owner}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-zillow-ink">{p.description}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-semibold text-zillow-slate">Stakeholders:</span>
                  {p.stakeholders.map((s) => (
                    <span
                      key={s}
                      className="rounded-md bg-white px-2 py-0.5 font-medium text-zillow-ink ring-1 ring-zillow-gray-border"
                    >
                      {s}
                    </span>
                  ))}
                </div>
                {p.fteSignal && (
                  <div className="mt-3 rounded-md bg-white px-3 py-2 text-xs leading-relaxed text-zillow-ink ring-1 ring-zillow-gray-border">
                    <span className="font-semibold text-zillow-blue">FTE signal: </span>
                    {p.fteSignal}
                  </div>
                )}
              </header>

              {tasks.map((t) => {
                const cur = taskStatus(t);
                const open = expanded.has(t.id);
                return (
                  <Fragment key={t.id}>
                    <div className="z-card">
                      <button
                        onClick={() => toggleExpand(t.id)}
                        className="flex w-full flex-wrap items-baseline justify-between gap-3 text-left"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-baseline gap-2">
                            <span className="font-mono text-xs text-zillow-slate">{t.id}</span>
                            <span className={`z-chip ${PRIORITY_STYLE[t.priority]}`}>
                              {t.priority}
                            </span>
                            <span className="rounded bg-zillow-gray-light px-2 py-0.5 text-[10px] font-mono text-zillow-slate">
                              {t.estimate}
                            </span>
                          </div>
                          <h3 className="mt-1 text-base font-semibold text-zillow-ink">
                            {t.title}
                          </h3>
                        </div>
                        <select
                          value={cur}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => setTaskStatus(t.id, e.target.value as JiraStatus)}
                          className={`rounded-md px-2 py-1 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-zillow-blue ${STATUS_STYLE[cur]}`}
                        >
                          {STATUS_ORDER.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </button>
                      {open && (
                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                          <div>
                            <div className="z-eyebrow">Description</div>
                            <p className="mt-2 text-sm leading-relaxed text-zillow-ink">
                              {t.description}
                            </p>
                            <div className="z-eyebrow mt-4">Acceptance criteria</div>
                            <ul className="mt-2 space-y-1 pl-5 text-xs leading-relaxed text-zillow-ink list-disc">
                              {t.acceptanceCriteria.map((c) => (
                                <li key={c}>{c}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <div className="z-eyebrow">Sources / context</div>
                            <ul className="mt-2 space-y-2">
                              {t.sources.map((s) => (
                                <li key={s.href}>
                                  <a
                                    href={s.href}
                                    target={s.href.startsWith("http") ? "_blank" : undefined}
                                    rel={
                                      s.href.startsWith("http") ? "noopener noreferrer" : undefined
                                    }
                                    className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium ring-1 ${
                                      SOURCE_KIND_STYLE[s.kind] ?? "ring-zillow-gray-border"
                                    }`}
                                  >
                                    <span className="font-mono text-[10px] uppercase">
                                      {s.kind}
                                    </span>
                                    <span>{s.label}</span>
                                    {s.href.startsWith("http") && <span aria-hidden>↗</span>}
                                  </a>
                                </li>
                              ))}
                            </ul>
                            <div className="z-eyebrow mt-4">Assignee</div>
                            <p className="mt-1 text-xs text-zillow-ink">{t.assignee ?? "—"}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </Fragment>
                );
              })}
            </article>
          );
        })}
        {filtered.length === 0 && (
          <div className="z-card text-center text-sm text-zillow-slate">
            No tasks match the current filter. Re-enable an epic, status, or priority.
          </div>
        )}
      </section>

      {/* Jira template snippet */}
      <section id="template" className="z-card bg-zillow-gray-light">
        <div className="z-eyebrow">Importing into Jira</div>
        <h2 className="z-h3 mt-2">Ticket-template field map for the WAVE board</h2>
        <p className="mt-2 text-sm leading-relaxed text-zillow-slate">
          {JIRA_TICKET_TEMPLATE.summary}
        </p>
        <div className="mt-4 overflow-x-auto rounded-xl border border-zillow-gray-border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-zillow-gray-light text-left">
              <tr>
                <th className="px-4 py-3 font-semibold text-zillow-ink">Jira field</th>
                <th className="px-4 py-3 font-semibold text-zillow-ink">Mapping from this site</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zillow-gray-border">
              {JIRA_TICKET_TEMPLATE.fields.map((f) => (
                <tr key={f.name}>
                  <td className="px-4 py-3 font-mono text-xs text-zillow-ink">{f.name}</td>
                  <td className="px-4 py-3 text-zillow-slate">{f.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="mt-4 list-disc space-y-1 pl-5 text-xs text-zillow-ink">
          {JIRA_TICKET_TEMPLATE.notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      </section>

      <section className="text-sm text-zillow-slate">
        Related:{" "}
        <Link href="/tracker" className="z-link">
          Issue tracker (per-step checklist)
        </Link>{" "}
        ·{" "}
        <Link href="/quick-wins" className="z-link">
          Quick wins (QW#)
        </Link>{" "}
        ·{" "}
        <Link href="/playbook" className="z-link">
          Playbook (FTE)
        </Link>{" "}
        ·{" "}
        <Link href="/glossary" className="z-link">
          Glossary
        </Link>
      </section>

      <p className="text-xs text-zillow-slate">
        Status overrides are saved in your browser&apos;s local storage on this device. Use{" "}
        <span className="font-semibold">Export CSV</span> to bulk-import into Jira or share state.
      </p>
    </div>
  );
}
