import type { BriefEvent } from '@/lib/spaces';
import { formatEventTime } from '@/lib/demoBrief';

const avStyles: Record<BriefEvent['avStatus'], { badge: string; dot: string }> = {
  ready: {
    badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    dot: 'bg-emerald-400'
  },
  attention: {
    badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    dot: 'bg-amber-400'
  },
  remote: {
    badge: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    dot: 'bg-sky-400'
  },
  unknown: {
    badge: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
    dot: 'bg-slate-400'
  }
};

function MapIcon({ small }: { small?: boolean }) {
  const size = small ? 'h-3.5 w-3.5' : 'h-4 w-4';
  return (
    <svg className={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
      />
    </svg>
  );
}

export function EventCard({ event }: { event: BriefEvent }) {
  const av = avStyles[event.avStatus];

  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition hover:border-white/20">
      <time className="text-sm font-medium text-slate-300">
        {formatEventTime(event.start)} → {formatEventTime(event.end)}
      </time>

      <h3 className="mt-3 text-lg font-semibold text-white">{event.subject}</h3>
      {event.organizer && (
        <p className="mt-1 text-sm text-slate-400">Hosted by {event.organizer}</p>
      )}

      <p className="mt-3 flex items-center gap-2 text-sm text-slate-300">
        <MapIcon />
        <span>{event.spaceDisplayName || event.location}</span>
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${av.badge}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${av.dot}`} />
          {event.avLabel}
        </span>
        {event.site && (
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300">
            {event.site}
          </span>
        )}
        {event.isImportant && (
          <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-xs text-amber-200">
            Priority
          </span>
        )}
      </div>

      <ActionLinks event={event} />
    </article>
  );
}

function ActionLinks({ event }: { event: BriefEvent }) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {event.wayfinderUrl && (
        <a
          href={event.wayfinderUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-brand-600"
        >
          <MapIcon small />
          Wayfinder
        </a>
      )}
      {event.joinUrl && (
        <a
          href={event.joinUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/10"
        >
          Join meeting
        </a>
      )}
    </div>
  );
}
