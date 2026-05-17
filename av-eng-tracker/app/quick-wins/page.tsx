import { QUICK_WINS, type WinTier } from "@/lib/data";

const TIER_ORDER: WinTier[] = ["Quick", "Medium", "Project"];

const TIER_STYLE: Record<WinTier, string> = {
  Quick: "border-zillow-green bg-green-50",
  Medium: "border-zillow-orange bg-orange-50",
  Project: "border-zillow-blue bg-zillow-blue-light",
};

const TIER_LABEL: Record<WinTier, string> = {
  Quick: "Quick wins (≤ 4 hours)",
  Medium: "Medium wins (1–3 days)",
  Project: "Project wins (1–2 weeks)",
};

const TIER_DESCRIPTION: Record<WinTier, string> = {
  Quick: "Low effort, can be knocked out same-week. Bias toward these in weeks 1–4.",
  Medium: "Real engineering work but bounded scope. Cluster these in weeks 4–8.",
  Project: "Multi-week deliverables that anchor the 60–90 day strategic narrative.",
};

const EFFORT_STYLE: Record<string, string> = {
  Low: "bg-green-50 text-zillow-green ring-1 ring-inset ring-green-200",
  Medium: "bg-yellow-50 text-yellow-800 ring-1 ring-inset ring-yellow-200",
  High: "bg-red-50 text-zillow-red ring-1 ring-inset ring-red-200",
};

const TOPIC_STYLE = "bg-zillow-gray-light text-zillow-slate";

export default function QuickWinsPage() {
  return (
    <div className="space-y-10">
      <header>
        <p className="z-eyebrow">Quick wins · 30 deliverables</p>
        <h1 className="z-h1 mt-2">Wins checklist by effort tier</h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-zillow-slate">
          30 concrete deliverables to credibility-build through your first 90 days. Sized by
          effort: <span className="font-semibold text-zillow-green">Quick</span> for same-week
          execution, <span className="font-semibold text-zillow-orange">Medium</span> for
          bounded engineering work, <span className="font-semibold text-zillow-blue">Project</span>{" "}
          for the strategic anchors. Every one closes a real gap from #av-team history.
        </p>
      </header>

      {TIER_ORDER.map((tier) => {
        const wins = QUICK_WINS.filter((w) => w.tier === tier);
        return (
          <section key={tier} className={`z-card border-l-4 ${TIER_STYLE[tier]}`}>
            <div className="mb-2 flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="z-h2">{TIER_LABEL[tier]}</h2>
              <span className="text-sm text-zillow-slate">
                {wins.length} {wins.length === 1 ? "win" : "wins"}
              </span>
            </div>
            <p className="text-sm text-zillow-slate">{TIER_DESCRIPTION[tier]}</p>

            <div className="mt-5 overflow-x-auto rounded-xl border border-zillow-gray-border bg-white">
              <table className="w-full text-sm">
                <thead className="bg-zillow-gray-light text-left">
                  <tr>
                    <th className="px-3 py-3 font-semibold text-zillow-ink">#</th>
                    <th className="px-3 py-3 font-semibold text-zillow-ink">Win</th>
                    <th className="px-3 py-3 font-semibold text-zillow-ink">Topic</th>
                    <th className="px-3 py-3 font-semibold text-zillow-ink">Effort</th>
                    <th className="px-3 py-3 font-semibold text-zillow-ink">Visibility</th>
                    <th className="px-3 py-3 font-semibold text-zillow-ink">Est. time</th>
                    <th className="px-3 py-3 font-semibold text-zillow-ink">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zillow-gray-border bg-white">
                  {wins.map((win) => (
                    <tr key={win.id}>
                      <td className="px-3 py-3 font-mono text-xs font-bold text-zillow-blue">
                        {win.id.toUpperCase()}
                      </td>
                      <td className="px-3 py-3 font-medium text-zillow-ink">{win.title}</td>
                      <td className="px-3 py-3">
                        <span className={`z-chip ${TOPIC_STYLE}`}>{win.topic}</span>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`z-chip ${EFFORT_STYLE[win.effort] ?? ""}`}>
                          {win.effort}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`z-chip ${EFFORT_STYLE[win.visibility] ?? ""}`}>
                          {win.visibility}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-xs text-zillow-slate">{win.estimatedTime}</td>
                      <td className="px-3 py-3 text-xs text-zillow-slate">{win.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}

      <section className="z-card bg-zillow-gray-light">
        <h2 className="z-h3">My recommended starter set (week 1–2)</h2>
        <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-zillow-ink">
          <li>
            <span className="font-semibold">QW1 — USB-C adapter SKU.</span> One lab day. Ship kits.
            Mark will publicly thank you.
          </li>
          <li>
            <span className="font-semibold">QW3 + QW4 — Reopen WAVE-16 and take it over.</span> 30
            min combined. Visible move that frees Matt.
          </li>
          <li>
            <span className="font-semibold">QW9 — MXA920 vs TCC2 one-pager.</span> Closes
            Mark&apos;s 8-month-old unanswered question.
          </li>
          <li>
            <span className="font-semibold">QW10 — Document SEA-3829 reference design.</span>{" "}
            Establishes Friday G62 pitch precedent.
          </li>
          <li>
            <span className="font-semibold">QW14 — TCC2 commissioning on SEA-3925.</span> No CapEx,
            recovers a known-bad room.
          </li>
        </ol>
      </section>
    </div>
  );
}
