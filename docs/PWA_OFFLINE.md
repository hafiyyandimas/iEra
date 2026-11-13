# PWA dan offline

PWA dikonfigurasi melalui `vite-plugin-pwa` di `vite.config.js`.

- Manifest menetapkan nama aplikasi, warna, mode standalone, start URL, dan ikon SVG.
- JavaScript, CSS, HTML, SVG, PNG, serta WOFF2 hasil build masuk precache.
- Navigasi SPA memakai fallback `index.html`; path `/api/` dikecualikan.
- GET `/api/animals` dan `/api/animals/year/:year` memakai strategi **NetworkFirst**.
- Cache hanya menyimpan respons HTTP 200, maksimal 30 entri selama tujuh hari. Batas tunggu jaringan adalah empat detik.
- Install prompt, update prompt, dan registrasi service worker berada di frontend.

## Data lokal

`src/storage/localCache.js` menyimpan snapshot katalog, favorit, catatan, serta data spesies pribadi di `localStorage`. Favorit dan catatan tersedia pada UI saat ini. Helper penyimpanan spesies pribadi masih ada, tetapi belum ada alur UI untuk membuat atau mengeditnya.

## Ekspektasi offline

- App shell dapat dibuka offline setelah asset tercache.
- Katalog yang pernah dimuat dapat tersedia dari cache browser atau snapshot lokal.
- Kunjungan offline pertama tidak memiliki katalog lokal.
- Favorit dan catatan tersimpan pada perangkat, tidak disinkronkan ke server atau perangkat lain.
- Detail dapat dibuka offline bila record tersedia di katalog yang pernah dimuat atau data lokal. Detail yang belum pernah dimuat mungkin tidak tersedia.
- Jangan menampilkan respons error seolah-olah data katalog berhasil dimuat.

Untuk menguji, gunakan HTTPS atau `localhost`, buka katalog saat online, lalu uji reload route dan akses data saat offline. Laporkan tes sebagai berhasil hanya jika benar-benar diuji pada browser atau deployment sasaran.
