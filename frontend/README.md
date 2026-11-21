# TrackPark Frontend (Mobile PWA) 🛵📱

Aplikasi frontend Progressive Web App (PWA) untuk petugas lapangan pencatatan dan monitoring parkir **TrackPark**.

Dibangun dengan pendekatan **Mobile-First** menyerupai antarmuka aplikasi Android native menggunakan:
- ⚡ **React 18** (Vite)
- 🎨 **Tailwind CSS**
- 🧭 **React Router DOM v6**
- 📦 **Vite Plugin PWA** (Service Worker & Web App Manifest)
- 🔌 **Lucide React** (Modern Icons)

---

## 📱 Fitur & Navigasi

Aplikasi dilengkapi dengan **Bottom Navigation Bar** permanen di bagian bawah layar:

1. **Parkir (`/vehicles`)**:
   - Menampilkan daftar semua sepeda motor yang sedang aktif terparkir (`status=parked`).
   - Fitur pencarian instan (live search) berdasarkan plat nomor atau jenis motor.
   - Badge lokasi blok/zona parkir dan jam masuk.
   - Klik kartu kendaraan untuk masuk ke halaman detail.

2. **Zona (`/zones`)**:
   - Ringkasan akumulasi seluruh kapasitas parkir.
   - Monitoring kapasitas per blok dengan indikator visual dan progress bar persentase (hijau/kuning/merah).
   - Klik zona untuk melihat motor apa saja yang ada di dalam zona tersebut.

3. **Catat Masuk (`/add`)**:
   - Tombol utama di tengah navigasi untuk mencatat motor baru masuk.
   - Form input plat nomor (otomatis huruf kapital), merk motor, pilihan blok parkir, dan catatan kondisi motor.
   - Terintegrasi langsung dengan `POST /api/vehicles`.

4. **Riwayat (`/history`)**:
   - Daftar seluruh motor yang telah menyelesaikan parkir (`status=exited`).
   - Pencarian riwayat berdasarkan plat nomor.

5. **Tentang (`/about`)**:
   - Informasi sistem TrackPark, versi PWA, deskripsi, teknologi yang digunakan, status API endpoint, dan profil pengembang.

6. **Detail Kendaraan (`/vehicles/:id`)**:
   - Detail lengkap motor, waktu masuk, dan catatan.
   - Pindah blok parkir (`PUT /api/vehicles/:id`).
   - Selesaikan parkir / motor keluar (`PUT` status `'exited'`).
   - Hapus data motor permanen (`DELETE /api/vehicles/:id`).

7. **Detail Blok (`/zones/:id`)**:
   - Info kapasitas terisi dan sisa slot di blok terkait.
   - Daftar motor yang sedang berada di blok tersebut.

---

## 🛠️ Konfigurasi Environment Variable

File `.env` di folder `frontend`:
```env
# URL backend REST API TrackPark
VITE_API_URL=http://localhost:5000/api
```
*(Ganti dengan URL production jika sudah dideploy ke Vercel/Cloud).*

---

## 🚀 Cara Menjalankan

```bash
# 1. Masuk ke folder frontend
cd frontend

# 2. Install dependensi
npm install

# 3. Jalankan development server
npm run dev
```

Buka URL lokal yang muncul di browser (biasanya `http://localhost:5173`).

---

## 📲 Install Sebagai PWA di Smartphone

1. Buka URL aplikasi di Google Chrome / Safari HP.
2. Di Chrome: Klik menu titik tiga (⋮) > **"Tambahkan ke Layar Utama"** / **"Install App"**.
3. Di Safari (iOS): Klik tombol Share > **"Add to Home Screen"**.
4. Aplikasi akan terpasang di HP dengan icon TrackPark dan dapat dibuka dalam mode full-screen standalone tanpa address bar browser.

