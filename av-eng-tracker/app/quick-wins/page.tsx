import { QUICK_WINS } from "@/lib/data";

const EFFORT_STYLE: Record<string, string> = {
  Low: "bg-green-50 text-zillow-green ring-1 ring-inset ring-green-200",
  Medium: "bg-yellow-50 text-yellow-800 ring-1 ring-inset ring-yellow-200",
  High: "bg-red-50 text-zillow-red ring-1 ring-inset ring-red-200",
};

export default function QuickWinsPage() {
  return (
    <div className="space-y-10">
      <header>
        <p className="z-eyebrow">Quick wins</p>
        <h1 className="z-h1 mt-2">Pick 3–5 for the next 30 days</h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-zillow-slate">
          Small bets that earn trust and demonstrate ownership. Every one of these closes a real
          gap surfaced in #av-team. Effort and visibility are tagged so you can pick the right mix
          for your bandwidth.
        </p>
      </header>

      <section>
        <div className="overflow-x-auto rounded-xl border border-zillow-gray-border">
          <table className="w-full text-sm">
            <thead className="bg-zillow-gray-light text-left">
              <tr>
                <th className="px-4 py-3 font-semibold text-zillow-ink">#</th>
                <th className="px-4 py-3 font-semibold text-zillow-ink">Win</th>
                <th className="px-4 py-3 font-semibold text-zillow-ink">Effort</th>
                <th className="px-4 py-3 font-semibold text-zillow-ink">Visibility</th>
                <th className="px-4 py-3 font-semibold text-zillow-ink">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zillow-gray-border bg-white">
              {QUICK_WINS.map((win) => (
                <tr key={win.id}>
                  <td className="px-4 py-3 font-mono text-xs font-bold text-zillow-blue">
                    {win.id.toUpperCase()}
                  </td>
                  <td className="px-4 py-3 font-medium text-zillow-ink">{win.title}</td>
                  <td className="px-4 py-3">
                    <span className={`z-chip ${EFFORT_STYLE[win.effort] ?? ""}`}>{win.effort}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`z-chip ${EFFORT_STYLE[win.visibility] ?? ""}`}>
                      {win.visibility}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zillow-slate">{win.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="z-card bg-zillow-gray-light">
        <h2 className="z-h3">My recommended starter set</h2>
        <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-zillow-ink">
          <li>
            <span className="font-semibold">QW1 — USB-C adapter SKU.</span> One day in the lab, ship
            kits to every site. Mark will publicly thank you.
          </li>
          <li>
            <span className="font-semibold">QW3 — Take over WAVE-16.</span> Visible move that frees
            Matt and shows you can own vendor escalations.
          </li>
          <li>
            <span className="font-semibold">QW7 — MXA920 vs TCC2 one-pager.</span> Closes Mark&apos;s
            8-month-old unanswered question. Earns the right to speak on the ceiling mic standard.
          </li>
          <li>
            <span className="font-semibold">QW6 — TCC2 commissioning pass on SEA-3925.</span> No
            CapEx. Recovers a known-bad room. Plants your flag as the audio engineer.
          </li>
        </ol>
      </section>
    </div>
  );
}
