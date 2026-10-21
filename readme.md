# TuneBox 🎵

TuneBox adalah aplikasi musik berbasis web yang terinspirasi dari Spotify. Project ini menggunakan Express.js dan TypeScript untuk backend serta Next.js untuk frontend.

## ✨ Fitur

- Register dan login menggunakan JWT
- Manajemen akun dan profil pengguna
- Menampilkan dan memutar lagu
- CRUD lagu dan album
- Membuat dan mengelola playlist
- Menambahkan dan menghapus lagu dari playlist
- Hak akses admin dan pengguna
- Upload audio menggunakan Cloudinary

## 🛠️ Teknologi

**Backend**
- Node.js
- Express.js
- TypeScript
- MySQL
- JWT
- Cloudinary

**Frontend**
- Next.js
- React
- TypeScript
- Tailwind CSS

## 📁 Struktur Folder

```text
express1/
├── README.md
├── package.json
├── src/ atau folder backend lainnya
└── frontend/
    ├── package.json
    ├── app/
    ├── public/
    └── ...
```

## 📋 Persyaratan

- Node.js dan npm
- MySQL Server
- Git
- Akun Cloudinary untuk fitur upload

## 🚀 Cara Menjalankan Backend

Buka terminal di folder `express1`:

```bash
npm install
```

Buat file `.env` sesuai variabel yang digunakan backend. Konfigurasikan port, koneksi MySQL, JWT secret, dan Cloudinary jika diperlukan.

Pastikan database dan tabel yang diperlukan sudah dibuat.

Jalankan backend menggunakan script yang tersedia di `package.json`. Jika script pengembangan bernama `dev`, gunakan:

```bash
npm run dev
```

Backend TuneBox menggunakan alamat API lokal:

```text
http://localhost:8000/api
```

Sesuaikan port jika konfigurasi backend berbeda.

## 🖥️ Cara Menjalankan Frontend

Buka terminal kedua, lalu masuk ke folder frontend:

```bash
cd frontend
npm install
```

Buat file `.env.local` di dalam folder `frontend`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

Jalankan frontend:

```bash
npm run dev
```

Buka browser:

```text
http://localhost:3000
```

Pastikan backend sudah berjalan agar frontend bisa terhubung ke API.

## 🔐 Keamanan

- Jangan upload file `.env` atau `.env.local`.
- Jangan membagikan password database, JWT secret, atau API secret Cloudinary.
- Pastikan file `.gitignore` mengabaikan file konfigurasi rahasia dan folder `node_modules`.

## 🌿 Branch Git

- `main`: versi utama yang stabil.
- `develop`: integrasi frontend dan backend.
- `backend`: pengembangan backend.
- `frontend`: pengembangan frontend.

Perubahan dari branch `backend` dan `frontend` digabungkan ke `develop`, lalu masuk ke `main` setelah diuji.

## 📝 Catatan

Project ini dibuat untuk pembelajaran pengembangan aplikasi web. Cara menjalankan dan konfigurasi dapat disesuaikan dengan script serta kebutuhan project yang sebenarnya.