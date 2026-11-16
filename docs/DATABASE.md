# Database katalog

Supabase menyimpan katalog resmi, akun aplikasi, dan sesi. Favorit, catatan, serta data hewan pribadi tetap berada di `localStorage`.

## Tabel katalog `public.animals`

Skema menyimpan `extinction_year INTEGER` dan `year_is_estimated BOOLEAN`, bukan tanggal atau waktu. Tahun katalog resmi dibatasi dari 2001 sampai 2025. Kolom sumber wajib berisi URL, sedangkan sumber gambar, kredit, lisensi, wilayah, habitat, dan alt text dapat diisi bila tersedia.

## Setup baru

1. Jalankan `database/schema.sql` pada SQL Editor Supabase.
2. Impor hanya record yang sudah diverifikasi. Jangan mengarang nama spesies, tahun, sumber, kredit, atau lisensi.
3. Jangan menyertakan `id`, `created_at`, atau `updated_at` saat impor; database mengisinya.
4. Tandai tahun estimasi dan jelaskan ketidakpastian pada deskripsi.

Skema membuat tabel `public.app_users` dan `public.auth_sessions`. Password disimpan sebagai hash scrypt; tabel hanya dapat diakses melalui backend menggunakan service-role key. Akun baru selalu mendapat role `user`.

Untuk database lama yang telah menjalankan skema sebelumnya, jalankan `database/migration_username_password_auth.sql`. Migrasi menyiapkan tabel autentikasi baru dan menonaktifkan trigger profil lama; akun Supabase Auth/profil lama tidak dihapus atau dimigrasikan. Pengguna harus mendaftar ulang dan admin perlu dipromosikan lagi.

## Reset total

`database/reset_iera.sql` bersifat destruktif. Skrip menghapus katalog, tabel favorit lama bila ada, akun dan sesi iEra, serta trigger profil lama, lalu membangun ulang skema kosong. Akun iEra, sesi, katalog, dan role admin hilang permanen. Akun Supabase Auth lama, objek Storage, dan pengaturan project tidak dihapus. Jalankan hanya pada project Supabase khusus iEra.

Untuk database yang sudah berisi data, backup dahulu dan tinjau file migrasi yang sesuai sebelum menjalankannya. Jangan jalankan skrip migrasi pada skema yang tidak cocok.

## Login username dan role admin

Aplikasi memakai username dan password melalui backend iEra; Supabase Auth/provider email tidak digunakan. Tidak tersedia pemulihan password otomatis.

Setelah akun tepercaya mendaftar, promosikan melalui SQL Editor:

```sql
update public.app_users
set role = 'admin'
where username = lower('admin_username')
returning id, username, role;
```

Registrasi tidak dapat memberi role admin. API memeriksa role dari `public.app_users` untuk setiap operasi tulis.
