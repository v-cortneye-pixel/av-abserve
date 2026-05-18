import { buildDemoBrief } from '@/lib/demoBrief';
import { BriefView } from '@/components/BriefView';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const brief = buildDemoBrief();

  return (
    <main className="min-h-screen px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <SiteHeader />
        <BriefView brief={brief} />
        <SiteFooter />
      </div>
    </main>
  );
}

function SiteHeader() {
  return (
    <header className="mb-12 text-center">
      <p className="inline-flex items-center rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-200">
        Global beta · AV Observe sibling
      </p>
      <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
        Workplace Brief
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-lg text-slate-400">
        Proactive briefings for your office day — meetings, AV readiness, and{' '}
        <span className="text-white">iOffice wayfinder</span> to the room.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm">
        <FeaturePill>Calendar</FeaturePill>
        <FeaturePill>Zoom AV health</FeaturePill>
        <FeaturePill>Wayfinder</FeaturePill>
        <FeaturePill>Slack delivery</FeaturePill>
      </div>
    </header>
  );
}

function FeaturePill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-300">
      {children}
    </span>
  );
}

function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-white/10 pt-8 text-center text-sm text-slate-500">
      <p>
        Demo data · API at{' '}
        <a href="/api/brief" className="text-brand-400 hover:underline">
          /api/brief
        </a>
      </p>
      <p className="mt-2">
        Demo on Vercel (no secrets) · Production on GitLab CI ·{' '}
        <code className="text-slate-400">docs/DEPLOYMENT.md</code>
      </p>
    </footer>
  );
}
