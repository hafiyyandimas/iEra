# REST API iEra

## Menjalankan

Jalankan `npm --prefix backend install`, isi `backend/.env`, kemudian `npm run dev:api` dari root. Endpoint lokal tersedia di `http://localhost:3000/api`; health check ada di `/health`.

Frontend menggunakan Axios melalui `VITE_API_BASE_URL`. Komponen React tidak berkomunikasi langsung dengan Supabase.

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
- GET katalog dilayani backend dengan kredensial server; RLS tetap aktif pada tabel.
- `POST`, `PUT`, dan `DELETE` memerlukan `Authorization: Bearer <API_ADMIN_TOKEN>`. Jika token tidak disetel, write route tidak tersedia.
- `ALLOWED_ORIGIN` membatasi origin browser; untuk beberapa origin gunakan daftar dipisahkan koma.
- Favorit dan data pribadi browser tidak dikirim ke API.

Gunakan token admin hanya dari Postman/alat administratif tepercaya. Tidak ada form admin pada frontend.
