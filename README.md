# Mahasiswa Finance 🎓💸

Aplikasi pengelolaan keuangan modern, profesional, dan responsif yang dirancang khusus untuk kebutuhan mahasiswa. Bantu mahasiswa mengatur pemasukan, pengeluaran, tabungan, anggaran, hingga target keuangan dengan UI yang premium dan elegan.

## ✨ Fitur Unggulan

- **Dashboard Modern**: Ringkasan saldo, pemasukan, pengeluaran, dan tabungan dengan grafik interaktif.
- **Pemasukan & Pengeluaran**: Catat transaksi dengan kategori lengkap khusus mahasiswa (uang kos, fotokopi, nongkrong, dll).
- **Budgeting**: Setel batas pengeluaran bulanan per kategori dengan notifikasi visual saat mendekati batas.
- **Target Tabungan**: Pantau progress tabungan untuk impianmu (laptop baru, wisuda, liburan).
- **Hutang & Piutang**: Jangan lupa membayar atau menagih pinjaman teman.
- **Analitik & AI Insights**: Dapatkan saran penghematan cerdas berdasarkan pola belanjamu.
- **Dark & Light Mode**: Nyaman di mata, kapanpun kamu butuh mencatat.
- **Authentication**: Aman dengan NextAuth (Email, Google, GitHub).

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4
- **Database**: MongoDB + Mongoose
- **Auth**: NextAuth.js
- **Charts**: Recharts
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Validation**: Zod + React Hook Form
- **Toasts**: Sonner

## 🚀 Cara Menjalankan

1. **Clone repositori** (jika sudah di-git).
2. **Install dependensi**:
   ```bash
   npm install
   ```
3. **Setup Environment Variables**:
   Buat file `.env.local` dan isi sesuai template:
   ```env
   MONGODB_URI=your_mongodb_atlas_uri
   NEXTAUTH_SECRET=your_secret
   NEXTAUTH_URL=http://localhost:3000
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   GITHUB_ID=...
   GITHUB_SECRET=...
   ```
4. **Jalankan Aplikasi**:
   ```bash
   npm run dev
   ```
5. Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

## 📁 Struktur Folder

- `src/app`: Routing dan Page (Next.js App Router)
- `src/components`: Komponen UI reusable
- `src/models`: Schema Mongoose untuk MongoDB
- `src/lib`: Konfigurasi library (Auth, MongoDB, Utils)
- `src/api`: Route Handlers untuk Backend

## 📝 Lisensi

Proyek ini dibuat untuk tujuan edukasi dan membantu komunitas mahasiswa.

---
Dibuat dengan ❤️ untuk Mahasiswa Indonesia.
