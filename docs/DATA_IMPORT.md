# Panduan menyiapkan katalog

Katalog tidak diisi dengan data contoh karena setiap tahun kepunahan, sumber, gambar, dan lisensi harus diverifikasi. `supabase/seed_template.csv` hanya berisi header dan bukan dataset siap impor.

## Validasi sebelum impor

- Hanya masukkan kepunahan spesies yang dapat didukung sumber tepercaya; jangan menganggap penilaian terakhir IUCN sebagai tahun kepunahan.
- Setiap tahun hanya boleh memiliki slot unik 1–3. Tampilkan kurang dari tiga bila sumber yang memenuhi syarat memang lebih sedikit.
- `date_precision` harus `exact`, `year_only`, atau `estimated`. Gunakan tanggal hanya bila sumber mendukung tanggal tepat.
- `source_name`, `source_url`, `image_url`, dan `image_alt` wajib diisi. Lengkapi pula `image_source_url` dan `image_license`; pastikan hak penggunaan gambar sesuai.
- `image_url` harus dapat diakses dari browser. Tautan halaman sumber bukan otomatis tautan gambar.
- Pastikan slug unik, tahun dalam rentang 2001–2025, dan tanggal cocok dengan tahun.

## Impor

Jalankan `supabase/schema.sql`, siapkan CSV dengan kolom dari `seed_template.csv`, lalu gunakan Supabase Table Editor → `animals` → Import data from CSV. Jangan mengimpor header template saja. Untuk mengisi UUID `id`, biarkan kolom tersebut tidak disertakan agar database memakai default.

RLS mengizinkan pembacaan katalog publik, tetapi tidak memberikan akses tulis katalog kepada klien aplikasi. Gunakan Table Editor atau proses administratif tepercaya untuk impor.
