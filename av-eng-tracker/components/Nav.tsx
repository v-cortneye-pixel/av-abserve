"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Paths that are shareable / forward-facing. When the user is on one of these,
// the full strategy nav is hidden so links to private pages (Playbook, 1:1
// Strategy, Patrick Audit, etc.) aren't exposed if the URL is shared.
const PUBLIC_PATHS = ["/findings"];

const NAV_ITEMS = [
  { href: "/", label: "Dashboard" },
  { href: "https://av-windows-setup.vercel.app", label: "🖥️ Windows Setup ↗" },
  { href: "/todo", label: "To-Do (do now)" },
  { href: "/triage", label: "Triage (P0 first)" },
  { href: "/findings", label: "📋 Findings (share-ready)" },
  { href: "/playbook", label: "Playbook (FTE)" },
  { href: "/one-on-one", label: "1:1 Strategy (private)" },
  { href: "/jira", label: "Jira" },
  { href: "/channels", label: "Channels & Contacts" },
  { href: "/timeline", label: "Team Timeline" },
  { href: "/sites", label: "Sites" },
  { href: "/tracker", label: "Tracker" },
  { href: "/questions", label: "Questions" },
  { href: "/issues", label: "Issues" },
  { href: "/nv-fleet", label: "NV Fleet" },
  { href: "/birddog", label: "BirdDog" },
  { href: "/uci", label: "UCI" },
  { href: "/patrick-audit", label: "Patrick Audit" },
  { href: "/splunk", label: "Splunk" },
  { href: "/mac-mini", label: "Mac Mini" },
  { href: "/hdmi", label: "HDMI" },
  { href: "/glossary", label: "Glossary" },
  { href: "/node", label: "Node.js (why)" },
  { href: "/handoff", label: "Handoff" },
  { href: "/plan", label: "Plan" },
  { href: "/quick-wins", label: "Wins" },
];

export default function Nav() {
  const pathname = usePathname();
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));

  // On forward-facing / shareable paths, render a stripped header with no
  // hamburger menu. Prevents accidental exposure of private strategy pages
  // when the URL is shared with the team.
  if (isPublic) {
    return (
      <nav className="no-print sticky top-0 z-50 border-b border-zillow-gray-border bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-container items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zillow-blue text-lg font-bold text-white">
              Z
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold text-zillow-ink">AV Engineering</div>
              <div className="text-xs text-zillow-slate">Findings · for team review</div>
            </div>
          </div>
          <span className="rounded-md bg-zillow-gray-light px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-zillow-slate">
            Share-ready view
          </span>
        </div>
      </nav>
    );
  }

  return (
    <nav className="no-print sticky top-0 z-50 border-b border-zillow-gray-border bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-container items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zillow-blue text-lg font-bold text-white">
            Z
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-zillow-ink">AV Engineering</div>
            <div className="text-xs text-zillow-slate">Cortney&apos;s Tracker</div>
          </div>
        </Link>

        <details className="group relative">
          <summary
            aria-label="Open menu"
            className="flex cursor-pointer list-none items-center gap-2 rounded-lg border border-zillow-gray-border bg-white px-3 py-2 text-sm font-semibold text-zillow-ink shadow-sm transition-colors hover:bg-zillow-gray-light"
          >
            <span
              aria-hidden
              className="flex h-4 w-5 flex-col justify-between"
            >
              <span className="block h-0.5 w-full rounded bg-zillow-ink" />
              <span className="block h-0.5 w-full rounded bg-zillow-ink" />
              <span className="block h-0.5 w-full rounded bg-zillow-ink" />
            </span>
            <span>Menu</span>
          </summary>
          <ul className="absolute right-0 top-12 z-50 max-h-[80vh] w-64 overflow-y-auto rounded-xl border border-zillow-gray-border bg-white p-2 shadow-xl">
            {NAV_ITEMS.map((item) => {
              const isExternal = item.href.startsWith("http");
              return (
                <li key={item.href}>
                  {isExternal ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-lg px-3 py-2 text-sm font-medium text-zillow-slate transition-colors hover:bg-zillow-gray-light hover:text-zillow-ink"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      href={item.href}
                      className="block rounded-lg px-3 py-2 text-sm font-medium text-zillow-slate transition-colors hover:bg-zillow-gray-light hover:text-zillow-ink"
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </details>
      </div>
    </nav>
  );
}
