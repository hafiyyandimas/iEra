import {
  findAnimalById,
  insertAnimal,
  listAnimals,
  removeAnimal,
  updateAnimal
} from '../models/animalModel.js';

const requiredTextFields = ['slug', 'common_name', 'scientific_name', 'description', 'source_url'];
const optionalTextFields = [
  'image_url', 'image_alt', 'habitat', 'region', 'image_credit', 'image_license', 'source_name', 'image_source_url'
];
const allowedFields = new Set([
  ...requiredTextFields,
  ...optionalTextFields,
  'extinction_year',
  'year_is_estimated'
]);

function validateAnimal(body, partial = false) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    const error = new Error('Request body must be a JSON object.');
    error.status = 400;
    throw error;
  }
  const unexpected = Object.keys(body).find((field) => !allowedFields.has(field));
  if (unexpected) {
    const error = new Error(`Kolom ${unexpected} tidak dapat diubah melalui API.`);
    error.status = 400;
    throw error;
  }
  const fields = partial ? requiredTextFields.filter((field) => field in body) : requiredTextFields;
  for (const field of fields) {
    if (typeof body[field] !== 'string' || !body[field].trim()) {
      const error = new Error(`${field} wajib diisi sebagai teks.`);
      error.status = 400;
      throw error;
    }
    if (body[field].length > (field === 'description' ? 5000 : 200)) {
      const error = new Error(`${field} terlalu panjang.`);
      error.status = 400;
      throw error;
    }
  }
  if ('slug' in body && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(body.slug)) {
    const error = new Error('slug hanya boleh berisi huruf kecil, angka, dan tanda hubung.');
    error.status = 400;
    throw error;
  }
  if (!partial || 'extinction_year' in body) {
    if (!Number.isInteger(body.extinction_year) || body.extinction_year < 2001 || body.extinction_year > 2025) {
      const error = new Error('extinction_year harus integer antara 2001 dan 2025.');
      error.status = 400;
      throw error;
    }
  }
  if ('year_is_estimated' in body && typeof body.year_is_estimated !== 'boolean') {
    const error = new Error('year_is_estimated harus bernilai boolean.');
    error.status = 400;
    throw error;
  }

  for (const field of optionalTextFields) {
    if (field in body && body[field] !== null && typeof body[field] !== 'string') {
      const error = new Error(`${field} harus berupa teks atau null.`);
      error.status = 400;
      throw error;
    }
  }
  if ('source_url' in body && !isHttpUrl(body.source_url)) {
    const error = new Error('source_url harus berupa URL HTTP atau HTTPS yang valid.');
    error.status = 400;
    throw error;
  }
  if ('image_url' in body && body.image_url && !isHttpUrl(body.image_url)) {
    const error = new Error('image_url harus berupa URL HTTP atau HTTPS yang valid.');
    error.status = 400;
    throw error;
  }
  const normalized = {};
  for (const field of allowedFields) {
    if (!(field in body)) continue;
    normalized[field] = typeof body[field] === 'string' ? body[field].trim() : body[field];
  }
  return normalized;
}

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

function validateUuid(value) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
    const error = new Error('ID spesies tidak valid.');
    error.status = 400;
    throw error;
  }
}

export async function getAnimals(req, res, next) {
  try {
    let year;
    if (req.query.year !== undefined) {
      year = Number(req.query.year);
      if (!Number.isInteger(year) || year < 2001 || year > 2025) {
        return res.status(400).json({ success: false, error: 'Tahun harus integer antara 2001 dan 2025.' });
      }
    }
    const data = await listAnimals({ year, search: req.query.search });
    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
}

export async function getAnimalsByYear(req, res, next) {
  req.query.year = req.params.year;
  return getAnimals(req, res, next);
}

export async function getAnimal(req, res, next) {
  try {
    const animal = await findAnimalById(req.params.id);
    if (!animal) return res.status(404).json({ success: false, error: 'Spesies tidak ditemukan.' });
    return res.json({ success: true, data: animal });
  } catch (error) {
    return next(error);
  }
}

export async function createAnimal(req, res, next) {
  try {
    const animal = validateAnimal(req.body);
    const data = await insertAnimal(animal);
    return res.status(201).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
}

export async function replaceAnimal(req, res, next) {
  try {
    validateUuid(req.params.id);
    const animal = validateAnimal(req.body);
    const data = await updateAnimal(req.params.id, animal);
    if (!data) return res.status(404).json({ success: false, error: 'Spesies tidak ditemukan.' });
    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
}

export async function deleteAnimal(req, res, next) {
  try {
    validateUuid(req.params.id);
    const data = await removeAnimal(req.params.id);
    if (!data) return res.status(404).json({ success: false, error: 'Spesies tidak ditemukan.' });
    return res.json({ success: true, data: { id: data.id } });
  } catch (error) {
    return next(error);
  }
}
