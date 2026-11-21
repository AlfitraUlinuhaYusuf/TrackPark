const supabase = require('../config/supabase');

/**
 * GET /api/zones
 * Mengambil semua zona beserta jumlah kendaraan dengan status 'parked' di tiap zona
 */
const getAllZones = async (req, res) => {
  try {
    // 1. Ambil seluruh data zona
    const { data: zones, error: zoneError } = await supabase
      .from('zones')
      .select('*')
      .order('name', { ascending: true });

    if (zoneError) {
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil data zona',
        error: zoneError.message,
      });
    }

    // 2. Ambil data kendaraan yang sedang 'parked' untuk menghitung jumlah per zona
    const { data: parkedVehicles, error: vehicleError } = await supabase
      .from('vehicles')
      .select('zone_id')
      .eq('status', 'parked');

    if (vehicleError) {
      return res.status(500).json({
        success: false,
        message: 'Gagal menghitung kendaraan parkir',
        error: vehicleError.message,
      });
    }

    // Hitung kemunculan zone_id kendaraan yang terparkir
    const parkedCountMap = {};
    if (parkedVehicles) {
      for (const v of parkedVehicles) {
        if (v.zone_id) {
          parkedCountMap[v.zone_id] = (parkedCountMap[v.zone_id] || 0) + 1;
        }
      }
    }

    // Gabungkan data zona dengan parked_count dan available_capacity
    const result = (zones || []).map((zone) => {
      const parkedCount = parkedCountMap[zone.id] || 0;
      const capacity = Number(zone.capacity) || 0;
      const availableCapacity = Math.max(0, capacity - parkedCount);

      return {
        ...zone,
        parked_count: parkedCount,
        available_capacity: availableCapacity,
        is_full: parkedCount >= capacity,
      };
    });

    return res.status(200).json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error saat mengambil zona',
      error: err.message,
    });
  }
};

/**
 * GET /api/zones/:id
 * Mengambil detail zona beserta array kendaraan 'parked' yang ada di zona tersebut
 */
const getZoneById = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Ambil detail zona
    const { data: zone, error: zoneError } = await supabase
      .from('zones')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (zoneError) {
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil detail zona',
        error: zoneError.message,
      });
    }

    if (!zone) {
      return res.status(404).json({
        success: false,
        message: `Zona dengan ID '${id}' tidak ditemukan`,
      });
    }

    // 2. Ambil seluruh kendaraan dengan status 'parked' di zona ini
    const { data: parkedVehicles, error: vehiclesError } = await supabase
      .from('vehicles')
      .select('*')
      .eq('zone_id', id)
      .eq('status', 'parked')
      .order('entry_time', { ascending: false });

    if (vehiclesError) {
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil data kendaraan di zona ini',
        error: vehiclesError.message,
      });
    }

    const parkedList = parkedVehicles || [];
    const capacity = Number(zone.capacity) || 0;
    const parkedCount = parkedList.length;

    return res.status(200).json({
      success: true,
      data: {
        ...zone,
        parked_count: parkedCount,
        available_capacity: Math.max(0, capacity - parkedCount),
        is_full: parkedCount >= capacity,
        vehicles: parkedList,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error saat mengambil detail zona',
      error: err.message,
    });
  }
};

module.exports = {
  getAllZones,
  getZoneById,
};

