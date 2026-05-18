/**
 * Normalize room/location strings for fuzzy matching across
 * calendar, Zoom, and iOffice space directory entries.
 */
export function normalizeRoomName(value) {
  if (!value || typeof value !== 'string') return '';
  return value
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function roomNamesMatch(a, b) {
  const left = normalizeRoomName(a);
  const right = normalizeRoomName(b);
  if (!left || !right) return false;
  if (left === right) return true;
  return left.includes(right) || right.includes(left);
}
