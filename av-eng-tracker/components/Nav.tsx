import Link from "next/link";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard" },
  { href: "/tracker", label: "Tracker" },
  { href: "/issues", label: "Issues" },
  { href: "/mac-mini", label: "Mac Mini" },
  { href: "/hdmi", label: "HDMI Options" },
  { href: "/handoff", label: "Handoff" },
  { href: "/plan", label: "90-Day Plan" },
  { href: "/quick-wins", label: "Quick Wins" },
];

export default function Nav() {
  return (
    <nav className="no-print sticky top-0 z-50 border-b border-zillow-gray-border bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-container items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zillow-blue text-lg font-bold text-white">
            Z
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-zillow-ink">AV Engineering</div>
            <div className="text-xs text-zillow-slate">Cortney's Tracker</div>
          </div>
        </Link>
        <ul className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-zillow-slate transition-colors hover:bg-zillow-gray-light hover:text-zillow-ink"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <details className="md:hidden">
          <summary className="cursor-pointer rounded-lg p-2 text-zillow-ink">☰</summary>
          <ul className="absolute right-4 top-16 z-50 w-56 rounded-xl border border-zillow-gray-border bg-white p-2 shadow-lg">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-zillow-slate hover:bg-zillow-gray-light hover:text-zillow-ink"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </details>
      </div>
    </nav>
  );
}
