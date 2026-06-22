# ServiTrack - Sistem Monitoring Servis Kendaraan

ServiTrack adalah aplikasi berbasis web yang dirancang untuk memudahkan pemilik kendaraan maupun manajer armada (*fleet manager*) dalam melacak, mencatat, dan menganalisis riwayat servis serta pengeluaran pemeliharaan kendaraan secara terpusat. Aplikasi ini dilengkapi dengan pengingat jadwal servis otomatis dan analitik pengeluaran yang divisualisasikan melalui grafik interaktif.

## 🧠 Konsep & Korelasi dengan NoSQL (MongoDB)

Aplikasi ini sangat mengandalkan kekuatan **MongoDB (NoSQL)** sebagai tulang punggung penyimpanan datanya, dan secara sengaja menggunakan **Native MongoDB Driver** (tanpa ODM seperti Mongoose) demi fleksibilitas dan performa maksimal. 

Beberapa korelasi utama mengapa arsitektur NoSQL sangat cocok untuk ServiTrack:
- **Fleksibilitas Skema (Schema Flexibility):** Riwayat servis seringkali memiliki detail *item* yang dinamis (seperti penggantian *sparepart*, biaya layanan, cairan, dll). MongoDB mampu menyimpan rincian item servis (`serviceItems`) sebagai *nested documents* (dokumen bersarang) dalam satu entitas `ServiceLog` tanpa harus membuat skema relasi tabel yang rumit (seperti *junction tables* di SQL).
- **Performa Aggregation Pipeline:** Fitur analitik dan metrik pada Dashboard (seperti menghitung total biaya per bulan, rasio jenis servis, dan menghitung jumlah kendaraan) semuanya diselesaikan di level *database engine* menggunakan *MongoDB Aggregation Pipeline*. Hal ini drastis menghemat *memory* di server Node.js dan menjamin eksekusi yang super cepat.
- **Keamanan Isolasi Data (Multi-Tenant Ready):** Desain indeks MongoDB memungkinkan pemisahan entitas kepemilikan antar-pengguna (`userId`) dengan sangat kuat, sehingga mencegah celah IDOR secara arsitektural.

## 🛠️ Tech Stack

Aplikasi ini dibangun menggunakan tumpukan teknologi modern:
- **Framework:** Next.js 16 (App Router)
- **Database:** MongoDB (dengan MongoDB Native Driver)
- **Authentication:** Better Auth
- **Styling:** Tailwind CSS v4 & UI Components (Radix UI)
- **Validation:** Zod v4 & React Hook Form
- **Data Visualization:** Recharts
- **Exporting Tools:** XLSX (Excel) & PDFMake (PDF)

## 🚀 Proses Setup (Instalasi Singkat)

Ikuti langkah-langkah di bawah ini untuk menjalankan ServiTrack di mesin lokal Anda:

1. **Clone Repository**
   ```bash
   git clone https://github.com/VidyaSulton/ServiTrack.git
   cd sistem-monitoring-servis
   ```

2. **Instalasi Dependencies**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment**
   Buat file `.env.local` di root direktori proyek, dan isi dengan variabel berikut:
   ```env
   # Koneksi Database
   MONGODB_URI="mongodb+srv://<username>:<password>@cluster.mongodb.net/servitrack"
   
   # Konfigurasi Better Auth
   BETTER_AUTH_SECRET="your_random_secure_secret"
   BETTER_AUTH_URL="http://localhost:3000"
   ```

4. **Jalankan Development Server**
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di [http://localhost:3000](http://localhost:3000). Buka browser untuk melihat hasilnya!
