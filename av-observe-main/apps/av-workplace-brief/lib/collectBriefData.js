import { Zoom, Microsoft } from '@av-observe/shared/modules/index.js';
import { loadSpaceDirectory, resolveSpace, getWayfinderUrl } from './spaceDirectory.js';
import { normalizeRoomName } from './normalizeRoomName.js';

function getDemoBrief() {
  const spaces = loadSpaceDirectory().spaces;
  const now = new Date();
  const inHours = (h) => new Date(now.getTime() + h * 60 * 60 * 1000).toISOString();

  const events = [
    {
      subject: 'QBR — Sales leadership',
      start: inHours(2),
      end: inHours(3),
      location: 'IRV-1109 zRetreat',
      organizer: { emailAddress: { name: 'Alex Morgan' } },
      onlineMeeting: { joinUrl: 'https://zillowgroup.zoom.us/j/example' },
      importance: 'normal',
      isInOffice: true
    },
    {
      subject: 'Customer demo — Pacific region',
      start: inHours(5),
      end: inHours(6),
      location: 'SEA-3619 All Hands',
      organizer: { emailAddress: { name: 'Jordan Lee' } },
      onlineMeeting: { joinUrl: 'https://zillowgroup.zoom.us/j/example2' },
      importance: 'high',
      isInOffice: true
    },
    {
      subject: 'Remote sync — product roadmap',
      start: inHours(8),
      end: inHours(8.5),
      location: 'Microsoft Teams Meeting',
      organizer: { emailAddress: { name: 'Sam Patel' } },
      onlineMeeting: { joinUrl: 'https://teams.microsoft.com/l/meetup-join/example' },
      importance: 'normal',
      isInOffice: false
    }
  ].map((event) => enrichEvent(event, spaces, {}, buildDemoAvHealth()));

  return {
    mode: 'demo',
    generatedAt: now.toISOString(),
    pilotUsers: [{ email: 'pilot@example.com', displayName: 'Pilot User (demo)' }],
    events,
    avHealthByRoom: buildDemoAvHealth(),
    meta: { source: 'demo', eventCount: events.length }
  };
}

function buildDemoAvHealth() {
  return new Map([
    [normalizeRoomName('IRV-1109 zRetreat'), { status: 'ready', label: 'Ready', health: 'noissue' }],
    [normalizeRoomName('SEA-3619 All Hands'), { status: 'attention', label: 'Check AV', health: 'issues' }]
  ]);
}

function enrichEvent(event, spaces, iofficeConfig, avHealthByRoom) {
  const locationText =
    event.location?.displayName ||
    event.location ||
    event.locations?.[0]?.displayName ||
    '';
  const space = resolveSpace(locationText, event.subject, spaces);
  const wayfinderUrl = getWayfinderUrl(space, iofficeConfig);
  const roomKey = normalizeRoomName(space?.zoomRoomName || locationText);
  const av = roomKey ? avHealthByRoom.get(roomKey) : null;

  return {
    subject: event.subject,
    start: event.start?.dateTime || event.start,
    end: event.end?.dateTime || event.end,
    location: locationText,
    organizer: event.organizer?.emailAddress?.name || event.organizer?.emailAddress?.address,
    joinUrl: event.onlineMeeting?.joinUrl || event.onlineMeetingUrl,
    importance: event.importance || 'normal',
    site: space?.site || null,
    spaceDisplayName: space?.displayName || locationText || null,
    wayfinderUrl,
    avStatus: av?.status || (locationText && !event.isInOffice ? 'remote' : 'unknown'),
    avLabel: av?.label || (event.isInOffice === false ? 'Remote' : 'Unknown'),
    isInOffice: Boolean(space?.site || /room|retreat|hands|board|floor/i.test(locationText))
  };
}

async function buildAvHealthByRoom(zoom) {
  const map = new Map();
  try {
    const rooms = await zoom.requestData('metrics/zoomrooms', { params: { page_size: 300 } });
    for (const room of rooms || []) {
      const key = normalizeRoomName(room.room_name);
      const health = room.health || 'unknown';
      let status = 'unknown';
      let label = 'Unknown';

      if (health === 'noissue') {
        status = 'ready';
        label = 'Ready';
      } else if (health === 'issues' || health === 'critical') {
        status = 'attention';
        label = 'Check AV';
      } else {
        status = 'attention';
        label = 'Check AV';
      }

      map.set(key, { status, label, health, roomName: room.room_name });
    }
  } catch (error) {
    console.warn('Could not load Zoom room health:', error.message);
  }
  return map;
}

function isImportantEvent(event, keywords) {
  const text = `${event.subject || ''} ${event.location || ''}`.toLowerCase();
  return keywords.some((kw) => text.includes(kw.toLowerCase()));
}

export async function collectBriefData(appConfig) {
  if (process.env.WORKPLACE_DEMO === 'true') {
    return getDemoBrief();
  }

  const spaces = loadSpaceDirectory().spaces;
  const iofficeConfig = appConfig.ioffice || {};
  const keywords = appConfig.pilot?.importanceKeywords || [];
  const pilotEmails = appConfig.pilot?.userEmails || [];
  const lookaheadHours = appConfig.briefing?.lookaheadHours ?? 24;

  if (pilotEmails.length === 0) {
    throw new Error(
      'No pilot users configured. Set pilot.userEmails in apps/av-workplace-brief/config.json or run with WORKPLACE_DEMO=true.'
    );
  }

  const zoom = new Zoom();
  const microsoft = new Microsoft();
  const avHealthByRoom = await buildAvHealthByRoom(zoom);

  const now = new Date();
  const end = new Date(now.getTime() + lookaheadHours * 60 * 60 * 1000);

  const allEvents = [];

  for (const email of pilotEmails) {
    const result = await microsoft.getUserEvents(email, {
      select: 'subject,start,end,organizer,location,importance,onlineMeeting',
      startDate: now,
      endDate: end,
      top: appConfig.briefing?.maxEventsPerUser || 25
    });
    for (const raw of result.value || []) {
      const locationText = raw.location?.displayName || '';
      const enriched = enrichEvent(
        {
          ...raw,
          location: locationText,
          isInOffice: Boolean(locationText && !/teams meeting|zoom/i.test(locationText))
        },
        spaces,
        iofficeConfig,
        avHealthByRoom
      );
      enriched.pilotUser = email;
      enriched.isImportant = isImportantEvent(enriched, keywords);
      allEvents.push(enriched);
    }
  }

  allEvents.sort((a, b) => new Date(a.start) - new Date(b.start));

  return {
    mode: process.env.mode === 'testing' ? 'testing' : 'production',
    generatedAt: now.toISOString(),
    pilotUsers: pilotEmails.map((email) => ({ email })),
    events: allEvents.slice(0, appConfig.briefing?.maxEventsPerUser * pilotEmails.length || 50),
    avHealthByRoom: Object.fromEntries(avHealthByRoom),
    meta: {
      source: 'live',
      eventCount: allEvents.length,
      lookaheadHours
    }
  };
}
