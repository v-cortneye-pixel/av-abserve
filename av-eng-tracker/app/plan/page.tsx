import { PLAN, RISKS } from "@/lib/data";

const PHASES = [
  { key: "days_1_30" as const, accent: "border-zillow-red" },
  { key: "days_31_60" as const, accent: "border-zillow-orange" },
  { key: "days_61_90" as const, accent: "border-zillow-blue" },
];

export default function PlanPage() {
  return (
    <div className="space-y-12">
      <header>
        <p className="z-eyebrow">Execution plan</p>
        <h1 className="z-h1 mt-2">90-day game plan</h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-zillow-slate">
          Three phases. Inventory first, ownership second, architecture third. Don&apos;t pitch new
          systems in week 2 — earn the right to lead architecture conversations by demonstrating
          fluency with the current stack.
        </p>
      </header>

      <section className="space-y-6">
        {PHASES.map(({ key, accent }) => {
          const phase = PLAN[key];
          return (
            <article key={key} className={`z-card border-l-4 ${accent}`}>
              <h2 className="z-h2">{phase.title}</h2>
              <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-zillow-slate">
                Theme: {phase.theme}
              </p>
              <ul className="mt-6 space-y-3">
                {phase.items.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-zillow-ink">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 shrink-0 rounded border-zillow-gray-border text-zillow-blue focus:ring-zillow-blue"
                    />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </section>

      <section>
        <h2 className="z-h2 mb-4">Open questions / risks</h2>
        <div className="z-card">
          <ol className="list-decimal space-y-3 pl-5 text-sm leading-relaxed text-zillow-ink">
            {RISKS.map((r, idx) => (
              <li key={idx}>{r}</li>
            ))}
          </ol>
        </div>
      </section>

      <section className="z-card bg-zillow-gray-light">
        <h2 className="z-h3">Posture rules</h2>
        <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-zillow-ink">
          <li>
            <span className="font-semibold">Frame proposals as pilots, not replacements.</span> Ask
            for a lab pilot or one named room. Don&apos;t pitch fleet-wide changes in week 2.
          </li>
          <li>
            <span className="font-semibold">Volunteer for tickets and docs, not just architecture.</span>{" "}
            This team has bled to keep things running. Pick up a Jira ticket to earn the right to
            talk standards.
          </li>
          <li>
            <span className="font-semibold">Pick one strategic bet at a time.</span> Sequence: HDMI
            / NV endpoints → UI standard → Tier 3 large room standard → Mac vs appliance.
          </li>
          <li>
            <span className="font-semibold">Use the Friday wins/challenges email as your scoreboard.</span>{" "}
            Stacey reads it. List 2 closed items per week. By month 3, the team forgets there was a
            vacuum.
          </li>
        </ol>
      </section>
    </div>
  );
}
