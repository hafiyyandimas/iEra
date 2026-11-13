# REST API iEra

## Menjalankan lokal

Jalankan `npm --prefix backend install`, siapkan `backend/.env`, lalu jalankan `npm run dev:api` dari root. API lokal tersedia di `http://localhost:3000`; health check ada di `/health`. Vite meneruskan request `/api` ke backend lokal.

Frontend memakai `src/services/animalService.js` dan default API base path `/api`. `VITE_API_BASE_URL` dapat mengubahnya. Supabase Auth di browser memakai URL dan anon/publishable key untuk sesi akun serta membaca profil sendiri dengan RLS.

## Endpoint

| Method | Path | Keterangan |
|---|---|---|
| GET | `/api/animals` | Daftar katalog; menerima `search` dan `year` |
| GET | `/api/animals/year/:year` | Record untuk satu tahun, 2001 sampai 2025 |
| GET | `/api/animals/:id` | Satu record berdasarkan UUID atau slug |
| POST | `/api/animals` | Tambah record resmi, admin saja |
| PUT | `/api/animals/:id` | Ganti record resmi dengan objek lengkap, admin saja |
| DELETE | `/api/animals/:id` | Hapus record resmi, admin saja |

Respons sukses berbentuk `{ "success": true, "data": ... }`; error berbentuk `{ "success": false, "error": "..." }`. Tahun dan body divalidasi server-side.

## Keamanan

- `SUPABASE_SERVICE_ROLE_KEY` hanya disimpan sebagai environment variable server. Jangan gunakan awalan `VITE_`, masukkan ke frontend, atau commit nilainya.
- Registrasi username hanya dapat membuat role `user`. Role dibaca dari `public.profiles`, bukan dari user metadata.
- `POST`, `PUT`, dan `DELETE` memerlukan access token Supabase pada `Authorization: Bearer <access_token>` serta profil dengan role `admin`.
- API memvalidasi access token dan memeriksa role di server. Menyembunyikan tombol di UI bukan kontrol akses.
- `ALLOWED_ORIGIN` membatasi origin lintas domain dan menerima daftar dipisahkan koma. Request same-origin didukung untuk deployment satu domain.
- Favorit dan catatan tetap tersimpan lokal dan tidak dikirim ke API.

Form login meminta username dan password. Supabase Auth menggunakan alias internal `@users.iera.invalid`; provider Email harus aktif dan konfirmasi email harus dimatikan. Alias tersebut tidak dapat menerima email verifikasi atau pemulihan password.
