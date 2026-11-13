# Database katalog

Supabase menyimpan katalog resmi saja. Skema baru menggunakan `extinction_year INTEGER` dan `year_is_estimated BOOLEAN`; tanggal, bulan, waktu, rentang tahun, dan slot telah dihapus dari model baru.

## Setup baru

1. Jalankan `database/schema.sql` pada SQL Editor.
2. Impor data terverifikasi melalui Table Editor. Paket `database/seed_animals.csv` berisi tiga record dataset lama yang sudah dipetakan ke skema baru. `database/seed_template.csv` hanya berisi header untuk record selanjutnya.
3. Jangan menyertakan `id`, `created_at`, atau `updated_at`; database mengisinya.
4. Verifikasi setiap tahun, status perkiraan, URL sumber, kredit, dan lisensi sebelum impor.
5. Supabase Auth membuat role `user` otomatis saat registrasi; favorit tetap tersimpan lokal di browser.

## Migrasi dari Modul 5

Jika `public.animals` sudah menggunakan skema responsi, backup database terlebih dahulu, lalu jalankan `database/migration_from_module5.sql`. Migrasi mempertahankan record, mengubah tipe tahun menjadi integer, mengubah `date_precision='estimated'` menjadi `year_is_estimated=true`, lalu menghapus `extinction_date`, `date_precision`, dan `slot`. Kolom tambahan sumber yang lama dipertahankan bila ada.

Skrip migrasi ditujukan untuk tabel Modul 5 yang mempunyai `date_precision`. Jangan jalankan pada skema yang berbeda tanpa menyesuaikan dan meninjau SQL. Migrasi tidak mengedit prosa deskripsi yang sudah tersimpan; tinjau deskripsi lama agar kartu baru hanya menyebut tahun dan tetap menjelaskan estimasi dengan jujur. Tabel favorit lama tidak lagi digunakan aplikasi dan tidak dihapus oleh migrasi.

Jika migrasi sudah mempertahankan spesies dari seed lama, jangan impor `seed_animals.csv` lagi karena nilai `slug` sudah ada. CSV baru berguna untuk setup database bersih atau record yang belum diimpor.

## Aturan katalog

- Tahun resmi yang didukung 2001–2025. Tahun 2026 hanya batas visual timeline.
- Jangan mengisi tahun dengan data rekaan.
- Tandai tahun perkiraan dan jelaskan ketidakpastian pada deskripsi.
- Hanya admin yang dapat menambah katalog resmi; API juga memeriksa role admin, bukan hanya menyembunyikan tombol di UI.
- Jalankan `database/migration_add_auth_roles.sql` pada SQL Editor sebelum registrasi, atau setelahnya untuk membuat profil `user` bagi akun lama. File ini aman dijalankan ulang.
- Untuk menjadikan akun sebagai admin, ubah email contoh lalu jalankan query manual ini di Supabase SQL Editor:

```sql
update public.profiles p
set role = 'admin'
from auth.users u
where p.id = u.id and lower(u.email) = lower('admin@example.com');
```

- Registrasi tidak menerima role dari pengguna; hanya query tepercaya di Supabase yang dapat menaikkan role menjadi `admin`.
- Fitur favorit dan catatan tetap lokal; perubahan role tidak mengunggah data lokal ke server.
- Aktifkan RLS. Jangan memberi role `anon` akses tulis.
