const express = require('express');
const router = express.Router();
const {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} = require('../controllers/vehicleController');

// GET /api/vehicles - Semua kendaraan (join zona, query ?status=parked & ?search=)
router.get('/', getAllVehicles);

// GET /api/vehicles/:id - Detail 1 kendaraan dengan info zona
router.get('/:id', getVehicleById);

// POST /api/vehicles - Tambah motor/kendaraan masuk baru
router.post('/', createVehicle);

// PUT /api/vehicles/:id - Update lokasi zone_id, notes, atau status ('exited')
router.put('/:id', updateVehicle);

// DELETE /api/vehicles/:id - Hapus data kendaraan
router.delete('/:id', deleteVehicle);

module.exports = router;

