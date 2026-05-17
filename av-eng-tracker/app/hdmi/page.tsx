import { HDMI_OPTIONS, ISSUES } from "@/lib/data";

const NV_TROUBLE = [
  {
    issue: "HDMI audio not passing on NV-21 under Q-Sys 9",
    when: "Aug 15, 2025",
    quote:
      "Mac Mini encoder, routed to the Projector Decoder, and the Mac's sound card is set to be its NV-21, instead of Q-Sys.....no signal",
    who: "Patrick",
  },
  {
    issue: "NV-21 fan failure",
    when: "May 7, 2026",
    quote: "Mark working on replacement.",
    who: "Mark",
  },
  {
    issue: "NV-21 PSU sourcing (no Phoenix block included)",
    when: "Sep 2, 2025",
    quote: "It is truly insane they dont include that connector.",
    who: "Mark",
  },
  {
    issue: "NV PSU mixup (21 vs 32)",
    when: "Aug 20, 2025",
    quote: "The NV21 PSU will not work with the NV32.",
    who: "Matt",
  },
  {
    issue: "AVoIP packet loss to Founders Suite decoder",
    when: "Jul 8, 2025",
    quote: "the main decoder for the founder's suite loses a packet every few seconds",
    who: "Patrick",
  },
  {
    issue: "VLAN trust required on NV networks",
    when: "Multiple",
    quote: "That switch still has the separate VLANs which makes me not fully trust that network.",
    who: "Matt",
  },
];

export default function HdmiPage() {
  const hdmiIssue = ISSUES.find((i) => i.id === "hdmi-share");

  return (
    <div className="space-y-12">
      <header>
        <p className="z-eyebrow">HDMI share — innovation framing</p>
        <h1 className="z-h1 mt-2">Six options on the table before signing the PO</h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-zillow-slate">
          The team has converged on &ldquo;use Q-Sys NV endpoints&rdquo; — that decision was made
          April 17, 2026. Before signing the PO, the systems engineer&apos;s job is to make sure we
          aren&apos;t jumping out of one frying pan into another. The NV platform has had a rough
          12 months.
        </p>
      </header>

      {/* NV trouble track record */}
      <section>
        <h2 className="z-h2 mb-4">Q-Sys NV platform — known issues over the past year</h2>
        <div className="overflow-x-auto rounded-xl border border-zillow-gray-border">
          <table className="w-full text-sm">
            <thead className="bg-zillow-gray-light text-left">
              <tr>
                <th className="px-4 py-3 font-semibold text-zillow-ink">Issue</th>
                <th className="px-4 py-3 font-semibold text-zillow-ink">When</th>
                <th className="px-4 py-3 font-semibold text-zillow-ink">Quote</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zillow-gray-border bg-white">
              {NV_TROUBLE.map((row) => (
                <tr key={row.issue}>
                  <td className="px-4 py-3 font-medium text-zillow-ink">{row.issue}</td>
                  <td className="px-4 py-3 font-mono text-xs text-zillow-slate">{row.when}</td>
                  <td className="px-4 py-3 text-zillow-slate">
                    <span className="italic">&ldquo;{row.quote}&rdquo;</span>{" "}
                    <span className="text-xs">— {row.who}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Options */}
      <section>
        <h2 className="z-h2 mb-4">Six paths to evaluate</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {HDMI_OPTIONS.map((opt) => (
            <article key={opt.id} className="z-card">
              <div className="mb-2 flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zillow-blue text-sm font-bold text-white">
                  {opt.id}
                </span>
                <h3 className="z-h3">{opt.title}</h3>
              </div>
              {opt.description && (
                <p className="mt-2 text-sm leading-relaxed text-zillow-slate">{opt.description}</p>
              )}
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-zillow-green">
                    Pros
                  </div>
                  <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-zillow-ink">
                    {opt.pros.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-zillow-red">
                    Cons
                  </div>
                  <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-zillow-ink">
                    {opt.cons.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="mt-4 grid gap-2 text-xs">
                <div>
                  <span className="font-semibold text-zillow-ink">Best for: </span>
                  <span className="text-zillow-slate">{opt.bestFor}</span>
                </div>
                <div>
                  <span className="font-semibold text-zillow-ink">Risk: </span>
                  <span className="text-zillow-slate">{opt.risk}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Recommended sequence */}
      <section className="z-card border-l-4 border-zillow-blue bg-zillow-blue-light">
        <div className="z-eyebrow">Recommended sequence</div>
        <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-zillow-ink">
          <li>
            <span className="font-semibold">Week 1 lab test:</span> Option D (source-side EDID
            forcing). If this catches 60%+ of issues, you&apos;ve saved the team a multi-room
            hardware swap.
          </li>
          <li>
            <span className="font-semibold">Week 2–3 lab test:</span> Option B in dev space — direct
            USB capture path. Measure latency, sync robustness.
          </li>
          <li>
            <span className="font-semibold">Bring back to Matt/Mark with data,</span> not opinions.
            If Option A is still the answer, fine — but you&apos;ve stress-tested the assumption.
          </li>
          <li>
            <span className="font-semibold">Parallel track:</span> Option E (wireless-only standard
            for non-event rooms) as a policy recommendation, not a hardware one.
          </li>
        </ol>
      </section>

      {/* Tuesday script */}
      <section className="z-card bg-zillow-gray-light">
        <h2 className="z-h3">The question to ask Matt Tuesday</h2>
        <blockquote className="mt-4 border-l-4 border-zillow-blue pl-4 text-sm italic leading-relaxed text-zillow-ink">
          &ldquo;Before we issue POs for Q-Sys NV endpoints, want me to bench-test source-side EDID
          forcing and direct USB capture as alternatives? Two weeks in the lab, no impact on
          production, gives us data to size the right investment. NV platform has had its own bumps
          over the last year and I want to make sure we&apos;re not jumping out of one frying pan
          into another.&rdquo;
        </blockquote>
      </section>

      {hdmiIssue && (
        <section className="text-sm text-zillow-slate">
          Full quotes and issue history:{" "}
          <a href={`/issues/${hdmiIssue.id}`} className="z-link">
            HDMI Share Reliability issue page →
          </a>
        </section>
      )}
    </div>
  );
}
