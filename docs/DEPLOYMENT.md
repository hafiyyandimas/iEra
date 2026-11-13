# Deployment

Frontend dan API dapat berjalan dalam satu project Vercel di domain yang sama. Frontend disajikan sebagai aset statis; `/api/*` dan `/health` diteruskan ke Vercel Function. Supabase service-role key hanya digunakan server-side.

## Konfigurasi Vercel

- Import repository dan gunakan preset Vite.
- Root Directory: root repository.
- Build command: `npm run build`.
- Output directory: `dist`.
- Runtime API: Node.js 20 atau lebih baru.
- Set environment variables frontend dan server pada project Vercel.

`vercel.json` mengarahkan `/api/*` dan `/health` ke `api/index.js`, lalu route lain ke SPA. Untuk project Vercel yang frontend dan API-nya satu domain, biarkan `VITE_API_BASE_URL` kosong agar frontend memakai `/api`.

## Environment variables

Frontend build:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- Opsional `VITE_API_BASE_URL`; biarkan kosong untuk API same-origin.

Server:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ALLOWED_ORIGIN`

Untuk deployment lintas domain, `ALLOWED_ORIGIN` berisi origin frontend yang diizinkan. Pisahkan beberapa origin dengan koma. Jangan pernah memberi awalan `VITE_` pada service-role key atau commit file environment berisi nilai nyata.

## Supabase Auth

- Jalankan `database/schema.sql` pada database baru.
- Aktifkan provider Email dan matikan konfirmasi email. Aplikasi memakai alias username `@users.iera.invalid`, yang tidak dapat menerima email.
- Pemulihan password lewat email tidak tersedia.
- Akun baru mendapat role `user`. Promosikan admin secara manual melalui `public.profiles`.

## Pengembangan lokal

Salin `.env.example` ke `.env.local` dan `backend/.env.example` ke `backend/.env`, lalu isi variabel yang diperlukan.

```powershell
npm run dev
npm run dev:api
```

Jalankan Vite dan API pada terminal terpisah. Vite menggunakan port 5173 dan meneruskan `/api` ke Express di port 3000.

## Verifikasi

- `/health` mengembalikan `{ "success": true, "status": "ok" }`.
- `/api/animals` mengembalikan katalog jika Supabase dan skema sudah dikonfigurasi.
- Guest dan akun role `user` ditolak saat mencoba menulis; admin dapat menulis.
- Uji reload route SPA, service worker, install prompt, update prompt, dan offline behavior pada HTTPS.
- Jangan menyatakan Supabase production, deployment Vercel, atau pengujian offline berhasil bila belum diuji.
