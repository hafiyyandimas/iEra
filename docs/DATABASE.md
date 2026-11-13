# Database katalog

Supabase menyimpan katalog resmi dan profil role. Favorit, catatan, serta data hewan pribadi tetap berada di `localStorage`.

## Tabel katalog `public.animals`

Skema menyimpan `extinction_year INTEGER` dan `year_is_estimated BOOLEAN`, bukan tanggal atau waktu. Tahun katalog resmi dibatasi dari 2001 sampai 2025. Kolom sumber wajib berisi URL, sedangkan sumber gambar, kredit, lisensi, wilayah, habitat, dan alt text dapat diisi bila tersedia.

## Setup baru

1. Jalankan `database/schema.sql` pada SQL Editor Supabase.
2. Impor hanya record yang sudah diverifikasi. Jangan mengarang nama spesies, tahun, sumber, kredit, atau lisensi.
3. Jangan menyertakan `id`, `created_at`, atau `updated_at` saat impor; database mengisinya.
4. Tandai tahun estimasi dan jelaskan ketidakpastian pada deskripsi.

Skema membuat tabel `public.profiles`, role `user` atau `admin`, trigger profil saat pendaftaran, dan Row Level Security. Akun baru selalu mendapat role `user`.

## Reset total

`database/reset_iera.sql` bersifat destruktif. Skrip menghapus katalog, tabel favorit lama bila ada, profil, semua akun `auth.users`, serta trigger/fungsi/policy terkait, lalu membangun ulang skema kosong. Akun, sesi, katalog, dan role admin hilang permanen. Skrip tidak menghapus objek Storage atau pengaturan project. Jalankan hanya pada project Supabase khusus iEra.

Untuk database yang sudah berisi data, backup dahulu dan tinjau file migrasi yang sesuai sebelum menjalankannya. Jangan jalankan skrip migrasi pada skema yang tidak cocok.

## Login username dan role admin

Aplikasi memakai username dan password. Supabase Auth menggunakan alias internal `username@users.iera.invalid`. Aktifkan provider Email dan matikan konfirmasi email karena alias tidak dapat menerima pesan. Pemulihan password melalui email tidak tersedia.

Setelah akun tepercaya mendaftar, promosikan melalui SQL Editor:

```sql
update public.profiles
set role = 'admin'
where lower(username) = lower('admin_username')
returning id, username, role;
```

Registrasi tidak dapat memberi role admin. API memeriksa role dari `public.profiles` untuk setiap operasi tulis. Akun lama yang dibuat memakai email asli tidak otomatis berpindah ke login username.
