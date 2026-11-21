const express = require('express');
const router = express.Router();
const { getAllZones, getZoneById } = require('../controllers/zoneController');

// GET /api/zones - Kembalikan semua zona beserta jumlah kendaraan parked di tiap zona
router.get('/', getAllZones);

// GET /api/zones/:id - Kembalikan detail zona beserta array kendaraan parked
router.get('/:id', getZoneById);

module.exports = router;

