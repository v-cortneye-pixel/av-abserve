"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ISSUES,
  STEP_DETAILS,
  type Issue,
  type IssueCategory,
  type IssueStatus,
  type Severity,
} from "@/lib/data";

const STORAGE_KEY = "av-tracker-progress-v1";

const SEVERITY_OPTIONS: Severity[] = ["P0", "P1", "P2", "P3"];
const CATEGORY_OPTIONS: IssueCategory[] = [
  "HDMI",
  "Mac",
  "Zoom",
  "Audio",
  "Hardware",
  "Process",
  "UI",
  "Network",
  "Other",
];
const STATUS_OPTIONS: IssueStatus[] = ["Open", "Workaround", "In Progress", "Resolved"];

const SEVERITY_STYLE: Record<Severity, string> = {
  P0: "bg-red-50 text-zillow-red ring-1 ring-inset ring-red-200",
  P1: "bg-orange-50 text-zillow-orange ring-1 ring-inset ring-orange-200",
  P2: "bg-yellow-50 text-yellow-800 ring-1 ring-inset ring-yellow-200",
  P3: "bg-blue-50 text-zillow-blue ring-1 ring-inset ring-blue-200",
};

const STATUS_STYLE: Record<IssueStatus, string> = {
  Open: "bg-red-50 text-zillow-red ring-1 ring-inset ring-red-200",
  Workaround: "bg-yellow-50 text-yellow-800 ring-1 ring-inset ring-yellow-200",
  "In Progress": "bg-blue-50 text-zillow-blue ring-1 ring-inset ring-blue-200",
  Resolved: "bg-green-50 text-zillow-green ring-1 ring-inset ring-green-200",
};

type SortKey = "severity" | "category" | "status" | "progress" | "title";
type SortDir = "asc" | "desc";
const SEVERITY_RANK: Record<Severity, number> = { P0: 0, P1: 1, P2: 2, P3: 3 };
const STATUS_RANK: Record<IssueStatus, number> = {
  Open: 0,
  "In Progress": 1,
  Workaround: 2,
  Resolved: 3,
};

type CheckedMap = Record<string, Record<number, boolean>>;

function loadProgress(): CheckedMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CheckedMap) : {};
  } catch {
    return {};
  }
}

function saveProgress(state: CheckedMap) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

function issueProgress(issue: Issue, checked: CheckedMap) {
  const total = issue.steps.length;
  if (total === 0) return { done: 0, total: 0, pct: 0 };
  const map = checked[issue.id] ?? {};
  const done = Object.values(map).filter(Boolean).length;
  return { done, total, pct: Math.round((done / total) * 100) };
}

export default function TrackerPage() {
  const [checked, setChecked] = useState<CheckedMap>({});
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState<Set<Severity>>(new Set());
  const [categoryFilter, setCategoryFilter] = useState<Set<IssueCategory>>(new Set());
  const [statusFilter, setStatusFilter] = useState<Set<IssueStatus>>(new Set());
  const [sortKey, setSortKey] = useState<SortKey>("severity");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setChecked(loadProgress());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveProgress(checked);
  }, [checked, hydrated]);

  const toggleStep = (issueId: string, stepIdx: number) => {
    setChecked((prev) => {
      const issueMap = { ...(prev[issueId] ?? {}) };
      issueMap[stepIdx] = !issueMap[stepIdx];
      return { ...prev, [issueId]: issueMap };
    });
  };

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => setExpanded(new Set(ISSUES.map((i) => i.id)));
  const collapseAll = () => setExpanded(new Set());

  const resetProgress = () => {
    if (
      typeof window !== "undefined" &&
      window.confirm("Reset all checklist progress? This cannot be undone.")
    ) {
      setChecked({});
    }
  };

  const toggleSetFilter = <T,>(set: Set<T>, value: T, setter: (s: Set<T>) => void) => {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    setter(next);
  };

  const filteredIssues = useMemo(() => {
    const lc = search.trim().toLowerCase();
    return ISSUES.filter((i) => {
      if (severityFilter.size > 0 && !severityFilter.has(i.severity)) return false;
      if (categoryFilter.size > 0 && !categoryFilter.has(i.category)) return false;
      if (statusFilter.size > 0 && !statusFilter.has(i.status)) return false;
      if (!lc) return true;
      return (
        i.title.toLowerCase().includes(lc) ||
        i.summary.toLowerCase().includes(lc) ||
        i.rooms.some((r) => r.toLowerCase().includes(lc)) ||
        i.owner.toLowerCase().includes(lc)
      );
    });
  }, [search, severityFilter, categoryFilter, statusFilter]);

  const sortedIssues = useMemo(() => {
    const arr = [...filteredIssues];
    arr.sort((a, b) => {
      let av: number | string = 0;
      let bv: number | string = 0;
      if (sortKey === "severity") {
        av = SEVERITY_RANK[a.severity];
        bv = SEVERITY_RANK[b.severity];
      } else if (sortKey === "status") {
        av = STATUS_RANK[a.status];
        bv = STATUS_RANK[b.status];
      } else if (sortKey === "category") {
        av = a.category;
        bv = b.category;
      } else if (sortKey === "title") {
        av = a.title;
        bv = b.title;
      } else if (sortKey === "progress") {
        av = issueProgress(a, checked).pct;
        bv = issueProgress(b, checked).pct;
      }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [filteredIssues, sortKey, sortDir, checked]);

  const overall = useMemo(() => {
    const totals = ISSUES.reduce(
      (acc, i) => {
        const p = issueProgress(i, checked);
        acc.done += p.done;
        acc.total += p.total;
        return acc;
      },
      { done: 0, total: 0 },
    );
    return {
      ...totals,
      pct: totals.total === 0 ? 0 : Math.round((totals.done / totals.total) * 100),
    };
  }, [checked]);

  const exportCSV = () => {
    const rows: string[] = [
      ["Issue ID", "Title", "Severity", "Category", "Status", "Step", "Done"]
        .map((c) => `"${c}"`)
        .join(","),
    ];
    for (const i of ISSUES) {
      const map = checked[i.id] ?? {};
      i.steps.forEach((s, idx) => {
        rows.push(
          [i.id, i.title, i.severity, i.category, i.status, s, map[idx] ? "Yes" : "No"]
            .map((c) => `"${String(c).replace(/"/g, '""')}"`)
            .join(","),
        );
      });
    }
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `av-tracker-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const headerSort = (key: SortKey) => () => {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <p className="z-eyebrow">Interactive tracker</p>
        <h1 className="z-h1 mt-2">Issues spreadsheet · live checklist</h1>
        <p className="mt-3 max-w-3xl text-base text-zillow-slate">
          Sortable, filterable view of every issue with step-by-step checklists. Progress saves
          automatically to your browser&apos;s local storage. Export to CSV when you need to share.
        </p>
      </header>

      {/* Overall progress */}
      <section className="z-card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="z-eyebrow">Overall progress</div>
            <div className="mt-1 text-3xl font-bold text-zillow-ink">
              {overall.done} / {overall.total}{" "}
              <span className="text-base font-normal text-zillow-slate">steps complete</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-zillow-blue">{overall.pct}%</div>
          </div>
        </div>
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-zillow-gray-light">
          <div
            className="h-full rounded-full bg-zillow-blue transition-all"
            style={{ width: `${overall.pct}%` }}
          />
        </div>
      </section>

      {/* Toolbar */}
      <section className="z-card space-y-5">
        {/* Search + global actions */}
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Search title, room, owner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[200px] rounded-lg border border-zillow-gray-border bg-white px-4 py-2 text-sm text-zillow-ink placeholder:text-zillow-gray focus:border-zillow-blue focus:outline-none focus:ring-2 focus:ring-zillow-blue-light"
          />
          <button onClick={expandAll} className="z-btn-secondary">
            Expand all
          </button>
          <button onClick={collapseAll} className="z-btn-secondary">
            Collapse all
          </button>
          <button onClick={exportCSV} className="z-btn-secondary">
            Export CSV
          </button>
          <button
            onClick={resetProgress}
            className="z-btn-secondary !border-red-200 !text-zillow-red hover:!bg-red-50"
          >
            Reset progress
          </button>
        </div>

        {/* Filter chips */}
        <div className="space-y-3">
          <FilterRow
            label="Severity"
            options={SEVERITY_OPTIONS}
            selected={severityFilter}
            onToggle={(v) => toggleSetFilter(severityFilter, v, setSeverityFilter)}
            styleMap={SEVERITY_STYLE}
          />
          <FilterRow
            label="Category"
            options={CATEGORY_OPTIONS}
            selected={categoryFilter}
            onToggle={(v) => toggleSetFilter(categoryFilter, v, setCategoryFilter)}
          />
          <FilterRow
            label="Status"
            options={STATUS_OPTIONS}
            selected={statusFilter}
            onToggle={(v) => toggleSetFilter(statusFilter, v, setStatusFilter)}
            styleMap={STATUS_STYLE}
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs text-zillow-slate">
          <span>
            Showing <span className="font-semibold text-zillow-ink">{sortedIssues.length}</span> of{" "}
            {ISSUES.length} issues
          </span>
          {(severityFilter.size > 0 ||
            categoryFilter.size > 0 ||
            statusFilter.size > 0 ||
            search) && (
            <button
              onClick={() => {
                setSearch("");
                setSeverityFilter(new Set());
                setCategoryFilter(new Set());
                setStatusFilter(new Set());
              }}
              className="z-link"
            >
              Clear all filters
            </button>
          )}
        </div>
      </section>

      {/* Table */}
      <section className="overflow-x-auto rounded-xl border border-zillow-gray-border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-zillow-gray-border bg-zillow-gray-light text-left">
            <tr>
              <th className="w-10 px-3 py-3"></th>
              <SortHeader
                label="Issue"
                active={sortKey === "title"}
                dir={sortDir}
                onClick={headerSort("title")}
              />
              <SortHeader
                label="Severity"
                active={sortKey === "severity"}
                dir={sortDir}
                onClick={headerSort("severity")}
              />
              <SortHeader
                label="Category"
                active={sortKey === "category"}
                dir={sortDir}
                onClick={headerSort("category")}
              />
              <SortHeader
                label="Status"
                active={sortKey === "status"}
                dir={sortDir}
                onClick={headerSort("status")}
              />
              <th className="px-3 py-3 font-semibold text-zillow-ink">Rooms</th>
              <SortHeader
                label="Progress"
                active={sortKey === "progress"}
                dir={sortDir}
                onClick={headerSort("progress")}
                className="w-44"
              />
            </tr>
          </thead>
          <tbody className="divide-y divide-zillow-gray-border">
            {sortedIssues.map((issue) => {
              const isOpen = expanded.has(issue.id);
              const p = issueProgress(issue, checked);
              return (
                <Fragment key={issue.id}>
                  <tr
                    className="cursor-pointer hover:bg-zillow-blue-light/40"
                    onClick={() => toggleExpand(issue.id)}
                  >
                    <td className="px-3 py-3 text-center">
                      <span className="inline-block text-zillow-slate transition-transform">
                        {isOpen ? "▼" : "▶"}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="font-medium text-zillow-ink">{issue.title}</div>
                      <div className="mt-0.5 text-xs text-zillow-slate">Owner: {issue.owner}</div>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`z-chip ${SEVERITY_STYLE[issue.severity]}`}>
                        {issue.severity}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="z-chip bg-zillow-blue-light text-zillow-blue">
                        {issue.category}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`z-chip ${STATUS_STYLE[issue.status]}`}>{issue.status}</span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-1">
                        {issue.rooms.slice(0, 2).map((r) => (
                          <span
                            key={r}
                            className="rounded bg-zillow-gray-light px-1.5 py-0.5 text-xs font-medium text-zillow-slate"
                          >
                            {r}
                          </span>
                        ))}
                        {issue.rooms.length > 2 && (
                          <span className="rounded bg-zillow-gray-light px-1.5 py-0.5 text-xs font-medium text-zillow-slate">
                            +{issue.rooms.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-zillow-gray-light">
                            <div
                              className="h-full rounded-full bg-zillow-blue transition-all"
                              style={{ width: `${p.pct}%` }}
                            />
                          </div>
                        </div>
                        <span className="shrink-0 font-mono text-xs text-zillow-slate">
                          {p.done}/{p.total}
                        </span>
                      </div>
                    </td>
                  </tr>
                  {isOpen && (
                    <tr className="bg-zillow-gray-light/50">
                      <td colSpan={7} className="px-6 py-5">
                        <div className="grid gap-6 md:grid-cols-3">
                          <div className="md:col-span-2">
                            <div className="z-eyebrow">Action steps</div>
                            <ul className="mt-3 space-y-2">
                              {issue.steps.map((step, idx) => {
                                const done = (checked[issue.id] ?? {})[idx];
                                const detail = STEP_DETAILS[`${issue.id}::${idx}`];
                                return (
                                  <li
                                    key={idx}
                                    className="rounded-lg bg-white px-3 py-2.5 transition-colors hover:bg-zillow-blue-light/40"
                                  >
                                    <div className="flex items-start gap-3">
                                      <input
                                        id={`${issue.id}-${idx}`}
                                        type="checkbox"
                                        checked={!!done}
                                        onChange={() => toggleStep(issue.id, idx)}
                                        className="mt-1 h-4 w-4 shrink-0 rounded border-zillow-gray-border text-zillow-blue focus:ring-zillow-blue"
                                      />
                                      <label
                                        htmlFor={`${issue.id}-${idx}`}
                                        className={`flex-1 cursor-pointer text-sm font-medium leading-relaxed ${
                                          done
                                            ? "text-zillow-gray line-through"
                                            : "text-zillow-ink"
                                        }`}
                                      >
                                        {step}
                                      </label>
                                    </div>
                                    {detail && (
                                      <div className={`ml-7 mt-2 ${done ? "opacity-50" : ""}`}>
                                        <p className="text-xs leading-relaxed text-zillow-slate">
                                          {detail.summary}
                                        </p>
                                        {detail.links && detail.links.length > 0 && (
                                          <div className="mt-2 flex flex-wrap gap-1.5">
                                            {detail.links.map((l) => (
                                              <a
                                                key={l.href}
                                                href={l.href}
                                                target={
                                                  l.external || l.href.startsWith("http")
                                                    ? "_blank"
                                                    : undefined
                                                }
                                                rel={
                                                  l.external || l.href.startsWith("http")
                                                    ? "noopener noreferrer"
                                                    : undefined
                                                }
                                                onClick={(e) => e.stopPropagation()}
                                                className="inline-flex items-center gap-1 rounded-md bg-zillow-blue-light px-2 py-0.5 text-[11px] font-medium text-zillow-blue ring-1 ring-blue-200 hover:bg-zillow-blue hover:text-white"
                                              >
                                                {l.label}
                                                {(l.external ||
                                                  l.href.startsWith("http")) && (
                                                  <span aria-hidden>↗</span>
                                                )}
                                              </a>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <div className="z-eyebrow">Summary</div>
                              <p className="mt-2 text-sm leading-relaxed text-zillow-ink">
                                {issue.summary}
                              </p>
                            </div>
                            <div>
                              <div className="z-eyebrow">Cortney&apos;s focus</div>
                              <p className="mt-2 text-sm leading-relaxed text-zillow-ink">
                                {issue.cortneyAction}
                              </p>
                            </div>
                            <Link
                              href={`/issues/${issue.id}`}
                              className="z-link text-sm"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Full issue detail with quotes →
                            </Link>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
            {sortedIssues.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-sm text-zillow-slate">
                  No issues match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <p className="text-xs text-zillow-slate">
        Progress is saved in your browser&apos;s local storage on this device. Use{" "}
        <span className="font-semibold">Export CSV</span> if you need to share state or move between
        devices.
      </p>
    </div>
  );
}

function FilterRow<T extends string>({
  label,
  options,
  selected,
  onToggle,
  styleMap,
}: {
  label: string;
  options: T[];
  selected: Set<T>;
  onToggle: (v: T) => void;
  styleMap?: Record<T, string>;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-20 shrink-0 text-xs font-semibold uppercase tracking-wide text-zillow-slate">
        {label}
      </span>
      {options.map((opt) => {
        const isSelected = selected.has(opt);
        const customStyle = styleMap?.[opt];
        return (
          <button
            key={opt}
            onClick={() => onToggle(opt)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
              isSelected
                ? customStyle ?? "bg-zillow-blue text-white"
                : "bg-zillow-gray-light text-zillow-slate hover:bg-zillow-blue-light hover:text-zillow-blue"
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function SortHeader({
  label,
  active,
  dir,
  onClick,
  className = "",
}: {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
  className?: string;
}) {
  return (
    <th className={`px-3 py-3 font-semibold text-zillow-ink ${className}`}>
      <button
        onClick={onClick}
        className="flex items-center gap-1 hover:text-zillow-blue"
        type="button"
      >
        {label}
        <span className={`text-xs ${active ? "text-zillow-blue" : "text-zillow-gray"}`}>
          {active ? (dir === "asc" ? "▲" : "▼") : "↕"}
        </span>
      </button>
    </th>
  );
}
