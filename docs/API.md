# REST API iEra

## Menjalankan lokal

Jalankan `npm --prefix backend install`, siapkan `backend/.env`, lalu jalankan `npm run dev:api` dari root. API lokal tersedia di `http://localhost:3000`; health check ada di `/health`. Vite meneruskan request `/api` ke backend lokal.

Frontend memakai `src/services/animalService.js` dan default API base path `/api`. `VITE_API_BASE_URL` dapat mengubahnya. Semua autentikasi dilakukan oleh backend melalui cookie sesi HttpOnly; frontend tidak memakai Supabase Auth atau kredensial Supabase.

## Endpoint

| Method | Path | Keterangan |
|---|---|---|
| POST | `/api/auth/register` | Buat akun username/password dan langsung membuka sesi |
| POST | `/api/auth/login` | Login dan membuka sesi |
| GET | `/api/auth/me` | Periksa sesi aktif |
| POST | `/api/auth/logout` | Hapus sesi aktif |
| GET | `/api/animals` | Daftar katalog; menerima `search` dan `year` |
| GET | `/api/animals/year/:year` | Record untuk satu tahun, 2001 sampai 2025 |
| GET | `/api/animals/:id` | Satu record berdasarkan UUID atau slug |
| POST | `/api/animals` | Tambah record resmi, admin saja |
| PUT | `/api/animals/:id` | Ganti record resmi dengan objek lengkap, admin saja |
| DELETE | `/api/animals/:id` | Hapus record resmi, admin saja |

Respons sukses berbentuk `{ "success": true, "data": ... }`; error berbentuk `{ "success": false, "error": "..." }`. Tahun dan body divalidasi server-side.

## Keamanan

- `SUPABASE_SERVICE_ROLE_KEY` hanya disimpan sebagai environment variable server. Jangan gunakan awalan `VITE_`, masukkan ke frontend, atau commit nilainya.
- Password di-hash menggunakan scrypt; backend tidak menyimpan password mentah.
- Cookie sesi berisi token acak HttpOnly; database hanya menyimpan hash token dan masa berlaku. Logout mencabut sesi server-side.
- Registrasi username hanya dapat membuat role `user`. Role dibaca dari `public.app_users`.
- `POST`, `PUT`, dan `DELETE` memerlukan sesi aktif serta role `admin`; pemeriksaan dilakukan di server.
- Endpoint register dan login memiliki pembatasan percobaan per IP.
- `ALLOWED_ORIGIN` membatasi origin lintas domain dan menerima daftar dipisahkan koma. Request same-origin didukung untuk deployment satu domain.
- Favorit dan catatan tetap tersimpan lokal dan tidak dikirim ke API.

Form login hanya meminta username dan password. Tidak ada email, alias email, provider Supabase Auth, atau konfirmasi email dalam alur autentikasi.
