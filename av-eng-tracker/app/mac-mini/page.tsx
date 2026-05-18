import Link from "next/link";
import { ISSUES } from "@/lib/data";
import QuoteCard from "@/components/QuoteCard";

const SECTIONS = [
  {
    id: "sequoia",
    title: "3.1 Mac OS update → Zoom Rooms hijack (Aug 2025)",
    note: "Andrew Spokes (CE) pushed Sequoia. Apple Intelligence popup overlaid Zoom Rooms without taking the Mac out of ZR. Zoom Dashboard didn't catch it.",
    machines: ["SFO-07-AV-001", "SEA-40-AV-OLYMPIC", "SFO-10-AV-001", "ZG82666 (likely SEA-3647-AV)"],
  },
  {
    id: "nv21-usb-c",
    title: "3.2 NV-21 + Mac OS USB-C audio bug under Q-Sys 9 (Aug 2025)",
    note: "Mac sound card set to NV-21 → no signal. Resolved by upgrade to Q-Sys 10.",
  },
  {
    id: "nyc-1227",
    title: "3.3 NYC-1227 Mac never properly setup (Mar 2026)",
    note: "Auto-login for zoomrooms account never configured. Originally set up as a regular Mac. Manual remediation by Matt + Andrew.",
  },
  {
    id: "irv-802-home",
    title: "3.4 IRV-802 Mac home screen visible during meeting (Mar 2026)",
    note: "Camera preview showing Mac desktop instead of conference view. Matt: 'I'm guessing it updated and is stuck there.'",
  },
  {
    id: "share-ui",
    title: "3.5 Zoom Sharing UI change post-Mac OS update (Feb 2026)",
    note: "Sharing workflow changed — popup replaced by integrated banner. 'Use Mac System Picker for Sharing' setting introduced.",
  },
  {
    id: "qsys-connect",
    title: "3.6 Q-Sys Connect for Zoom Rooms — Windows-only certification (May 2026)",
    note: "QSC announced Q-Sys Connect as a Zoom Rooms attached controller — certified for Windows only. Strategic question: does Zillow's Mac Mini standard limit future Q-Sys touch panel integration?",
  },
  {
    id: "g62",
    title: "3.7 G62 / Poly appliance debate (May 14–15, 2026)",
    note: "Cortney proposed Poly G62 appliance. Matt pushed back hard. Stacey reframed as 'Tier 3 large/complex room standard rather than replacing what you have.'",
  },
];

export default function MacMiniPage() {
  const macIssue = ISSUES.find((i) => i.id === "mac-mini");
  const quotes = macIssue?.quotes ?? [];

  return (
    <div className="space-y-12">
      <header>
        <p className="z-eyebrow">Architectural deep dive</p>
        <h1 className="z-h1 mt-2">Mac Mini issues — fleet host platform review</h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-zillow-slate">
          The Mac Mini has been Zillow&apos;s standard Zoom Rooms host for years. Technically stable
          under normal operation, but the management surface and vendor ecosystem direction are
          eroding the case. Here&apos;s every Mac Mini-related thread chronologically.
        </p>
      </header>

      {/* Verdict card */}
      <section className="z-card border-l-4 border-zillow-blue bg-zillow-blue-light">
        <div className="z-eyebrow">Engineering verdict</div>
        <p className="mt-3 text-base leading-relaxed text-zillow-ink">
          The Mac Mini has been the <em>stable performer</em> technically. The pain isn&apos;t the
          hardware — it&apos;s the{" "}
          <span className="font-semibold">management surface</span> (Jamf push, OS updates, Apple
          ID, ZR version drift) and{" "}
          <span className="font-semibold">vendor compatibility direction</span> (Q-Sys Connect
          moving Windows-only). The architectural question isn&apos;t &ldquo;is Mac Mini
          bad?&rdquo; — it&apos;s{" "}
          <em>&ldquo;can we afford the operational tax indefinitely as the vendor ecosystem
          shifts?&rdquo;</em>
        </p>
      </section>

      {/* Pattern table */}
      <section>
        <h2 className="z-h2 mb-4">Issue tally over ~9 months</h2>
        <div className="overflow-x-auto rounded-xl border border-zillow-gray-border">
          <table className="w-full text-sm">
            <thead className="bg-zillow-gray-light text-left">
              <tr>
                <th className="px-4 py-3 font-semibold text-zillow-ink">Pattern</th>
                <th className="px-4 py-3 font-semibold text-zillow-ink">Frequency</th>
                <th className="px-4 py-3 font-semibold text-zillow-ink">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zillow-gray-border bg-white">
              {[
                ["OS updates breaking Zoom Rooms", "4+ documented events", "High"],
                ["Setup / provisioning inconsistency", "2 documented events", "Medium"],
                ["Auto-login / screensaver edge cases", "2 documented events", "Medium"],
                ["Vendor compatibility (Q-Sys Connect requires Windows)", "New / strategic", "High"],
                ["Performance", "Not a complaint", "—"],
              ].map(([p, f, s]) => (
                <tr key={p}>
                  <td className="px-4 py-3 text-zillow-ink">{p}</td>
                  <td className="px-4 py-3 text-zillow-slate">{f}</td>
                  <td className="px-4 py-3 text-zillow-slate">{s}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Sections */}
      <section className="space-y-4">
        <h2 className="z-h2">Chronological incidents</h2>
        {SECTIONS.map((s) => (
          <div key={s.id} className="z-card">
            <h3 className="z-h3">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-zillow-slate">{s.note}</p>
            {s.machines && (
              <div className="mt-3 flex flex-wrap gap-2">
                {s.machines.map((m) => (
                  <span
                    key={m}
                    className="rounded-md bg-zillow-gray-light px-2 py-1 text-xs font-medium text-zillow-slate"
                  >
                    {m}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </section>

      {/* Quotes */}
      <section>
        <h2 className="z-h2 mb-4">Quotes captured</h2>
        <div className="space-y-3">
          {quotes.map((q, idx) => (
            <QuoteCard key={idx} quote={q} />
          ))}
        </div>
      </section>

      {/* Tuesday meeting prep */}
      <section className="z-card bg-zillow-gray-light">
        <h2 className="z-h3">Tuesday meeting with Matt — how to frame this</h2>
        <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-zillow-ink">
          <li>
            Lead with questions, not pitches. Ask Matt to walk you through the existing Mac Mini +
            Q-Sys reference design end-to-end.
          </li>
          <li>
            Get the management story: Jamf push, OS update cadence, what CE handles, what AV
            handles, what breaks and how often.
          </li>
          <li>
            Reframe the G62 conversation: not as a replacement, but as a Tier 3 lab pilot with
            success criteria <em>Matt</em> defines.
          </li>
          <li>
            Volunteer to quantify ticket-hours/year for OS-driven Mac Mini issues. That number is
            the basis for any future architectural proposal.
          </li>
          <li>
            Closing question:{" "}
            <em>
              &ldquo;What&apos;s one thing on your plate I can pick up this week so you have time to
              think about all this?&rdquo;
            </em>
          </li>
        </ol>
        <div className="mt-4">
          <Link href={`/issues/mac-mini`} className="z-link text-sm">
            See the full Mac Mini issue page →
          </Link>
        </div>
      </section>
    </div>
  );
}
