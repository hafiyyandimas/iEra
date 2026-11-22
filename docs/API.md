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
| GET | `/api/favorites` | Favorit akun milik sesi aktif |
| PUT | `/api/favorites` | Ganti seluruh favorit akun dengan hasil gabungan perangkat dan akun; body `{ "favorites": [{ "animalId", "note", "savedAt" }] }` |
| PUT | `/api/favorites/:animalId` | Simpan atau perbarui satu favorit, body `{ "note", "savedAt" }` |
| DELETE | `/api/favorites/:animalId` | Hapus satu favorit dari akun |

Respons sukses berbentuk `{ "success": true, "data": ... }`; error berbentuk `{ "success": false, "error": "..." }`. Tahun dan body divalidasi server-side.

Admin mengedit spesies dari halaman detail (`/animal/:id`). Form mengirim `PUT /api/animals/:id` dengan objek lengkap seperti form tambah, memakai `slug` lama agar tautan yang sudah ada tidak berubah. Kolom opsional yang dikosongkan dikirim sebagai `null`, dan kolom di luar form (mis. `source_name`, `image_source_url`) tidak ikut terkirim sehingga nilainya di database tetap.

## Favorit dan catatan

Favorit selalu ditulis ke `localStorage` lebih dulu, jadi aplikasi tetap berfungsi offline. Saat ada sesi aktif, setiap perubahan juga dikirim ke akun:

- Menambah atau menghapus favorit memakai `PUT`/`DELETE /api/favorites/:animalId`.
- Menyimpan catatan memakai `PUT /api/favorites/:animalId`.
- Saat sesi pertama kali terbaca atau tombol "Sinkronkan sekarang" ditekan, frontend mengambil favorit akun, menggabungkannya dengan favorit perangkat, lalu mengirim hasil gabungan lewat `PUT /api/favorites`. Catatan dari versi yang paling baru diperbarui yang dipakai, sedangkan tanggal simpan paling awal dipertahankan.
- Spesies pribadi (id berawalan `personal-`) tidak pernah dikirim ke API karena tidak ada di katalog resmi.
- Jika sinkronisasi gagal, favorit perangkat tetap utuh dan halaman Favorit menampilkan pesan agar pengguna mencoba "Sinkronkan sekarang".

## Keamanan

- `SUPABASE_SERVICE_ROLE_KEY` hanya disimpan sebagai environment variable server. Jangan gunakan awalan `VITE_`, masukkan ke frontend, atau commit nilainya.
- Password di-hash menggunakan scrypt; backend tidak menyimpan password mentah.
- Cookie sesi berisi token acak HttpOnly; database hanya menyimpan hash token dan masa berlaku. Logout mencabut sesi server-side.
- Registrasi username hanya dapat membuat role `user`. Role dibaca dari `public.app_users`.
- `POST`, `PUT`, dan `DELETE` katalog memerlukan sesi aktif serta role `admin`; pemeriksaan dilakukan di server.
- Endpoint register dan login memiliki pembatasan percobaan per IP.
- `ALLOWED_ORIGIN` membatasi origin lintas domain dan menerima daftar dipisahkan koma. Request same-origin didukung untuk deployment satu domain.
- Endpoint `/api/favorites` memerlukan sesi aktif. Pemilik baris selalu diambil dari sesi (`req.authUser.id`), bukan dari body, sehingga satu akun tidak dapat membaca atau mengubah favorit akun lain. Catatan dibatasi 500 karakter dan hanya id katalog berbentuk UUID yang diterima.

Form login hanya meminta username dan password. Tidak ada email, alias email, provider Supabase Auth, atau konfirmasi email dalam alur autentikasi.
