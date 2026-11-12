const ANIMALS_KEY = 'iera.animals.v1';
const FAVORITES_KEY = 'iera.favorites.v1';

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

export const getCachedAnimals = () => readJson(ANIMALS_KEY, null);
export const cacheAnimals = (animals) => writeJson(ANIMALS_KEY, animals);
export const getLocalFavorites = () => readJson(FAVORITES_KEY, []);
export const saveLocalFavorites = (favorites) => writeJson(FAVORITES_KEY, favorites);
