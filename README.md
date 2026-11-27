# Dimsum PJS — HTML, Tailwind CSS, JavaScript, dan REST API

Website Dimsum PJS ini mempertahankan identitas visual dan alur pemesanan yang sudah ada. Data menu reguler dan Special Edition sekarang diambil dari REST API buatan sendiri, sehingga tidak ada katalog resep asing atau data ayam yang tidak berhubungan dengan produk Dimsum PJS.

## Teknologi

- **HTML5** untuk struktur halaman.
- **Tailwind CSS v4** untuk styling dan layout responsif. Utility class ditulis langsung pada elemen HTML.
- **JavaScript** untuk Fetch API, render menu, keranjang, dan checkout WhatsApp.
- **Node.js (modul bawaan)** untuk menjalankan REST API sederhana tanpa Express atau database tambahan.

> `assets/css/tailwind.css` adalah hasil kompilasi Tailwind CSS. Tidak ada `styles.css` terpisah yang menjadi stylesheet utama.

## Menjalankan proyek

Pastikan Node.js sudah terpasang. Karena file CSS hasil build Tailwind sudah disertakan, cara tercepat menjalankan proyek adalah:

```bash
node server.js
```

Untuk mengembangkan atau membangun ulang utility Tailwind, pasang dependensi lalu jalankan:

```bash
npm install
npm run dev
```

Perintah `npm run dev` akan membangun CSS Tailwind lalu menjalankan website dan API pada port 3000.

Buka:

```text
http://localhost:3000
```

Jangan membuka `index.html` dengan `file://` secara langsung karena browser perlu mengakses endpoint API melalui server lokal.

## REST API yang digunakan

API dibuat sendiri untuk data menu Dimsum PJS. Data sumber berada pada `data/menu.json`.

| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/api/menu` | Mengambil semua menu |
| GET | `/api/menu?group=regular` | Mengambil enam menu regular |
| GET | `/api/menu?group=special` | Mengambil tiga menu Special Edition |
| GET | `/api/menu/ayam` | Mengambil detail satu menu berdasarkan ID |

Contoh respons:

```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": "ayam",
      "name": "Dimsum Ayam",
      "price": 17000,
      "unit": "porsi",
      "group": "regular"
    }
  ]
}
```

Frontend mengambil data menggunakan JavaScript Fetch API dari endpoint `/api/menu`. Harga, nama, deskripsi, kategori, dan gambar kartu menu berasal dari respons API, bukan ditulis satu per satu di HTML.

## Cara menguji API

Saat server berjalan, buka alamat berikut pada browser:

- `http://localhost:3000/api/menu`
- `http://localhost:3000/api/menu?group=regular`
- `http://localhost:3000/api/menu?group=special`
- `http://localhost:3000/api/menu/ayam`

## Fitur website yang dipertahankan

- Landing page Dimsum PJS.
- Enam menu reguler dan tiga menu Special Edition.
- Keranjang multi-produk dengan tombol tambah/kurang jumlah.
- Checkout WhatsApp dengan ringkasan pesanan.
- Pilihan dine-in/takeaway, nama, dan catatan.
- Navigasi mobile.
- Bagian alur pemesanan dan lokasi outlet.
- Responsif untuk desktop, tablet, dan ponsel.

## Build CSS Tailwind saja

Untuk menghasilkan ulang CSS setelah mengubah class Tailwind:

```bash
npm run build:css
```

Untuk mode pantau saat mengembangkan styling:

```bash
npm run watch:css
```

## Struktur folder

```text
dimsum-pjs-website/
 ├── assets/
 │   ├── css/tailwind.css      # output build Tailwind
 │   └── images/               # aset asli Dimsum PJS
 ├── data/menu.json            # sumber data REST API
 ├── src/input.css             # konfigurasi sumber Tailwind
 ├── index.html
 ├── script.js                 # Fetch API dan interaksi frontend
 ├── server.js                 # server statis + endpoint REST API
 ├── package.json
 └── README.md
```
