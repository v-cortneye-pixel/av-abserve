import Link from "next/link";
import {
  BIRDDOG_DEPLOYMENTS,
  BIRDDOG_PHASE_PLAN,
  BIRDDOG_SENTIMENT,
  CAMERA_OPTIONS,
} from "@/lib/data";
import QuoteCard from "@/components/QuoteCard";

const PRIORITY_STYLE: Record<string, string> = {
  P0: "bg-red-50 text-zillow-red ring-1 ring-inset ring-red-200",
  P1: "bg-orange-50 text-zillow-orange ring-1 ring-inset ring-orange-200",
  P2: "bg-yellow-50 text-yellow-800 ring-1 ring-inset ring-yellow-200",
};

export default function BirddogPage() {
  return (
    <div className="space-y-12">
      <header>
        <p className="z-eyebrow">Vendor phase-out</p>
        <h1 className="z-h1 mt-2">BirdDog → Replacement camera platform</h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-zillow-slate">
          BirdDog has been a recurring source of failure at SFO-735 and NYC-1250 — noisy fans,
          dead decoders, &ldquo;Birddog-gate&rdquo; for the FDoB launch. Patrick was on record
          disliking the platform; Mark designed a remediation project in Jan 2025 that never fully
          fixed it. This page evaluates replacement camera options and proposes a 90-day phase-out.
        </p>
      </header>

      {/* My recommendation */}
      <section className="z-card border-l-4 border-zillow-blue bg-zillow-blue-light">
        <div className="z-eyebrow">Cortney&apos;s recommendation</div>
        <h2 className="z-h3 mt-2">Panasonic AW-UE50 (white) for All Hands, AVer PTZ310UV2 elsewhere</h2>
        <p className="mt-3 text-sm leading-relaxed text-zillow-ink">
          <strong>SFO-735 and NYC-1250</strong> get <strong>Panasonic AW-UE50</strong> (or UE40 if budget tight)
          — broadcast-grade build, white finish to match the room aesthetic, NDI|HX + SDI + HDMI for
          fallback, and Matt already flagged it as a candidate back in April 2025. Pair with{" "}
          <strong>Q-Sys NV-32 decoders</strong> for any signal routing (consistent with the April 17
          decision to standardize on Q-Sys NV endpoints).
        </p>
        <p className="mt-3 text-sm leading-relaxed text-zillow-ink">
          Any secondary or lab camera positions get <strong>AVer PTZ310UV2 / PTZ330</strong> — half the
          cost, AVer is already in the fleet (UE1, CAM550), and white finish is available.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-zillow-ink">
          <strong>Bonus consideration:</strong> If we&apos;re willing to drop white finish, the{" "}
          <strong>QSC NC-12x80 / NC-20x60</strong> option puts cameras inside the Q-Sys ecosystem
          natively — ACPR works out of the box, no NDI dependency, single fabric for cameras + audio
          + control. Worth proposing as a Tier 3 future direction even if not the immediate replacement.
        </p>
      </section>

      {/* Current footprint */}
      <section>
        <h2 className="z-h2 mb-4">Current BirdDog footprint</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {BIRDDOG_DEPLOYMENTS.map((d) => (
            <article key={d.room} className="z-card">
              <div className="flex items-center gap-2">
                <span className={`z-chip ${PRIORITY_STYLE[d.priority]}`}>{d.priority}</span>
                <span className="text-xs text-zillow-slate">{d.site}</span>
              </div>
              <h3 className="z-h3 mt-2">{d.room}</h3>
              <div className="mt-3 space-y-2 text-sm">
                <div>
                  <span className="font-semibold text-zillow-ink">Gear: </span>
                  <span className="text-zillow-slate">{d.gear}</span>
                </div>
                <div>
                  <span className="font-semibold text-zillow-ink">Role: </span>
                  <span className="text-zillow-slate">{d.role}</span>
                </div>
                <div>
                  <span className="font-semibold text-zillow-ink">Known problems: </span>
                  <span className="text-zillow-slate">{d.knownProblems}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Why phase out */}
      <section>
        <h2 className="z-h2 mb-4">Why phase out — receipts from the channel</h2>
        <div className="space-y-3">
          {BIRDDOG_SENTIMENT.map((q, idx) => (
            <QuoteCard key={idx} quote={q} />
          ))}
        </div>
      </section>

      {/* Camera options */}
      <section>
        <h2 className="z-h2 mb-4">Camera replacement options (5 candidates)</h2>
        <div className="space-y-4">
          {CAMERA_OPTIONS.map((opt, idx) => (
            <article key={opt.id} className="z-card">
              <header className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-zillow-blue text-xs font-bold text-white">
                      {idx + 1}
                    </span>
                    <h3 className="z-h3">
                      {opt.vendor} {opt.model}
                    </h3>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-2 text-xs">
                    <span className="text-zillow-slate">{opt.resolution}</span>
                    <span className="text-zillow-slate">·</span>
                    <span className="text-zillow-slate">{opt.transport}</span>
                    <span className="text-zillow-slate">·</span>
                    <span className="font-semibold text-zillow-ink">{opt.priceRange}</span>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap gap-1.5">
                  {opt.whiteFinish && (
                    <span className="z-chip bg-zillow-gray-light text-zillow-slate ring-1 ring-inset ring-zillow-gray-border">
                      White ✓
                    </span>
                  )}
                  {opt.ndiNative && (
                    <span className="z-chip bg-yellow-50 text-yellow-800 ring-1 ring-inset ring-yellow-200">
                      NDI native
                    </span>
                  )}
                  {opt.qSysNative && (
                    <span className="z-chip bg-zillow-blue-light text-zillow-blue ring-1 ring-inset ring-blue-200">
                      Q-Sys native
                    </span>
                  )}
                </div>
              </header>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-zillow-green">
                    Pros
                  </div>
                  <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-zillow-ink">
                    {opt.pros.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-zillow-red">
                    Cons
                  </div>
                  <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-zillow-ink">
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
                  <span className="font-semibold text-zillow-ink">Zillow familiarity: </span>
                  <span className="text-zillow-slate">{opt.zillowFamiliarity}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Comparison matrix */}
      <section>
        <h2 className="z-h2 mb-4">At-a-glance comparison</h2>
        <div className="overflow-x-auto rounded-xl border border-zillow-gray-border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-zillow-gray-light text-left">
              <tr>
                <th className="px-3 py-3 font-semibold text-zillow-ink">Option</th>
                <th className="px-3 py-3 font-semibold text-zillow-ink">Resolution</th>
                <th className="px-3 py-3 font-semibold text-zillow-ink">Price</th>
                <th className="px-3 py-3 font-semibold text-zillow-ink">White</th>
                <th className="px-3 py-3 font-semibold text-zillow-ink">NDI</th>
                <th className="px-3 py-3 font-semibold text-zillow-ink">Q-Sys</th>
                <th className="px-3 py-3 font-semibold text-zillow-ink">Zillow familiar?</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zillow-gray-border">
              {CAMERA_OPTIONS.map((opt) => (
                <tr key={opt.id}>
                  <td className="px-3 py-3 font-medium text-zillow-ink">
                    {opt.vendor} {opt.model}
                  </td>
                  <td className="px-3 py-3 text-zillow-slate">{opt.resolution}</td>
                  <td className="px-3 py-3 font-mono text-xs text-zillow-slate">
                    {opt.priceRange}
                  </td>
                  <td className="px-3 py-3 text-center">{opt.whiteFinish ? "✓" : "—"}</td>
                  <td className="px-3 py-3 text-center">{opt.ndiNative ? "✓" : "—"}</td>
                  <td className="px-3 py-3 text-center">{opt.qSysNative ? "✓" : "—"}</td>
                  <td className="px-3 py-3 text-xs text-zillow-slate">{opt.zillowFamiliarity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Phase plan */}
      <section>
        <h2 className="z-h2 mb-4">90-day phase-out plan</h2>
        <div className="space-y-4">
          {BIRDDOG_PHASE_PLAN.map((phase) => (
            <article key={phase.phase} className="z-card border-l-4 border-zillow-blue">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zillow-blue text-sm font-bold text-white">
                  {phase.phase}
                </span>
                <div>
                  <h3 className="z-h3">{phase.name}</h3>
                  <div className="text-xs text-zillow-slate">{phase.timing}</div>
                </div>
              </div>
              <ul className="mt-4 space-y-2">
                {phase.actions.map((a, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-zillow-ink">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 shrink-0 rounded border-zillow-gray-border text-zillow-blue focus:ring-zillow-blue"
                    />
                    <span className="leading-relaxed">{a}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      {/* Questions for the team */}
      <section className="z-card bg-zillow-gray-light">
        <h2 className="z-h3">Questions to bring to the team</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-zillow-ink">
          <li>
            <strong>Mark:</strong> What&apos;s the 2026 vs 2027 AOP picture for SFO-735 and NYC-1250 camera
            refresh? Can we accelerate?
          </li>
          <li>
            <strong>Matt:</strong> You called out Panasonic AW-UE40 and AVer PTZ310UV2 last April. Still
            your top picks, or has your thinking evolved?
          </li>
          <li>
            <strong>Mark:</strong> Your Jan 2025 &ldquo;Birddog Remediation&rdquo; drawings — what did that
            project actually scope, and how does it relate to a full phase-out?
          </li>
          <li>
            <strong>Team:</strong> Do we keep NDI as a transport going forward, or move cameras to the Q-Sys
            NV / NC ecosystem to align with the April 17 NV endpoint decision?
          </li>
          <li>
            <strong>Matt:</strong> If we go Q-Sys NC-series cameras, we lose the white finish but gain ACPR
            and ecosystem alignment. Is that trade-off worth raising with Workplace/Design?
          </li>
          <li>
            <strong>Mark:</strong> Can I run a one-camera pilot in SFO-735 to validate the chosen platform
            before committing to a full swap of both rooms?
          </li>
          <li>
            <strong>Stacey:</strong> Want me to write this up as a one-pager for leadership before AOP
            conversations?
          </li>
        </ol>
      </section>

      <section className="text-sm text-zillow-slate">
        Related:{" "}
        <Link href="/nv-fleet" className="z-link">
          NV Fleet tracker
        </Link>{" "}
        ·{" "}
        <Link href="/hdmi" className="z-link">
          HDMI options
        </Link>{" "}
        ·{" "}
        <Link href="/issues/hdmi-share" className="z-link">
          HDMI share issue detail
        </Link>
      </section>
    </div>
  );
}
