/**
 * Tier-1 filtering: only surface high-signal meetings in pilot briefs.
 */

function matchesKeywords(text, keywords) {
  const haystack = (text || '').toLowerCase();
  return keywords.some((kw) => haystack.includes(kw.toLowerCase()));
}

export function isTier1Event(event, config) {
  const keywords = config.pilot?.importanceKeywords || [];
  const primarySite = config.pilot?.primarySite;
  const subject = event.subject || '';
  const location = event.location || event.spaceDisplayName || '';

  if (event.importance === 'high') return true;
  if (event.isImportant) return true;
  if (matchesKeywords(`${subject} ${location}`, keywords)) return true;

  if (primarySite && event.site === primarySite && event.isInOffice) {
    return matchesKeywords(`${subject} ${location}`, keywords);
  }

  return false;
}

export function applyTier1Filter(events, config) {
  const tier1Only =
    process.env.WORKPLACE_TIER1_ONLY !== 'false' && config.briefing?.tier1Only !== false;

  if (!tier1Only) {
    return {
      events,
      tier1Only: false,
      totalBefore: events.length,
      totalAfter: events.length
    };
  }

  const filtered = events.filter((event) => isTier1Event(event, config));

  return {
    events: filtered,
    tier1Only: true,
    totalBefore: events.length,
    totalAfter: filtered.length
  };
}
