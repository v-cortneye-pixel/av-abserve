import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { normalizeRoomName, roomNamesMatch } from './normalizeRoomName.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '../data');

function loadJsonIfExists(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

/**
 * Load space directory (pilot mappings). Falls back to sample file for demos.
 */
export function loadSpaceDirectory() {
  const primary = path.join(DATA_DIR, 'spaceDirectory.json');
  const sample = path.join(DATA_DIR, 'spaceDirectory.sample.json');
  const data = loadJsonIfExists(primary) || loadJsonIfExists(sample);
  if (!data?.spaces) {
    return { spaces: [] };
  }
  return data;
}

/**
 * Resolve calendar location / subject hints to a space record + wayfinder URL.
 */
export function resolveSpace(locationText, subjectText, spaces) {
  const candidates = [locationText, subjectText].filter(Boolean);
  for (const space of spaces) {
    const patterns = [
      space.displayName,
      space.zoomRoomName,
      ...(space.match || [])
    ].filter(Boolean);

    for (const candidate of candidates) {
      for (const pattern of patterns) {
        if (roomNamesMatch(candidate, pattern)) {
          return space;
        }
      }
    }
  }

  // Site code fallback from location string (e.g. "IRV-1109")
  for (const candidate of candidates) {
    const normalized = normalizeRoomName(candidate);
    const siteMatch = normalized.match(/\b(irv|sea|sfo|nyc|den|kcy)\b/);
    if (siteMatch) {
      return {
        displayName: candidate,
        site: siteMatch[1].toUpperCase(),
        ioffice: null,
        inferred: true
      };
    }
  }

  return null;
}

export function getWayfinderUrl(space, iofficeConfig = {}) {
  if (space?.ioffice?.wayfinderUrl) {
    return space.ioffice.wayfinderUrl;
  }
  const base = iofficeConfig.wayfinderBaseUrl;
  const spaceId = space?.ioffice?.spaceId;
  if (base && spaceId) {
    const separator = base.includes('?') ? '&' : '?';
    return `${base}${separator}spaceId=${encodeURIComponent(spaceId)}`;
  }
  return null;
}
