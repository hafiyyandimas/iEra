import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isCatalogFavoriteId,
  mergeFavorites,
  normalizeFavorite,
  normalizeFavoriteNote
} from './favorites.js';

const FIRST = '3f0c1f9e-1a2b-4c3d-8e4f-5a6b7c8d9e0f';
const SECOND = '7a1b2c3d-4e5f-4a6b-9c7d-8e9f0a1b2c3d';

test('only catalog UUIDs are treated as account-syncable favorites', () => {
  assert.equal(isCatalogFavoriteId(FIRST), true);
  assert.equal(isCatalogFavoriteId('personal-9f8e7d6c'), false);
  assert.equal(isCatalogFavoriteId('thylacine'), false);
  assert.equal(isCatalogFavoriteId(undefined), false);
});

test('notes are trimmed to the catalog length limit and non-strings become empty', () => {
  assert.equal(normalizeFavoriteNote('catatan'), 'catatan');
  assert.equal(normalizeFavoriteNote(42), '');
  assert.equal(normalizeFavoriteNote('x'.repeat(600)).length, 500);
});

test('normalizeFavorite rejects entries without an animal id', () => {
  assert.equal(normalizeFavorite({ animalId: '' }), null);
  assert.equal(normalizeFavorite(null), null);
});

test('mergeFavorites keeps the union and prefers the newest note', () => {
  const merged = mergeFavorites(
    [{
      animalId: FIRST,
      note: 'versi perangkat',
      savedAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z'
    }],
    [
      {
        animalId: FIRST,
        note: 'versi akun',
        savedAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-03-01T00:00:00.000Z'
      },
      {
        animalId: SECOND,
        note: '',
        savedAt: '2025-12-01T00:00:00.000Z',
        updatedAt: '2025-12-01T00:00:00.000Z'
      }
    ]
  );

  assert.equal(merged.length, 2);
  assert.equal(merged[0].animalId, FIRST);
  assert.equal(merged[0].note, 'versi akun');
  assert.equal(merged[0].savedAt, '2026-01-01T00:00:00.000Z');
  assert.equal(merged[1].animalId, SECOND);
});

test('mergeFavorites keeps a device note that is newer than the account copy', () => {
  const merged = mergeFavorites(
    [{
      animalId: FIRST,
      note: 'catatan baru',
      savedAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-06-01T00:00:00.000Z'
    }],
    [{
      animalId: FIRST,
      note: 'catatan lama',
      savedAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-02-01T00:00:00.000Z'
    }]
  );

  assert.equal(merged.length, 1);
  assert.equal(merged[0].note, 'catatan baru');
});
