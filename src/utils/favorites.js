export const FAVORITE_NOTE_MAX_LENGTH = 500;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isCatalogFavoriteId(value) {
  return typeof value === 'string' && UUID_PATTERN.test(value);
}

export function normalizeFavoriteNote(value) {
  if (typeof value !== 'string') return '';
  return value.slice(0, FAVORITE_NOTE_MAX_LENGTH);
}

function readTime(value) {
  const time = Date.parse(value);
  return Number.isNaN(time) ? 0 : time;
}

export function normalizeFavorite(value) {
  if (!value || typeof value !== 'object') return null;
  const animalId = typeof value.animalId === 'string' ? value.animalId.trim() : '';
  if (!animalId) return null;

  const savedTime = readTime(value.savedAt) || readTime(value.updatedAt) || Date.now();
  const updatedTime = readTime(value.updatedAt) || savedTime;
  return {
    animalId,
    note: normalizeFavoriteNote(value.note),
    savedAt: new Date(savedTime).toISOString(),
    updatedAt: new Date(updatedTime).toISOString()
  };
}

// Union of device favorites and account favorites. The note from the most
// recently updated copy wins; the earliest save date is kept.
export function mergeFavorites(deviceFavorites = [], accountFavorites = []) {
  const merged = new Map();

  for (const value of [...deviceFavorites, ...accountFavorites]) {
    const favorite = normalizeFavorite(value);
    if (!favorite) continue;

    const existing = merged.get(favorite.animalId);
    if (!existing) {
      merged.set(favorite.animalId, favorite);
      continue;
    }

    const newer = readTime(favorite.updatedAt) >= readTime(existing.updatedAt) ? favorite : existing;
    merged.set(favorite.animalId, {
      animalId: favorite.animalId,
      note: newer.note,
      savedAt: new Date(Math.min(readTime(existing.savedAt), readTime(favorite.savedAt))).toISOString(),
      updatedAt: newer.updatedAt
    });
  }

  return [...merged.values()].sort((a, b) => (
    readTime(b.savedAt) - readTime(a.savedAt) || a.animalId.localeCompare(b.animalId)
  ));
}
