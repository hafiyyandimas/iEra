import { apiClient } from './apiClient.js';

function unwrap(response) {
  if (!response.data?.success) throw new Error(response.data?.error || 'Respons API tidak valid.');
  return response.data.data;
}

export async function fetchAnimals(params = {}) {
  const response = await apiClient.get('/animals', { params });
  const data = unwrap(response);
  if (!Array.isArray(data)) throw new Error('Format katalog API tidak valid.');
  return data;
}

export async function fetchAnimal(id) {
  const response = await apiClient.get(`/animals/${encodeURIComponent(id)}`);
  const data = unwrap(response);
  if (!data || typeof data !== 'object') throw new Error('Format detail spesies tidak valid.');
  return data;
}

export async function createOfficialAnimal(animal, accessToken) {
  if (!accessToken) throw new Error('Login admin diperlukan.');
  const response = await apiClient.post('/animals', animal, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  return unwrap(response);
}
