import { apiClient } from './apiClient.js';

export async function fetchAnimals() {
  const response = await apiClient.get('/animals', {
    params: {
      select: '*',
      order: 'extinction_year.asc,slot.asc'
    }
  });
  if (!Array.isArray(response.data)) throw new Error('Format data katalog tidak valid.');
  return response.data;
}
