import Link from "next/link";
import { ISSUES, MEMORY_LEAK_REFACTOR, SITES, UCI_ISSUES } from "@/lib/data";

function countForSite(prefixes: string[]) {
  const matches = (rooms: string[]) =>
    rooms.some((r) => prefixes.some((p) => r.toLowerCase().startsWith(p.toLowerCase())));
  const issueCount = ISSUES.filter((i) => matches(i.rooms)).length;
  const uciCount = UCI_ISSUES.filter((i) => matches(i.rooms)).length;
  const memMainFixed = MEMORY_LEAK_REFACTOR.mainScriptFixed.filter((r) =>
    prefixes.some((p) => r.room.toLowerCase().startsWith(p.toLowerCase())),
  ).length;
  const memRebuilt = MEMORY_LEAK_REFACTOR.rebuiltRooms.filter((r) =>
    prefixes.some((p) => r.room.toLowerCase().startsWith(p.toLowerCase())),
  ).length;
  return { issueCount, uciCount, memMainFixed, memRebuilt };
}

export default function SitesIndex() {
  return (
    <div className="space-y-12">
      <header>
        <p className="z-eyebrow">Sites</p>
        <h1 className="z-h1 mt-2">Per-site AV breakdown</h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-zillow-slate">
          Every Zillow AV office, separated. Each site page filters all known issues, UCI
          problems, memory-leak refactor rooms, and Patrick&apos;s open work down to that
          campus. Use this for a single-room walk-through or for site-specific 1:1s with
          Matt, Mark, or John.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        {SITES.map((s) => {
          const { issueCount, uciCount, memMainFixed, memRebuilt } = countForSite(
            s.matchesPrefixes,
          );
          return (
            <Link
              key={s.id}
              href={`/sites/${s.id}`}
              className="z-card group transition-shadow hover:shadow-lg"
            >
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="z-eyebrow">
                    {s.code} · {s.region}
                  </div>
                  <h2 className="z-h3 mt-1 group-hover:text-zillow-blue">{s.name}</h2>
                </div>
                <span className="font-mono text-xs text-zillow-slate">
                  {s.roomList.length} rooms
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-zillow-ink">{s.signature}</p>
              <div className="mt-4 grid grid-cols-4 gap-2 text-center">
                <div className="rounded-md bg-red-50 px-2 py-2">
                  <div className="text-lg font-bold text-zillow-red">{issueCount}</div>
                  <div className="text-[10px] uppercase tracking-wider text-zillow-slate">
                    Issues
                  </div>
                </div>
                <div className="rounded-md bg-amber-50 px-2 py-2">
                  <div className="text-lg font-bold text-amber-800">{uciCount}</div>
                  <div className="text-[10px] uppercase tracking-wider text-zillow-slate">
                    UCI
                  </div>
                </div>
                <div className="rounded-md bg-emerald-50 px-2 py-2">
                  <div className="text-lg font-bold text-emerald-700">{memMainFixed}</div>
                  <div className="text-[10px] uppercase tracking-wider text-zillow-slate">
                    Mem fix
                  </div>
                </div>
                <div className="rounded-md bg-zillow-blue-light px-2 py-2">
                  <div className="text-lg font-bold text-zillow-blue">{memRebuilt}</div>
                  <div className="text-[10px] uppercase tracking-wider text-zillow-slate">
                    Rebuilt
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </section>

      <section className="z-card bg-zillow-gray-light">
        <p className="text-sm leading-relaxed text-zillow-ink">
          <strong>Note:</strong> Each site page also surfaces the BirdDog deployments and
          Q-Sys NV endpoints that live there — so when you walk a campus you can see at a
          glance what gear is on the floor, what&apos;s been rebuilt, and what&apos;s still
          on the fluff list.
        </p>
      </section>
    </div>
  );
}
