# Deployment

Frontend dan backend dideploy sebagai dua project terpisah; Supabase tetap menjadi database katalog.

## Frontend Vercel

- Root Directory: repository root.
- Build command: `npm run build`.
- Output directory: `dist`.
- Environment variable: `VITE_API_BASE_URL=https://<domain-backend>/api`.
- Deploy melalui HTTPS agar service worker dan instalasi PWA berfungsi.

## Backend Vercel

- Root Directory: `backend`.
- Framework/runtime: Node.js Functions.
- Environment variables server-only:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `API_ADMIN_TOKEN` (token panjang acak; write route tidak aktif bila tidak diatur)
  - `ALLOWED_ORIGIN` (origin frontend, tanpa path)
- Pastikan semua route API dapat diakses melalui deployment dan health check `/health` berhasil.

`backend/api/index.js` mengekspor Express app untuk Functions, sementara `backend/src/index.js` menjalankan server lokal. Uji deployment Vercel setelah menentukan root project dan URL backend final; jangan mengasumsikan konfigurasi lokal otomatis berperilaku sama pada serverless.

## Checklist

- GET katalog dapat dipanggil dari domain frontend.
- CORS hanya mengizinkan origin yang diperlukan.
- Kredensial Supabase dan token admin hanya berada di backend settings.
- POST/PUT/DELETE ditolak tanpa token admin.
- Route SPA dapat dibuka langsung dan direload.
- Manifest, service worker, install prompt, offline route, serta favorit lokal diuji di HTTPS.
