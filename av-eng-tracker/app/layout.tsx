import type { Metadata } from "next";
import Nav from "@/components/Nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "AV Engineering Tracker — Cortney",
  description:
    "Zillow AV Engineering — recurring issues, Patrick handoff, 90-day plan, and HDMI architecture options.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white">
        <Nav />
        <main className="mx-auto max-w-container px-6 py-10 md:py-12">{children}</main>
        <footer className="no-print mt-16 border-t border-zillow-gray-border">
          <div className="mx-auto flex max-w-container flex-col gap-2 px-6 py-8 text-xs text-zillow-slate md:flex-row md:items-center md:justify-between">
            <div>Compiled from #av-team Slack history (Sep 2023 → May 2026).</div>
            <div>Living document. Update as items move through resolution.</div>
          </div>
        </footer>
      </body>
    </html>
  );
}
