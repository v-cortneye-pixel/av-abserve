import { HANDOFF_KEYS } from "@/lib/data";

export default function HandoffPage() {
  return (
    <div className="space-y-12">
      <header>
        <p className="z-eyebrow">Patrick handoff</p>
        <h1 className="z-h1 mt-2">Claim the keys, don&apos;t ask for them</h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-zillow-slate">
          You replaced Patrick. His tooling, UCIs, plugins, alerts bot, IP validator, and GitLab
          repos are your portfolio now. Bring these to the Tuesday meeting with Matt and the Monday
          WAVE sync. Posture: <span className="font-semibold text-zillow-ink">claim, don&apos;t ask.</span>
        </p>
      </header>

      <section className="z-card">
        <div className="z-eyebrow">Posture rule</div>
        <p className="mt-2 text-base leading-relaxed text-zillow-ink">
          <span className="font-semibold">&ldquo;I&apos;m taking WAVE-16.&rdquo;</span> not{" "}
          <span className="italic text-zillow-slate">&ldquo;want me to take WAVE-16?&rdquo;</span>
        </p>
      </section>

      <section>
        <h2 className="z-h2 mb-4">1. Code, tooling, and accounts</h2>
        <div className="z-card">
          <ol className="list-decimal space-y-3 pl-5 text-sm leading-relaxed text-zillow-ink">
            {HANDOFF_KEYS.toolingAndAccounts.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ol>
        </div>
      </section>

      <section>
        <h2 className="z-h2 mb-4">2. Access checklist</h2>
        <p className="mb-4 text-sm text-zillow-slate">
          You asked for these on May 12. Keep pushing until they&apos;re granted.
        </p>
        <div className="z-card">
          <ul className="space-y-3">
            {HANDOFF_KEYS.accessList.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm text-zillow-ink">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-zillow-gray-border text-zillow-blue focus:ring-zillow-blue"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section>
        <h2 className="z-h2 mb-4">3. Process and decision context</h2>
        <div className="z-card">
          <ul className="list-disc space-y-3 pl-5 text-sm leading-relaxed text-zillow-ink">
            {HANDOFF_KEYS.processAndContext.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="z-card bg-zillow-gray-light">
        <h2 className="z-h3">What I need from the team this week</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left">
              <tr>
                <th className="px-3 py-2 font-semibold text-zillow-ink">Need</th>
                <th className="px-3 py-2 font-semibold text-zillow-ink">From</th>
                <th className="px-3 py-2 font-semibold text-zillow-ink">By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zillow-gray-border">
              {[
                ["Repo access + tool access", "Mark", "Wednesday"],
                ["Q-Sys file walkthroughs", "Matt", "This week"],
                [
                  "Confirmation: I own WAVE-16, Zoom Whiteboard ticket, NV-21 process runbook, USB-C SKU, MXA920/TCC2 spec, SEA-3647 audio closure",
                  "Mark + Matt",
                  "Monday WAVE sync",
                ],
                ["Patrick's exit notes / handoff doc (if it exists)", "Stacey", "This week"],
                ["Lab time to bench-test EDID forcing + direct USB capture", "Matt", "Within 2 weeks"],
                ["World Cup ask scoping authority", "Mark", "Monday"],
              ].map(([need, from, by]) => (
                <tr key={need}>
                  <td className="px-3 py-3 text-zillow-ink">{need}</td>
                  <td className="px-3 py-3 text-zillow-slate">{from}</td>
                  <td className="px-3 py-3 text-zillow-slate">{by}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
