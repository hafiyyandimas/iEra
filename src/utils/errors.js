export function getErrorMessage(error) {
  if (error?.response?.status === 401 || error?.response?.status === 403) {
    return 'Sesi tidak dapat mengakses data. Coba muat ulang atau periksa pengaturan Supabase.';
  }
  if (error?.code === 'ECONNABORTED') return 'Koneksi terlalu lama. Periksa jaringan lalu coba lagi.';
  if (!navigator.onLine) return 'Kamu sedang offline. Data yang tersimpan di perangkat tetap bisa digunakan.';
  return error?.message || 'Terjadi kesalahan. Silakan coba lagi.';
}
