import type { BriefPayload } from '@/lib/spaces';
import { formatEventTime } from '@/lib/demoBrief';
import { EventCard } from '@/components/EventCard';

export function BriefView({ brief }: { brief: BriefPayload }) {
  return (
    <section className="mx-auto max-w-2xl">
      <header className="mb-8 rounded-2xl border border-white/10 bg-gradient-to-br from-brand-500/20 to-transparent p-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-100">
          Beta · Powered by AV Observe
        </p>
        <h2 className="mt-2 text-2xl font-bold text-white">Your day at a glance</h2>
        <p className="mt-2 text-sm text-slate-400">
          Generated {formatEventTime(brief.generatedAt)} · {brief.events.length} upcoming
          events · mode <code className="text-brand-300">{brief.mode}</code>
        </p>
      </header>

      <ol className="space-y-4">
        {brief.events.map((event) => (
          <li key={`${event.subject}-${event.start}`}>
            <EventCard event={event} />
          </li>
        ))}
      </ol>
    </section>
  );
}
