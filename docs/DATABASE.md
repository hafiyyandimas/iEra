# Database katalog

Supabase menyimpan katalog resmi saja. Skema baru menggunakan `extinction_year INTEGER` dan `year_is_estimated BOOLEAN`; tanggal, bulan, waktu, rentang tahun, dan slot telah dihapus dari model baru.

## Setup baru

1. Jalankan `database/schema.sql` pada SQL Editor.
2. Impor data terverifikasi melalui Table Editor. Paket `database/seed_animals.csv` berisi tiga record dataset lama yang sudah dipetakan ke skema baru. `database/seed_template.csv` hanya berisi header untuk record selanjutnya.
3. Jangan menyertakan `id`, `created_at`, atau `updated_at`; database mengisinya.
4. Verifikasi setiap tahun, status perkiraan, URL sumber, kredit, dan lisensi sebelum impor.

## Migrasi dari Modul 5

Jika `public.animals` sudah menggunakan skema responsi, backup database terlebih dahulu, lalu jalankan `database/migration_from_module5.sql`. Migrasi mempertahankan record, mengubah tipe tahun menjadi integer, mengubah `date_precision='estimated'` menjadi `year_is_estimated=true`, lalu menghapus `extinction_date`, `date_precision`, dan `slot`. Kolom tambahan sumber yang lama dipertahankan bila ada.

Skrip migrasi ditujukan untuk tabel Modul 5 yang mempunyai `date_precision`. Jangan jalankan pada skema yang berbeda tanpa menyesuaikan dan meninjau SQL. Migrasi tidak mengedit prosa deskripsi yang sudah tersimpan; tinjau deskripsi lama agar kartu baru hanya menyebut tahun dan tetap menjelaskan estimasi dengan jujur. Tabel favorit lama tidak lagi digunakan aplikasi dan tidak dihapus oleh migrasi.

Jika migrasi sudah mempertahankan spesies dari seed lama, jangan impor `seed_animals.csv` lagi karena nilai `slug` sudah ada. CSV baru berguna untuk setup database bersih atau record yang belum diimpor.

## Aturan katalog

- Tahun resmi yang didukung 2001–2025. Tahun 2026 hanya batas visual timeline.
- Jangan mengisi tahun dengan data rekaan.
- Tandai tahun perkiraan dan jelaskan ketidakpastian pada deskripsi.
- Entri spesies pribadi disimpan di browser, tidak masuk ke `animals`.
- Aktifkan RLS. Jangan memberi role `anon` akses tulis.
