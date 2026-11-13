# iEra: Extinct Species Explorer

iEra adalah Progressive Web App tugas akhir PBB untuk menjelajahi katalog spesies yang tercatat punah berdasarkan tahun, memperkirakan tahun lahir dari umur, dan menyimpan favorit serta catatan pada perangkat. Admin yang terotorisasi dapat menambahkan spesies ke katalog resmi (Admin hanya bisa ditambahkan melalui Supabase).

## Fitur

- Lima halaman utama: Era, Extinct Database, EraGuessr, Favorit, dan About Me.
- Timeline vertikal dari 2001 sampai 2026. Data katalog resmi dibatasi ke 2001 sampai 2025; 2026 hanya penanda visual.
- Katalog dapat dicari berdasarkan nama umum atau nama ilmiah, dan difilter berdasarkan tahun.
- Halaman detail menampilkan sumber dan informasi gambar yang tersedia.
- EraGuessr memperkirakan tahun lahir dengan rumus `tahun sekarang - umur` dan menampilkan maksimal tiga spesies yang cocok.
- Favorit dan catatan tersimpan lokal di browser dan tidak disinkronkan antarperangkat.
- Login memakai username dan password. Akun baru mendapat role `user`; admin ditetapkan manual melalui Supabase.
- Admin yang terotorisasi dapat menambah record katalog melalui REST API.
- PWA memiliki manifest, service worker, install prompt, update prompt, dan cache untuk katalog publik.

## Teknologi

- Frontend: React 19, Vite, React Router, Tailwind CSS.
- Backend: Node.js 20 atau lebih baru dan Express.
- Database katalog resmi: Supabase PostgreSQL.
- Deployment yang didukung: satu project Vercel untuk frontend dan API.

## Menjalankan lokal

Gunakan Node.js 20 atau lebih baru. Salin `.env.example` menjadi `.env.local` dan isi URL serta anon key Supabase. Salin `backend/.env.example` menjadi `backend/.env` dan isi konfigurasi server. Jangan menaruh service-role key di frontend.

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

Vite berjalan di `http://localhost:5173`, backend lokal di `http://localhost:3000`. Vite meneruskan request `/api` ke backend lokal.

## Konfigurasi Supabase

1. Jalankan `database/schema.sql` pada SQL Editor untuk membuat tabel, trigger, dan policy.
2. Pastikan provider Email aktif dan konfirmasi email dimatikan. Form aplikasi hanya meminta username dan password; Supabase Auth menggunakan alias internal yang tidak dapat menerima email.
3. Daftarkan akun melalui aplikasi. Akun baru otomatis memperoleh role `user`.
4. Untuk admin, promosikan username secara manual dengan SQL di [docs/DATABASE.md](./docs/DATABASE.md).

Tidak tersedia pemulihan password melalui email. Akun lama yang dibuat dengan alamat email tidak otomatis berpindah ke login username.

Untuk reset total, `database/reset_iera.sql` menghapus katalog, profil, dan seluruh akun Auth pada project sebelum membangun ulang tabel. Jalankan hanya pada project Supabase khusus iEra.

## Environment variables

Frontend:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-or-publishable-key
```

Backend:

```env
PORT=3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=server-only-key
ALLOWED_ORIGIN=http://localhost:5173
```

Di Vercel, atur variabel frontend dan backend pada project yang sama. Pada production, frontend menggunakan API relatif `/api`. `SUPABASE_SERVICE_ROLE_KEY` harus tetap menjadi environment variable server dan tidak boleh memakai awalan `VITE_`.

## Routes

| Route | Halaman |
|---|---|
| `/era` | Timeline spesies |
| `/database` | Katalog resmi |
| `/guessr` | Pencarian berdasarkan perkiraan tahun lahir |
| `/favorit` | Favorit dan catatan lokal |
| `/about` | Profil praktikan |
| `/animal/:id` | Detail spesies |

## Validasi

```powershell
npm test
npm run build
```

Dokumentasi API, database, deployment, dan PWA tersedia di [docs/](./docs/).
