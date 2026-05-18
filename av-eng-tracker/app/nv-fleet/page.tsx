"use client";

import { useEffect, useMemo, useState } from "react";
import {
  NV_DEVICES,
  NV_KNOWN_ISSUES,
  NV_SPARES,
  type NvDevice,
  type NvHealth,
  type NvModel,
} from "@/lib/data";

const STORAGE_KEY = "av-nv-fleet-v1";

const HEALTH_STYLE: Record<NvHealth, string> = {
  Healthy: "bg-green-50 text-zillow-green ring-1 ring-inset ring-green-200",
  Watch: "bg-yellow-50 text-yellow-800 ring-1 ring-inset ring-yellow-200",
  Faulty: "bg-red-50 text-zillow-red ring-1 ring-inset ring-red-200",
  "RMA / Replaced": "bg-blue-50 text-zillow-blue ring-1 ring-inset ring-blue-200",
  Unknown: "bg-zillow-gray-light text-zillow-slate ring-1 ring-inset ring-zillow-gray-border",
};

const SEVERITY_STYLE: Record<string, string> = {
  P0: "bg-red-50 text-zillow-red ring-1 ring-inset ring-red-200",
  P1: "bg-orange-50 text-zillow-orange ring-1 ring-inset ring-orange-200",
  P2: "bg-yellow-50 text-yellow-800 ring-1 ring-inset ring-yellow-200",
};

interface DeviceOverride {
  health?: NvHealth;
  firmware?: string;
  serialNumber?: string;
  macAddress?: string;
  notes?: string;
}

interface IncidentEntry {
  id: string;
  deviceId: string;
  date: string;
  symptom: string;
  resolution: string;
  resolved: boolean;
}

interface PersistedState {
  deviceOverrides: Record<string, DeviceOverride>;
  incidents: IncidentEntry[];
}

function loadState(): PersistedState {
  if (typeof window === "undefined") return { deviceOverrides: {}, incidents: [] };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { deviceOverrides: {}, incidents: [] };
    const p = JSON.parse(raw) as PersistedState;
    return {
      deviceOverrides: p.deviceOverrides ?? {},
      incidents: p.incidents ?? [],
    };
  } catch {
    return { deviceOverrides: {}, incidents: [] };
  }
}

function saveState(state: PersistedState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export default function NvFleetPage() {
  const [state, setState] = useState<PersistedState>({ deviceOverrides: {}, incidents: [] });
  const [hydrated, setHydrated] = useState(false);

  // Filters
  const [siteFilter, setSiteFilter] = useState<Set<string>>(new Set());
  const [modelFilter, setModelFilter] = useState<Set<NvModel>>(new Set());
  const [healthFilter, setHealthFilter] = useState<Set<NvHealth>>(new Set());
  const [search, setSearch] = useState("");

  // New incident form
  const [newDeviceId, setNewDeviceId] = useState<string>("");
  const [newSymptom, setNewSymptom] = useState("");
  const [newResolution, setNewResolution] = useState("");

  // Expanded device rows
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveState(state);
  }, [state, hydrated]);

  const sites = useMemo(
    () => Array.from(new Set(NV_DEVICES.map((d) => d.site))).sort(),
    [],
  );
  const healthOptions: NvHealth[] = ["Healthy", "Watch", "Faulty", "RMA / Replaced", "Unknown"];

  const effectiveDevice = (d: NvDevice): NvDevice & DeviceOverride => {
    const o = state.deviceOverrides[d.id] ?? {};
    return { ...d, ...o };
  };

  const filteredDevices = useMemo(() => {
    const lc = search.trim().toLowerCase();
    return NV_DEVICES.map(effectiveDevice).filter((d) => {
      if (siteFilter.size > 0 && !siteFilter.has(d.site)) return false;
      if (modelFilter.size > 0 && !modelFilter.has(d.model)) return false;
      if (healthFilter.size > 0 && !healthFilter.has(d.health)) return false;
      if (!lc) return true;
      return (
        d.room.toLowerCase().includes(lc) ||
        d.notes.toLowerCase().includes(lc) ||
        (d.serialNumber ?? "").toLowerCase().includes(lc) ||
        (d.macAddress ?? "").toLowerCase().includes(lc)
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, siteFilter, modelFilter, healthFilter, state.deviceOverrides]);

  const counts = useMemo(() => {
    const total = NV_DEVICES.length;
    const byHealth = NV_DEVICES.reduce<Record<NvHealth, number>>(
      (acc, d) => {
        const e = effectiveDevice(d);
        acc[e.health] = (acc[e.health] ?? 0) + 1;
        return acc;
      },
      { Healthy: 0, Watch: 0, Faulty: 0, "RMA / Replaced": 0, Unknown: 0 },
    );
    return { total, byHealth };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.deviceOverrides]);

  const toggleSet = <T,>(set: Set<T>, value: T, setter: (s: Set<T>) => void) => {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    setter(next);
  };

  const setOverride = (deviceId: string, patch: DeviceOverride) => {
    setState((prev) => ({
      ...prev,
      deviceOverrides: {
        ...prev.deviceOverrides,
        [deviceId]: { ...(prev.deviceOverrides[deviceId] ?? {}), ...patch },
      },
    }));
  };

  const addIncident = () => {
    if (!newDeviceId || !newSymptom.trim()) return;
    const entry: IncidentEntry = {
      id: `inc_${Date.now()}`,
      deviceId: newDeviceId,
      date: new Date().toISOString().slice(0, 10),
      symptom: newSymptom.trim(),
      resolution: newResolution.trim(),
      resolved: false,
    };
    setState((prev) => ({ ...prev, incidents: [entry, ...prev.incidents] }));
    setNewSymptom("");
    setNewResolution("");
  };

  const toggleIncidentResolved = (id: string) => {
    setState((prev) => ({
      ...prev,
      incidents: prev.incidents.map((i) =>
        i.id === id ? { ...i, resolved: !i.resolved } : i,
      ),
    }));
  };

  const deleteIncident = (id: string) => {
    setState((prev) => ({ ...prev, incidents: prev.incidents.filter((i) => i.id !== id) }));
  };

  const resetAll = () => {
    if (
      typeof window !== "undefined" &&
      window.confirm("Reset all NV fleet overrides and incidents? This cannot be undone.")
    ) {
      setState({ deviceOverrides: {}, incidents: [] });
    }
  };

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const exportCSV = () => {
    const rows: string[] = [
      ["Device ID", "Room", "Site", "Model", "Role", "Health", "SN", "MAC", "Firmware", "Notes"]
        .map((h) => `"${h}"`)
        .join(","),
    ];
    for (const d of NV_DEVICES) {
      const e = effectiveDevice(d);
      rows.push(
        [
          d.id,
          e.room,
          e.site,
          e.model,
          e.role,
          e.health,
          e.serialNumber ?? "",
          e.macAddress ?? "",
          e.firmware ?? "",
          e.notes ?? "",
        ]
          .map((c) => `"${String(c).replace(/"/g, '""')}"`)
          .join(","),
      );
    }
    rows.push("");
    rows.push(
      ["Incident ID", "Device", "Date", "Symptom", "Resolution", "Resolved"]
        .map((h) => `"${h}"`)
        .join(","),
    );
    for (const i of state.incidents) {
      rows.push(
        [i.id, i.deviceId, i.date, i.symptom, i.resolution, i.resolved ? "Yes" : "No"]
          .map((c) => `"${String(c).replace(/"/g, '""')}"`)
          .join(","),
      );
    }
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nv-fleet-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-10">
      <header>
        <p className="z-eyebrow">Fleet tracker</p>
        <h1 className="z-h1 mt-2">Q-Sys NV-21 / NV-32 fleet</h1>
        <p className="mt-3 max-w-3xl text-base text-zillow-slate">
          Per-unit inventory, incident log, and the recurring known-issues knowledge base for the
          NV-21 / NV-32 platform. As we standardize on Q-Sys NV endpoints for HDMI share, every
          unit gets tracked here. Closes the SN/MAC process gap from the May 8 fan failure.
        </p>
      </header>

      {/* Fleet health summary */}
      <section className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <div className="z-card">
          <div className="z-eyebrow">Total units</div>
          <div className="mt-1 text-3xl font-bold text-zillow-ink">{counts.total}</div>
        </div>
        {(["Healthy", "Watch", "Faulty", "RMA / Replaced"] as NvHealth[]).map((h) => (
          <div key={h} className="z-card">
            <div className={`z-chip ${HEALTH_STYLE[h]}`}>{h}</div>
            <div className="mt-2 text-3xl font-bold text-zillow-ink">{counts.byHealth[h]}</div>
          </div>
        ))}
      </section>

      {/* Inventory */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="z-h2">Inventory</h2>
          <button onClick={exportCSV} className="z-btn-secondary">
            Export CSV
          </button>
        </div>

        {/* Filter toolbar */}
        <div className="z-card mb-4 space-y-3">
          <input
            type="text"
            placeholder="Search room, SN, MAC, notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-zillow-gray-border bg-white px-4 py-2 text-sm text-zillow-ink placeholder:text-zillow-gray focus:border-zillow-blue focus:outline-none focus:ring-2 focus:ring-zillow-blue-light"
          />
          <FilterRow
            label="Site"
            options={sites}
            selected={siteFilter}
            onToggle={(v) => toggleSet(siteFilter, v, setSiteFilter)}
          />
          <FilterRow
            label="Model"
            options={["NV-21", "NV-32"] as NvModel[]}
            selected={modelFilter}
            onToggle={(v) => toggleSet(modelFilter, v, setModelFilter)}
          />
          <FilterRow
            label="Health"
            options={healthOptions}
            selected={healthFilter}
            onToggle={(v) => toggleSet(healthFilter, v, setHealthFilter)}
            styleMap={HEALTH_STYLE}
          />
        </div>

        <div className="overflow-x-auto rounded-xl border border-zillow-gray-border bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-zillow-gray-border bg-zillow-gray-light text-left">
              <tr>
                <th className="w-10 px-3 py-3"></th>
                <th className="px-3 py-3 font-semibold text-zillow-ink">Room / Site</th>
                <th className="px-3 py-3 font-semibold text-zillow-ink">Model</th>
                <th className="px-3 py-3 font-semibold text-zillow-ink">Role</th>
                <th className="px-3 py-3 font-semibold text-zillow-ink">Health</th>
                <th className="px-3 py-3 font-semibold text-zillow-ink">Power</th>
                <th className="px-3 py-3 font-semibold text-zillow-ink">SN / MAC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zillow-gray-border">
              {filteredDevices.map((d) => {
                const isOpen = expanded.has(d.id);
                return (
                  <DeviceRow
                    key={d.id}
                    device={d}
                    isOpen={isOpen}
                    onToggle={() => toggleExpand(d.id)}
                    onOverride={(patch) => setOverride(d.id, patch)}
                  />
                );
              })}
              {filteredDevices.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-zillow-slate">
                    No devices match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Incidents log */}
      <section>
        <h2 className="z-h2 mb-4">Incident log</h2>
        <div className="z-card mb-4">
          <div className="z-eyebrow">Log a new incident</div>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <select
              value={newDeviceId}
              onChange={(e) => setNewDeviceId(e.target.value)}
              className="rounded-lg border border-zillow-gray-border bg-white px-3 py-2 text-sm text-zillow-ink focus:border-zillow-blue focus:outline-none focus:ring-2 focus:ring-zillow-blue-light"
            >
              <option value="">Select device...</option>
              {NV_DEVICES.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.room} — {d.model}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Symptom (e.g. fan noise, no signal, packet loss)"
              value={newSymptom}
              onChange={(e) => setNewSymptom(e.target.value)}
              className="rounded-lg border border-zillow-gray-border bg-white px-3 py-2 text-sm text-zillow-ink placeholder:text-zillow-gray focus:border-zillow-blue focus:outline-none focus:ring-2 focus:ring-zillow-blue-light"
            />
            <textarea
              placeholder="Resolution (Jira ticket, RMA #, etc.)"
              value={newResolution}
              onChange={(e) => setNewResolution(e.target.value)}
              rows={2}
              className="md:col-span-2 rounded-lg border border-zillow-gray-border bg-white px-3 py-2 text-sm text-zillow-ink placeholder:text-zillow-gray focus:border-zillow-blue focus:outline-none focus:ring-2 focus:ring-zillow-blue-light"
            />
            <div className="md:col-span-2 flex justify-end">
              <button
                onClick={addIncident}
                disabled={!newDeviceId || !newSymptom.trim()}
                className="z-btn-primary disabled:opacity-50"
              >
                Add incident
              </button>
            </div>
          </div>
        </div>

        {state.incidents.length === 0 ? (
          <div className="z-card text-center text-sm text-zillow-slate">
            No incidents logged yet.
          </div>
        ) : (
          <div className="space-y-2">
            {state.incidents.map((inc) => {
              const device = NV_DEVICES.find((d) => d.id === inc.deviceId);
              return (
                <div
                  key={inc.id}
                  className={`z-card ${inc.resolved ? "bg-zillow-gray-light/50" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={inc.resolved}
                      onChange={() => toggleIncidentResolved(inc.id)}
                      className="mt-1 h-4 w-4 shrink-0 rounded border-zillow-gray-border text-zillow-blue focus:ring-zillow-blue"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs text-zillow-slate">{inc.date}</span>
                        <span className="font-semibold text-zillow-ink">
                          {device ? `${device.room} (${device.model})` : inc.deviceId}
                        </span>
                        {inc.resolved && (
                          <span className="z-chip bg-green-50 text-zillow-green ring-1 ring-inset ring-green-200">
                            Resolved
                          </span>
                        )}
                      </div>
                      <p
                        className={`mt-1 text-sm ${
                          inc.resolved ? "text-zillow-gray line-through" : "text-zillow-ink"
                        }`}
                      >
                        {inc.symptom}
                      </p>
                      {inc.resolution && (
                        <p className="mt-1 text-xs italic text-zillow-slate">
                          Resolution: {inc.resolution}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => deleteIncident(inc.id)}
                      className="shrink-0 text-xs text-zillow-gray hover:text-zillow-red"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Known issues KB */}
      <section>
        <h2 className="z-h2 mb-4">Known-issues knowledge base</h2>
        <p className="mb-4 text-sm text-zillow-slate">
          Recurring patterns observed in the channel history. Read-only reference. Tag a device
          in the inventory with one of these issue IDs to flag it.
        </p>
        <div className="space-y-4">
          {NV_KNOWN_ISSUES.map((issue) => (
            <article key={issue.id} className="z-card">
              <header className="flex flex-wrap items-center gap-2">
                <span className={`z-chip ${SEVERITY_STYLE[issue.severity]}`}>
                  {issue.severity}
                </span>
                {issue.affectsModels.map((m) => (
                  <span
                    key={m}
                    className="z-chip bg-zillow-blue-light text-zillow-blue"
                  >
                    {m}
                  </span>
                ))}
                <span className="font-mono text-xs text-zillow-slate">
                  First seen {issue.firstSeen}
                </span>
                <span className="font-mono text-xs text-zillow-slate">id: {issue.id}</span>
              </header>
              <h3 className="z-h3 mt-3">{issue.title}</h3>
              <dl className="mt-3 grid gap-3 text-sm md:grid-cols-2">
                <Field label="Symptom" value={issue.symptom} />
                <Field label="Cause" value={issue.cause} />
                <Field label="Workaround" value={issue.workaround} />
                {issue.permanentFix && <Field label="Permanent fix" value={issue.permanentFix} />}
              </dl>
              {issue.evidence.length > 0 && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wider text-zillow-blue">
                    Evidence ({issue.evidence.length})
                  </summary>
                  <div className="mt-3 space-y-2">
                    {issue.evidence.map((q, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg border-l-4 border-zillow-blue bg-zillow-gray-light p-3"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-zillow-ink">{q.who}</span>
                          <span className="font-mono text-zillow-slate">{q.when}</span>
                        </div>
                        <p className="mt-1 text-sm text-zillow-ink">&ldquo;{q.text}&rdquo;</p>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* Spares SKU reference */}
      <section>
        <h2 className="z-h2 mb-4">Spare parts SKU reference</h2>
        <div className="overflow-x-auto rounded-xl border border-zillow-gray-border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-zillow-gray-light text-left">
              <tr>
                <th className="px-3 py-3 font-semibold text-zillow-ink">Part</th>
                <th className="px-3 py-3 font-semibold text-zillow-ink">Part #</th>
                <th className="px-3 py-3 font-semibold text-zillow-ink">Source</th>
                <th className="px-3 py-3 font-semibold text-zillow-ink">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zillow-gray-border">
              {NV_SPARES.map((p) => (
                <tr key={p.partNumber}>
                  <td className="px-3 py-3 font-medium text-zillow-ink">{p.name}</td>
                  <td className="px-3 py-3 font-mono text-xs text-zillow-slate">
                    {p.partNumber}
                  </td>
                  <td className="px-3 py-3 text-zillow-slate">
                    {p.url ? (
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="z-link"
                      >
                        {p.source}
                      </a>
                    ) : (
                      p.source
                    )}
                  </td>
                  <td className="px-3 py-3 text-zillow-slate">{p.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="flex justify-end">
        <button
          onClick={resetAll}
          className="z-btn-secondary !border-red-200 !text-zillow-red hover:!bg-red-50"
        >
          Reset all NV fleet data
        </button>
      </section>

      <p className="text-xs text-zillow-slate">
        Device overrides and incident log are saved in your browser&apos;s local storage on this
        device. Use <span className="font-semibold">Export CSV</span> to share with the team or
        move state between devices.
      </p>
    </div>
  );
}

function DeviceRow({
  device,
  isOpen,
  onToggle,
  onOverride,
}: {
  device: NvDevice & DeviceOverride;
  isOpen: boolean;
  onToggle: () => void;
  onOverride: (patch: DeviceOverride) => void;
}) {
  return (
    <>
      <tr
        className="cursor-pointer hover:bg-zillow-blue-light/30"
        onClick={onToggle}
      >
        <td className="px-3 py-3 text-center text-zillow-slate">{isOpen ? "▼" : "▶"}</td>
        <td className="px-3 py-3">
          <div className="font-medium text-zillow-ink">{device.room}</div>
          <div className="text-xs text-zillow-slate">{device.site}</div>
        </td>
        <td className="px-3 py-3">
          <span className="z-chip bg-zillow-blue-light text-zillow-blue">{device.model}</span>
        </td>
        <td className="px-3 py-3 text-zillow-slate">{device.role}</td>
        <td className="px-3 py-3">
          <span className={`z-chip ${HEALTH_STYLE[device.health]}`}>{device.health}</span>
        </td>
        <td className="px-3 py-3 text-zillow-slate">{device.powerMethod}</td>
        <td className="px-3 py-3 font-mono text-xs text-zillow-slate">
          {device.serialNumber || device.macAddress ? (
            <>
              {device.serialNumber && <div>SN: {device.serialNumber}</div>}
              {device.macAddress && <div>MAC: {device.macAddress}</div>}
            </>
          ) : (
            <span className="text-zillow-gray">—</span>
          )}
        </td>
      </tr>
      {isOpen && (
        <tr className="bg-zillow-gray-light/50">
          <td colSpan={7} className="px-6 py-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="z-eyebrow">Notes</div>
                <p className="mt-2 text-sm leading-relaxed text-zillow-ink">{device.notes}</p>
                {device.knownIssueIds && device.knownIssueIds.length > 0 && (
                  <div className="mt-3">
                    <div className="text-xs font-semibold uppercase tracking-wide text-zillow-slate">
                      Tagged known issues
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {device.knownIssueIds.map((kid) => (
                        <span
                          key={kid}
                          className="rounded bg-white px-2 py-0.5 text-xs font-mono text-zillow-slate ring-1 ring-inset ring-zillow-gray-border"
                        >
                          {kid}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <div className="z-eyebrow">Edit unit details</div>
                <div className="grid gap-3">
                  <label className="block text-xs">
                    <span className="font-semibold text-zillow-slate">Health</span>
                    <select
                      value={device.health}
                      onChange={(e) => onOverride({ health: e.target.value as NvHealth })}
                      className="mt-1 w-full rounded-lg border border-zillow-gray-border bg-white px-3 py-1.5 text-sm text-zillow-ink"
                    >
                      {(
                        ["Healthy", "Watch", "Faulty", "RMA / Replaced", "Unknown"] as NvHealth[]
                      ).map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-xs">
                    <span className="font-semibold text-zillow-slate">Serial number</span>
                    <input
                      type="text"
                      value={device.serialNumber ?? ""}
                      onChange={(e) => onOverride({ serialNumber: e.target.value })}
                      placeholder="e.g. NV21-XXXXXXX"
                      className="mt-1 w-full rounded-lg border border-zillow-gray-border bg-white px-3 py-1.5 text-sm text-zillow-ink"
                    />
                  </label>
                  <label className="block text-xs">
                    <span className="font-semibold text-zillow-slate">MAC address</span>
                    <input
                      type="text"
                      value={device.macAddress ?? ""}
                      onChange={(e) => onOverride({ macAddress: e.target.value })}
                      placeholder="e.g. 00:60:74:XX:XX:XX"
                      className="mt-1 w-full rounded-lg border border-zillow-gray-border bg-white px-3 py-1.5 text-sm text-zillow-ink"
                    />
                  </label>
                  <label className="block text-xs">
                    <span className="font-semibold text-zillow-slate">Firmware</span>
                    <input
                      type="text"
                      value={device.firmware ?? ""}
                      onChange={(e) => onOverride({ firmware: e.target.value })}
                      placeholder="e.g. Q-Sys 10.0.1"
                      className="mt-1 w-full rounded-lg border border-zillow-gray-border bg-white px-3 py-1.5 text-sm text-zillow-ink"
                    />
                  </label>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
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
      <span className="w-16 shrink-0 text-xs font-semibold uppercase tracking-wide text-zillow-slate">
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

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-zillow-slate">{label}</dt>
      <dd className="mt-1 leading-relaxed text-zillow-ink">{value}</dd>
    </div>
  );
}
