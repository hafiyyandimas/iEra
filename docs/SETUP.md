# Setup lokal dan Supabase

## Menjalankan aplikasi

1. Pasang Node.js 20 atau lebih baru.
2. Jalankan `npm install`.
3. Salin `.env.example` menjadi `.env.local`, lalu isi:
   - `VITE_SUPABASE_URL`: URL proyek Supabase.
   - `VITE_SUPABASE_ANON_KEY`: publishable/anon key proyek. Jangan gunakan service-role key.
4. Di Supabase Authentication → Providers, aktifkan **Anonymous sign-ins**.
5. Jalankan isi `supabase/schema.sql` pada SQL Editor.
6. Impor data katalog tervalidasi mengikuti [panduan katalog](./DATA_IMPORT.md).
7. Jalankan `npm run dev`.

Tanpa konfigurasi Supabase, UI dan halaman profil tetap dapat dibuka, tetapi katalog dan sinkronisasi server tidak tersedia. Tidak ada data hewan contoh.

## Perilaku data

- Katalog dimuat lewat REST API Supabase menggunakan Axios dan disimpan di localStorage.
- Sesi anonymous dibuat ketika browser online dan belum memiliki sesi.
- Operasi favorit mengirim publishable key pada `apikey` dan JWT sesi pada `Authorization`.
- Favorit/catatan lokal langsung tersimpan; bila request tertunda, operasi berada dalam outbox dan dicoba lagi saat online.
- Data favorit milik sesi anonymous dapat hilang jika data browser dihapus. Sesi tanpa akun tidak dapat dipulihkan lintas perangkat.

## Build dan deploy Vercel

Jalankan `npm run build`; Vercel memakai `npm run build` dan output `dist`. Tambahkan `VITE_SUPABASE_URL` serta `VITE_SUPABASE_ANON_KEY` pada Project Settings → Environment Variables, untuk environment yang digunakan, lalu deploy ulang setelah perubahan env.

`vercel.json` mengarahkan navigasi SPA ke `index.html`. Deploy hanya setelah SQL, Anonymous Auth, RLS, dan data katalog siap.
