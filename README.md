# Cek Sehat

Cek Sehat adalah platform skrining kesehatan jarak jauh. Pengguna mengisi kuesioner singkat, mendapat rekomendasi tes lab, memesan alat ambil sampel ke rumah, memantau kurir sampai sampel tiba di lab, lalu membaca hasil dengan penanda warna dan saran langkah berikutnya. Semua bisa dilakukan tanpa keluar rumah.

> Hasil skrining bukan diagnosis. Data lab, kurir, dan hasil di aplikasi ini adalah data contoh untuk keperluan demo.

## Masalah yang diselesaikan

- Banyak orang menunda cek kesehatan rutin karena harus antre di lab dan tidak tahu tes apa yang perlu diambil.
- Hasil lab biasanya berupa angka tanpa penjelasan, sehingga sulit dipahami orang awam.
- Keluarga sering perlu dicek bersamaan, tetapi pemesanannya terpisah-pisah.

Cek Sehat menjawabnya dengan rekomendasi tes otomatis, satu kali penjemputan sampel untuk beberapa tes dan beberapa anggota keluarga, serta hasil yang langsung diberi arti (normal, waspada, tinggi).

## Alur pengguna

| Langkah | Layar | Yang terjadi |
|---|---|---|
| 0. Daftar / masuk | `register`, `login` | Buat akun (nama, email, kata sandi, usia, jenis kelamin, telepon, alamat). Usia dan jenis kelamin dipakai untuk menentukan rentang normal hasil. |
| 1. Cek 2 menit | `quiz` → `quizResult` | 7 pertanyaan tentang tujuan, riwayat keluarga, gaya hidup, dan gejala. Setiap jawaban memberi skor ke tes tertentu, lalu aplikasi menyarankan tes yang paling relevan. |
| 2. Pilih lab & tes | `labs` → `catalog` | Pilih lab mitra (3 lab, harga dan waktu hasil berbeda), lalu tes yang tersedia di lab itu beserta jumlahnya. Aplikasi memperingatkan jika ada tes yang butuh puasa dicampur dengan tes yang tidak boleh puasa. |
| 3. Jadwalkan | `checkout` | Pilih tanggal dan jam pengantaran alat, alamat, dan pembayaran. Jika jumlah tes lebih dari satu, tiap tes bisa ditugaskan ke anggota keluarga tertentu. Aplikasi juga menghitung jadwal mulai puasa. |
| 4. Ambil & kirim | `tracking` | Pantau pesanan melalui 6 tahap: Dipesan → Kurir mengantar alat → Alat diterima → Petugas menjemput sampel → Diperiksa di lab → Hasil siap. Setelah mengambil sampel sendiri, pengguna menekan tombol "Sampel selesai diambil" untuk memanggil kurir. |
| 5. Hasil & tindak lanjut | `result`, `timeline` | Setiap hasil tampil dengan gauge berwarna (hijau normal, kuning waspada, merah tinggi), rentang referensi sesuai usia/jenis kelamin, dan saran kapan tes ulang. Linimasa menunjukkan perubahan angka dari waktu ke waktu per orang. |

Fitur pendukung:
- **Dashboard (`home`)**: ringkasan perjalanan kesehatan, pesanan aktif, dan hasil terbaru.
- **Akun saya (`profile`)**: ubah profil dan foto, pengaturan notifikasi, kelola anggota keluarga, ganti kata sandi.
- **Dua bahasa**: Bahasa Indonesia dan Inggris, bisa diganti kapan saja.

## Tes yang tersedia

| Tes | Persiapan |
|---|---|
| Gula Darah Puasa | Puasa 8–10 jam |
| Anemia (Hemoglobin & Darah Lengkap) | Tanpa persiapan |
| Kolesterol / Profil Lipid | Puasa 10–12 jam |
| Ginjal (Ureum & Kreatinin) | Makan seperti biasa |
| Urin Lengkap | Urin pagi pertama |

## Model biaya

- **Harga tes** ditentukan oleh masing-masing lab mitra. Harga yang tampil di aplikasi saat ini adalah data dummy untuk demo.
- **Biaya penjemputan** disesuaikan dengan lokasi pengguna.
- **Komisi platform** sebesar 5% dari setiap transaksi.

## Arsitektur

```
Browser (React + Vite + Tailwind)
   │  fetch /api/... dengan token JWT
   ▼
Backend Express (backend/)  ── di Vercel berjalan sebagai serverless function (api/index.ts)
   │  Prisma ORM
   ▼
PostgreSQL di Supabase
```

**Frontend** (`src/`): React 19, Vite 8, Tailwind CSS v4. Pemanggilan API ada di `src/api/` (`client.ts`, `auth.ts`, `members.ts`, `orders.ts`).

**Backend** (`backend/`): Express 5 dengan pola berlapis `route → controller → service → repository`. Semua input divalidasi dengan Zod, kata sandi di-hash dengan bcrypt, dan autentikasi memakai JWT (Bearer token).

**Database** (`prisma/schema.prisma`):

| Tabel | Isi |
|---|---|
| `users` | Profil, hash kata sandi, dan preferensi akun |
| `members` | Anggota keluarga milik pengguna |
| `orders` | Pesanan: lab, jadwal, alamat, total, tahap, data kurir |
| `order_units` | Satu baris per unit tes dalam pesanan, beserta pemiliknya (akun utama atau anggota keluarga) |
| `quiz_answers` | Jawaban kuesioner (tabel sudah ada, belum dipakai frontend) |
| `results` | Hasil tes (tabel sudah ada; saat ini hasil masih dihitung di frontend) |

### Endpoint API

| Method | Path | Auth | Fungsi |
|---|---|---|---|
| POST | `/api/auth/register` | – | Buat akun |
| POST | `/api/auth/login` | – | Masuk, mendapat JWT |
| GET | `/api/auth/me` | ✓ | Ambil profil |
| PATCH | `/api/auth/me` | ✓ | Ubah profil dan preferensi |
| POST | `/api/auth/change-password` | ✓ | Ganti kata sandi |
| GET / POST | `/api/members` | ✓ | Daftar / tambah anggota keluarga |
| DELETE | `/api/members/:id` | ✓ | Hapus anggota keluarga |
| GET / POST | `/api/orders` | ✓ | Daftar / buat pesanan |
| PATCH | `/api/orders/:id/step` | ✓ | Ubah tahap pesanan |
| GET | `/health` | – | Cek server hidup |

## Menjalankan secara lokal

Kebutuhan: Node.js 22 dan database PostgreSQL (Supabase).

1. Install dependensi:
   ```
   npm install
   ```
2. Buat file `.env` di root project:
   ```
   DATABASE_URL="postgresql://...pooler.supabase.com:6543/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://...pooler.supabase.com:5432/postgres"
   JWT_SECRET="string-acak-minimal-16-karakter"
   JWT_EXPIRES_IN="7d"
   PORT="8787"
   CORS_ORIGIN="http://localhost:8443"
   VITE_API_URL="http://localhost:8787"
   ```
   `DATABASE_URL` (port 6543) dipakai aplikasi, `DIRECT_URL` (port 5432) dipakai untuk migrasi. Jangan commit file ini.
3. Buat tabel di database:
   ```
   npm run db:migrate
   ```
4. Jalankan backend dan frontend sekaligus:
   ```
   npm start
   ```
   Atau terpisah: `npm run server` (backend, port 8787) dan `npm run dev` (frontend, port 8443). Di Figma Make, frontend sudah berjalan otomatis, jadi cukup jalankan `npm run server`.
5. Buka `http://localhost:8443`.

### Script yang tersedia

| Script | Fungsi |
|---|---|
| `npm start` | Backend + frontend bersamaan |
| `npm run dev` | Frontend saja |
| `npm run server` | Backend saja (mode watch) |
| `npm run build` | Build frontend production |
| `npm run vercel-build` | `prisma generate` + build, dipakai Vercel |
| `npm run db:migrate` | Jalankan migrasi Prisma |
| `npm run db:studio` | Buka Prisma Studio untuk melihat data |

## Deploy ke Vercel

`vercel.json` sudah mengatur build (`npm run vercel-build`, output `dist`) dan mengarahkan `/api/*` ke serverless function di `api/index.ts`. Frontend memanggil `/api` di domain yang sama, jadi `VITE_API_URL` tidak perlu diisi di Vercel.

Tambahkan environment variable berikut di Vercel (**Settings → Environment Variables**), lalu redeploy:

| Nama | Nilai |
|---|---|
| `DATABASE_URL` | URL pooler Supabase (port 6543) |
| `DIRECT_URL` | URL langsung Supabase (port 5432) |
| `JWT_SECRET` | String acak minimal 16 karakter |
| `JWT_EXPIRES_IN` | `7d` |
| `NODE_ENV` | `production` |

Vercel tidak menjalankan migrasi. Jika skema database berubah, jalankan `npm run db:migrate` dari komputer lokal sebelum deploy.

## Struktur folder

```
api/            Entry serverless function untuk Vercel
backend/        Server Express (config, middleware, modules/auth|members|orders, shared)
prisma/         Skema dan migrasi database
src/            Aplikasi React
  api/          Klien API ke backend
  generated/    Prisma client hasil generate
  screens1.tsx  Welcome, login, register, dashboard, kuesioner
  screens2.tsx  Lab, katalog tes, checkout
  screens3.tsx  Pelacakan, hasil, linimasa
  profile.tsx   Halaman akun
  data.ts       Data tes, lab, metrik, dan pertanyaan kuesioner
vercel.json     Konfigurasi deploy
```
link vercel: 
