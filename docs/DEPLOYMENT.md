# Deployment

Frontend dan API berjalan dalam **satu project Vercel** di domain yang sama. Frontend disajikan sebagai aset statis; `/api/*` dan `/health` dijalankan sebagai Vercel Functions. Supabase service-role key hanya digunakan server-side.

## Konfigurasi Vercel

- Import project dari repository dan pilih aplikasi **Vite** (bukan preset `Services`).
- Root Directory: repository root (`./`).
- Build command: `npm run build`.
- Output directory: `dist`.
- Runtime: Node.js 20.x.
- Tambahkan environment variables di project Vercel:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY` (server-only; jangan gunakan awalan `VITE_`)
  - `ALLOWED_ORIGIN` (origin deployment frontend, misalnya `https://iera.vercel.app`, tanpa path)
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY` (anon/publishable key; aman berada di frontend dengan RLS aktif)
  - Untuk auth lokal, salin variabel `VITE_SUPABASE_*` dari `.env.example`; gunakan server key hanya pada environment API.
- `VITE_API_BASE_URL` tidak wajib untuk deployment satu domain; default frontend adalah `/api`. Jika diatur, gunakan `/api`.
- Aktifkan provider Email di Supabase Auth dan atur Site URL serta Redirect URLs untuk domain Vercel (dan `http://localhost:5173` untuk lokal).
- Deploy melalui HTTPS agar service worker dan instalasi PWA berfungsi.

`api/index.js` meneruskan request ke handler Express yang sama dengan deployment backend terpisah. `vercel.json` mengarahkan `/api/*` dan `/health` ke function tersebut serta route SPA ke frontend. `backend/api/index.js` dan `backend/vercel.json` tetap dapat digunakan jika backend ingin dideploy sebagai project terpisah.

## Verifikasi

- Buka `/health`; respons yang diharapkan: `{ "success": true, "status": "ok" }`.
- Buka `/api/animals`; respons sukses berisi katalog.
- Jika katalog gagal tetapi `/health` berhasil, periksa environment Supabase dan skema tabel.
- `SUPABASE_SERVICE_ROLE_KEY` tidak boleh dimasukkan ke frontend atau variabel berawalan `VITE_`.
- Registrasi baru harus menghasilkan role `user`; hanya role `admin` yang dapat menambah katalog resmi.
- POST/PUT/DELETE ditolak tanpa access token akun ber-role `admin`.
- Pastikan route SPA dapat dibuka langsung dan direload, serta manifest, service worker, dan offline route berfungsi di HTTPS.

## Checklist

- GET katalog dapat dipanggil dari domain frontend.
- CORS hanya mengizinkan origin yang diperlukan.
- Service-role key hanya tersedia di environment server.
- POST/PUT/DELETE ditolak untuk guest dan akun ber-role `user`.
- Route SPA dapat dibuka langsung dan direload.
- Manifest, service worker, install prompt, offline route, serta favorit lokal diuji di HTTPS.
