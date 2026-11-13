# iEra — Extinct Species Explorer

iEra adalah PWA tugas besar PPB untuk menjelajahi katalog spesies yang tercatat punah berdasarkan tahun, mencari hubungan dengan perkiraan tahun lahir, dan menyimpan favorit/catatan lokal. Admin dapat menambahkan spesies ke katalog resmi.

## Struktur

- Frontend React + Vite berada di root repository; route memakai React Router.
- Backend REST API Node.js + Express berada di `backend/` dan membaca katalog Supabase. Login memakai Supabase Auth.
- `database/` berisi skema baru (tahun saja), migrasi dari Modul 5, dan template CSV.
- Guest dan akun `user` dapat melihat katalog dan memakai favorit/catatan lokal; hanya role `admin` dapat menambahkan katalog resmi.

## Menjalankan lokal

Gunakan Node.js 20 atau lebih baru. Siapkan frontend `.env.local` dari `.env.example` dengan Supabase URL dan anon/publishable key. Siapkan `backend/.env` dari `backend/.env.example` dengan Supabase URL dan service-role key. Jangan pernah memasukkan service-role key ke frontend.

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

Untuk proyek Supabase baru, jalankan `database/schema.sql`. Untuk database yang sudah ada, jalankan `database/migration_add_auth_roles.sql` agar registrasi membuat role `user`; jalankan juga `database/migration_from_module5.sql` hanya bila tabel masih memakai skema Modul 5. Setelah akun admin mendaftar, promosikan emailnya secara manual dengan query di `docs/DATABASE.md`. Dataset awal yang sudah dipetakan ke skema baru ada di `database/seed_animals.csv`; jangan impor ulang setelah migrasi mempertahankan slug yang sama.

Jangan isi katalog dengan spesies, tahun, sumber, atau lisensi yang belum diverifikasi. Langkah detail berada di [docs/DATABASE.md](./docs/DATABASE.md).

## Fitur

- Lima tab: Era, Extinct Database, EraGuessr, Favorit, About Me.
- Timeline vertikal 2001–2026; data resmi mencakup 2001–2025.
- Detail spesies pada `/animal/:id`.
- Database mendukung pencarian/filter untuk semua pengunjung dan penambahan katalog resmi oleh admin.
- EraGuessr menampilkan maksimal tiga spesies dengan tahun yang cocok.
- PWA, katalog network-first yang dicache, favorit/catatan lokal.
- Registrasi memberi role `user`; role admin hanya ditetapkan manual melalui SQL Supabase.
- API read publik; endpoint tulis katalog memverifikasi access token dan role admin server-side.

## Build dan test

```powershell
npm test
npm run build
```

Panduan API, deployment, dan offline ada di folder [docs/](./docs/).
