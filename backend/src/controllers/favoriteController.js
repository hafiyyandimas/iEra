import {
  deleteAccountFavorite,
  listAccountFavorites,
  replaceAccountFavorites,
  saveAccountFavorite
} from '../models/favoriteModel.js';

const FAVORITE_LIMIT = 200;
const NOTE_MAX_LENGTH = 500;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function badRequest(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

function validateAnimalId(value) {
  if (typeof value !== 'string' || !UUID_PATTERN.test(value)) {
    throw badRequest('ID spesies favorit tidak valid.');
  }
  return value;
}

function validateNote(value) {
  if (value === undefined || value === null) return '';
  if (typeof value !== 'string') throw badRequest('Catatan harus berupa teks.');
  if (value.length > NOTE_MAX_LENGTH) throw badRequest(`Catatan maksimal ${NOTE_MAX_LENGTH} karakter.`);
  return value;
}

function validateSavedAt(value) {
  if (value === undefined || value === null) return new Date().toISOString();
  const time = Date.parse(value);
  if (typeof value !== 'string' || Number.isNaN(time)) throw badRequest('Waktu simpan favorit tidak valid.');
  return new Date(time).toISOString();
}

function validateFavorite(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw badRequest('Setiap favorit harus berupa objek.');
  }
  return {
    animalId: validateAnimalId(value.animalId),
    note: validateNote(value.note),
    savedAt: validateSavedAt(value.savedAt)
  };
}

function toPublicFavorite(row) {
  return {
    animalId: row.animal_id,
    note: row.note,
    savedAt: row.saved_at,
    updatedAt: row.updated_at
  };
}

export async function getFavorites(req, res, next) {
  try {
    const rows = await listAccountFavorites(req.authUser.id);
    return res.json({ success: true, data: rows.map(toPublicFavorite) });
  } catch (error) {
    return next(error);
  }
}

export async function putFavorite(req, res, next) {
  try {
    const animalId = validateAnimalId(req.params.animalId);
    const row = await saveAccountFavorite({
      userId: req.authUser.id,
      animalId,
      note: validateNote(req.body?.note),
      savedAt: validateSavedAt(req.body?.savedAt)
    });
    return res.json({ success: true, data: toPublicFavorite(row) });
  } catch (error) {
    return next(error);
  }
}

export async function deleteFavorite(req, res, next) {
  try {
    const animalId = validateAnimalId(req.params.animalId);
    await deleteAccountFavorite(req.authUser.id, animalId);
    return res.json({ success: true, data: { animalId } });
  } catch (error) {
    return next(error);
  }
}

export async function putFavorites(req, res, next) {
  try {
    const body = req.body;
    if (!body || typeof body !== 'object' || Array.isArray(body) || !Array.isArray(body.favorites)) {
      throw badRequest('Body harus berisi array favorites.');
    }
    if (body.favorites.length > FAVORITE_LIMIT) {
      throw badRequest(`Maksimal ${FAVORITE_LIMIT} favorit per akun.`);
    }

    const seen = new Set();
    const favorites = body.favorites.map((value) => {
      const favorite = validateFavorite(value);
      if (seen.has(favorite.animalId)) throw badRequest('Daftar favorit memuat spesies yang sama lebih dari sekali.');
      seen.add(favorite.animalId);
      return favorite;
    });

    const rows = await replaceAccountFavorites({ userId: req.authUser.id, favorites });
    return res.json({ success: true, data: rows.map(toPublicFavorite) });
  } catch (error) {
    return next(error);
  }
}
