# TrackPark Backend API 🛵🚗

Backend API untuk aplikasi manajemen parkir **TrackPark**, dibangun menggunakan **Node.js**, **Express.js**, dan terhubung langsung ke **PostgreSQL Supabase** melalui `@supabase/supabase-js`.

API ini siap dideploy secara serverless ke **Vercel** (`vercel.json`).

---

## 📁 Struktur Folder

```text
backend/
├── config/
│   └── supabase.js             # Inisialisasi Supabase client
├── controllers/
│   ├── zoneController.js       # Logika bisnis data zona & kapasitas
│   └── vehicleController.js    # Logika bisnis kendaraan masuk/keluar/update
├── routes/
│   ├── zoneRoutes.js           # Route /api/zones
│   └── vehicleRoutes.js        # Route /api/vehicles
├── .env.example                # Contoh konfigurasi environment variables
├── .gitignore                  # File/folder yang diabaikan git
├── index.js                    # Entry point aplikasi Express
├── package.json                # Dependensi & skrip Node.js
├── supabase_schema.sql         # DDL skema database & data awal Supabase
├── vercel.json                 # Konfigurasi deploy ke Vercel Serverless
└── README.md                   # Dokumentasi API
```

---

## 🛠️ Persiapan & Instalasi

### 1. Salin Environment Variables
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Isi variabel dengan kredensial dari project Supabase Anda:
- `SUPABASE_URL`: URL project Supabase (`https://<project-ref>.supabase.co`)
- `SUPABASE_KEY`: Supabase `anon` / `public` API key (atau `service_role` key)
- `PORT`: (Opsional, default: `5000`)

### 2. Buat Tabel di Supabase
Buka **SQL Editor** di Dashboard Supabase Anda, lalu salin dan jalankan seluruh isi file [`supabase_schema.sql`](file:///d:/TrackPark/backend/supabase_schema.sql).

### 3. Install Dependensi
```bash
npm install
```

### 4. Jalankan Server
- Mode pengembangan (development dengan nodemon):
  ```bash
  npm run dev
  ```
- Mode produksi:
  ```bash
  npm start
  ```
Server akan aktif di `http://localhost:5000`.

---

## 📡 Daftar Endpoint API

### 1. Zona Parkir (`/api/zones`)

| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| `GET` | `/api/zones` | Mengembalikan semua zona beserta jumlah kendaraan dengan status `parked` & sisa kapasitas. |
| `GET` | `/api/zones/:id` | Mengembalikan detail zona dan array kendaraan yang sedang parkir (`parked`) di zona tersebut. |

#### Contoh Response `GET /api/zones`:
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": "e2a2254e-6e21-4f10-9993-9c59df18c5e1",
      "name": "Zona A - Motor Matic",
      "capacity": 20,
      "description": "Area sisi utara",
      "parked_count": 5,
      "available_capacity": 15,
      "is_full": false
    }
  ]
}
```

---

### 2. Kendaraan (`/api/vehicles`)

| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| `GET` | `/api/vehicles` | Mengembalikan semua kendaraan join dengan nama zona. Mendukung query parameter `?status=parked` dan `?search=`. |
| `GET` | `/api/vehicles/:id` | Mengembalikan detail 1 kendaraan beserta info lengkap zonanya. |
| `POST` | `/api/vehicles` | Mencatat motor/kendaraan masuk baru (status otomatis `parked`, entry_time otomatis waktu saat ini). |
| `PUT` | `/api/vehicles/:id` | Memperbarui lokasi `zone_id`, catatan `notes`, atau mengubah status menjadi `'exited'`. |
| `DELETE`| `/api/vehicles/:id` | Menghapus data kendaraan dari database. |

#### Request Body `POST /api/vehicles`:
```json
{
  "plate_number": "B 1234 XYZ",
  "model": "Honda Vario 160",
  "zone_id": "e2a2254e-6e21-4f10-9993-9c59df18c5e1",
  "notes": "Helm dititipkan di spion"
}
```

#### Request Body `PUT /api/vehicles/:id`:
```json
{
  "status": "exited",
  "notes": "Sudah keluar melalui gerbang 2"
}
```
*(Atau untuk memindahkan zona parkir: `{"zone_id": "<uuid-zona-baru>"}`)*

---

## 🚀 Deploy ke Vercel

Folder `backend` telah dilengkapi dengan `vercel.json` untuk deploy sebagai **Serverless Function**:

1. Pastikan Anda telah menginstal Vercel CLI (`npm i -g vercel`) atau import repository ke dashboard [Vercel](https://vercel.com).
2. Di Dashboard Vercel, atur **Environment Variables**:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
3. Deploy melalui CLI:
   ```bash
   vercel
   ```
4. Express API akan otomatis menangani seluruh rute melalui `@vercel/node`.

