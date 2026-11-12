# iEra

iEra adalah PWA React untuk mencari catatan spesies yang tercatat punah berdasarkan perkiraan tahun lahir, mengelola favorit pribadi, dan membaca profil praktikan. Katalog sengaja tidak berisi data contoh; masukkan data yang sudah diverifikasi beserta sumber serta lisensi gambar sebelum penggunaan.

## Mulai cepat

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Isi environment Supabase dan jalankan SQL sebelum memuat katalog. Lihat [Setup](./docs/SETUP.md), [panduan impor katalog](./docs/DATA_IMPORT.md), dan [perilaku offline](./docs/PWA_OFFLINE.md).

## Fitur

- Tiga tab: Beranda, Favorit, About Me.
- Pencarian umur ke tahun lahir dengan rentang katalog 2001–2025 dan maksimum tiga hasil.
- Favorite CRUD lokal/server, catatan pribadi, konfirmasi hapus, serta sinkronisasi outbox.
- Anonymous Auth dan RLS; tidak ada secret/service-role key di frontend.
- Installable PWA dengan app shell offline.

## Deploy

Atur `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` di Vercel, pastikan schema/RLS dan katalog sudah disiapkan, lalu jalankan build `npm run build` dengan output `dist`.
