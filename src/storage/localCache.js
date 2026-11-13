const ANIMALS_KEY = 'iera.animals.v2';
const LEGACY_ANIMALS_KEY = 'iera.animals.v1';
const FAVORITES_KEY = 'iera.favorites.v2';
const LEGACY_FAVORITES_KEY = 'iera.favorites.v1';
const PERSONAL_ANIMALS_KEY = 'iera.personal-animals.v1';

function readJson(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch (error) {
    throw new Error(`Penyimpanan lokal tidak dapat dibaca: ${error.message}`);
  }
}

function writeJson(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    throw new Error(`Penyimpanan lokal gagal. Periksa ruang penyimpanan browser: ${error.message}`);
  }
}

function readArray(key, fallback) {
  const value = readJson(key, fallback);
  if (!Array.isArray(value)) throw new Error('Format data lokal tidak valid.');
  return value;
}

export function getCachedAnimals() {
  const current = readJson(ANIMALS_KEY, null);
  if (current !== null) return readArray(ANIMALS_KEY, []);
  const legacy = readJson(LEGACY_ANIMALS_KEY, null);
  if (!legacy) return null;
  if (!Array.isArray(legacy)) throw new Error('Format katalog lokal lama tidak valid.');
  return legacy.map((animal) => ({
    ...animal,
    year_is_estimated: animal.year_is_estimated ?? animal.date_precision === 'estimated'
  }));
}
export const cacheAnimals = (animals) => writeJson(ANIMALS_KEY, animals);
export function getLocalFavorites() {
  const current = readJson(FAVORITES_KEY, null);
  if (current !== null) return readArray(FAVORITES_KEY, []);
  const legacy = readArray(LEGACY_FAVORITES_KEY, []);
  return legacy.filter((favorite) => typeof favorite.animalId === 'string').map((favorite) => ({
    animalId: favorite.animalId,
    note: favorite.note || '',
    savedAt: favorite.savedAt || favorite.updatedAt || new Date().toISOString()
  }));
}
export const saveLocalFavorites = (favorites) => writeJson(FAVORITES_KEY, favorites);
export const getPersonalAnimals = () => readArray(PERSONAL_ANIMALS_KEY, []);
export const savePersonalAnimals = (animals) => writeJson(PERSONAL_ANIMALS_KEY, animals);
