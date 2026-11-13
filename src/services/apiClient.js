import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || '/api',
  timeout: 12000,
  headers: { Accept: 'application/json' }
});

export function getApiError(error) {
  if (error?.response?.data?.error) return error.response.data.error;
  if (error?.code === 'ECONNABORTED') return 'Koneksi API terlalu lama. Coba lagi.';
  if (typeof navigator !== 'undefined' && !navigator.onLine) return 'Kamu sedang offline. Katalog tersimpan tetap dapat dibuka.';
  return 'API tidak dapat dihubungi. Pastikan server backend berjalan.';
}
