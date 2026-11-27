# Dimsum PJS — HTML, Tailwind CSS, JavaScript, dan REST API

Website Dimsum PJS ini mempertahankan identitas visual dan alur pemesanan yang sudah ada. Data menu reguler dan Special Edition diambil dari REST API buatan sendiri agar katalog tetap relevan dengan produk Dimsum PJS.

## Teknologi
- HTML5 untuk struktur halaman.
- Tailwind CSS v4 untuk styling dan layout responsif.
- JavaScript Fetch API untuk mengambil dan merender data menu, keranjang, dan checkout WhatsApp.
- Node.js (modul bawaan) untuk menjalankan REST API tanpa Express atau database tambahan.

`assets/css/tailwind.css` adalah hasil kompilasi Tailwind CSS. Tidak ada `styles.css` terpisah yang menjadi stylesheet utama.

## Menjalankan proyek
Pastikan Node.js sudah terpasang. Dari folder proyek (folder yang berisi `server.js`), jalankan:

```bash
node server.js
```

Untuk mengembangkan atau membangun ulang utility Tailwind:

```bash
npm install
npm run dev
```

Buka http://localhost:3000. Jangan membuka `index.html` dengan `file://` secara langsung karena frontend perlu mengakses endpoint API melalui server lokal.

## REST API
Data sumber berada di `data/menu.json`.

| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/api/menu` | Mengambil semua menu |
| GET | `/api/menu?group=regular` | Mengambil enam menu reguler |
| GET | `/api/menu?group=special` | Mengambil tiga menu Special Edition |
| GET | `/api/menu/ayam` | Mengambil detail menu berdasarkan ID |

Frontend mengambil data menggunakan JavaScript Fetch API dari endpoint `/api/menu`.

## Fitur
- Landing page Dimsum PJS.
- Enam menu reguler dan tiga menu Special Edition.
- Keranjang multi-produk dengan pengubah kuantitas.
- Checkout WhatsApp dengan ringkasan pesanan.
- Pilihan dine-in/takeaway, nama, dan catatan.
- Navigasi mobile dan layout responsif desktop/tablet/ponsel.

## Struktur proyek
```text
dimsum-pjs-website/
├── assets/
│   ├── css/tailwind.css
│   └── images/
├── data/menu.json
├── src/input.css
├── index.html
├── script.js
├── server.js
├── package.json
├── .gitignore
└── README.md
```
