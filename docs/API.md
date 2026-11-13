# REST API iEra

## Menjalankan

Jalankan `npm --prefix backend install`, isi `backend/.env`, kemudian `npm run dev:api` dari root. Endpoint lokal tersedia di `http://localhost:3000/api`; health check ada di `/health`.

Katalog resmi diakses melalui Axios (`VITE_API_BASE_URL`). Supabase Auth di browser memakai anon/publishable key untuk sesi akun dan membaca profil role dengan RLS.

## Endpoint

| Method | Path | Keterangan |
|---|---|---|
| GET | `/api/animals` | Daftar katalog; menerima `search` dan `year` |
| GET | `/api/animals/:id` | Satu record berdasarkan UUID atau slug |
| GET | `/api/animals/year/:year` | Record untuk satu tahun 2001–2025 |
| POST | `/api/animals` | Tambah record resmi, admin saja |
| PUT | `/api/animals/:id` | Ganti record resmi, admin saja |
| DELETE | `/api/animals/:id` | Hapus record resmi, admin saja |

Respons sukses berbentuk `{ "success": true, "data": ... }`; error berbentuk `{ "success": false, "error": "..." }`. Tahun dan body divalidasi server-side.

## Keamanan

- `SUPABASE_SERVICE_ROLE_KEY` hanya disimpan sebagai environment variable backend. Jangan gunakan awalan `VITE_`, jangan masukkan ke frontend, dan jangan commit nilai nyata.
- Signup melalui Supabase Auth selalu membuat profil ber-role `user`; role dibaca dari `public.profiles`, bukan dari user metadata.
- GET katalog dilayani backend dengan kredensial server. Service-role key melewati RLS, sehingga route tulis memeriksa role secara eksplisit di server.
- `POST`, `PUT`, dan `DELETE` memerlukan access token Supabase pada `Authorization: Bearer <access_token>` dan profil dengan role `admin`.
- `ALLOWED_ORIGIN` membatasi origin browser; untuk beberapa origin gunakan daftar dipisahkan koma.
- Favorit tetap tersimpan lokal dan tidak dikirim ke API.

Promosikan akun tepercaya ke role `admin` secara manual melalui SQL Editor Supabase; tidak ada opsi memilih role saat registrasi. UI tambah katalog resmi hanya tampil untuk admin, dan API tetap memverifikasi role server-side.
