# 🚀 Panduan Deployment TrackPark ke Vercel

Panduan lengkap langkah demi langkah untuk men-deploy aplikasi **TrackPark** (Backend Express & Frontend React PWA) ke **Vercel**.

---

## 📋 Checklist Kesiapan Deploy (Status: SIAP ✅)

- [x] **Backend Express.js Serverless**: Dilengkapi `vercel.json` (`@vercel/node`) & `module.exports = app`.
- [x] **Database Cloud**: Terhubung ke PostgreSQL Supabase via `@supabase/supabase-js`.
- [x] **Frontend SPA Routing**: Dilengkapi `frontend/vercel.json` agar refresh halaman di route mana pun (`/vehicles`, `/add`, dll.) tidak error 404.
- [x] **PWA Ready**: Web App Manifest & Service Worker terkonfigurasi.
- [x] **Keamanan Git**: File `.gitignore` melindungi file rahasia `.env` dan `node_modules` agar tidak bocor.

---

## 🛠️ Langkah Deploy ke Vercel (Gratis & Cepat)

Karena TrackPark terdiri dari **Backend** dan **Frontend**, cara terbaik adalah membuat **2 Project di Vercel** dari satu repositori GitHub yang sama:

---

### TAHAP 1: Push Project ke GitHub
Buka terminal di root folder `d:\TrackPark`:
```bash
git init
git add .
git commit -m "feat: initial commit ready for production deployment"
# Sambungkan ke repositori GitHub Anda
git branch -M main
git remote add origin https://github.com/USERNAME/trackpark.git
git push -u origin main
```

---

### TAHAP 2: Deploy Backend ke Vercel
1. Buka dashboard [vercel.com](https://vercel.com) dan login.
2. Klik tombol **"Add New..."** > **"Project"**.
3. Pilih repositori GitHub `trackpark`.
4. Pada bagian **Project Configuration**:
   - **Project Name:** `trackpark-backend` (atau nama pilihan Anda)
   - **Root Directory:** Klik **Edit**, lalu pilih folder **`backend`**.
5. Buka bagian **Environment Variables**, tambahkan:
   - `SUPABASE_URL` = *(URL project Supabase Anda, misal: `https://eylxstljezvwgdijxzzc.supabase.co`)*
   - `SUPABASE_KEY` = *(Anon key Supabase Anda)*
6. Klik **"Deploy"**.
7. Tunggu hingga selesai. Salin URL backend produksi yang diberikan Vercel, contoh:  
   👉 `https://trackpark-backend.vercel.app`

---

### TAHAP 3: Deploy Frontend ke Vercel
1. Kembali ke Dashboard Vercel, klik **"Add New..."** > **"Project"** lagi.
2. Pilih kembali repositori GitHub `trackpark`.
3. Pada bagian **Project Configuration**:
   - **Project Name:** `trackpark` (atau `trackpark-app`)
   - **Framework Preset:** `Vite` (otomatis terdeteksi)
   - **Root Directory:** Klik **Edit**, lalu pilih folder **`frontend`**.
4. Buka bagian **Environment Variables**, tambahkan:
   - `VITE_API_URL` = `https://trackpark-backend.vercel.app/api`  
     *(Ganti dengan URL backend yang Anda dapatkan di TAHAP 2, diakhiri dengan `/api`)*
5. Klik **"Deploy"**.
6. Selesai! 🎉 Aplikasi TrackPark Anda kini sudah live di internet dan dapat diakses dari HP atau laptop mana pun.

---

## 📱 Menginstall di Smartphone Petugas (PWA)
1. Buka URL frontend produksi Anda di browser HP (Chrome di Android, Safari di iOS).
2. Di Chrome: Tap menu titik tiga (⋮) > **"Tambahkan ke Layar Utama"** / **"Install App"**.
3. Di Safari: Tap tombol Share > **"Add to Home Screen"**.
4. Aplikasi akan terinstall di menu HP petugas dan berjalan layaknya aplikasi native tanpa bar URL browser.

