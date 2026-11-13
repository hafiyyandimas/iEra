# iEra — Extinct Species Explorer

iEra adalah PWA tugas besar PPB untuk menjelajahi katalog spesies yang tercatat punah berdasarkan tahun, mencari hubungan dengan perkiraan tahun lahir, menyimpan favorit/catatan lokal, dan membuat entri pribadi yang belum diverifikasi.

## Struktur

- Frontend React + Vite berada di root repository; route memakai React Router.
- Backend REST API Node.js + Express berada di `backend/` dan membaca katalog Supabase.
- `database/` berisi skema baru (tahun saja), migrasi dari Modul 5, dan template CSV.
- Favorit, catatan, serta spesies pribadi hanya tersimpan di localStorage perangkat. Tidak ada login atau sinkronisasi antarperangkat.

## Menjalankan lokal

Gunakan Node.js 20 atau lebih baru. Siapkan frontend `.env.local` dari `.env.example`, lalu siapkan `backend/.env` dari `backend/.env.example`. Isi kredensial Supabase hanya pada backend.

Terminal pertama:

```powershell
npm install
npm run dev
```

Terminal kedua:

```powershell
npm --prefix backend install
npm run dev:api
```

Frontend berjalan di Vite, API lokal di `http://localhost:3000`. Untuk deployment Vercel satu project, frontend dan API memakai domain yang sama dengan base API `/api`. Jika frontend dan backend sengaja dideploy terpisah, set `VITE_API_BASE_URL` ke base URL API produksi.

## Database dan katalog

Untuk proyek Supabase baru, jalankan `database/schema.sql`. Jika tabel lama Modul 5 sudah berisi katalog, jalankan `database/migration_from_module5.sql` agar nilai tahun tetap tersimpan dan kolom tanggal/slot dihapus. Dataset awal yang sudah dipetakan ke skema baru ada di `database/seed_animals.csv`; jangan impor ulang setelah migrasi mempertahankan slug yang sama.

Jangan isi katalog dengan spesies, tahun, sumber, atau lisensi yang belum diverifikasi. Langkah detail berada di [docs/DATABASE.md](./docs/DATABASE.md).

## Fitur

- Lima tab: Era, Extinct Database, EraGuessr, Favorit, About Me.
- Timeline vertikal 2001–2026; data resmi mencakup 2001–2025.
- Detail spesies pada `/animal/:id`.
- Database mendukung pencarian, filter tahun, dan CRUD data pribadi lokal.
- EraGuessr menampilkan maksimal tiga spesies dengan tahun yang cocok.
- PWA, katalog network-first yang dicache, favorit serta data pribadi lokal.
- API read publik; endpoint tulis katalog memerlukan token admin server-side.

## Build dan test

```powershell
npm test
npm run build
```

Panduan API, deployment, dan offline ada di folder [docs/](./docs/).
