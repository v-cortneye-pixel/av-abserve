import {
  BriefEvent,
  BriefPayload,
  normalizeRoomName,
  resolveSpace
} from '@/lib/spaces';

const avHealth = new Map<string, { status: BriefEvent['avStatus']; label: string }>([
  [normalizeRoomName('IRV-1109 zRetreat'), { status: 'ready', label: 'Ready' }],
  [normalizeRoomName('SEA-3619 All Hands'), { status: 'attention', label: 'Check AV' }]
]);

function enrich(
  raw: {
    subject: string;
    start: string;
    end: string;
    location: string;
    organizer?: string;
    joinUrl?: string;
    isInOffice?: boolean;
    isImportant?: boolean;
  }
): BriefEvent {
  const space = resolveSpace(raw.location, raw.subject);
  const roomKey = normalizeRoomName(space?.zoomRoomName || raw.location);
  const av = avHealth.get(roomKey);
  const wayfinderUrl = space?.ioffice?.wayfinderUrl ?? null;

  return {
    subject: raw.subject,
    start: raw.start,
    end: raw.end,
    location: raw.location,
    organizer: raw.organizer,
    joinUrl: raw.joinUrl,
    site: space?.site ?? null,
    spaceDisplayName: space?.displayName ?? raw.location,
    wayfinderUrl,
    avStatus: av?.status ?? (raw.isInOffice === false ? 'remote' : 'unknown'),
    avLabel: av?.label ?? (raw.isInOffice === false ? 'Remote' : 'Unknown'),
    isInOffice: raw.isInOffice ?? Boolean(space?.site),
    isImportant: raw.isImportant
  };
}

export function buildDemoBrief(): BriefPayload {
  const now = new Date();
  const inHours = (h: number) => new Date(now.getTime() + h * 60 * 60 * 1000).toISOString();

  const events = [
    {
      subject: 'QBR — Sales leadership',
      start: inHours(2),
      end: inHours(3),
      location: 'IRV-1109 zRetreat',
      organizer: 'Alex Morgan',
      joinUrl: 'https://zillowgroup.zoom.us/j/example',
      isInOffice: true
    },
    {
      subject: 'Customer demo — Pacific region',
      start: inHours(5),
      end: inHours(6),
      location: 'SEA-3619 All Hands',
      organizer: 'Jordan Lee',
      joinUrl: 'https://zillowgroup.zoom.us/j/example2',
      isInOffice: true,
      isImportant: true
    },
    {
      subject: 'Remote sync — product roadmap',
      start: inHours(8),
      end: inHours(8.5),
      location: 'Microsoft Teams Meeting',
      organizer: 'Sam Patel',
      joinUrl: 'https://teams.microsoft.com/l/meetup-join/example',
      isInOffice: false
    }
  ].map(enrich);

  return {
    mode: 'demo',
    generatedAt: now.toISOString(),
    events,
    meta: { source: 'demo', eventCount: events.length }
  };
}

export function formatEventTime(iso: string): string {
  const date = new Date(iso.endsWith('Z') ? iso : `${iso}Z`);
  return date.toLocaleString('en-US', {
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short'
  });
}
