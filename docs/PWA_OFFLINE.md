# PWA dan offline

Manifest, ikon, `vite-plugin-pwa`, serta alur update Modul 5 dipertahankan. App shell dan asset statis diprecache. React Router memakai fallback `index.html` sehingga route aplikasi dapat dibuka ulang setelah app shell tersimpan.

GET katalog `/api/animals` dan `/api/animals/year/:year` memakai strategi **NetworkFirst**, cache dibatasi hingga 30 respons selama tujuh hari, dan hanya respons HTTP 200 yang dicache. Favorit dan hewan pribadi tidak memakai HTTP cache; keduanya disimpan pada localStorage terpisah. Cache katalog lokal membantu timeline menampilkan data yang pernah dimuat.

Offline:

- Route app shell dan data lokal dapat tersedia setelah kunjungan online pertama.
- Katalog baru membutuhkan API; kunjungan offline pertama menampilkan pesan yang sesuai.
- Favorit/catatan pribadi dan data spesies pribadi dapat dibaca/diedit offline.
- Tidak ada sinkronisasi server atau klaim sinkronisasi antarperangkat.

Untuk pengujian install dan service worker, gunakan HTTPS atau `localhost`, buka aplikasi online lebih dulu, lalu uji reload route dan koleksi saat offline.
