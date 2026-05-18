import spaceDirectory from '@/data/spaceDirectory.json';

export type SpaceRecord = {
  id?: string;
  site?: string;
  displayName?: string;
  match?: string[];
  zoomRoomName?: string;
  ioffice?: { wayfinderUrl?: string; spaceId?: string };
  inferred?: boolean;
};

export type BriefEvent = {
  subject: string;
  start: string;
  end: string;
  location: string;
  organizer?: string;
  joinUrl?: string;
  site: string | null;
  spaceDisplayName: string | null;
  wayfinderUrl: string | null;
  avStatus: 'ready' | 'attention' | 'remote' | 'unknown';
  avLabel: string;
  isInOffice: boolean;
  isImportant?: boolean;
};

export type BriefPayload = {
  mode: string;
  generatedAt: string;
  events: BriefEvent[];
  meta: { source: string; eventCount: number };
};

export function normalizeRoomName(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function roomNamesMatch(a: string, b: string): boolean {
  const left = normalizeRoomName(a);
  const right = normalizeRoomName(b);
  if (!left || !right) return false;
  if (left === right) return true;
  return left.includes(right) || right.includes(left);
}

export function resolveSpace(
  locationText: string,
  subjectText: string
): SpaceRecord | null {
  const spaces = spaceDirectory.spaces as SpaceRecord[];
  const candidates = [locationText, subjectText].filter(Boolean);

  for (const space of spaces) {
    const patterns = [space.displayName, space.zoomRoomName, ...(space.match || [])].filter(
      Boolean
    ) as string[];
    for (const candidate of candidates) {
      for (const pattern of patterns) {
        if (roomNamesMatch(candidate, pattern)) return space;
      }
    }
  }

  for (const candidate of candidates) {
    const normalized = normalizeRoomName(candidate);
    const siteMatch = normalized.match(/\b(irv|sea|sfo|nyc|den|kcy)\b/);
    if (siteMatch) {
      return {
        displayName: candidate,
        site: siteMatch[1].toUpperCase(),
        inferred: true
      };
    }
  }
  return null;
}
