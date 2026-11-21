const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Muat variabel lingkungan dari .env
dotenv.config();

const zoneRoutes = require('./routes/zoneRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');

const app = express();

// 1. Global Middlewares
app.use(cors());
app.use(express.json());

// 2. Health Check & Root Endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    app: 'TrackPark Backend API',
    status: 'online',
    version: '1.0.0',
    documentation: {
      zones: {
        list: 'GET /api/zones',
        detail: 'GET /api/zones/:id',
      },
      vehicles: {
        list: 'GET /api/vehicles?status=parked&search=B',
        detail: 'GET /api/vehicles/:id',
        create: 'POST /api/vehicles',
        update: 'PUT /api/vehicles/:id',
        delete: 'DELETE /api/vehicles/:id',
      },
    },
  });
});

// 3. API Routes
app.use('/api/zones', zoneRoutes);
app.use('/api/vehicles', vehicleRoutes);

// 4. 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan`,
  });
});

// 5. Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Application Error:', err);
  res.status(500).json({
    success: false,
    message: 'Terjadi kesalahan internal pada server',
    error: process.env.NODE_ENV === 'production' ? undefined : err.message,
  });
});

// 6. Jalankan server jika dijalankan secara lokal (bukan di-import oleh Vercel Serverless)
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`🚗 TrackPark API Server is running!`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`⚡ Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`=========================================`);
  });
}

// Export app untuk Vercel Serverless Function
module.exports = app;

