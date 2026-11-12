# PWA dan mode offline

Vite PWA menghasilkan manifest dan service worker. App shell, ikon, fallback gambar, JavaScript, dan CSS dimasukkan ke precache. Katalog mempunyai runtime cache network-first yang terbatas; favorit tidak pernah disimpan dalam cache service worker.

Dataset berhasil diambil juga disimpan terpisah di localStorage agar pencarian dapat dilakukan offline setelah kunjungan online. Favorit/catatan memiliki cache lokal serta outbox; perubahan lokal tidak mengaku sudah tersinkron sampai endpoint Supabase menerima operasi. Outbox diproses berurutan menggunakan upsert berkunci unik dan dihapus per operasi setelah respons berhasil.

Untuk pengujian install dan service worker, gunakan build preview/hosting HTTPS (localhost juga memenuhi syarat secure context). Setelah kunjungan pertama, putuskan jaringan untuk memeriksa app shell, pencarian dari cache, dan perubahan favorit tertunda. Sambungkan kembali untuk memeriksa sinkronisasi.
